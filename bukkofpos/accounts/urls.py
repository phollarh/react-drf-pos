from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AccountViewSet,
    ActivateAccountView,
    JWTCookieTokenObtainPairView,
    JWTCookieTokenRefreshView,
    LogOutAPIVIEW,
    OuletViewSet,
    OuletStaffViewSet,
    RegisterView,
    ProfileViewSet,
    StaffLoginViewSet,
    AuthenticateOutletView
)

router = DefaultRouter()
router.register("api/outlets", OuletViewSet, basename="outlets")
router.register("api/user", AccountViewSet, basename="user")
router.register("api/outletstaffs", OuletStaffViewSet, basename="outletstaffs")
router.register("api/staffs-login", StaffLoginViewSet, basename="staffslogin")
urlpatterns = [
    path("api/token/", JWTCookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", JWTCookieTokenRefreshView.as_view(), name="token_refresh" ),
    path("api/logout/", LogOutAPIVIEW.as_view(), name="api_logout"),
    path("api/profile/", ProfileViewSet.as_view(), name="profile"),
    # path("api/outlets/", OuletViewSet.as_view(), name="outlets"),
    path("api/activate/", ActivateAccountView.as_view(), name="activate"),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/verify_outlet/", AuthenticateOutletView.as_view(), name="verify_outlet"),  

] + router.urls