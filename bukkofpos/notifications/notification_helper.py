from .models import Notification
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from accounts.models import Outlets
from django.shortcuts import get_object_or_404


def create_notification(
    user, event_type, title, message, search_related_pk=None, active_outlet=None
):
    outlet = Outlets.objects.none()
    if active_outlet is not None:
        outlet = get_object_or_404(Outlets, id=active_outlet)
    notification = Notification.objects.create(
        user=user,
        active_outlet=outlet,
        title=title,
        message=message,
        search_related_pk=search_related_pk
    )

    notification_data = {
        "id": notification.id,
        "is_read": notification.is_read,
        "title": notification.title,
        "message": notification.message,
        "search_related_pk": search_related_pk,
        "created_at": notification.created_at.isoformat(),
    }

    def send_notification():
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"notification_outlet_{active_outlet}",
            {
                "type": event_type,
                "notification": notification_data,
            },
        )

    transaction.on_commit(send_notification)

    return notification
