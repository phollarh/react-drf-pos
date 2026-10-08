from django.http import Http404

from .services import ensure_staff_assigned, supervisor_session

from .models import (
    AuthorizationNonce,
    EmailVerification,
    OutletStaff,
    OutletStaffLogin,
    Outlets,
    PasswordResetToken,
    PasswordUpdateVerification,
    Profile,
)
from datetime import timedelta
import uuid
from django.db import IntegrityError, transaction
from rest_framework.exceptions import ValidationError
from django.conf import settings
from django.shortcuts import get_object_or_404, render
from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import AllowAny
from .schema import user_list_docs
from .schema import create_userList_doc
from rest_framework import generics
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from django.utils import timezone
import secrets
from .serializer import (
    AccountSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPiarSerializer,
    CustomTokenRefreshSerializer,
    OutletSerializer,
    OutletStaffSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    StaffLoginSerializer,
    ValidateOutletSerializer,
)
from rest_framework.decorators import action
from django.contrib.auth.hashers import check_password
from pos.global_permisson import IsVerified
from django.core import signing
from django.core.signing import BadSignature, SignatureExpired
from accounts.session_permisson import (
    ASPermission,
    IsAdminOrSupervisor,
    IsAdminOrSupervisorOrStaff,
)

# Create your views here.


def activateEmail(request, user, code):
    mail_subject = "Activate your user account."
    message = render_to_string(
        "activate_account.html",
        {
            "user": user.email,
            "name": user.first_name,
            "code": code,
        },
    )
    email = EmailMessage(mail_subject, message, to=[user.email])
    email.content_subtype = "html"
    email.send()


def PasswordResetEmail(request, user, code):
    try:
        mail_subject = "Reset your user account Password."
        message = render_to_string(
            "password_reset_otp.html",
            {
                "user": user.email,
                "code": code,
            },
        )
        email = EmailMessage(mail_subject, message, to=[user.email])
        email.content_subtype = "html"
        sent = email.send(fail_silently=False)
        print("Email send result:", sent)
        return sent == 1

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        raise


class ActivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        id = request.data.get("id")
        code = request.data.get("code")

        User = get_user_model()
        if not id or not code:
            return Response(
                {"error": "User ID and code are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid User Detials"}, status=status.HTTP_404_NOT_FOUND
            )

        if user.email_verified:
            return Response(
                {"message": "Account already verified"},
                status=status.HTTP_200_OK,
            )

        try:
            email_model_instance = EmailVerification.objects.get(user=user)
        except EmailVerification.DoesNotExist:
            return Response(
                {"error": "Verification code not found, Request another"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not check_password(code, email_model_instance.code):
            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if email_model_instance.is_expired():
            return Response(
                {"error": "Expired OTP, Request Another"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email_model_instance.pending_email:
            user.email = email_model_instance.pending_email
        user.email_verified = True
        user.save()
        return Response(
            {
                "id": user.id,
                "email_verified": True,
                "message": "Account verification successful",
            },
            status=status.HTTP_200_OK,
        )

    # def get(self, request, uidb64, token):
    #     User = get_user_model()

    #     try:
    #         uid = force_str(urlsafe_base64_decode(uidb64))
    #         user = User.objects.get(pk=uid)
    #     except (TypeError, User.DoesNotExist):
    #         return Response(
    #             {"error": "Invalid activation link"}, status=status.HTTP_400_BAD_REQUEST
    #         )

    #     if account_activation_token.check_token(user, token):
    #         user.email_verified = True
    #         user.save()

    #         return Response(
    #             {"message": "Email verified successfully"}, status=status.HTTP_200_OK
    #         )

    #     return Response(
    #         {"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST
    #     )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @create_userList_doc
    def post(self, request):

        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        code = str(secrets.randbelow(90000) + 10000)

        EmailVerification.objects.update_or_create(
            user=user,
            defaults={
                "code": code,
                #    "expires_at": timezone.now() + timedelta(minutes=10),
            },
        )
        activateEmail(request, code=code, user=user)
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class AuthenticateOutletView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def post(self, request):
        outlet_id = request.data.get("outlet_id")
        outlet_pin = request.data.get("outlet_pin")
        active_outlet = get_active_outlet_id(request)
        if active_outlet and str(active_outlet) != str(outlet_id):
            return Response(
                {"error": "deactive active outlet to proceed"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not outlet_id or not outlet_pin:
            return Response(
                {"error": "Outlet ID and PIN are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            outlet = Outlets.objects.get(id=outlet_id, user=request.user)
        except Outlets.DoesNotExist:
            return Response(
                {"error": "Outlet not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if request.pos_authorization.get("role") == "supervisor":
            if str(request.pos_authorization.get("outlet_id")) != str(outlet_id):
                return Response(
                    {"error": "You're not a member of this outlet..."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if not check_password(outlet_pin, outlet.pin):
            return Response(
                {"error": "Invalid outlet PIN"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        active_status = request.data.get("desired_status")
        if not isinstance(active_status, bool):
            return Response(
                {"error": "A valid outlet status is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if active_status:
            active_outlet = signing.dumps(
                {
                    "outlet_id": outlet.id,
                    "user_id": outlet.user.id,
                    "is_active": active_status,
                },
                salt="active_outlet",
            )
            response = Response(
                {
                    "id": outlet.id,
                    "is_active": active_status,
                    "message": "PIN verified",
                },
                status=status.HTTP_200_OK,
            )
            response.set_cookie(
                "active_outlet",
                active_outlet,
                httponly=True,
                samesite="Lax",
                max_age=30 * 24 * 60 * 60,
            )
            return response
        else:

            response = Response(
                {
                    "id": outlet.id,
                    "is_active": active_status,
                    "message": "outlet deactivated",
                },
                status=status.HTTP_200_OK,
            )

            assigned_staff = request.COOKIES.get("assigned_staff")
            print(assigned_staff, "asssss", active_status)
            if assigned_staff:
                print("madehedgdg")
                OutletStaffLogin.objects.filter(
                    outlet_staff__Employee_id=assigned_staff, assigned=True
                ).update(
                    assigned=False,
                    last_activity=timezone.now(),
                    assignment_expires_at=None,
                )
                response.delete_cookie("assigned_staff")
            response.delete_cookie("active_outlet")
            return response


class LogOutAPIVIEW(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        response = Response("Logged out successfully")
        response.set_cookie("refresh_token", "", expires=0)
        response.set_cookie("access_token", "", expires=0)

        return response


def get_active_outlet_id(request):
    signed_token = request.COOKIES.get("active_outlet")

    if not signed_token:
        return None

    try:
        active_outlet = signing.loads(
            signed_token,
            salt="active_outlet",
            max_age=30 * 24 * 60 * 60,
        )
    except (signing.SignatureExpired, signing.BadSignature):
        return None

    if str(active_outlet.get("user_id")) != str(request.user.id):
        return None

    return active_outlet.get("outlet_id")


class AccountViewSet(viewsets.ViewSet):
    Account = get_user_model()
    queryset = Account.objects.all()
    permission_classes = [IsAuthenticated, ASPermission, IsAdminOrSupervisor]

    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated()]
        return super().get_permissions()

    @user_list_docs
    def list(self, request):

        user_id = request.query_params.get("user_id")
        if str(user_id) != str(request.user.id):
            return Response(
                {"error": "invalid user details "}, status=status.HTTP_400_BAD_REQUEST
            )
        queryset = self.queryset.get(id=user_id)
        serializer = AccountSerializer(queryset)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["get"],
        url_path="is_authenticated",
        permission_classes=[IsAuthenticated],
    )
    def is_authenticated(self, request):
        signed_active_token = request.COOKIES.get("active_outlet")
        if not signed_active_token:
            return Response(
                {
                    "is_authenticated": True,
                    "auth_id": request.user.id,
                    "active_outlet": None,
                    "is_outlet_active": False,
                },
                status=status.HTTP_200_OK,
            )
        try:
            active_outlet = signing.loads(
                signed_active_token, salt="active_outlet", max_age=30 * 24 * 60 * 60
            )
        except signing.SignatureExpired:
            response = Response(
                {
                    "is_authenticated": True,
                    "auth_id": request.user.id,
                    "active_outlet": None,
                    "is_outlet_active": False,
                },
                status=status.HTTP_200_OK,
            )
            response.delete_cookie("active_outlet")
            return response
        except signing.BadSignature:
            response = Response(
                {
                    "is_authenticated": True,
                    "auth_id": request.user.id,
                    "active_outlet": None,
                    "is_outlet_active": False,
                },
                status=status.HTTP_200_OK,
            )
            response.delete_cookie("active_outlet")
            return response

        if str(request.user.id) != str(active_outlet.get("user_id")):
            response = Response(
                {
                    "is_authenticated": True,
                    "auth_id": request.user.id,
                    "active_outlet": None,
                    "is_outlet_active": False,
                },
                status=status.HTTP_200_OK,
            )

            response.delete_cookie("active_outlet")
            return response
        return Response(
            {
                "is_authenticated": True,
                "auth_id": request.user.id,
                "active_outlet": active_outlet.get("outlet_id"),
                "is_outlet_active": True,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["POST"],
        url_path="pos_authorization",
        permission_classes=[IsAuthenticated, IsVerified],
    )
    def pos_authorization(self, request):
        employee_id = request.data.get("staff_id")
        outlet_id = request.data.get("outlet")
        active_auth_outlet = get_active_outlet_id(request)
        if isinstance(outlet_id, str):
            outlet_id = outlet_id.strip()
            outlet_id = outlet_id or None
        if (
            active_auth_outlet is not None
            and outlet_id
            and str(active_auth_outlet) != str(outlet_id)
        ):
            return Response(
                {
                    "error": "please deactivate active outlet, before authorizing another outlet"
                },
                status=status.HTTP_409_CONFLICT,
            )
        role = (request.data.get("authorize_as") or "").lower()
        get_password = request.data.get("passcode")
        allowed_roles = {"admin", "supervisor", "staff"}
        session_expires_at = (
            timezone.now() + timedelta(seconds=settings.STAFF_ASSIGNMENT_MAX_AGE)
        ).timestamp()

        if role not in allowed_roles:
            return Response(
                {"error_role": "role is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        if not get_password:
            return Response(
                {"error": "Password or PIN is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if role == "admin":
            outlet = None
            if not request.user.check_password(get_password):
                return Response(
                    {"error_passcode": "Invalid admin password, try again"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if outlet_id is not None:
                try:
                    outlet = Outlets.objects.get(
                        id=outlet_id,
                        user=request.user,
                    )
                except Outlets.DoesNotExist:
                    return Response(
                        {"error": "invalid outlet"}, status=status.HTTP_400_BAD_REQUEST
                    )
            session_auth = signing.dumps(
                {
                    "outlet_id": (outlet.id if outlet else None),
                    "employee_id": str(employee_id),
                    "user_id": request.user.id,
                    "session_expiration": session_expires_at,
                    "role": role,
                },
                salt="user_pass_session",
            )
        elif role == "supervisor":
            try:
                get_staff = OutletStaff.objects.get(
                    Employee_id=employee_id,
                    # status__iexact=role,
                    outlet__user=request.user,
                )
                if get_staff.status.lower() != role:
                    return Response(
                        {"error_role": "Selected role is not a supervisor"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except OutletStaff.DoesNotExist:
                return Response(
                    {"error": "invalid staff details"}, status=status.HTTP_404_NOT_FOUND
                )
            if not check_password(get_password, get_staff.pin):
                return Response(
                    {"error_passcode": "Invalid password"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            supervisor_session(get_staff)
            session_auth = signing.dumps(
                {
                    "outlet_id": get_staff.outlet.id,
                    "employee_id": str(get_staff.Employee_id),
                    "session_expiration": session_expires_at,
                    "user_id": request.user.id,
                    "role": role,
                },
                salt="user_pass_session",
            )
        elif role == "staff":
            if not outlet_id:
                return Response(
                    {"error": "outlet is required"}, status=status.HTTP_400_BAD_REQUEST
                )
            try:
                get_staff = OutletStaff.objects.get(
                    Employee_id=employee_id,
                    #    status__iexact=role,
                    outlet__user=request.user,
                    outlet__id=outlet_id,
                )
                if get_staff.status.lower() != role:
                    return Response(
                        {"error_role": "Selected role is not staff "},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except OutletStaff.DoesNotExist:
                return Response(
                    {"error": "invalid staff details"}, status=status.HTTP_404_NOT_FOUND
                )
            if not check_password(get_password, get_staff.pin):
                return Response(
                    {"error_passcode": "Invalid password"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            currently_assigned = request.COOKIES.get("assigned_staff")
            
            if currently_assigned is not None and str(currently_assigned) != str(
                get_staff.Employee_id
            ):
                return Response(
                    {"error": "Please unassign the current staff before continuing"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            ensure_staff_assigned(request, get_staff)
            session_auth = signing.dumps(
                {
                    "outlet_id": outlet_id,
                    "employee_id": str(get_staff.Employee_id),
                    "user_id": request.user.id,
                    "session_expiration": session_expires_at,
                    "role": role,
                },
                salt="user_pass_session",
            )

        response = Response(
            {
                "message": "authorization success",
                "authSession": "active",
                "role": role,
                "authorize": True,
            },
            status=status.HTTP_200_OK,
        )
        if role == "staff":
            response.set_cookie(
                "assigned_staff",
                str(get_staff.Employee_id),
                max_age=settings.STAFF_ASSIGNMENT_MAX_AGE,
                httponly=True,
                samesite="Lax",
            )
        response.set_cookie(
            "pos_session",
            session_auth,
            max_age=settings.STAFF_ASSIGNMENT_MAX_AGE,
            httponly=True,
            samesite="Lax",
            secure=False,
        )
        response.delete_cookie("pass_token")
        return response

    @action(
        detail=False,
        methods=["GET"],
        url_path="check_user_session",
        permission_classes=[IsAuthenticated, IsVerified],
    )
    def check_user_session(self, request):
        token = request.COOKIES.get("pos_session")
        if not token:
            return Response(
                {"error": "No active session detail"},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            authorization = signing.loads(
                token, salt="user_pass_session", max_age=15 * 60
            )
        except signing.SignatureExpired:
            return Response(
                {
                    "error": "session expired please reauthenticate",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except signing.BadSignature:
            return Response(
                {
                    "error": "Invalid POS authorization",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if str(authorization["user_id"]) != str(request.user.id):
            return Response(
                {"error": "invalid user details"}, status=status.HTTP_403_FORBIDDEN
            )
        if authorization["role"] in {"supervisor", "staff"}:
            try:
                staff = OutletStaff.objects.get(
                    Employee_id=authorization["employee_id"],
                    outlet__user=request.user,
                    status__iexact=authorization["role"],
                )
            except OutletStaff.DoesNotExist:
                return Response(
                    {"error": "Invalid supervisor or staff details"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(
                {
                    "role": authorization["role"],
                    "user_session_id": staff.Employee_id,
                    "user_session_name": staff.name,
                    "username": staff.username,
                    "avatar": (
                        request.build_absolute_uri(staff.image.url)
                        if staff.image
                        else None
                    ),
                },
                status=status.HTTP_200_OK,
            )
        profile = getattr(request.user, "profile", None)

        avatar = (
            request.build_absolute_uri(profile.image.url)
            if profile and profile.image
            else None
        )
        return Response(
            {
                "role": authorization["role"],
                "user_session_id": request.user.id,
                "user_session_name": request.user.first_name,
                "avatar": avatar,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["POST"],
        url_path="end_user_session",
        permission_classes=[
            # IsAuthenticated,
            IsVerified,
            ASPermission,
            IsAdminOrSupervisorOrStaff,
        ],
    )
    def end_user_session(self, request):
        session = request.pos_authorization
        session_id = request.pos_authorization.get("employee_id")
        role = session.get("role")
        assigned_staff = request.COOKIES.get("assigned_staff")
        current_time = timezone.now()

        if str(role) in {"supervisor", "staff", "admin"}:
            assigned_session_log = (
                OutletStaffLogin.objects.filter(
                    outlet_staff__Employee_id=assigned_staff, is_active=True
                )
                .order_by("-login_date")
                .first()
            )
            if assigned_session_log:
                assigned_session_log.last_activity = current_time
                if assigned_session_log.assigned:

                    assigned_session_log.assigned = False
                    assigned_session_log.assignment_expires_at = None

                assigned_session_log.save()

        response = Response(
            {
                "message": "session ended",
                "unassigned_staff_id": assigned_staff if assigned_staff else None,
            },
            status=status.HTTP_200_OK,
        )
        response.delete_cookie("pass_token")
        response.delete_cookie("assigned_staff")
        response.delete_cookie("pos_session")
        return response

    @action(
        detail=False,
        methods=["POST"],
        url_path="authenticate_password",
        permission_classes=[IsAuthenticated, ASPermission, IsAdminOrSupervisorOrStaff],
    )
    def authenticate_password(self, request):
        user_passcode = request.data.get("password")
        purpose = request.data.get("purpose")
        authorization = request.pos_authorization
        session_role = authorization.get("role")
        session_employee_id = authorization.get("employee_id")
        request_cred = request.data.get("requestId")
        outlet_id = request.data.get("outlet_id")
        if not request_cred or not purpose:
            return Response(
                {"error": "Invalid action, try again"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            object_id = request_cred["id"]
            object_details = request_cred["object_details"]
        except (KeyError, TypeError, ValueError):
            return Response(
                {"error": "Invalid request data"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        AuthorizationNonce.objects.filter(
            user=request.user,
            purpose=purpose,
            object_id=str(object_id),
            object_details=object_details,
        ).delete()
        if user_passcode is None:
            return Response(
                {"error": "password required"}, status=status.HTTP_400_BAD_REQUEST
            )
        if session_role == "admin":
            if not request.user.check_password(user_passcode):
                return Response(
                    {"error": "Invalid admin password"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            authorizer = {"id": request.user.id, "authorize": "admin"}
        elif session_role == "supervisor":

            # if outlet_id is None:
            #     return Response(
            #         {"error": "Activate an out to use Supervisor passcode "},
            #         status=status.HTTP_400_BAD_REQUEST,
            #     )
            # try:
            #     outlet_supervisor = Outlets.objects.get(user=request.user, id=outlet_id)
            # except Outlets.DoesNotExist:
            #     return Response(
            #         {"error": "Invalid user Outlet "},
            #         status=status.HTTP_400_BAD_REQUEST,
            #     )
            try:
                supervisor = OutletStaff.objects.get(
                    outlet__user=request.user,
                    status__iexact="supervisor",
                    Employee_id=session_employee_id,
                )
            except OutletStaff.DoesNotExist:
                return Response(
                    {"error": "You can not perform this action"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # for staff in supervisor:
            #     if str(request.pos_authorization['employee_id']) != str(staff.Employee_id):
            #         return Response({"error":"You can not perform this action"}, status=status.HTTP_400_BAD_REQUEST)
            if check_password(user_passcode, supervisor.pin):
                authorizer = {
                    "id": str(supervisor.Employee_id),
                    "authorize": f"supervisor {supervisor.name}",
                }

            else:
                return Response(
                    {"error": "Invalid passcode"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif session_role == "staff":
            return Response(
                {
                    "error": "You can not perform this action, Admin or supervisor authorization required"
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        nonce = uuid.uuid4().hex

        AuthorizationNonce.objects.create(
            nonce=nonce,
            purpose=purpose,
            object_details=object_details,
            object_id=str(object_id),
            user=request.user,
        )
        lag_time_check = request.data.get("lag_time_check")

        pass_token = signing.dumps(
            {
                "lag_time_check": lag_time_check,
                "user_id": request.user.id,
                "nonce": nonce,
                "authorizer": authorizer,
                "purpose": purpose,
            },
            salt="user_pass",
        )
        response = Response(
            {
                "message": "Passcode verified",
                "pass_token": pass_token,
            },
            status=status.HTTP_200_OK,
        )
        if lag_time_check is True:
            response.set_cookie(
                "pass_token",
                response.data["pass_token"],
                max_age=15 * 60,
                httponly=True,
                samesite="Lax",
                # secure=True,
            )
        return response

    @action(
        detail=False,
        methods=["POST", "PATCH"],
        url_path="reset_password",
        permission_classes=[AllowAny],
    )
    def reset_password(self, request):
        User = get_user_model()
        if request.method == "POST":
            email = request.data.get("email")
            code = request.data.get("code")
            if not email or not code:
                return Response(
                    {"error": "User Email and code are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "invalid user email"}, status=status.HTTP_404_NOT_FOUND
                )
            try:
                email_model_instance = PasswordUpdateVerification.objects.get(user=user)
            except PasswordUpdateVerification.DoesNotExist:
                return Response(
                    {"error": "Verification code not found, Request another"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if email_model_instance.is_expired():
                return Response(
                    {"error": "Verification code expired, please try again"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not check_password(code, email_model_instance.code):
                return Response(
                    {"error": "Invalid OTP , try again"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reset_token = signing.dumps({"user_id": user.id}, salt="password-reset")
            PasswordResetToken.objects.create(user=user, token=reset_token, used=False)
            return Response(
                {
                    "reset_token": reset_token,
                    "message": "verification successful, input new Password",
                },
                status=status.HTTP_200_OK,
            )
        elif request.method == "PATCH":
            token = request.data.get("token")

            if not token:
                return Response(
                    {"error": "Reset token required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                payload = signing.loads(
                    token,
                    salt="password-reset",
                    max_age=600,
                )

            except SignatureExpired:
                return Response(
                    {"error": "Reset token expired"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except BadSignature:
                return Response(
                    {"error": "Invalid reset token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            record = PasswordResetToken.objects.filter(
                user_id=payload["user_id"],
                token=token,
                used=False,
            ).first()

            if not record:
                return Response(
                    {"error": "invalid, request new OTP"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                user = User.objects.get(id=payload["user_id"])
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = ResetPasswordSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            if user.check_password(serializer.validated_data["new_password"]):
                return Response(
                    {"error": "Invalid, please try a different password"}, status=400
                )
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            record.used = True
            record.save()

            # PasswordUpdateVerification.objects.filter(
            #     user=user
            # ).delete()
            return Response(
                {"message": "Password updated successfully"},
                status=status.HTTP_200_OK,
            )

    @action(
        detail=False,
        methods=["POST"],
        url_path="forgot_password_otp_gen",
        permission_classes=[AllowAny],
    )
    def forgot_password_otp_gen(self, request):
        User = get_user_model()
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "please enter a valid email"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "NO user with the email"}, status=status.HTTP_400_BAD_REQUEST
            )

        password_model_instance, created = (
            PasswordUpdateVerification.objects.update_or_create(
                user=user,
            )
        )

        if not created:
            if (
                password_model_instance.created_at + timezone.timedelta(minutes=5)
                > timezone.now()
            ):
                return Response(
                    {
                        "error": "Please wait a while before requesting another",
                        "nextTime": max(
                            0,
                            int(
                                (
                                    password_model_instance.created_at
                                    + timezone.timedelta(minutes=5)
                                    - timezone.now()
                                ).total_seconds()
                            ),
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        code = str(secrets.randbelow(90000) + 10000)

        if not PasswordResetEmail(request, user, code):
            return Response({"error": "Failed to send email"}, status=500)

        password_model_instance.created_at = timezone.now()
        password_model_instance.code = code
        password_model_instance.save()

        return Response(
            {
                "sent": True,
                "email": user.email,
                "next_available_time": password_model_instance.created_at
                + timezone.timedelta(minutes=5),
                "message": "OTP sent, Please check your email to change your password",
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["PATCH"],
        url_path="otp_resend_email",
        permission_classes=[IsAuthenticated],
    )
    def otp_resend_email(self, request):

        User = get_user_model()
        email = request.data.get("email")
        user_id = request.data.get("id")
        if not email or not user_id:
            return Response(
                {"error": "user id and email required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid user details"}, status=status.HTTP_400_BAD_REQUEST
            )
        if user.email_verified:
            return Response(
                {"error": "Email already already verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(email=email).exclude(id=user.id).exists():
            return Response({"error": "Email already in use"}, status=400)

        verification_instance, created = EmailVerification.objects.get_or_create(
            user=user,
            defaults={
                "pending_email": email,
            },
        )
        if not created:
            if (
                verification_instance.created_at + timezone.timedelta(minutes=5)
                > timezone.now()
            ):
                return Response(
                    {"error": "Please wait a while before requesting another code"},
                    status=400,
                )
        code = str(secrets.randbelow(90000) + 10000)

        verification_instance.pending_email = email
        verification_instance.code = code
        verification_instance.created_at = timezone.now()
        verification_instance.save()

        activateEmail(request, code=code, user=user)
        return Response(
            {
                "message": "please check your email for single-use code",
                "next_available_time": verification_instance.created_at
                + timezone.timedelta(minutes=5),
            }
        )

    @action(
        detail=False,
        methods=["GET"],
        url_path="otp_status",
        permission_classes=[IsAuthenticated],
    )
    def otp_status(self, request):
        User = get_user_model()
        user_id = request.query_params.get("id")

        try:
            user = User.objects.get(id=user_id)

        except User.DoesNotExist:

            return Response({"error": "invalid user"}, status=status.HTTP_404_NOT_FOUND)
        if user.email_verified:
            return Response(
                {"is_verified": "User already verified"}, status=status.HTTP_200_OK
            )
        try:
            verification = EmailVerification.objects.get(user=user)
        except EmailVerification.DoesNotExist:
            return Response({"can_resend": True}, status=status.HTTP_404_NOT_FOUND)

        next_time = verification.created_at + timezone.timedelta(minutes=5)

        return Response(
            {
                "next_available_time": next_time,
                "can_resend": next_time <= timezone.now(),
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["PATCH"],
        url_path="change-password",
        permission_classes=[IsAuthenticated, ASPermission, IsAdminOrSupervisor],
    )
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = request.user

        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"current_password": ["Incorrect password"]}, status=400)
        if user.check_password(serializer.validated_data["new_password"]):
            return Response(
                {"error": "New password must be different from your current password."},
                status=400,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"message": "Password changed successfully"}, status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["GET"],
        url_path="get_email_verify_status",
        permission_classes=[IsAuthenticated],
    )
    def get_email_verify_status(self, request):
        try:
            user = self.queryset.get(id=self.request.user.id)
        except self.Account.DoesNotExist:
            return Response(
                {"error": "Invalid User"}, status=status.HTTP_400_BAD_REQUEST
            )
        if not user.email_verified:
            return Response(
                {
                    "error": "Please verify your Email",
                    "email_verification_status": False,
                },
                status=403,
            )
        return Response(
            {"message": "Email Already Verified...", "email_verification_status": True},
            status=200,
        )


class ProfileViewSet(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]

    def get_object(self):
        profile = Profile.objects.get(profile=self.request.user)
        return profile


# class OuletViewSet(generics.RetrieveUpdateAPIView):
#     serializer_class = OutletSerializer
#     permission_classes = [IsAuthenticated]


#     def get_queryset(self):
#         return Outlets.objects.filter(user=self.request.user)
class OuletViewSet(viewsets.ModelViewSet):
    queryset = Outlets.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]
    serializer_class = OutletSerializer

    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated(), IsVerified()]
        return super().get_permissions()

    def partial_update(self, request, *args, **kwargs):

        instance = self.get_object()
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
                {"error": "token expired, try later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payload["user_id"] != request.user.id:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_403_FORBIDDEN,
            )
        if payload["authorizer"]["authorize"] != "admin":

            response = Response(
                {"error_admin": "Error, Only admin and update outlet"},
                status=status.HTTP_403_FORBIDDEN,
            )
            response.delete_cookie("pass_token")
            return response
        nonce = payload["nonce"]
        # purpose = payload["purpose"]
        with transaction.atomic():
            if not payload["lag_time_check"]:
                try:
                    verify_nonce = AuthorizationNonce.objects.select_for_update().get(
                        object_id=str(instance.id),
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
            self.perform_update(serializer)

            # verify_nonce.delete()
            return Response(
                {"data": serializer.data, "message": "update successful"},
                status=status.HTTP_200_OK,
            )

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        token = request.headers.get("X-Pass-Token")
        if not token:
            token = request.COOKIES.get("pass_token")
        if not token:
            return Response(
                {"error_token": "Admin/Supervisor Passcode required"},
                status=status.HTTP_403_FORBIDDEN,
            )
        pin = request.data.get("pin")
        if len(pin) != 4 or not pin.isdigit():
            return Response(
                {"error": " 4 digits are required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payload = signing.loads(token, salt="user_pass", max_age=15 * 60)

        except SignatureExpired:
            return Response(
                {"error": "token expired, try later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payload["user_id"] != request.user.id:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if payload["authorizer"]["authorize"] != "admin":

            response = Response(
                {"error_admin": "Error, Please Enter admin Passcode"},
                status=status.HTTP_403_FORBIDDEN,
            )
            response.delete_cookie("pass_token")
            return response

        nonce = payload["nonce"]
        # purpose = payload["purpose"]
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

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            try:
                with transaction.atomic():
                    serializer.save(user=request.user)
            except IntegrityError:
                outlet_name = serializer.validated_data.get("name")

                duplicate_exists = Outlets.objects.filter(
                    user=request.user,
                    name__iexact=outlet_name,
                ).exists()
                if duplicate_exists:
                    raise ValidationError(
                        {"name": ("You already have an outlet " "with this name.")}
                    )
                raise

            # verify_nonce.delete()
            return Response(
                {"data": serializer.data, "message": "Outlet Created successful"},
                status=status.HTTP_200_OK,
            )

    def perform_create(self, serializer):
        email = serializer.validated_data.get("email_address")

        if email:
            email = email.strip().lower()

            used_by_another_user = (
                Outlets.objects.filter(email_address__iexact=email)
                .exclude(user=self.request.user)
                .exists()
            )
            if used_by_another_user:
                raise ValidationError(
                    {"email_address": "This email is already used by another account."}
                )

        serializer.save(user=self.request.user, email_address=email)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
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
        if payload["authorizer"]["authorize"] != "admin":
            response = Response(
                {"error_admin": "Error, Please Enter admin Passcode"},
                status=status.HTTP_403_FORBIDDEN,
            )
            response.delete_cookie("pass_token")
            return response

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

            self.perform_destroy(instance)
            # verify_nonce.delete()
            return Response(
                {"message": "deleted successfully"}, status=status.HTTP_200_OK
            )


class OuletStaffViewSet(viewsets.ModelViewSet):
    queryset = OutletStaff.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisor,
    ]
    serializer_class = OutletStaffSerializer

    def get_permissions(self):
        if self.action == "list":
            return [IsAuthenticated(), IsVerified()]
        elif self.action in ("partial_update", "update"):
            return [
                IsAuthenticated(),
                IsVerified(),
                ASPermission(),
                IsAdminOrSupervisorOrStaff(),
            ]
        return super().get_permissions()

    def get_queryset(self):
        # outlet_id = self.request.query_params.get("outlet_id")
        outlet_id = get_active_outlet_id(self.request)

        if not outlet_id:
            raise ValidationError({"error": "Outlet Details are required"})
        qs = super().get_queryset().filter(outlet__user=self.request.user)

        if self.action == "list":
            outlet_id = self.request.query_params.get("outlet_id")
        else:
            outlet_id = get_active_outlet_id(self.request)

        if not outlet_id:
            raise ValidationError({"error": "Outlet details are required"})

        return qs.filter(outlet_id=outlet_id)

    # def list(self, request, *args, **kwargs):
    #     outlet_id = self.request.query_params.get("outlet_id")
    #     if not outlet_id:
    #         return Response(
    #             {"error": "Please Add/Activate and Outlet to use services"},
    #             status=status.HTTP_403_FORBIDDEN,
    #         )
    #     return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        token = request.headers.get("X-Pass-Token")
        if not token:
            token = request.COOKIES.get("pass_token")
        outlet_id = get_active_outlet_id(request)
        # outlet_id = self.request.query_params.get("outlet_id")

        if not outlet_id:
            return Response(
                {"error": "Please activate an outlet"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            outlet_instance = Outlets.objects.get(id=outlet_id, user=self.request.user)
        except Outlets.DoesNotExist:
            return Response(
                {"error": "Invalid outlet details "}, status=status.HTTP_404_NOT_FOUND
            )
        if request.pos_authorization.get("role") == "supervisor":
            if str(outlet_instance.id) != str(
                request.pos_authorization.get("outlet_id")
            ):
                return Response(
                    {"error": "You can not perform this action"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        if not token:
            return Response(
                {"error_token": "Admin/Supervisor Passcode required"},
                status=status.HTTP_403_FORBIDDEN,
            )
        pin = request.data.get("pin")
        if not pin or len(pin) != 4 or not pin.isdigit():
            return Response(
                {"error": " 4 digits are required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            payload = signing.loads(token, salt="user_pass", max_age=15 * 60)

        except SignatureExpired:
            return Response(
                {"error": "token expired, try later"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except BadSignature:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if payload["user_id"] != request.user.id:
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_403_FORBIDDEN,
            )

        nonce = payload["nonce"]
        # purpose = payload["purpose"]
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

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(outlet=outlet_instance)

            # verify_nonce.delete()
            return Response(
                {"data": serializer.data, "message": "Outlet staff Created successful"},
                status=status.HTTP_200_OK,
            )

    def partial_update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except Http404:
            return Response(
                {"error": "Invalid Outlet or Staff"},
                status=status.HTTP_404_NOT_FOUND,
            )
        role = request.pos_authorization.get("role")
        if role == "supervisor":
            if str(instance.outlet_id) != str(
                request.pos_authorization.get("outlet_id")
            ):
                return Response(
                    {"error": "You can not perform this action"},
                    status=status.HTTP_403_FORBIDDEN,
                )
        image = request.data.get("image")
        if role == "staff" and str(instance.Employee_id) != str(
            request.pos_authorization.get("employee_id")
        ):
            return Response(
                {"error": "you can not perform this action"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not image:
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
                    {"error": "token expired, try later"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except BadSignature:
                return Response(
                    {"error": "Invalid token"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if payload["user_id"] != request.user.id:
                return Response(
                    {"error": "Invalid token"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            nonce = payload["nonce"]
            # purpose = payload["purpose"]
            with transaction.atomic():
                if not payload["lag_time_check"]:
                    try:
                        verify_nonce = AuthorizationNonce.objects.select_for_update().get(
                            object_id=str(instance.Employee_id),
                            # purpose=purpose,
                            user=request.user,
                            nonce=nonce,
                        )
                        if verify_nonce.created_at < timezone.now() - timedelta(
                            minutes=3
                        ):
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

            # login = (
            #     OutletStaffLogin.objects.filter(outlet_staff=instance, is_active=True)
            #     .order_by("-login_date")
            #     .first()
            # )
            # if login is None:
            #     return Response(
            #         {"error": "please log in to Update Your details"},
            #         status=status.HTTP_403_FORBIDDEN,
            #     )
            pin = request.data.get("pin")
            if pin:
                if len(pin) != 4 or not pin.isdigit():

                    return Response(
                        {"error": "Pin must be 4 exactly digits"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            # verify_nonce.delete()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(
            {"data": serializer.data, "message": "update successful"},
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

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
        nonce = payload["nonce"]
        # purpose = payload["purpose"]
        with transaction.atomic():
            if not payload["lag_time_check"]:
                try:
                    verify_nonce = AuthorizationNonce.objects.select_for_update().get(
                        user=request.user,
                        object_id=str(instance.Employee_id),
                        # purpose=purpose,
                        nonce=nonce,
                    )
                    if verify_nonce.created_at < timezone.now() - timedelta(minutes=10):
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
            self.perform_destroy(instance)
            return Response(
                {"message": "deleted successfully"}, status=status.HTTP_200_OK
            )


class StaffLoginViewSet(viewsets.ModelViewSet):
    queryset = OutletStaffLogin.objects.all()
    permission_classes = [
        IsAuthenticated,
        IsVerified,
        ASPermission,
        IsAdminOrSupervisorOrStaff,
    ]
    serializer_class = StaffLoginSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(outlet_staff__outlet__user=self.request.user)

    def get_serializer_class(self):
        if self.action in ("update", "partial_update", "create"):
            return StaffLoginSerializer
        return super().get_serializer_class()

    @action(detail=False, methods=["POST", "GET"], url_path="assign_staff_session")
    def assign_staff_session(self, request):
        
        username = request.data.get("username", "").strip().lower()
        # outlet_id = request.data.get("outlet_id")
        outlet_id = get_active_outlet_id(request)

        pin = request.data.get("pin")
        if request.method == "GET":

            assgned_staff = request.COOKIES.get("assigned_staff")
            
            if assgned_staff:
                login = OutletStaffLogin.objects.filter(
                    outlet_staff__Employee_id=assgned_staff,
                    assigned=True,
                    is_active=True,
                ).first()
                if not login:
                    response = Response(
                        {"message": "No active assignment"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                    response.delete_cookie("assigned_staff")
                    return response
                return Response(
                    {
                        "message": "assigned, please log out. before reassigning",
                        "assigned_staff": assgned_staff,
                    },
                    status=status.HTTP_200_OK,
                )
        if not username and not pin and not outlet_id:
            print("i got pulled here from get method")
            return Response(
                {
                    "error": "Invalid Action,username/password and active outlet are required"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            staff = OutletStaff.objects.get(
                username=username,
                outlet__id=outlet_id,
                outlet__user=request.user,
            )
        except OutletStaff.DoesNotExist:
            return Response(
                {"error": "invalid staff details"}, status=status.HTTP_404_NOT_FOUND
            )
        if not check_password(str(pin), staff.pin):
            return Response(
                {"error": "Invalid pin auth"}, status=status.HTTP_403_FORBIDDEN
            )
        # //check if staff is logged, then logout
        get_cookies_id = request.COOKIES.get("assigned_staff")
        if get_cookies_id:
            session_auth_role = request.pos_authorization.get("role")

            logout = get_cookies_id == str(staff.Employee_id)
            if logout:
                staff_instance = (
                    OutletStaffLogin.objects.filter(outlet_staff=staff)
                    .order_by("-login_date")
                    .first()
                )
                if not staff_instance:
                    return Response(
                        {"error": "No active login found."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                with transaction.atomic():
                    staff_instance.assigned = False
                    staff_instance.assignment_expires_at = None
                    staff_instance.last_activity = timezone.now()
                    staff_instance.save()
                    response = Response(
                        {
                            "message": "You've unassigned successfully, please logout in Setting to logout",
                            "employee_id": staff.Employee_id,
                            "assigned_status": staff_instance.assigned,
                        },
                        status=status.HTTP_200_OK,
                    )
                    response.delete_cookie("assigned_staff")
                    if session_auth_role == "staff":
                        response.delete_cookie("pos_session")
                    return response
            return Response(
                {
                    "error": "please unassign the current staff, to continue",
                    "employee_id": get_cookies_id,
                    "assigned_status": True,
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        active_login = ensure_staff_assigned(request, staff)

        response = Response(
            {
                "message": "assigned success, always unassigned when session end",
                "employee_id": staff.Employee_id,
                "assigned_status": active_login.assigned,
            },
            status=status.HTTP_200_OK,
        )
        set_max_age = 0
        if not active_login.assignment_expires_at < timezone.now():
            set_max_age = active_login.assignment_expires_at - timezone.now()
        print(set_max_age.total_seconds())
        response.set_cookie(
            "assigned_staff",
            str(staff.Employee_id),
            max_age=set_max_age.total_seconds(),
            httponly=True,
            samesite="Lax",
        )
        # response.set_cookie(
        #     "assigned_staff",
        #     response.data["employee_id"],
        #     max_age=settings.STAFF_ASSIGNMENT_MAX_AGE,
        #     httponly=True,
        #     samesite="Lax",
        # )
        return response

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        get_cookies = request.COOKIES.get("assigned_staff")
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = Response(serializer.data)
        if get_cookies:
            response.delete_cookie("assigned_staff")
        return response

    @action(
        detail=False,
        methods=["GET"],
        url_path="staff-active-status",
        permission_classes=[
            IsAuthenticated,
            IsVerified,
            ASPermission,
            IsAdminOrSupervisorOrStaff,
        ],
    )
    def staff_active_status(self, request):
        staff_id = request.query_params.get("staff_id")
        if not staff_id:
            return Response(
                {"error": "staff_id is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        last_log_seesion = (
            OutletStaffLogin.objects.filter(
                outlet_staff__Employee_id=staff_id, is_active=False
            )
            .order_by("-login_date")
            .first()
        )

        still_logged_in = (
            OutletStaffLogin.objects.filter(
                outlet_staff__Employee_id=staff_id,
                is_active=True,
                outlet_staff__outlet__user=request.user,
            )
            .order_by("-login_date")
            .first()
        )
        # still_logged_in = OutletStaffLogin.objects.filter(
        #     outlet_staff__Employee_id=staff_id, is_active=True
        # ).exists()
        if still_logged_in is not None:

            return Response(
                {
                    "is_active": True,
                    "staff_id": still_logged_in.outlet_staff.Employee_id,
                    "session_id": still_logged_in.id,
                    "log_in_time": still_logged_in.login_date,
                    "last_logIn_time": None,
                    "assigned": still_logged_in.assigned,
                    "assigned_time": still_logged_in.assigned_at,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "is_active": last_log_seesion.is_active if last_log_seesion else False,
                "staff_id": last_log_seesion.outlet_staff.Employee_id,
                "session_id": last_log_seesion.id if last_log_seesion else None,
                "last_logIn_time": (
                    last_log_seesion.logout_date if last_log_seesion else None
                ),
                "assigned": last_log_seesion.assigned if last_log_seesion else False,
            },
            status=status.HTTP_200_OK,
        )


class JWTSetCookieMixin:

    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get("refresh"):
            response.set_cookie(
                settings.SIMPLE_JWT["REFRESH_TOKEN_NAME"],
                response.data["refresh"],
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                httponly=True,
                samesite=settings.SIMPLE_JWT["JWT_COOKIE_SAMESITE"],
            )
        if response.data.get("access"):
            response.set_cookie(
                settings.SIMPLE_JWT["ACCESS_TOKEN_NAME"],
                response.data["access"],
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                httponly=True,
                samesite=settings.SIMPLE_JWT["JWT_COOKIE_SAMESITE"],
            )
            # if not request.META.get("HTTP_USER_AGENT", "").lower().startswith("swagger"):
            #     del response.data["access"]

        # user_id = response.data["user_id"]
        # print(user_id)

        return super().finalize_response(request, response, *args, **kwargs)


class JWTCookieTokenObtainPairView(JWTSetCookieMixin, TokenObtainPairView):
    serializer_class = CustomTokenObtainPiarSerializer


class JWTCookieTokenRefreshView(JWTSetCookieMixin, TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer
