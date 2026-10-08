from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from django.db.models import F
from accounts.models import OutletStaff, Outlets
from .models import (
    Category,
    InventoryLog,
    Measurement,
    PrinterSetup,
    Product,
    Order,
    SalesReceipt,
    Payment,
    SalesReceiptOrder,
)


class ProductCreateSerializers(serializers.ModelSerializer):

    sold_In = serializers.CharField(source="sold_In.measurement_type")
    category = serializers.CharField(source="category.name")

    class Meta:
        model = Product
        fields = (
            "id",
            # "user",
            "product_name",
            "sold_In",
            "cost_price",
            "selling_price",
            "stock_inventory",
            "category",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        print(validated_data)
        return super().create(validated_data)


class ProductSerializers(serializers.ModelSerializer):
    # sold_In = MeasurementSerializer()
    sold_In = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    outlet = serializers.SerializerMethodField()
    # created_by = serializers.SerializerMethodField()
    # category = serializers.CharField(source="category.name")

    class Meta:
        model = Product
        fields = (
            "id",
            # "created_by",
            "outlet",
            "product_name",
            "sold_In",
            "cost_price",
            "selling_price",
            "stock_inventory",
            "category",
        )
        read_only_fields = ("id",)

    def get_outlet(self, obj):
        return obj.outlet.name if obj.outlet else None

    def get_sold_In(self, obj):
        return {
            "measurement_type": obj.sold_In.measurement_type,
            "id": obj.sold_In.id if obj.sold_In else None,
        }

    def get_category(self, obj):
        return {
            "name": obj.category.name,
            "id": obj.category.id if obj.category else None,
        }

    # def get_created_by(self, obj):
    #     return (
    #         obj.created_by.username
    #         if obj.created_by
    #         else None
    #     )


class CreateProductSerializers(serializers.ModelSerializer):
    quantity = serializers.DecimalField(
        max_digits=10, write_only=True, decimal_places=4, required=False
    )
    action = serializers.ChoiceField(
        choices=InventoryLog.Typechoices.choices, write_only=True, required=False
    )

    class UpdateCategorySerializer(serializers.ModelSerializer):
        id = serializers.IntegerField()

        class Meta:
            model = Category
            fields = ("id",)

    category = UpdateCategorySerializer()

    class UpdateMeasurementSerializer(serializers.ModelSerializer):
        id = serializers.IntegerField()

        class Meta:
            model = Measurement
            fields = ("id",)

    sold_In = UpdateMeasurementSerializer()

    # class UpdateOutletSerializer(serializers.ModelSerializer):

    #     class Meta:
    #         model = Outlets
    #         fields = ("id",)

    class Meta:
        model = Product
        fields = (
            "id",
            # "created_by",
            "product_name",
            "outlet",
            "sold_In",
            "cost_price",
            "selling_price",
            "stock_inventory",
            "category",
            "quantity",
            "action",
        )
        extra_kwargs = {
            "action": {"required": False, "allow_null": True},
            "quantity": {"required": False},
            "allow_null": True,
        }

    # def get_created_by(self, obj):
    #     return obj.created_by.username if obj.created_by else None

    def validate_stock_inventory(self, value):
        if value <= 0:
            raise serializers.ValidationError("inventory must be creater than zero")
        return value

    def create(self, validated_data):
        category_pop = validated_data.pop("category", None)
        sold_In_pop = validated_data.pop("sold_In", None)
        # outlet_pop = validated_data.pop("outlet", None)
        # print(category_pop["id"])
        if category_pop is not None:
            try:
                category_instance = Category.objects.get(id=category_pop["id"])
            except Category.DoesNotExist:
                raise ValidationError({"error": "Category selection does not exist"})
        if sold_In_pop is not None:

            try:
                measurement_instance = Measurement.objects.get(id=sold_In_pop["id"])

            except Measurement.DoesNotExist:
                raise ValidationError({"error": "Measure selection does not exist"})

        product = Product.objects.create(
            # outlet=outlet_instance,
            category=category_instance,
            sold_In=measurement_instance,
            **validated_data,
        )
        return product

    def update(self, instance, validated_data):
        category = validated_data.pop("category", None)
        sold_In = validated_data.pop("sold_In", None)

        # outlet_pop = validated_data.pop("outlet", None)
        # instance = super().update(instance, validated_data)
        with transaction.atomic():
            if category is not None:
                try:
                    category_instance = Category.objects.get(id=category["id"])

                except Category.DoesNotExist:
                    raise ValidationError(
                        {"error": "Category selection does not exist"}
                    )
                instance.category = category_instance
            if sold_In is not None:
                try:
                    measurement_instance = Measurement.objects.get(id=sold_In["id"])

                except Measurement.DoesNotExist:
                    raise ValidationError({"error": "measure selection does not exist"})

                instance.sold_In = measurement_instance
            instance.save()
            instance = super().update(instance, validated_data)
        return instance


class InventoryLogSerializer(serializers.ModelSerializer):
    action = serializers.ChoiceField(choices=InventoryLog.Typechoices.choices)
    performed_by = serializers.SerializerMethodField(required=False)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = InventoryLog
        fields = ("id", "product", "quantity", "action", "created_at", "performed_by")
        read_only_fields = ("id", "performed_by")

    def get_performed_by(self, obj):
        perfomer = "Unknown"
        if obj.performed_by_supervisor is not None:
            perfomer = f"supervisor {obj.performed_by_supervisor.name}"
        if obj.performed_by_admin is not None:
            perfomer = "Admin"
        return perfomer


class MeasurementSerializers(serializers.ModelSerializer):

    class Meta:
        model = Measurement
        fields = ("id", "measurement_type", "value", "outlet")
        read_only_fields = ("id",)

    def update(self, instance, validated_data):

        instance = super().update(instance, validated_data)

        return instance


class CategorySerializers(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ("id", "name", "outlet")
        read_only_fields = ("id",)

    def update(self, instance, validated_data):

        instance = super().update(instance, validated_data)

        return instance


class OrderSerializers(serializers.ModelSerializer):
    product = ProductSerializers()

    class Meta:
        model = Order
        fields = (
            "id",
            "product",
            "quantity",
            "description",
            "date",
            "product_name_at_sale",
            "measurement_type_at_sale",
            "measurement_value_at_sale",
            "unit_selling_price",
            "paid",
            "sub_total",
        )
        read_only_fields = ("id",)

    # def get_order_subtotal(self, obj):
    #     subtotal = obj.order_subtotal  # already Decimal
    #     return str(subtotal.quantize(Decimal("0.00")))


class CheckReceiptStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = SalesReceipt
        fields = (
            "id",
            "hold",
        )
        read_only_fields = ("id",)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class SalesReceiptSerializer(serializers.ModelSerializer):

    orders = OrderSerializers(many=True)
    total = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()
    payment_option = serializers.SerializerMethodField()
    amount_tenderd = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = SalesReceipt
        fields = (
            "id",
            "hold",
            "orders",
            "remarks",
            "payment_option",
            "date",
            "issued",
            "total",
            "amount_tenderd",
            "balance_due",
        )
        read_only_fields = ("id",)

    def get_total(self, obj):
        total_sales_amount = obj.orders.all()

        return sum(sales.sub_total for sales in total_sales_amount)

    def get_payment_option(self, obj):
        payment_option_first = obj.sales_receipt_order.first()

        if payment_option_first:
            return payment_option_first.payment_option

        return None

    def get_date(self, obj):
        receipt_date = obj.issued_at if obj.issued and obj.issued_at else obj.date

        return serializers.DateTimeField().to_representation(receipt_date)

    def get_balance_due(self, obj):

        total_sales_amount = self.get_total(obj)

        try:
            payment = obj.payment
        except Payment.DoesNotExist:
            payment = None

        if payment and payment.amount_tenderd is not None:
            return total_sales_amount - payment.amount_tenderd

        return total_sales_amount

    def get_amount_tenderd(self, obj):
        total_sales_amount = self.get_total(obj)

        try:
            payment = obj.payment
        except:
            payment = None

        if payment and payment.amount_tenderd is not None:
            return payment.amount_tenderd

        return total_sales_amount


class SalesReceiptCreateSerializer(serializers.ModelSerializer):
    class UpdateOrderSerializer(serializers.ModelSerializer):
        product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

        class Meta:
            model = Order
            fields = ("product", "quantity", "sub_total")

    hold = serializers.BooleanField(
        required=False,
    )
    orders = UpdateOrderSerializer(many=True)
    payment_option = serializers.ChoiceField(
        choices=SalesReceiptOrder.Paymentchoices.choices,
        required=False,
        allow_blank=True,
    )
    amount_tenderd = serializers.DecimalField(
        max_digits=15, required=False, write_only=True, decimal_places=2
    )

    def update(self, instance, validated_data):
        orderItem_data = validated_data.pop("orders", None)
        payment_option_bc = validated_data.pop("payment_option", None)
        amount_tenderd = validated_data.pop("amount_tenderd", None)
        hold = validated_data.get("hold")

        with transaction.atomic():
            instance = super().update(instance, validated_data)
            if orderItem_data is not None:

                receipt = SalesReceipt.objects.get(id=instance.id)
                receipt.orders.all().delete()

                # order_items = [
                #     Order(
                #         user=self.context["request"].user,

                #         sub_total=orderItem["quantity"]
                #         * orderItem["product"].selling_price,
                #         **orderItem,
                #     )
                #     for orderItem in orderItem_data
                # ]

                # new_order_item = Order.objects.bulk_create(order_items)
                new_order_items = []

                for order_item_data in orderItem_data:
                    new_order = Order(
                        user=self.context["request"].user,
                        **order_item_data,
                    )

                    new_order.save()
                    new_order_items.append(new_order)
                for new_order in new_order_items:
                    receipt.add_order(
                        order=new_order,
                        payment_option=payment_option_bc
                        or SalesReceiptOrder.Paymentchoices.CASH,
                        remarks="newly created",
                    )
                if hold is False:
                    receipt = SalesReceipt.objects.select_for_update().get(
                        id=instance.id
                    )
                    receipt.payment.amount_tenderd = Decimal(amount_tenderd)
                    receipt.payment.paid = True
                    receipt.payment.payment_time = timezone.now()
                    receipt.issued_at = timezone.now()
                    receipt.issued = True
                    receipt.payment.save()
                    receipt.full_clean()
                    receipt.save()

                    for x in orderItem_data:

                        product = x["product"]
                        inventory_update = Product.objects.filter(
                            id=product.id, stock_inventory__gte=x["quantity"]
                        ).update(stock_inventory=F("stock_inventory") - x["quantity"])
                        if inventory_update == 0:
                            raise serializers.ValidationError(
                                {
                                    "inventory_error": "low stock",
                                    "product_id": product.id,
                                }
                            )

        return instance

    hold = serializers.BooleanField(required=False)

    class Meta:
        model = SalesReceipt
        fields = (
            "id",
            "assigned_staff",
            "hold",
            "orders",
            "remarks",
            "payment_option",
            "amount_tenderd",
        )


class PaymentReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "Payemnt_for_receipt",
            "Amount_tenderd",
            "payment_time",
            "amount",
            "issued",
        )


class ViewOrderSerializer(serializers.ModelSerializer):
    # product_name = serializers.CharField(source='orders.product_name')
    # product_price = serializers.CharField(source='product.selling_price')

    class Meta:
        model = SalesReceiptOrder
        fields = (
            "sales_receipt",
            "order",
            "payment_option",
            "remarks",
        )


class CreateOrderSerializer(serializers.ModelSerializer):
    receipt_id = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, write_only=True
    )

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "product",
            "quantity",
            "description",
            "sub_total",
            "receipt_id",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        print(validated_data, self.initial_data)

        validated_data.pop("receipt_id", None)
        return super().create(validated_data)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value


