from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.


class Notification(models.Model):
    user = models.ForeignKey(get_user_model(), blank=True, null=True, on_delete=models.CASCADE)
    title = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    message = models.TextField(max_length=2000)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} | {self.created_at}"
