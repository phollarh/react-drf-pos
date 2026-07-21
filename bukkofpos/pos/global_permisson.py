from rest_framework.permissions import BasePermission


class IsVerified(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        return (
            user is not None
            and user.is_authenticated
            and getattr(user, "email_verified", False) is True
        )