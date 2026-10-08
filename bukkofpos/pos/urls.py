from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/sales_info/charts/", views.SalesInfoChartAPIView.as_view()),
    path("api/product_sales/info/", views.WeeklyProductSalesChartInfoAPIView.as_view()),
    path(
        "sales_receipt/<int:pk>/pdf/", views.sales_receipt_pdf, name="sales_receipt_pdf"
    ),
]
