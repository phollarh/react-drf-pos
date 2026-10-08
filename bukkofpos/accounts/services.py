from datetime import datetime, timedelta, timezone as datetime_timezone
from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import APIException

from .models import OutletStaff, OutletStaffLogin


class StaffConflict(APIException):
    status_code = 409
    default_detail = {
        "error": "You already have an active session, please end session to continue ",
        "code": "only_one_active_staff_assign_per_session",
    }


def get_assignment_expiry():
    return timezone.now() + timedelta(seconds=settings.STAFF_ASSIGNMENT_MAX_AGE)


@transaction.atomic
def ensure_staff_assigned(request, staff: OutletStaff) -> OutletStaffLogin:
    now = timezone.now()
    locked_staff = OutletStaff.objects.select_for_update().get(pk=staff.pk)
    active_login = (
        OutletStaffLogin.objects.select_for_update()
        .filter(outlet_staff=locked_staff, is_active=True, logout_date__isnull=True)
        .order_by("-login_date")
        .first()
    )
    expires_at_session = now + timedelta(seconds=settings.STAFF_ASSIGNMENT_MAX_AGE)
    pos_auth = getattr(request, "pos_authorization", None)
    if pos_auth and pos_auth.get("session_expiration") is not None:
        get_session_expire_at = pos_auth.get("session_expiration")

        expires_at_session = datetime.fromtimestamp(
            get_session_expire_at, tz=datetime_timezone.utc
        )

    expires_at = now + timedelta(seconds=settings.STAFF_ASSIGNMENT_MAX_AGE)

    if active_login is None:
        get_contrainst = OutletStaffLogin.objects.filter(
            Q(is_active=True, outlet_staff=locked_staff)
            | Q(assigned=True, outlet_staff=locked_staff)
        ).exists()
        if get_contrainst:
            raise StaffConflict

        return OutletStaffLogin.objects.create(
            assignment_expires_at=min(expires_at, expires_at_session),
            outlet_staff=locked_staff,
            assigned_at=now,
            last_activity=now,
            assigned=True,
            is_active=True,
        )
    active_login.assignment_expires_at = min(expires_at, expires_at_session)
    active_login.last_activity = now
    update_fields = ["last_activity", "assignment_expires_at"]
    assignment_was_expired = (
        active_login.assignment_expires_at is None
        or active_login.assignment_expires_at <= now
    )

    if not active_login.assigned or assignment_was_expired:
        active_login.assigned = True
        active_login.assigned_at = now
        update_fields.extend(["assigned", "assigned_at"])

    active_login.save(update_fields=update_fields)

    return active_login


@transaction.atomic
def supervisor_session(staff: OutletStaff) -> OutletStaffLogin:
    now = timezone.now()
    locked_staff = OutletStaff.objects.select_for_update().get(pk=staff.pk)
    active_login = (
        OutletStaffLogin.objects.select_for_update()
        .filter(outlet_staff=locked_staff, is_active=True, logout_date__isnull=True)
        .order_by("-login_date")
        .first()
    )

    if active_login is None:
        get_contrainst = OutletStaffLogin.objects.filter(
            Q(is_active=True, outlet_staff=locked_staff)
            | Q(assigned=True, outlet_staff=locked_staff)
        ).exists()
        if get_contrainst:
            raise StaffConflict

        return OutletStaffLogin.objects.create(
            outlet_staff=locked_staff,
            last_activity=now,
            is_active=True,
        )

    active_login.last_activity = now
    update_fields = ["last_activity"]
    active_login.save(update_fields=update_fields)

    return active_login
