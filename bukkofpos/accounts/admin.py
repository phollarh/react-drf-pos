from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import CustomUser, Outlets, OutletStaff, OutletStaffLogin, Profile, EmailVerification,AuthorizationNonce


class ProfileInline(admin.TabularInline):
    model = Profile
    can_delete = False
    extra = 0


class OutletsInline(admin.TabularInline):
    model = Outlets
    can_delete = False
    extra = 0


class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = [
        "email",
        "first_name",
        "last_name",
        "username",
        "is_staff",
    ]
    inlines = [ProfileInline, OutletsInline]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Personal info"),
            {
                "fields": (
                    "first_name",
                    "last_name",
                    "username",
                )
            },
        ),
        (
            _("Permissions"),
            {"fields": ("is_active", "is_staff", "is_superuser", "email_verified")},
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                
                ),
            },
        ),
    )
    search_fields = ("email", "first_name")
    readonly_fields = ("date_joined",)


admin.site.register(CustomUser, UserAdmin)
admin.site.register(EmailVerification)
admin.site.register(OutletStaff)
admin.site.register(OutletStaffLogin)
admin.site.register(AuthorizationNonce)
# admin.site.register(Profile)
