import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer
from django.contrib.auth import get_user_model

from notifications.models import Notification

User = get_user_model()


class notificationsConsumer(JsonWebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.room_name = None
        self.outlet_notification = None

    def connect(self):
        self.user = self.scope["user"]
        active_outlet = self.scope["active_outlet"]
        if not self.user.is_authenticated:
            self.close(code=4001)
            return
        if self.scope["url_route"]["kwargs"]["user_id"] != str(self.user.id):
            self.close(code=4001)
            return
        self.room_name = f"notification_for_user_{self.user.id}"
        if (
            active_outlet
            and active_outlet.get("is_active")
            and str(active_outlet.get("user_id")) == str(self.user.id)
        ):
            self.outlet_notification = (
                f"notification_outlet_{active_outlet["outlet_id"]}"
            )

            async_to_sync(self.channel_layer.group_add)(
                self.outlet_notification, self.channel_name
            )
        async_to_sync(self.channel_layer.group_add)(self.room_name, self.channel_name)
        self.accept()
        # notification = list(
        #     Notification.objects.filter(user=self.user)
        #     .order_by("-created_at")
        #     .values("id", "is_read", "message", "created_at")[:20]
        # )
        # if notification:
        #     async_to_sync(
        #         self.channel_layer.group_send(
        #             self.room_name,
        #             {
        #                 "type": "notifications.onconnect",
        #                 "title_msg": notification
        #             },
        #         )
        #     )

    def receive_json(self, content, **kwargs):
        Notification.objects.filter(id=content["notification_id"]).update(
            is_read=content["is_read"]
        )
        get_notification = Notification.objects.get(id=content["notification_id"])
        notification_data = {
            "id": get_notification.id,
            "is_read": get_notification.is_read,
            "title": get_notification.title,
            "message": get_notification.message,
            "created_at": get_notification.created_at.isoformat(),
        }
        print(notification_data)
        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {"type": "notification.message", "notification": notification_data},
        )

    def celery_task_update(self, event):
        self.send_json({"event": "celery_task_update", "data": event["data"]})

    def notification_message(self, event):
        self.send_json(event)

    def notifications_onconnect(self, event):
        self.send_json(event)

    def inventory_update(self, event):

        self.send_json(event)

    def void_receipt(self, event):
        self.send_json(event)
    def low_stock(self, event):
        self.send_json(event)
    
    def create_or_update_product(self, event):
        self.send_json(event)

        # self.send_json(content=content['text'])

    # def receive(self, text_data):
    #     # message = text_data['this is testing']
    #     self.send(text_data="Hello world")

    # self.close()

    def disconnect(self, close_code):
        if self.room_name:
            async_to_sync(self.channel_layer.group_discard)(
                self.room_name, self.channel_name
            )

        if self.outlet_notification:
            async_to_sync(self.channel_layer.group_discard)(
                self.outlet_notification, self.channel_name
            )
