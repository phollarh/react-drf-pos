from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from notifications.views import NotificationsViewSet
from notifications.consumers import notificationsConsumer
from pos.views import (
    CheckSalesReceiptStatus,
    MeasuremnetListViewSet,
    OrderViewSet,
    ProductListViewSet,
    ProductsInfoViewset,
    SalesInfoViewSet,
    SalesReceiptOrderViewSet,
    SalesReceiptViewSet,
    SalesReceiptOrderUpdateViewSet,
    CategoryListViewSet,
    InventoryViewset,
    PrinterSetUpViewSet
)
from debug_toolbar.toolbar import debug_toolbar_urls
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings

router = DefaultRouter()

router.register("api/products", ProductListViewSet, basename="products")
router.register("api/inventory_log", InventoryViewset, basename="inventory_log")
router.register("api/order", OrderViewSet, basename="create_order")
router.register("api/sales_receipt", SalesReceiptViewSet, basename="sales_receipt")
router.register(
    "api/sales_receipt_status", CheckSalesReceiptStatus, basename="sales_receipt_status"
)
router.register(
    "api/sales_receipt_order", SalesReceiptOrderViewSet, basename="sales_receipt_order"
)
router.register(
    "api/order_sales_receipt_update",
    SalesReceiptOrderUpdateViewSet,
    basename="update_sales_receipt",
)
router.register("api/sales_info", SalesInfoViewSet, basename="sales_info")
router.register(
    "api/measurements_info", MeasuremnetListViewSet, basename="measurements_info"
)
router.register("api/categories_info", CategoryListViewSet, basename="categories_info")
router.register("api/products_info", ProductsInfoViewset, basename="products_info")
router.register("api/notifications", NotificationsViewSet, basename="nofications")
router.register("api/printer_setup", PrinterSetUpViewSet, basename="printer_setup")

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("", include("pos.urls")),
        path("accounts/", include("accounts.urls")),
        # path("notifications/", include("notifications.urls")),
        path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
        path("api/docs/schema/ui/", SpectacularSwaggerView.as_view()),
        # path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
        # path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    ]
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    + router.urls
    + debug_toolbar_urls()
)

websocket_urlpatterns = [
    path("notifications/<str:user_id>/", notificationsConsumer.as_asgi())
]
