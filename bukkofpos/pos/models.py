from decimal import ROUND_HALF_UP, Decimal
from django.utils import timezone
from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.db.models.signals import post_save
from accounts.models import OutletStaff, Outlets

# Create your models here.


# //VALIDATORS
def stock_inventory_validation(value):
    if value < 0:
        raise ValidationError("stock_inventory cannot be negative")


def order_quantity_validation(value):
    if value <= 0:
        raise ValidationError("order quantity must be greater than zero")


class Product(models.Model):
    # created_by = models.ForeignKey(OutletStaff, on_delete=models.DO_NOTHING)
    update_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    product_name = models.CharField(max_length=100)
    sold_In = models.ForeignKey(
        "Measurement",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="measured_in",
    )
    outlet = models.ForeignKey(
        Outlets,
        related_name="products",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    cost_price = models.DecimalField(default=0, decimal_places=2, max_digits=12)
    selling_price = models.DecimalField(default=0, decimal_places=2, max_digits=12)
    stock_inventory = models.DecimalField(
        default=0,
        decimal_places=3,
        max_digits=50,
        blank=True,
        null=True,
        validators=[stock_inventory_validation],
    )
    category = models.ForeignKey(
        "Category",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="cats",
    )

    def __str__(self):

        return f"{self.product_name} | {self.selling_price}"

    # def save(self, *args, **kwargs):
    #     # calculate subtotal and store it before saving
    #     get_ordered_quantity
    #     self.stock_inventory = self.stock_inventory - self.products.all()
    #     super().save(*args, **kwargs)
class InventoryLog(models.Model):
    class Typechoices(models.TextChoices):
        ADD = "add", "add"
        SUBTRACT = "subtract", "subtract"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory_logs"
    )
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    action = models.CharField(max_length=20, choices=Typechoices.choices)
    performed_by_supervisor = models.ForeignKey(
        OutletStaff,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    performed_by_admin = models.ForeignKey(
        get_user_model(),
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
# def initiate_inventory_log(sender, instance, created, **kwargs):
#     if created and instance.stock_inventory > 0:

#         InventoryLog.objects.create(
#             payment_for_receipt=instance,
#             action="add",
#             product=instance,
#             quantity=instance.stock_inventory,
#             performed_by_admin=get_user)


# post_save.connect(initiate_inventory_log, sender=Product)


class Category(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    outlet = models.ForeignKey(
        Outlets, on_delete=models.CASCADE, related_name="categories"
    )

    def __str__(self):
        return f"{self.name } | {self.outlet}"


class Measurement(models.Model):
    outlet = models.ForeignKey(
        Outlets, related_name="measured_types", on_delete=models.CASCADE
    )

    # name = models.CharField(max_length=30)
    class Typechoices(models.TextChoices):
        EACH = "each", "each"
        GRAM = "g", "gram"
        KILOGRAM = "kg", "kilogram"
        LITRE = "ltr", "litre"

    value = models.DecimalField(
        default=1, decimal_places=4, max_digits=6, null=True, blank=True
    )
    measurement_type = models.CharField(max_length=4, choices=Typechoices.choices)

    def __str__(self):
        return f" {self.measurement_type}"


class Order(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    product = models.ForeignKey(
        "Product", related_name="products", on_delete=models.CASCADE
    )
    quantity = models.DecimalField(
        max_digits=12, decimal_places=3, validators=[order_quantity_validation]
    )
    description = models.CharField(max_length=300, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)
    paid = models.BooleanField(default=False)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def __str__(self):

        return (
            f"{self.product} | {self.product.selling_price} per {self.product.sold_In}"
        )

    def save(self, *args, **kwargs):
        # calculate subtotal and store it before saving
        self.sub_total = self.quantity * self.product.selling_price
        super().save(*args, **kwargs)

    # @property
    # def order_subtotal(self):
    #     subtotal = self.quantity * self.product.selling_price
    #     return subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


class SalesReceipt(models.Model):

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    hold = models.BooleanField(default=True)
    orders = models.ManyToManyField(
        Order, related_name="order_receipt", through="SalesReceiptOrder"
    )
    assigned_staff = models.ForeignKey(OutletStaff, null=True, blank=True,related_name="staff_receipts", on_delete=models.DO_NOTHING)
    remarks = models.TextField(max_length=200, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)
    issued = models.BooleanField(default=False)
    issued_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Receipt id {self.id} - {self.date}"

    def add_order(self, order, payment_option, remarks=None):

        receipt_order = SalesReceiptOrder.objects.create(
            order=order,
            sales_receipt=self,
            payment_option=payment_option,
            remarks=remarks or "",
        )

        return receipt_order


class SalesReceiptOrder(models.Model):
    class Paymentchoices(models.TextChoices):
        TRANSFER = "TF", "transfer"
        CASH = "CASH", "cash"
        CARD = "CARD", "card"

    order = models.ForeignKey(
        Order, related_name="order_salesreceipt", on_delete=models.CASCADE
    )
    sales_receipt = models.ForeignKey(
        SalesReceipt, related_name="sales_receipt_order", on_delete=models.CASCADE
    )
    payment_option = models.CharField(
        choices=Paymentchoices.choices, default=Paymentchoices.TRANSFER, max_length=4
    )
    remarks = models.TextField(max_length=200, null=True, blank=True)
    # amount = models.DecimalField(decimal_places=2, max_digits=8)

    def __str__(self):
        return f"{self.order}"

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["order"], name="unique_order_per_receipt")
        ]


class Payment(models.Model):
    payment_for_receipt = models.OneToOneField(
        SalesReceipt,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="payment",
    )
    amount_tenderd = models.DecimalField(
        default=0, decimal_places=2, max_digits=8, blank=True, null=True
    )

    payment_time = models.DateTimeField(null=True, blank=True)
    paid = models.BooleanField(default=False)
    # amount = models.DecimalField(
    #     default=0, decimal_places=2, max_digits=7, blank=True, null=True
    # )

    def __str__(self):
        return f"{self.payment_for_receipt}"

    # @property
    # def balance(self):
    #     Total_bal = self.Amount_tenderd - self.payemnt_for_receipt.
    #     # Total_bal = Decimal(Total_balo).quantize(Decimal(".01"), rounding=ROUND_HALF_UP)
    #     return Total_bal


def initiate_payment(sender, instance, created, **kwargs):
    if created:
        Payment.objects.create(payment_for_receipt=instance)


post_save.connect(initiate_payment, sender=SalesReceipt)
