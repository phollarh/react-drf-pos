from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("sales/info/", views.SalesInfoAPIView.as_view()),
    path(
        "sales_receipt/<int:pk>/pdf/", views.sales_receipt_pdf, name="sales_receipt_pdf"
    ),
]
