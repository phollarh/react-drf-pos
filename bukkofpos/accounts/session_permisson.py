from django.conf import settings
from django.core import signing
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission


class ASPermission(BasePermission):
    def has_permission(self, request, view):
        token = request.COOKIES.get("pos_session")
        if not token:
            raise PermissionDenied(
                {
                    "error": "POS authorization required",
                    "code": "pos_authorization_required",
                }
            )
        user = request.user
        try:
            authorization = signing.loads(
                token, salt="user_pass_session", max_age=settings.STAFF_ASSIGNMENT_MAX_AGE
            )
        except signing.SignatureExpired:
            raise PermissionDenied(
                {
                    "error": "session expired please reauthenticate",
                    "code": "session_expired_please_reauthenticate",
                }
            )
        except signing.BadSignature:
            raise PermissionDenied(
                {
                    "error": "Invalid POS authorization",
                    "code": "pos_authorization_required",
                }
            )
        if str(authorization.get("user_id")) != str(user.id):
            raise PermissionDenied(
                {
                    "error": "Invalid POS authorization",
                    "code": "pos_authorization_required",
                }
            )
        
        request.pos_authorization = authorization

        return True


class IsAdminOrSupervisor(BasePermission):

    def has_permission(self, request, view):
        authorization = getattr(
            request,
            "pos_authorization",
            None,
        )

        if not authorization:
            return False
        get_role = authorization.get("role")
        if get_role in {"admin", "supervisor"}:
            return True

        return False

    
class IsAdminOrSupervisorOrStaff(BasePermission):

    def has_permission(self, request, view):
        authorization = getattr(
            request,
            "pos_authorization",
            None,
        )

        if not authorization:
            return False
        get_role = authorization.get("role")
        
        if get_role in {"admin", "supervisor", "staff"}:
            return True

        return False