class IssuedReceiptsSerializer(serializers.ModelSerializer):
    order = CreateOrderSerializer()

    class Meta:
        model = SalesReceiptOrder
        fields = ("order", "payment_option", "sales_receipt", "remarks")


# class DailySalesSerializer(serializers.Serializer):
#     daily = serializers.CharField()
#     total_daily = serializers.DecimalField(max_digits=10, decimal_places=2)

# class WeeklySerializer(serializers.Serializer):

# class MonthlySalesSerializer(serializers.Serializer):
#     month = serializers.CharField()
#     total = serializers.DecimalField(max_digits=10, decimal_places=2)


class GrossSalesSerilizer(serializers.Serializer):
    sales = serializers.DecimalField(max_digits=10, decimal_places=2)


class CostOfSalesSalesSerilizer(serializers.Serializer):
    cost_of_sale = serializers.DecimalField(max_digits=10, decimal_places=2)


# class SalesInfoSerializer(serializers.Serializer):
#     daily_sales = DailySalesSerializer(many=True)
#     monthly_sales = MonthlySalesSerializer(many=True)
# gross_sales = GrossSalesSerilizer(many=True)
# cost_of_sales = CostOfSalesSalesSerilizer(many=True)
# net_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
# gross_profit = serializers.DecimalField(max_digits=10, decimal_places=2)


