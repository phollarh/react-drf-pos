from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone


class UserTimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        timezone_name = (
            request.headers.get("X-Timezone") or settings.TIME_ZONE
        ).strip()

        try:
            user_timezone = ZoneInfo(timezone_name)
        except (ZoneInfoNotFoundError, ValueError):
            return JsonResponse(
                {"error": "Invalid timezone"},
                status=400,
            )

        with timezone.override(user_timezone):
            return self.get_response(request)