from django.contrib import admin
from .models import (
    Category,
    InventoryLog,
    Product,
    Measurement,
    Order,
    SalesReceipt,
    SalesReceiptOrder,
    Payment,
)

# Register your models here.


class PaymentIline(admin.TabularInline):
    model = Payment


class SalesReceiptAdmin(admin.ModelAdmin):
    inlines = [PaymentIline]


class InventoryInline(admin.TabularInline):
    model = InventoryLog


class ProductInlineAdmin(admin.ModelAdmin):

    inlines = [
        InventoryInline,
    ]


admin.site.register(Product, ProductInlineAdmin)
admin.site.register(Order)
admin.site.register(Category)
admin.site.register(Measurement)
admin.site.register(SalesReceipt, SalesReceiptAdmin)
admin.site.register(SalesReceiptOrder)
