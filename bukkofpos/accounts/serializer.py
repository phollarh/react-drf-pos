from .models import OutletStaff, OutletStaffLogin, Profile
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import CustomUser, Outlets
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.password_validation import validate_password


class RegisterResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField()
    message = serializers.CharField()


class ValidateOutletSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    isActive = serializers.BooleanField()


class RegisterSerializer(serializers.ModelSerializer):
    Account = CustomUser

    class Meta:
        model = CustomUser
        fields = ("email", "first_name", "last_name", "password")

        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"read_only": True},
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class AccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()
        fields = ("id", "username", "email")
        read_only_fields = ("id",)

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        return instance


class OutletSerializer(serializers.ModelSerializer):

    class Meta:
        model = Outlets
        fields = (
            "id",
            "name",
            "email_address",
            "city",
            "pin",
            "address",
            "Facebook",
            "Instagram",
            "outlet_logo",
            "outlet_description",
        )
        extra_kwargs = {
            "id": {"read_only": True},
            "pin": {"write_only": True},
            "outlet_logo": {"required": False, "allow_null": True},
            "Instagram": {"required": False, "allow_null": True},
            "Facebook": {"required": False, "allow_null": True},
            "outlet_description": {"required": False, "allow_null": True},
        }


class OutletStaffSerializer(serializers.ModelSerializer):

    class Meta:
        model = OutletStaff
        fields = (
            "name",
            "outlet",
            "username",
            "email",
            "address",
            "status",
            "Employee_id",
            "phone_number",
            "pin",
            "created_at",
            "image",
        )
        extra_kwargs = {
            "Employee_id": {"read_only": True},
            "outlet": {"read_only": True},
            "last_login_date": {"read_only": True},
            "image": {"required": False, "allow_null": True},
            "email": {"required": False, "allow_null": True},
            "address": {"required": False, "allow_null": True},
            "username": {
                "read_only": True,
            },
            "phone_number": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):

        print(validated_data)

        return super().create(validated_data)

    # def update(self, instance, validated_data):
    #     instance=super().update(instance, validated_data)


class StaffLoginSerializer(serializers.ModelSerializer):
    typedPin = serializers.CharField(write_only=True)
    Employee_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = OutletStaffLogin
        fields = (
            "outlet_staff",
            "logout_date",
            "login_date",
            "is_active",
            "typedPin",
            "Employee_id",
        )

        # extra_kwargs = {
        #     "outlet_staff": {"read_only": True},
        #     "login_date": {"read_only": True},
        #     "logout_date": {"read_only": True, "required": False, "allow_null": True},
        #     "is_active": {"read_only": True},
        # }
        extra_kwargs = {
            "logout_date": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):
        Employee_id = validated_data.pop("Employee_id")

        staff_pin = validated_data.pop("typedPin")

        MAX_ATTEMPTS = 3
        LOCK_TIME = timedelta(minutes=1)

        try:
            staff = OutletStaff.objects.get(Employee_id=Employee_id)
        except OutletStaff.DoesNotExist:
            raise ValidationError({"non_field_errors": ["Invalid credentials"]})
        now = timezone.now()
        if staff.is_locked:
            if (
                staff.last_failed_attempt
                and (now - staff.last_failed_attempt) < LOCK_TIME
            ):
                raise ValidationError(
                    {"non_field_errors": ["Account locked. Try again later"]}
                )
            else:
                staff.is_locked = False
                staff.failed_attempts = 0
                staff.last_failed_attempt = None
                staff.save()

        if not staff_pin:
            raise ValidationError({"non_field_errors": ["Invalid credentials"]})

        if not check_password(str(staff_pin), staff.pin):
            staff.failed_attempts += 1
            staff.last_failed_attempt = now

            if staff.failed_attempts >= MAX_ATTEMPTS:
                staff.is_locked = True
            staff.save()
            raise ValidationError(
                {
                    "non_field_errors": [
                        "PIN is nvalid",
                    ]
                }
            )
            # raise ValidationError({"non_field_errors": ["Invalid credentials"]})
        # if staff.pin != str(staff_pin):
        #     raise ValidationError({"non_field_errors": ["Invalid credentials"]})
        with transaction.atomic():
            OutletStaffLogin.objects.filter(outlet_staff=staff, is_active=True).update(
                is_active=False, logout_date=timezone.now()
            )

            staff_logged = OutletStaffLogin.objects.create(
                outlet_staff=staff, is_active=True
            )

        return staff_logged

    def update(self, instance, validated_data):
        print(validated_data)
        typed_pin = validated_data.pop("typedPin", None)
        employee_id = validated_data.pop("Employee_id", None)
        MAX_ATTEMPTS = 3
        LOCK_TIME = timedelta(minutes=5)
        now = timezone.now()
        # instance=super().update(instance, validated_data)
        try:
            staff = OutletStaff.objects.get(Employee_id=employee_id)
        except OutletStaff.DoesNotExist:
            raise ValidationError({"non_field_errors": ["Invalid credentials"]})

        if staff.is_locked:
            if (
                staff.last_failed_attempt
                and (now - staff.last_failed_attempt) < LOCK_TIME
            ):
                raise ValidationError(
                    {"non_field_errors": ["Account locked. Try again later"]}
                )
            else:
                staff.is_locked = False
                staff.failed_attempts = 0
                staff.last_failed_attempt = None
                staff.save()

        if not check_password(str(typed_pin), staff.pin):
            staff.failed_attempts += 1
            staff.last_failed_attempt = now

            if staff.failed_attempts >= MAX_ATTEMPTS:
                staff.is_locked = True
            staff.save()
            raise ValidationError(
                {
                    "non_field_errors": [
                        "PIN is Invalid",
                    ]
                }
            )
        if instance.outlet_staff.Employee_id != staff.Employee_id:
            raise ValidationError({"non_field_errors": ["Invalid credentials"]})
        if not instance.is_active:
            raise ValidationError({"non_field_errors": ["Session already inactive"]})
        with transaction.atomic():
            logged_in_staff = instance
            logged_in_staff.logout_date = timezone.now()
            logged_in_staff.is_active = False
            logged_in_staff.assigned = False
            logged_in_staff.last_activity = timezone.now()
            logged_in_staff.save()
        return logged_in_staff


