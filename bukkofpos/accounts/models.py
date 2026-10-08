from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.utils import timezone
from django.conf import settings
from django.db import IntegrityError, transaction
import uuid
from django.contrib.auth.hashers import make_password, identify_hasher


def profile_picture_upload_path(instance, filename):
    return f"profile/{instance.id}/{filename}"


def outlet_staff_upload_path(instance, filename):
    return f"outlet/{instance.Employee_id}/{filename}"


def outlet_logo_upload_path(instance, filename):
    return f"outlet/{instance.id}/{filename}"


class CustomUserManager(BaseUserManager):
    @transaction.atomic
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a regular user with an email and password.
        """
        if not email:

            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        base = email.split("@")[0]

        username = base
        counter = 0
        while True:
            username = base if counter == 0 else f"{base}{counter}"

            try:
                user = self.model(email=email, username=username, **extra_fields)
                user.set_password(password)
                user.save(using=self._db)
                return user
            except IntegrityError:
                counter += 1

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with an email and password.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Superuser must have is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Superuser must have is_superuser=True."))

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=30, blank=True)
    last_name = models.CharField(_("last name"), max_length=30, blank=True)
    username = models.CharField(_("username"), unique=True, blank=True)
    email_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Designates whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    date_joined = models.DateTimeField(_("date joined"), auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email


class EmailVerification(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=5)
    pending_email = models.EmailField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > (self.created_at + timezone.timedelta(minutes=10))

    def save(self, *args, **kwargs):
        try:
            identify_hasher(self.code)
        except ValueError:
            self.code = make_password(self.code)

        super().save(*args, **kwargs)


class AuthorizationNonce(models.Model):
    nonce = models.CharField(max_length=64, unique=True)
    object_details = models.CharField(max_length=64, null=True, blank=True)
    object_id = models.CharField(max_length=64, null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    purpose = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.created_at} | {self.user}"


class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class PasswordUpdateVerification(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=5)

    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > (self.created_at + timezone.timedelta(minutes=10))

    def save(self, *args, **kwargs):
        try:
            identify_hasher(self.code)
        except ValueError:
            self.code = make_password(self.code)

        super().save(*args, **kwargs)


class Profile(models.Model):
    profile = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    date_modified = models.DateTimeField(auto_now=True)
    image = models.ImageField(
        null=True, blank=True, upload_to=profile_picture_upload_path
    )
    # outlet = models.ManyToManyField("Outlets", blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return str(self.profile.username)


def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(profile=instance)


class Outlets(models.Model):
    user = models.ForeignKey(
        CustomUser, related_name="user_outlets", on_delete=models.CASCADE
    )

    supivisor_passcode = models.CharField(max_length=255, null=True, blank=True)
    pin = models.CharField(max_length=255)
    name = models.CharField(max_length=50, null=False, blank=False)
    email_address = models.EmailField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    # phone_number = PhoneNumberField(null=True, blank=True)
    # staff=models.CharField(max_length=50, null=False, blank=False)
    Facebook = models.CharField(null=True, blank=True, max_length=100)
    Instagram = models.CharField(null=True, blank=True, max_length=100)
    outlet_logo = models.ImageField(
        null=True, blank=True, upload_to=outlet_logo_upload_path
    )
    outlet_description = models.TextField(null=True, blank=True, max_length=200)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                "user", Lower("name"), name="Oulet_already_exist"
            )
        ]

    def save(self, *args, **kwargs):
        try:
            identify_hasher(self.pin)

        except ValueError:

            self.pin = make_password(self.pin)
        if self.supivisor_passcode:
            try:
                identify_hasher(self.supivisor_passcode)
            except ValueError:
                self.supivisor_passcode = make_password(self.supivisor_passcode)

        super().save(*args, **kwargs)

    def __str__(self):
        return str(self.name)


# def create_outlet(sender, instance, created, **kwargs):
#     if created:
#         Outlets.objects.create(user=instance, name="first outlet")


post_save.connect(create_profile, sender=CustomUser)
# post_save.connect(create_outlet, sender=CustomUser)


class OutletStaff(models.Model):

    STATUS = (
        ("Manager", "Manager"),
        ("Supervisor", "Supervisor"),
        ("Staff", "Staff"),
    )
    outlet = models.ForeignKey(
        Outlets, related_name="outlet_staffs", on_delete=models.CASCADE
    )
    image = models.ImageField(null=True, blank=True, upload_to=outlet_staff_upload_path)
    name = models.CharField(max_length=100, null=True, blank=True)
    phone_number = models.CharField(
        max_length=100, default="hdygdy", null=True, blank=True
    )
    username = models.CharField(max_length=100, unique=True)
    address = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(unique=True, max_length=100)
    status = models.CharField(max_length=100, choices=STATUS, default="staff")
    Employee_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    pin = models.CharField(max_length=255)
    # security fields

    failed_attempts = models.IntegerField(default=0)
    last_failed_attempt = models.DateTimeField(null=True, blank=True)
    is_locked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.outlet} | {self.name} | {self.status}"

    def save(self, *args, **kwargs):

        try:
            if self.pin:
                identify_hasher(self.pin)
        except ValueError:
            self.pin = make_password(self.pin)
        self.email = BaseUserManager.normalize_email(self.email)
        if not self.username:
            username = self.email.split("@")[0]
            counter = 0

            while True:
                try:
                    if counter == 0:
                        self.username = username
                    else:
                        self.username = f"{username}{counter}"
                    super().save(*args, **kwargs)
                    break
                except IntegrityError:
                    counter += 1
        else:
            super().save(*args, **kwargs)


# def auto_create_outletstaff(sender, instance, created, **kwargs):
#     if created:
#         OutletStaff.objects.create(
#             user=instance,
#             outlet=instance.user,
#             status="manager",
#         )


# post_save.connect(auto_create_outletstaff, sender=CustomUser)


class OutletStaffLogin(models.Model):
    # outlet = models.ForeignKey(Outlets, on_delete=models.CASCADE)
    outlet_staff = models.ForeignKey(
        OutletStaff,
        related_name="staff_login",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )
    assignment_expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )
    assigned = models.BooleanField(default=False)
    login_date = models.DateTimeField(auto_now_add=True)
    logout_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    assigned_at = models.DateTimeField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["outlet_staff"],
                condition=Q(is_active=True),
                name="only_one_active_staff_per_session",
            ),
            models.UniqueConstraint(
                fields=["outlet_staff"],
                condition=Q(assigned=True),
                name="only_one_asigned_staff_per_session",
            ),
        ]

    def __str__(self):
        return f"{self.outlet_staff} | - Active: {self.is_active}"


def create_auto_create_outletStaffLogin(sender, instance, created, **kwargs):
    if created:
        User_Staff = OutletStaffLogin(outlet_staff=instance, logout_date=timezone.now())
        User_Staff.save()


post_save.connect(create_auto_create_outletStaffLogin, sender=OutletStaff)
