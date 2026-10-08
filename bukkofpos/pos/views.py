from datetime import date, datetime, timedelta
from decimal import Decimal
from django.shortcuts import get_object_or_404, render
from django.http import Http404
from rest_framework import viewsets, status
from django.db import transaction
from django.db.models import Exists, OuterRef
from django.core import signing
from django.core.signing import BadSignature, SignatureExpired
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, action

from accounts.views import get_active_outlet_id
from .models import (
    Category,
    InventoryLog,
    Measurement,
    Order,
    PrinterSetup,
    Product,
    SalesReceipt,
    SalesReceiptOrder,
)
from .serializers import (
    CategorySerializers,
    CheckReceiptStatusSerializer,
    CreateOrderSerializer,
    CreateProductSerializers,
    InventoryLogSerializer,
    MeasurementSerializers,
    OrderSerializers,
    ProductInfoSerializer,
    ProductSerializers,
    # SalesInfoSerializer,
    SalesReceiptCreateSerializer,
    # SalesReceiptOrderSerializer,
    SalesReceiptSerializer,
    SalesSerializer,
    ViewOrderSerializer,
    printerSetupSerializer,
    productInfoSerializerBydate,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.reverse import reverse
from django.utils import timezone

# from datetime import datetime, timedelta, timezone as dt_timezone
import calendar
from django.db.models import Sum, F, DecimalField, ExpressionWrapper, Q, Value
from django.db.models.functions import Coalesce, TruncDate, TruncMonth
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import ValidationError
from .global_permisson import IsVerified
from accounts.models import AuthorizationNonce, OutletStaff, Outlets
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from notifications.notification_helper import create_notification
from accounts.session_permisson import (
    ASPermission,
    IsAdminOrSupervisor,
    IsAdminOrSupervisorOrStaff,
)

# reportlab
from django.http import HttpResponse
from django.http import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors, pdfencrypt
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)
from reportlab.platypus.flowables import Image
from reportlab.lib.styles import getSampleStyleSheet
from .models import SalesReceipt
from reportlab.pdfgen import canvas
from io import BytesIO
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import HRFlowable

# Create your views here.


def index(request):
    return render(request, "home.html")


class ProductListViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category", "sold_In")
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]
    serializer_class = ProductSerializers

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = ["product_name", "id"]

    def get_permissions(self):
        if self.action == "list":
            return (
                IsVerified(),
                IsAuthenticated(),
                ASPermission(),
                IsAdminOrSupervisorOrStaff(),
            )
        return super().get_permissions()

    def get_queryset(self):
        # outlet_id = self.request.query_params.get("outlet_id")
        outlet_id = get_active_outlet_id(self.request)
        if not outlet_id:
            raise ValidationError(
                {"error": "No active Outlet, Please Add/Activate an Outlet.."}
            )

        qs = super().get_queryset()
        return qs.filter(user=self.request.user, outlet__id=outlet_id, is_active=True)

    def create(self, request, *args, **kwargs):
        outlet_id = get_active_outlet_id(request)

        if not outlet_id:
            return Response(
                {"error": "Please activate an outlet"},
                status=400,
            )
        token = request.headers.get("X-Pass-Token")

        if not token:
            token = request.COOKIES.get("pass_token")

        if not token:
            return Response(
                {"error_token": "Admin/Supervisor Passcode required"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            payload = signing.loads(token, salt="user_pass", max_age=15 * 60)

        except SignatureExpired:
            return Response(
                {"error": " token expired, try later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payload["user_id"] != request.user.id:
            return Response(
                {"error": "Invalid  token"},
                status=status.HTTP_403_FORBIDDEN,
            )
        nonce = payload["nonce"]
        # purpose = payload["purpose"]
        authorizer = payload["authorizer"]
        with transaction.atomic():
            if not payload["lag_time_check"]:
                try:
                    verify_nonce = AuthorizationNonce.objects.select_for_update().get(
                        user=request.user,
                        # purpose=purpose,
                        nonce=nonce,
                    )
                    if verify_nonce.created_at < timezone.now() - timedelta(minutes=3):
                        verify_nonce.delete()
                        return Response(
                            {
                                "error": "Authorization has expired. Please authenticate again."
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                except AuthorizationNonce.DoesNotExist:
                    return Response(
                        {"error": "Invalid or expired authorization token"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                verify_nonce.delete()
            outlet = get_object_or_404(Outlets, id=outlet_id, user=request.user)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user, outlet=outlet)
            quantity = serializer.data["stock_inventory"]
            action = "add"

            if quantity is not None and action is not None:
                create_inventory_log(
                    authorizer, serializer.data["id"], quantity, action
                )
                # verify_nonce.delete()
            return Response(
                {"data": serializer.data, "message": "created successful"},
                status=status.HTTP_200_OK,
            )

    def partial_update(self, request, *args, **kwargs):

        try:
            instance = self.get_object()
        except Http404:
            return Response(
                {"error": "Invalid Outlet"},
                status=status.HTTP_404_NOT_FOUND,
            )

        token = request.headers.get("X-Pass-Token")
        if not token:
            token = request.COOKIES.get("pass_token")
        if not token:
            return Response(
                {"error_token": "Admin/Supervisor Passcode required"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            payload = signing.loads(
                token,
                salt="user_pass",
                max_age=15 * 60,
            )

        except SignatureExpired:
            return Response(
                {"error": "product token expired, try later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payload["user_id"] != request.user.id:
            return Response(
                {"error": "Invalid  token"},
                status=status.HTTP_403_FORBIDDEN,
            )
        nonce = payload["nonce"]
        # purpose = payload["purpose"]
        authorizer = payload["authorizer"]

        with transaction.atomic():
            if not payload["lag_time_check"]:
                try:
                    verify_nonce = AuthorizationNonce.objects.select_for_update().get(
                        object_id=str(instance.id),
                        # purpose=purpose,
                        user=request.user,
                        nonce=nonce,
                    )
                    if verify_nonce.created_at < timezone.now() - timedelta(minutes=3):
                        verify_nonce.delete()
                        return Response(
                            {
                                "error": "Authorization has expired. Please authenticate again."
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )
                except AuthorizationNonce.DoesNotExist:
                    return Response(
                        {"error": "Invalid or expired authorization token"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                verify_nonce.delete()

            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            product_instance = serializer.save(user=request.user)
            quantity = request.data.get("quantity")
            action = request.data.get("action")
            # print(quantity,action)
            if quantity is not None and action is not None:
                message_title = f"Inventory Update"
                message = (
                    f"Inventory stock of {product_instance.product_name} was updated "
                )
                create_inventory_log(authorizer, instance.id, quantity, action)
                create_notification(
                    request.user, "inventory.update", message_title, message
                )
            # verify_nonce.delete()
            return Response(
                {"data": serializer.data, "message": "update successful"},
                status=status.HTTP_200_OK,
            )

    def get_serializer_class(self):
        if self.action in ("update", "partial_update", "create"):
            return CreateProductSerializers
        return super().get_serializer_class()

    def destroy(self, request, *args, **kwargs):
        token = request.headers.get("X-Pass-Token")
        if not token:
            token = request.COOKIES.get("pass_token")

        if not token:
            return Response(
                {"error_token": "Admin/Supervisor Passcode required"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            payload = signing.loads(
                token,
                salt="user_pass",
                max_age=15 * 60,
            )

        except SignatureExpired:
            return Response(
                {"error": "delete token expired, try later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid delete token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payload["user_id"] != request.user.id:
            return Response(
                {"error": "Invalid delete token"},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            instance = self.get_object()
        except Http404:
            return Response({"error": "No Product matches the given query"}, status=404)
        nonce = payload["nonce"]
        # purpose = payload["purpose"]
        with transaction.atomic():
            if not payload["lag_time_check"]:
                try:
                    verify_nonce = AuthorizationNonce.objects.select_for_update().get(
                        user=request.user,
                        object_id=str(instance.id),
                        # purpose=purpose,
                        nonce=nonce,
                    )
                    if verify_nonce.created_at < timezone.now() - timedelta(minutes=3):
                        verify_nonce.delete()
                        return Response(
                            {
                                "error": "Authorization has expired. Please authenticate again."
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )

                except AuthorizationNonce.DoesNotExist:
                    return Response(
                        {"error": "Invalid or expired authorization token"},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                verify_nonce.delete()
            # self.perform_destroy(instance)
            instance.is_active = False
            instance.save(
                update_fields=[
                    "is_active",
                ]
            )
            return Response({"message": "Product deleted"}, status=status.HTTP_200_OK)


class InventoryViewset(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]
    queryset = InventoryLog.objects.all()

    def get_permissions(self):
        if self.action == "list":
            return [
                IsAuthenticated(),
                IsVerified(),
                ASPermission(),
                IsAdminOrSupervisorOrStaff(),
            ]
        return super().get_permissions()

    def list(self, request):
        product_id = request.query_params.get("product_id")
        active_outlet_id = get_active_outlet_id(request)
        current_count = int(request.headers.get("X-Count-Header"))

        if not product_id:
            return Response(
                {"error": "Product details are required"},
                status=status.HTTP_404_NOT_FOUND,
            )
        queryset = self.queryset.filter(
            product__id=product_id,
            product__user=request.user,
            product__outlet_id=active_outlet_id,
        )
        get_list = current_count + 10

        if get_list >= queryset.count():
            message = "All inventory data fetched"
            disable_button = True
            get_list = queryset.count()
        else:
            message = "click to load more data  >>>"
            disable_button = False
            get_list = get_list
        return_queryset = queryset[:get_list]
        serializer = InventoryLogSerializer(return_queryset, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": message,
                "disable_button": disable_button,
            },
            status=status.HTTP_200_OK,
        )
from django.core.exceptions import ValidationError as DjangoValidationError

def create_inventory_log(authorizer, product, quantity, action):
    User = get_user_model()
    product_instance = Product.objects.get(id=product)
    quantity_dec = Decimal(quantity)
    if quantity_dec <= 0.00:
        raise ValueError("Invalid quantity action")
    if action == "add":
        product_instance.stock_inventory += quantity_dec
    elif action == "subtract":
        product_instance.stock_inventory -= quantity_dec
    else:
        raise ValueError("Invalid action")
    try:
        product_instance.full_clean()
        product_instance.save()
    except DjangoValidationError:
        
        raise ValidationError(
            {"stock_inventory": ["stock_inventory cannot be negative"]}
        )
    
    log = {
        "product": product_instance,
        "quantity": quantity_dec,
        "action": action,
    }
    if authorizer["authorize"].split(" ")[0] == "admin":
        log["performed_by_admin"] = User.objects.get(id=authorizer["id"])
    else:
        log["performed_by_supervisor"] = OutletStaff.objects.get(
            Employee_id=authorizer["id"]
        )

    InventoryLog.objects.create(**log)


# class Inventory_log(viewsets.ModelViewSet):
#     queryset = InventoryLog.objects.all()
#     permission_classes = [IsAuthenticated, IsVerified]
#     serializer_class = InventoryLogSerializer

#     def get_queryset(self):
#         product_id = self.request.query_params.get("product_id")
#         if not product_id:
#             raise ValidationError({"error": "Product details required"})

#         qs = super().get_queryset()
#         return qs.filter(user=self.request.user, product__id=product_id)
#         return super().get_queryset()

#     def create(self, request, *args, **kwargs):
#         product_id = request.data.get("product_id")
#         product_instance = Product.objects.get(id=product_id)

#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         serializer.save(product=product_instance)
#         return Response(
#             {"data": serializer.data, "message": "stock inventory updated"},
#             status=status.HTTP_200_OK,
#         )


class MeasuremnetListViewSet(viewsets.ModelViewSet):
    queryset = Measurement.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]
    serializer_class = MeasurementSerializers

    def get_queryset(self):
        # outlet_id = self.request.query_params.get("outlet_id")
        # print(outlet_id, "outlet id ....")

        outlet_id = get_active_outlet_id(self.request)
        if not outlet_id:
            raise ValidationError(
                {"error": "Please Add/Activate and outlet to continue"}
            )
        queryset = Measurement.objects.filter(
            outlet__user=self.request.user, outlet_id=outlet_id
        )

        return queryset

    def create(self, request, *args, **kwargs):
        outlet_id = get_active_outlet_id(self.request)
        if not outlet_id:
            return Response(
                {"error": "Please Add/Activate and outlet to continue"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        outlet = get_object_or_404(Outlets, id=outlet_id, user=request.user)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(outlet=outlet)
        return Response(
            {"message": "created successfully"}, status=status.HTTP_201_CREATED
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        role = request.pos_authorization.get("role")
        if role != "admin":
            return Response(
                {"error": "You can not perform this operation"},
                status=status.HTTP_403_FORBIDDEN,
            )
        self.perform_destroy(instance)
        return Response({"message": "Measurement deleted"}, status=status.HTTP_200_OK)


class CategoryListViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]
    serializer_class = CategorySerializers

    def get_queryset(self):
        # outlet_id = self.request.query_params.get("outlet_id")
        outlet_id = get_active_outlet_id(self.request)
        if not outlet_id:
            raise ValidationError(
                {"error": "Please Add/Activate and outlet to continue"}
            )
        queryset = Category.objects.filter(
            outlet=outlet_id, outlet__user=self.request.user
        )

        return queryset

    # def perform_create(self, serializer):
    #     outlet_id = self.request.query_params.get("outlet_id")
    #     category = serializer.save()
    #     update_object=Category.objects.get(id=category.id)
    #     print(update_object.cats.first(outlet=outlet_id))
    def create(self, request, *args, **kwargs):
        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            return Response(
                {"error": "Please/Add ot activate an outlet to continue"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        outlet = get_object_or_404(Outlets, id=outlet_id, user=request.user)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(outlet=outlet)
        return Response(
            {"message": "created successfully"}, status=status.HTTP_201_CREATED
        )

    def destroy(self, request, *args, **kwargs):
        role = request.pos_authorization.get("role")
        if role != "admin":
            return Response(
                {"error": "You can not perform this operation"},
                status=status.HTTP_403_FORBIDDEN,
            )
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "Category deleted"}, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related("user", "product")
    serializer_class = CreateOrderSerializer
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisorOrStaff,
    ]

    def get_serializer_class(self):
        if self.action == "list":
            return OrderSerializers
        return super().get_serializer_class()

    def create(self, request, *args, **kwargs):
        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            return Response(
                {"error": "Activate an outlet to continue"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        receipt_id = request.data.get("receipt_id")

        mixed_outlet = False

        with transaction.atomic():
            # order = serializer.save(user=self.request.user)
            if receipt_id not in (None, "", "undefined", "null"):
                try:
                    receipt_obj = SalesReceipt.objects.get(
                        id=receipt_id, issued=False, user=self.request.user
                    )
                except SalesReceipt.DoesNotExist:
                    return Response(
                        {"error": "Receipt object does not exist"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:
                receipts = SalesReceipt.objects.filter(
                    sales_receipt_order__order__product__outlet__id=outlet_id,
                    issued=False,
                    hold=False,
                    user=self.request.user,
                ).distinct()

                if receipts.count() > 1:
                    raise ValidationError(
                        "Multiple active receipts exist for this outlet."
                    )

                receipt_obj = receipts.first()
                if receipt_obj is None:
                    get_false_receipts = SalesReceipt.objects.filter(
                        sales_receipt_order__order__product__outlet__id=outlet_id,
                        issued=False,
                        user=self.request.user,
                    ).distinct()
                    if get_false_receipts.count() > 2:

                        return Response(
                            {
                                # "mess": get_false_receipts,
                                "error_len": "maximum amount of old reached, issue receipt on hold to continue",
                            },
                            status=status.HTTP_403_FORBIDDEN,
                        )

                    receipt_obj = SalesReceipt.objects.create(
                        issued=False,
                        hold=False,
                        user=request.user,
                    )
            order = self.get_serializer(data=request.data)
            order.is_valid(raise_exception=True)
            product = order.validated_data["product"]
            if str(product.outlet.id) != str(outlet_id):
                return Response(
                    {
                        "error": "Can not perform action, product does not belong to this outlet"
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            instance = order.save(user=request.user)
            mixed_outlet = receipt_obj.sales_receipt_order.exclude(
                order__product__outlet=instance.product.outlet
            ).exists()
            if mixed_outlet:
                receipt_obj.hold = True
                receipt_obj.save()
                receipt_obj = SalesReceipt.objects.create(
                    issued=False, hold=False, user=self.request.user
                )

            receipt_obj.add_order(
                order=instance, payment_option=SalesReceiptOrder.Paymentchoices.CASH
            )
        response_serializer = OrderSerializers(
            instance, context=self.get_serializer_context()
        )
        return Response(
            {
                "data": response_serializer.data,
                "receipt_status": receipt_obj.hold,
                "receipt_id": receipt_obj.id,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        receipt = order.order_salesreceipt.first().sales_receipt

        with transaction.atomic():
            self.perform_destroy(order)

            if not receipt.orders.exists():
                receipt.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SalesInfoChartAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def get(self, request):
        now = timezone.now()
        # start = timezone.make_aware(datetime.combine(now.date(), datetime.min.time()))
        # end = timezone.make_aware(datetime.combine(now.date(), datetime.max.time()))

        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            raise ValidationError(
                {"error": "Please Activate/Add an Outlet to View Sales Info"}
            )
        current_year = timezone.localdate().year
        # current_year = timezone.now().year

        receipts = SalesReceipt.objects.filter(
            issued=True,
            sales_receipt_order__order__product__outlet=outlet_id,
            issued_at__year=current_year,
        )
        if not receipts:
            return Response(
                {"error": "No Data match the Receipt"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        start_of_year = date(current_year, 1, 1)
        start_of_next_year = date(current_year + 1, 1, 1)
        current_day = timezone.localdate()
        start_of_week = current_day - timedelta(days=current_day.weekday())
        months = list(calendar.month_name)[1:]
        # current_day = timezone.now().date()
        end_of_week = start_of_week + timedelta(days=6)
        monthly_sales = {}
        weekly_sales_dic = {}
        monthly_data = (
            SalesReceiptOrder.objects.filter(
                order__product__outlet=outlet_id,
                sales_receipt__in=receipts,
                sales_receipt__issued_at__date__gte=start_of_year,
                sales_receipt__issued_at__date__lt=start_of_next_year,
            )
            .annotate(month=TruncMonth("sales_receipt__issued_at"))
            .values("month")
            .annotate(monthly_sales=Sum("order__sub_total"))
        )

        for m in range(len(months)):

            print(months[m])
            monthly_sales[months[m]] = Decimal("0.00")

        for data in monthly_data:
            month_str = data["month"].strftime("%B")
            monthly_sales[month_str] = data["monthly_sales"]

        monthly_sales = [
            {"month": key, "total": value} for key, value in monthly_sales.items()
        ]

        weekly_sales = (
            SalesReceiptOrder.objects.filter(
                order__product__outlet=outlet_id,
                sales_receipt__in=receipts,
                sales_receipt__issued_at__date__gte=start_of_week,
                sales_receipt__issued_at__date__lte=end_of_week,
            )
            .annotate(date=TruncDate("sales_receipt__issued_at"))
            .values("date")
            .annotate(daily_sales=Sum("order__sub_total"))
        )

        for i in range(7):
            key = start_of_week + timedelta(days=i)
            key_str = key.strftime("%A")
            weekly_sales_dic[key_str] = Decimal(0)

        for sales in weekly_sales:
            name = sales["date"].strftime("%A")
            weekly_sales_dic[name] = sales["daily_sales"]
        weekly_sales = [
            {"daily": key, "total_daily": value}
            for key, value in weekly_sales_dic.items()
        ]

        return Response(
            {
                "monthly_sales": monthly_sales,
                "daily_sales": weekly_sales,
            },
            status=status.HTTP_200_OK,
        )


# class WeeklySalesChartInfoAPIView(APIView):
#     permission_classes = [
#         IsAuthenticated,
#         IsVerified,
#         ASPermission,
#         IsAdminOrSupervisor,
#     ]

#     def get(self, request):
#         current_day = timezone.now().date()
#         current_year = timezone.now().year
#         active_outlet_id = get_active_outlet_id(request)

#         if not active_outlet_id:
#             return Response(
#                 {"error": "Please activate an outlet"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         receipts = SalesReceipt.objects.filter(
#             issued=True,
#             date__year=current_year,
#             sales_receipt_order__order__product__outlet=active_outlet_id
#         )
#         start_of_week = current_day - timedelta(days=current_day.weekday())
#         days_in_the_week_sales = {}

#         for i in range(7):
#             key = start_of_week + timedelta(days=i)
#             key_str = key.strftime("%A")
#             days_in_the_week_sales[key_str] = (
#                 SalesReceiptOrder.objects.filter(
#                     sales_receipt__in=receipts,order__user=request.user, order__date__date=key
#                 ).aggregate(daily_sales=Sum("order__sub_total"))["daily_sales"]
#                 or 0
#             )


#         updated_daily_sales = [{"daily_sales": days_in_the_week_sales}]
#         print(updated_daily_sales)
#         return Response(updated_daily_sales)


# class OrderViewSet(viewsets.ViewSet):
#     queryset = Order.objects.select_related("user", "product")
#     serializer_class = CreateOrderSerializer
#     permission_classes = [IsAuthenticated]


class SalesReceiptPagePagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = "size"
    max_page_size = 150

    def get_paginated_response(self, data):
        return Response(
            {
                "count": self.page.paginator.count,
                "page_size": self.get_page_size(self.request),
                "total_pages": self.page.paginator.num_pages,
                "current_page": self.page.number,
                "next": self.get_next_link(),
                "previous": self.get_previous_link(),
                "results": data,
            }
        )


def get_current_dates(request):
    today = timezone.localtime()
    current_year = today.year
    current_day = today.date()
    current_month = today.month

    receipts = SalesReceipt.objects.filter(issued=True, user=request.user)

    start_of_week = current_day - timedelta(days=current_day.weekday())
    end_of_last_week = start_of_week - timedelta(days=1)
    start_of_last_week = start_of_week - timedelta(days=7)
    if current_month == 1:
        previous_month = 12
        year_of_previous_month = current_year - 1
    else:
        previous_month = current_month - 1
        year_of_previous_month = current_year
    last_month_receipts = receipts.filter(
        issued_at__month=previous_month,
        issued_at__year=year_of_previous_month,
    )
    last_month_start = date(year=year_of_previous_month, month=previous_month, day=1)

    return {
        "receipts": receipts,
        "current_year": current_year,
        "current_day": current_day,
        "current_month": current_month,
        "start_of_week": start_of_week,
        "end_of_last_week": end_of_last_week,
        "start_of_last_week": start_of_last_week,
        "previous_month": previous_month,
        "last_month_receipts": last_month_receipts,
        "last_month_start": last_month_start,
    }


class CheckSalesReceiptStatus(viewsets.ViewSet):

    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisorOrStaff,
    ]

    def list(self, request):
        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            return Response(
                {"error": "Add/activate an outlet to continue"},
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = SalesReceipt.objects.filter(
            user=request.user,
            issued=False,
            sales_receipt_order__order__product__outlet=outlet_id,
        ).distinct()
        serializer = CheckReceiptStatusSerializer(queryset, many=True)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):

        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            return Response(
                {"error": "Add/activate an outlet"}, status=status.HTTP_403_FORBIDDEN
            )
        get_assign_staff = request.COOKIES.get("assigned_staff")
        if not get_assign_staff:
            return Response(
                {"error": "Assign a staff to perform action"},
                status=status.HTTP_403_FORBIDDEN,
            )
        matching_orders = SalesReceiptOrder.objects.filter(
            order__product__outlet_id=outlet_id, sales_receipt_id=OuterRef("pk")
        )
        with transaction.atomic():
            # receipt = (
            #     SalesReceipt.objects.select_for_update()
            #     .filter(
            #         issued=False,
            #         sales_receipt_order__order__product__outlet=outlet_id,
            #         id=pk,
            #     )
            #     .distinct()
            #     .first()
            # )

            receipt = (
                SalesReceipt.objects.select_for_update()
                .filter(Exists(matching_orders), id=pk, issued=False)
                .first()
            )
            if not receipt:
                return Response(
                    {"error": "Receipt does not exist"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = CheckReceiptStatusSerializer(
                receipt, data=request.data, partial=True
            )
            serializer.is_valid(raise_exception=True)

            new_receipt = serializer.save()
            if new_receipt.hold is False:
                SalesReceipt.objects.filter(
                    issued=False,
                    sales_receipt_order__order__product__outlet=outlet_id,
                ).exclude(id=new_receipt.id).update(hold=True)

            return Response(serializer.data)


class SalesReceiptViewSet(viewsets.ModelViewSet):

    queryset = SalesReceipt.objects.prefetch_related(
        Prefetch(
            "orders",
            queryset=Order.objects.select_related(
                "product__sold_In", "product__category"
            ),
        )
    ).order_by("-date")

    # r = SalesReceipt.objects.all()

    # # all_receipt = [receipt for receipt in r]
    # for x in r:
    #     if x.orders.exists():
    #         x.delete()

    serializer_class = SalesReceiptSerializer
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisorOrStaff,
    ]
    pagination_class = SalesReceiptPagePagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = [
        "id",
    ]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        get_staff = request.COOKIES.get("assigned_staff")
        if not get_staff:
            return Response(
                {"error": "Assign a Staff to perform Action"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            assigned_staff = OutletStaff.objects.get(Employee_id=get_staff)
        except OutletStaff.DoesNotExist:
            return Response(
                {"error": "Invalid staff details"}, status=status.HTTP_404_NOT_FOUND
            )
        with transaction.atomic():
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(assigned_staff=assigned_staff)

            hold = request.data.get("hold")
            if hold is True:

                self.queryset = SalesReceipt.objects.filter(
                    issued=False, user=self.request.user, hold=True
                ).order_by("-date")

            response_serializer = SalesReceiptSerializer(
                instance, context=self.get_serializer_context()
            )
            token = signing.dumps({"receipt_id": instance.id})
            response = response_serializer.data
            response["pdf_url"] = (
                request.build_absolute_uri(
                    reverse("sales_receipt_pdf", kwargs={"pk": instance.pk})
                )
                + f"?token={token}"
            )
            return Response(response, status=status.HTTP_200_OK)

    @action(detail=False, methods=["GET"], url_path="issued_receipt_pdf_regenerate")
    def issued_receipt_pdf_regenerate(self, request):
        receipt_id = request.query_params.get("receipt_id")
        outlet_id = request.query_params.get("outlet_id")

        if not receipt_id and not outlet_id:
            return Response(
                {"error": "receipt id and outet id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        matching_orders = SalesReceiptOrder.objects.filter(
            order__product__outlet=outlet_id, sales_receipt_id=OuterRef("pk")
        )

        try:
            instance = SalesReceipt.objects.get(
                Exists(matching_orders),
                id=receipt_id,
                user=request.user,
                issued=True,
                hold=False,
            )
        except SalesReceipt.DoesNotExist:
            return Response(
                {"error": "receipt not found"}, status=status.HTTP_404_NOT_FOUND
            )
        token = signing.dumps({"receipt_id": instance.id})
        response = {
            "pdf_url": (
                request.build_absolute_uri(
                    reverse("sales_receipt_pdf", kwargs={"pk": instance.pk})
                )
                + f"?token={token}"
            )
        }
        return Response(response, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        get_assigned_staff = self.request.COOKIES.get("assigned_staff")
        issued_receipt = self.request.query_params.get("issued")

        if not issued_receipt or issued_receipt.lower() == "false":
            if not get_assigned_staff:
                return Response(
                    {"error": "Assign a staff to perform action"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        get_dates = get_current_dates(self.request)
        false_receipt = self.request.query_params.get("issued")

        qs = SalesReceipt.objects.filter(issued=False, user=self.request.user).order_by(
            "-date"
        )
        if self.action == "list":

            qs = qs.filter(hold=False)
        if false_receipt is not None:
            qs = qs.filter(issued=false_receipt.lower() == "false")
        get_outlet = get_active_outlet_id(self.request)
        if not get_outlet:
            raise ValidationError(
                {"error": " No Active Outlet, Add/activate an outlet"}
            )

        order_query = Order.objects.filter(product__outlet=int(get_outlet))

        qs = (
            qs.filter(sales_receipt_order__order__product__outlet=int(get_outlet))
            .distinct()
            .prefetch_related(
                Prefetch(
                    "orders",
                    queryset=order_query.select_related(
                        "product__sold_In", "product__category"
                    ),
                )
            )
        )
        if self.action == "partial_update":
            return qs.filter(issued=False)
        # query_set = super().get_queryset()
        issued = self.request.query_params.get("issued")
        if issued is not None:
            now = timezone.localtime()
            start_of_today = timezone.make_aware(
                datetime.combine(now.date(), datetime.min.time())
            )
            queryset = (
                SalesReceipt.objects.filter(
                    user=self.request.user,
                    sales_receipt_order__order__product__outlet=get_outlet,
                    issued=(issued.lower() == "true"),
                )
                .order_by("-issued_at")
                .distinct()
            )
            date_range = self.request.query_params.get("dateRange")
            start_date = self.request.query_params.get("startDate")
            end_date = self.request.query_params.get("endDate")
            print(start_date, end_date)
            if start_date and end_date:
                queryset = queryset.filter(
                    issued_at__date__gte=start_date,
                    issued_at__date__lte=end_date,
                )
            if date_range == "today":

                queryset = queryset.filter(
                    issued_at__gte=start_of_today,
                    issued_at__lte=now,
                )
            elif date_range == "last_24_hours":
                queryset = queryset.filter(
                    issued_at__date__gte=timezone.now() - timedelta(hours=24),
                    issued_at__date__lte=timezone.now(),
                )
            elif date_range == "this_week":
                queryset = queryset.filter(
                    issued_at__date__gte=get_dates["start_of_week"],
                    issued_at__date__lte=timezone.localdate(),
                )
            elif date_range == "this_month":
                queryset = queryset.filter(
                    issued_at__date__gte=get_dates["current_day"].replace(day=1),
                    issued_at__date__lte=timezone.localdate(),
                )
            queryset = queryset.prefetch_related(
                Prefetch(
                    "orders",
                    queryset=order_query.select_related(
                        "product__sold_In", "product__category"
                    ),
                )
            )
            return queryset
        return qs.distinct()

        # return query_set

    def get_serializer_class(self):
        if self.action in ["partial_update", "update"]:
            return SalesReceiptCreateSerializer
        return super().get_serializer_class()


class SalesReceiptOrderViewSet(viewsets.ViewSet):
    # queryset = Product.objects.filter(user=request.user)
    # permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = SalesReceiptOrder.objects.prefetch_related("order__product")
        issued = request.query_params.get("issued") == "true"
        receipt_id = request.query_params.get("receipt_id")
        if issued:
            queryset = queryset.filter(sales_receipt__issued=issued)
        if receipt_id:
            queryset = queryset.filter(sales_receipt__id=receipt_id)

        serializer = SalesReceiptOrderSerializer(queryset, many=True)

        return Response(serializer.data)


class SalesReceiptOrderUpdateViewSet(viewsets.ViewSet):
    # queryset = Product.objects.filter(user=request.user)
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def list(self, request):
        queryset = SalesReceiptOrder.objects.prefetch_related("order__product")
        issued = request.query_params.get("issued") == "true"
        receipt_id = request.query_params.get("receipt_id")
        if issued:
            queryset = queryset.filter(sales_receipt__issued=issued)
        if receipt_id:
            queryset = queryset.filter(sales_receipt__id=receipt_id)

        serializer = ViewOrderSerializer(queryset, many=True)

        return Response(serializer.data)


class SalesInfoViewSet(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def calculate_sales(
        self,
        receipts,
        outlet_id=None,
        start_date=None,
        end_date=None,
        start_date_range=None,
        end_date_range=None,
    ):
        base_filter = {
            "sales_receipt__in": receipts,
        }

        if outlet_id:
            base_filter["order__product__outlet"] = outlet_id
        queryset = SalesReceiptOrder.objects.select_related(
            "sales_receipt", "order"
        ).filter(**base_filter)
        if start_date_range and end_date_range:
            queryset = queryset.filter(
                sales_receipt__issued_at__date__gte=start_date_range,
                sales_receipt__issued_at__date__lte=end_date_range,
            )

        elif start_date and end_date:
            queryset = queryset.filter(
                sales_receipt__issued_at__date__gte=start_date,
                sales_receipt__issued_at__date__lte=end_date,
            )
        else:
            queryset = queryset.filter(
                sales_receipt__issued_at__date=start_date,
            )
        # gross_sales = queryset.aggregate(gross_sales_for=Sum("order__sub_total"))[
        #     "gross_sales_for"
        # ] or Decimal(0.00)
        # cost_of_sales = queryset.annotate(
        #     cost_of_sales_for=ExpressionWrapper(
        #         F("order__product__cost_price") * F("order__quantity"),
        #         output_field=DecimalField(max_digits=10, decimal_places=2),
        #     )
        # ).aggregate(total_cost_of_sales_for=Sum("cost_of_sales_for"))[
        #     "total_cost_of_sales_for"
        # ] or Decimal(
        #     0.00
        # )
        # to reduce the number of queries the below is used
        aggregate_values = queryset.aggregate(
            gross_sales_for=Sum("order__sub_total"),
            total_cost_of_sales_for=Sum(
                ExpressionWrapper(
                    F("order__unit_cost_price") * F("order__quantity"),
                    output_field=DecimalField(max_digits=10, decimal_places=2),
                )
            ),
        )

        gross_sales = aggregate_values["gross_sales_for"] or Decimal(0.00)
        cost_of_sales = aggregate_values["total_cost_of_sales_for"] or Decimal(0.00)
        net_profit = gross_sales - cost_of_sales

        return {
            "gross_sales": gross_sales,
            "cost_of_sales": cost_of_sales,
            "net_profit": net_profit,
        }

    def list(self, request):
        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            return Response(
                {"error": "Please Add/Activate an outlet to continue"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        context = get_current_dates(request)
        receipt_in_outlet = context["receipts"].filter(
            sales_receipt_order__order__product__outlet=outlet_id
        )
        last_receipt_in_outlet = context["last_month_receipts"].filter(
            sales_receipt_order__order__product__outlet=outlet_id
        )
        start_date_range = request.query_params.get("start_date_range")
        end_date_range = request.query_params.get("end_date_range")

        serializer = SalesSerializer(
            {
                "today": self.calculate_sales(
                    receipts=receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date=context["current_day"],
                ),
                "yesterday": self.calculate_sales(
                    receipts=receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date=context["current_day"] - timedelta(days=1),
                ),
                "this_week": self.calculate_sales(
                    receipts=receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date=context["start_of_week"],
                    end_date=context["current_day"],
                ),
                "this_month": self.calculate_sales(
                    receipts=receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date=context["current_day"].replace(day=1),
                    end_date=context["current_day"],
                ),
                "last_week": self.calculate_sales(
                    receipts=receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date=context["start_of_last_week"],
                    end_date=context["end_of_last_week"],
                ),
                "last_month": self.calculate_sales(
                    receipts=last_receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date=context["last_month_start"],
                    end_date=context["current_day"].replace(day=1) - timedelta(days=1),
                ),
                "date_range": self.calculate_sales(
                    receipts=receipt_in_outlet,
                    outlet_id=outlet_id,
                    start_date_range=start_date_range,
                    end_date_range=end_date_range,
                ),
            }
        )

        return Response(serializer.data)


class ProductsInfoViewset(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def calculate_sales(self, start_date, outlet_id, product_id=None, end_date=None):
        queryset = Product.objects.filter(outlet__id=outlet_id)
        sales_filter = Q(
            products__order_salesreceipt__sales_receipt__issued=True,
            products__order_salesreceipt__sales_receipt__issued_at__date__gte=start_date,
        )
        if end_date:
            sales_filter &= Q(
                products__order_salesreceipt__sales_receipt__issued_at__date__lte=end_date
            )
        else:
            sales_filter &= Q(
                products__order_salesreceipt__sales_receipt__issued_at__date=start_date
            )
        queryset = queryset.annotate(
            total_qty=Coalesce(
                Sum(
                    "products__quantity",
                    filter=sales_filter,
                ),
                Value(0),
                output_field=DecimalField(max_digits=10, decimal_places=2),
            ),
            total_amount=Coalesce(
                Sum(
                    F("products__quantity") * F("products__unit_selling_price"),
                    filter=sales_filter,
                ),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            total_profit=Coalesce(
                Sum(
                    F("products__quantity")
                    * (
                        F("products__unit_selling_price")
                        - F("products__unit_cost_price")
                    ),
                    filter=sales_filter,
                ),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
        )
        # total_outlet_profit = queryset.aggregate(outlet_profits=Sum("total_profit"))["outlet_profits"]

        aggregated_quantity = queryset.aggregate(sales_contribution=Sum("total_qty"))[
            "sales_contribution"
        ]
        # profit_rank = (queryset["total_profit"]/total_outlet_profit) * 100

        queryset = queryset.order_by("-total_profit")
        profitlis = [product.total_profit for product in queryset]
        for product in queryset:
            rank = profitlis.index(product.total_profit) + 1
            product.profit_rank = rank
            # print(rank)
        # print(queryset)
        if product_id:
            product = next(
                (product for product in queryset if str(product.id) == str(product_id)),
                None,
            )
            # queryset = queryset.filter(id=product_id)
            # product = queryset.first()
            if product and aggregated_quantity:
                product.sales_contribution = (
                    product.total_qty / aggregated_quantity
                ) * 100

            queryset = [product] if product else []

            return queryset

        return sorted(queryset, key=lambda prod: prod.total_qty, reverse=True)

    def list(self, request):
        context = get_current_dates(request)
        outlet_id = get_active_outlet_id(request)
        # if not outlet_id:
        #     return Response({"error": "add/activate an outlet to continue..."})

        product_id = request.query_params.get("product_id")

        start_date_range = request.query_params.get("start_date_range")
        end_date_range = request.query_params.get("end_date_range")
        queryset = Product.objects.none()
        if start_date_range and end_date_range:
            queryset = self.calculate_sales(
                start_date=start_date_range,
                end_date=end_date_range,
                outlet_id=outlet_id,
                product_id=product_id,
            )

        serializer = productInfoSerializerBydate(
            {
                "today": ProductInfoSerializer(
                    self.calculate_sales(
                        start_date=context["current_day"],
                        outlet_id=outlet_id,
                        product_id=product_id,
                    ),
                    many=True,
                ).data,
                "yesterday": ProductInfoSerializer(
                    self.calculate_sales(
                        outlet_id=outlet_id,
                        start_date=context["current_day"] - timedelta(days=1),
                        product_id=product_id,
                    ),
                    many=True,
                ).data,
                "this_week": ProductInfoSerializer(
                    self.calculate_sales(
                        outlet_id=outlet_id,
                        start_date=context["start_of_week"],
                        end_date=context["current_day"],
                        product_id=product_id,
                    ),
                    many=True,
                ).data,
                "this_month": ProductInfoSerializer(
                    self.calculate_sales(
                        outlet_id=outlet_id,
                        start_date=context["current_day"].replace(day=1),
                        end_date=context["current_day"],
                        product_id=product_id,
                    ),
                    many=True,
                ).data,
                "last_week": ProductInfoSerializer(
                    self.calculate_sales(
                        outlet_id=outlet_id,
                        start_date=context["start_of_last_week"],
                        end_date=context["end_of_last_week"],
                        product_id=product_id,
                    ),
                    many=True,
                ).data,
                "last_month": ProductInfoSerializer(
                    self.calculate_sales(
                        outlet_id=outlet_id,
                        start_date=context["last_month_start"],
                        end_date=context["current_day"].replace(day=1)
                        - timedelta(days=1),
                        product_id=product_id,
                    ),
                    many=True,
                ).data,
                "date_range": ProductInfoSerializer(queryset, many=True).data,
            }
        )
        return Response(serializer.data)


class WeeklyProductSalesChartInfoAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def get(self, request):
        outlet_id = get_active_outlet_id(request)
        product_id = request.query_params.get("product_id")
        if not product_id or not outlet_id:
            return Response(
                {"error": "invalid details"}, status=status.HTTP_403_FORBIDDEN
            )
        current_day = timezone.localdate()
        start_of_week = current_day - timedelta(days=current_day.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        days_in_the_week_sales = {}

        sales = (
            Product.objects.filter(
                products__order_salesreceipt__sales_receipt__issued=True,
                products__order_salesreceipt__sales_receipt__issued_at__date__gte=start_of_week,
                products__order_salesreceipt__sales_receipt__issued_at__date__lte=end_of_week,
                outlet=outlet_id,
                id=product_id,
            )
            .annotate(
                date=TruncDate("products__order_salesreceipt__sales_receipt__issued_at")
            )
            .values("date")
            .annotate(
                daily_sales=Sum(
                    F("products__quantity") * F("products__unit_selling_price")
                )
            )
        )

        # days_value = {}
        for i in range(7):
            key = start_of_week + timedelta(days=i)
            key_str = key.strftime("%A")
            days_in_the_week_sales[key_str] = Decimal(0)

            # days_in_the_week_sales[key_str] = Product.objects.filter(
            #     products__order_salesreceipt__sales_receipt__issued=True,
            #     products__order_salesreceipt__sales_receipt__issued_at__date=key,
            #     outlet=outlet_id,
            #     id=product_id,
            # ).aggregate(daily_sales=Sum(F("products__quantity") * F("selling_price")))[
            #     "daily_sales"
            # ] or Decimal(
            #     0.00
            # )
        for day in sales:
            name = day["date"].strftime("%A")
            days_in_the_week_sales[name] = day["daily_sales"]

        updated_daily_sales = {"daily_sales": days_in_the_week_sales}

        return Response(updated_daily_sales)


class PrinterSetUpViewSet(viewsets.ViewSet):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisorOrStaff,
    ]
    queryset = PrinterSetup.objects.all()

    def get_queryset(self):
        print(self.queryset.filter(outlet__user=self.request.user))
        return self.queryset.filter(outlet__user=self.request.user)

    def list(self, request):
        outlet_id = get_active_outlet_id(request)
        if not outlet_id:
            return Response(
                {"error": "Activate an outlet"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        printer_setup = get_object_or_404(self.get_queryset(), outlet_id=outlet_id)
        serializer = printerSetupSerializer(printer_setup)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        outlet_id = get_active_outlet_id(request)

        if not outlet_id:
            return Response(
                {"error": "Activate an outlet"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        get_object = get_object_or_404(self.get_queryset(), outlet_id=outlet_id)
        serializer = printerSetupSerializer(get_object, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "paper size updated"}, status=status.HTTP_200_OK)


# # generate receipt pdf reportlab
def generate_sales_receipt_pdf(pk, payment_option, total, balance, remarks=None):
    Receipt = SalesReceipt.objects.get(pk=pk, issued=True)
    outlet = Receipt.orders.first().product.outlet

    # print(Receipt,outlet)
    # attending_staff=get_object_or_404(OutletStaffLogin, user=request.user)

    custom_page_size = (2.1 * inch, 6 * inch)
    left_margin = 0 * inch
    right_margin = 0 * inch
    top_margin = 0 * inch
    bottom_margin = 0 * inch
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=custom_page_size,
        leftMargin=left_margin,
        rightMargin=right_margin,
        topMargin=top_margin,
        bottomMargin=bottom_margin,
    )
    elements = []

    # Create a title for the PDF
    title = f"{outlet.name.upper()}"
    title_style = getSampleStyleSheet()["Title"]
    title_style.alignment = TA_CENTER
    title_style.fontSize = 10
    title_style.fontName = "Times-Bold"

    contact = f"888888888"
    contact_style = getSampleStyleSheet()["Normal"]
    contact_style.alignment = TA_CENTER
    contact_style.fontSize = 8

    Address = f"{outlet.address}"
    address_style = getSampleStyleSheet()["Normal"]
    address_style.alignment = TA_CENTER
    address_style.fontSize = 8
    address_style.fontName = "Times-Bold"

    issued_by = f"&nbsp;&nbsp;&nbsp;ISSUED BY : {Receipt.assigned_staff.name}"
    issued_by_style = getSampleStyleSheet()["Normal"]
    issued_by_style.fontSize = 8
    issued_by_style.fontName = "Times-Bold"

    Receipt_id = f"&nbsp;&nbsp;&nbsp;RECEIPT ID : # - 0{Receipt.id}"
    Receipt_id_style = getSampleStyleSheet()["Normal"]
    Receipt_id_style.fontSize = 8
    Receipt_id_style.fontName = "Times-Bold"
    local_time = timezone.localtime(Receipt.issued_at)
    time = f"&nbsp;&nbsp;&nbsp;DATE: {local_time.strftime('%Y-%m-%d %H:%M:%S')}"
    time_style = getSampleStyleSheet()["Normal"]
    time_style.fontSize = 8
    time_style.fontName = "Times-Bold"

    Amount_tenderd = " {0}".format(Receipt.payment.amount_tenderd)
    Amount_tenderd_style = getSampleStyleSheet()["Normal"]
    Amount_tenderd_style.fontSize = 9
    Amount_tenderd_style.alignment = 1
    Amount_tenderd_style.fontName = "Times-Bold"
    Amount_tenderd_paragraph = Paragraph(Amount_tenderd, Amount_tenderd_style)

    Remarks = f"Thank you for your patronage"
    Remarks_style = getSampleStyleSheet()["Normal"]
    Remarks_style.fontSize = 8
    Remarks_style.fontName = "Times-Bold"
    Remarks_style.alignment = TA_CENTER

    items_details_style = getSampleStyleSheet()["Normal"]
    items_details_style.fontSize = 9
    items_details_style.fontName = "Times-Roman"

    # Create a table to display the receipt data
    receipt_data = [["Product", "Qty", "Price"]]

    for product in Receipt.orders.all():
        receipt_data.append(
            [
                f"{product.product_name_at_sale}",
                f"{product.quantity}",
                f" {product.unit_selling_price}",
            ]
        )

    receipt_table = Table(receipt_data, colWidths=[1.3 * inch, 0.3 * inch, 0.6 * inch])
    receipt_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.white),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 15),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("FONTNAME", (0, 1), (-1, -1), "Times-Bold"),
                ("GRID", (0, 0), (-1, -1), 1, colors.white),
                ("WORDWRAP", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 15),
            ]
        )
    )

    receipt_data_summary = [["", "Mode", ""]]
    receipt_data_summary.append([f"Total Amount ", f"", total])
    receipt_data_summary.append(
        [
            f" Amount Tendered",
            f"{payment_option}",
            (Amount_tenderd_paragraph),
        ]
    )
    receipt_data_summary.append([f" Change Due", f"", balance])
    receipt_table_summary = Table(
        receipt_data_summary, colWidths=[1.3 * inch, 0.3 * inch, 0.6 * inch]
    )
    receipt_table_summary.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.white),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Times-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                # ('BOTTOMPADDING', (0, 0), (-1, 0), 15),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("FONTNAME", (0, 1), (-1, -1), "Times-Bold"),
                ("GRID", (0, 0), (-1, -1), 1, colors.white),
                ("WORDWRAP", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 15),
            ]
        )
    )

    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph(Address, address_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(contact, contact_style))
    elements.append(Spacer(1, 7))
    elements.append(HRFlowable(width="100%", thickness=1.5, color="black"))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(Receipt_id, Receipt_id_style))
    elements.append(Paragraph(time, time_style))
    elements.append(Paragraph(issued_by, issued_by_style))

    elements.append(Spacer(1, 7))
    elements.append(receipt_table)
    elements.append(HRFlowable(width="100%", thickness=1.5, color="black"))
    elements.append(receipt_table_summary)

    elements.append(HRFlowable(width="100%", thickness=1.5, color="black"))
    # elements.append(Paragraph(items, items_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(Remarks, Remarks_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color="black"))
    elements.append(Spacer(1, 10))
    doc.build(elements)

    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="sales_receipt_{pk}.pdf'

    buffer.seek(0)
    response.write(buffer.read())
    buffer.close()
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def sales_receipt_pdf(request, pk):
    try:
        payload = signing.loads(request.GET["token"], max_age=60)
    except (BadSignature, SignatureExpired):
        return Response(status=403)

    if payload["receipt_id"] != pk:
        return Response(status=403)
    receipt = SalesReceipt.objects.get(pk=pk)
    serializer = SalesReceiptSerializer(receipt)

    return generate_sales_receipt_pdf(
        serializer.data["id"],
        serializer.data["payment_option"],
        serializer.data["total"],
        serializer.data["balance_due"],
    )
