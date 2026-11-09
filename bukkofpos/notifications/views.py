from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import Notification
from accounts.session_permisson import ASPermission, IsAdminOrSupervisor
from .serializer import notificationSerializer
from accounts.views import get_active_outlet_id

# Create your views here.


class NotificationsViewSet(viewsets.ViewSet):
    # permission_classes = [ASPermission, IsAdminOrSupervisor]

    def list(self, request):
        try:
            current_count = max(0, int(request.headers.get("X-Count-Header"), "0"))
        except (TypeError, ValueError):
            current_count = 0
        get_list = current_count + 10
        user = request.user
        notify = Notification.objects.filter(
            Q(user_id=user.id, active_outlet_id=get_active_outlet_id(request))
            | Q(user__isnull=True, active_outlet__isnull=True)
            | Q(user_id=user.id, active_outlet__isnull=True)
        ).order_by("-created_at")

        if get_list >= notify.count():
            message = "All notification data fetched"
            disable_button = True
            get_list = notify.count()
        else:
            message = "see previous notifications"
            disable_button = False
            get_list = get_list
        return_queryset = notify[:get_list]

        serializer = notificationSerializer(return_queryset, many=True)
        return Response(
            {
                "data": serializer.data,
                "message": message,
                "disable_button": disable_button,
            },
            status=status.HTTP_200_OK,
        )
