from rest_framework.permissions import BasePermission


class IsVerified(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user is None:
            return False
        elif not user.is_authenticated:
            return False
        verified = getattr(user, "email_verified", False)
        if not verified:
            return False
        return True
        # return (
        #     user is not None
        #     and user.is_authenticated
        #     and getattr(user, "email_verified", False) is True
        # )