class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ("email", "first_name", "last_name", "phone_number", "image")
        extra_kwargs = {
            "email": {"read_only": True},
            "image": {"required": False, "allow_null": True},
        }

    def get_email(self, obj):
        return obj.profile.email

    def get_first_name(self, obj):
        return obj.profile.first_name

    def get_last_name(self, obj):
        return obj.profile.last_name

    def update(self, instance, validated_data):

        instance = super().update(instance, validated_data)
        first_name = self.initial_data.get("first_name")
        last_name = self.initial_data.get("last_name")
        if first_name is not None:
            instance.profile.first_name = first_name
        if last_name is not None:
            instance.profile.last_name = last_name
        instance.profile.save()
        instance.save()
        return instance


# class OutletUpdateSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Outlets
#         fields = ("name", "email_address", "address", "Facebook", "Instagram", "outlet_logo", "outlet_logo")
#         extra_kwargs = {
#             "outlet_logo": {"required": False, "allow_null": True},
#             "outlet_logo": {"required": False, "allow_null": True},
#             "Instagram": {"required": False, "allow_null": True},
#             "Facebook": {"required": False, "allow_null": True},
#         }

# def get_email(self, obj):
#     return obj.profile.email

# def get_first_name(self, obj):
#     return obj.profile.first_name

# def get_last_name(self, obj):
#     return obj.profile.last_name

# def update(self, instance, validated_data):

#     instance = super().update(instance, validated_data)
#     print(validated_data)
#     first_name = self.initial_data.get("first_name")
#     last_name = self.initial_data.get("last_name")
#     if first_name is not None:
#         instance.profile.first_name = first_name
#     if last_name is not None:
#         instance.profile.last_name = last_name
#     instance.profile.save()
#     instance.save()
#     return instance


class CustomTokenObtainPiarSerializer(TokenObtainPairSerializer):
    def get_token(cls, user):
        token = super().get_token(user)
        token["is_verified"] = user.email_verified
        token["email"] = user.email

        return token

    def validate(self, attrs):

        data = super().validate(attrs)
        data["user_id"] = self.user.id
        return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None

    def validate(self, attrs):
        attrs["refresh"] = self.context["request"].COOKIES.get(
            settings.SIMPLE_JWT["REFRESH_TOKEN_NAME"]
        )
        if attrs["refresh"]:
            return super().validate(attrs)
        else:
            raise InvalidToken("NO valid refresh token found")
