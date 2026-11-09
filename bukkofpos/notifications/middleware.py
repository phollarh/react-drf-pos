from django.core import signing
import jwt
from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user(scope):
    token = scope["token"]
    model = get_user_model()

    try:
        if token:
            user_id = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])[
                "user_id"
            ]
            return model.objects.get(id=user_id)
        else:
            return AnonymousUser()
    except (jwt.exceptions.DecodeError, model.DoesNotExist):
        return AnonymousUser()


@database_sync_to_async
def get_active_outlet(scope):
    token = scope["outlet_token"]
    try:
        active_outlet = signing.loads(
                token,
                salt="active_outlet",
                max_age=30 * 24 * 60 * 60,
            )
    except (signing.SignatureExpired, signing.BadSignature):
        return None
    
    if str(active_outlet.get("user_id")) != str(scope["user"].id):
        return None
    return active_outlet


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, recieve, send):
        headers_dict = dict(scope["headers"])
        
        cookies_str = headers_dict.get(b"cookie", b"").decode()
        cookies = {}
        
        for cookie in cookies_str.split("; "):
            name, separator, value = cookie.strip().partition("=")
            if not separator:
                continue

            cookies[name] = value
            
        access_token = cookies.get("access_token")
        active_outlet = cookies.get("active_outlet")
        
        scope["token"] = access_token
        scope["outlet_token"] = active_outlet
        scope["user"] = await get_user(scope)
        scope["active_outlet"] = await get_active_outlet(scope)

        return await self.app(scope, recieve, send)


