from .models import Notification
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def create_notification(user, event_type,title, message):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message,
    )

    notification_data = {
        "id": notification.id,
        "is_read": notification.is_read,
        "title": notification.title,
        "message": notification.message,
        "created_at": notification.created_at.isoformat(),
    }

    def send_notification():
        channel_layer = get_channel_layer()      
        async_to_sync(channel_layer.group_send)(
            f"notification_for_user_{user.id}",
            {
                "type": event_type,
                "notification": notification_data,
            },
        )

    transaction.on_commit(send_notification)

    return notification