class PreSalesSerializer(serializers.Serializer):
    gross_sales = serializers.DecimalField(max_digits=10, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=10, decimal_places=2)
    cost_of_sales = serializers.DecimalField(max_digits=10, decimal_places=2)


class SalesSerializer(serializers.Serializer):
    today = PreSalesSerializer()
    yesterday = PreSalesSerializer()
    this_week = PreSalesSerializer()
    this_month = PreSalesSerializer()
    last_week = PreSalesSerializer()
    last_month = PreSalesSerializer()
    date_range = PreSalesSerializer()


class ProductInfoSerializer(serializers.ModelSerializer):
    total_qty = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    total_amount = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    total_profit = serializers.DecimalField(
        read_only=True, max_digits=10, decimal_places=2
    )
    sales_contribution = serializers.FloatField(
        read_only=True, default=None, allow_null=True
    )
    profit_rank = serializers.IntegerField(
        read_only=True, default=None, allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "product_name",
            "total_qty",
            "total_amount",
            "total_profit",
            "profit_rank",
            "sales_contribution",
        ]


class productInfoSerializerBydate(serializers.Serializer):
    today = ProductInfoSerializer(many=True)
    yesterday = ProductInfoSerializer(many=True)
    this_week = ProductInfoSerializer(many=True)
    this_month = ProductInfoSerializer(many=True)
    last_week = ProductInfoSerializer(many=True)
    last_month = ProductInfoSerializer(many=True)
    date_range = ProductInfoSerializer(many=True)


class printerSetupSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrinterSetup
        fields = ["outlet", "paper_size", "id"]
        read_only_fields = ("id",)
