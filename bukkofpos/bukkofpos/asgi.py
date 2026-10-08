import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bukkofpos.settings')

django_application = get_asgi_application()

from . import urls # noqa isort:skip

from notifications.middleware import JWTAuthMiddleware # noqa isort:skip

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddleware(URLRouter(urls.websocket_urlpatterns))
    }
)