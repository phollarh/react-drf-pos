import calendar
from pprint import pprint
import random
from pos.models import SalesReceipt, Order, Product, SalesReceiptOrder
from django.contrib.auth import get_user_model
from django.utils import timezone
import calendar
from django.db.models import Sum, F, DecimalField, ExpressionWrapper
from datetime import timedelta

# //to use scripts install django extension the run  python manage.py runscript  scripts

User = get_user_model()


def run():
    # order = Order.objects.values().last()
    # salesreceipt = SalesReceipt.objects.values().first()
    user = User.objects.get(id=1)
    # order = Order.objects.create(user=user,product=Product.objects.get(id=1), Quantity=2)

    # receipt_obj, created = SalesReceipt.objects.get_or_create(issued=False)
    # salesreceipt.orders.add(order)
    # print(salesreceipt.orders.all())
    # print(order, salesreceipt)
    # receipt_order = receipt_obj.add_order(
    #     order=order, payment_option=SalesReceiptOrder.Paymentchoices.TRANSFER
    # )
    # print(receipt_order)
    # salesreceipt.orders.add(order, through_defaults={'remarks':'','amount':25_000})
    # new_order = [
    #     {"user": user, "product": Product.objects.get(id=1), "quantity": 4},
    #     {"user": user, "product": Product.objects.get(id=1), "quantity": 12.5},
    #     {"user": user, "product": Product.objects.get(id=1), "quantity": 10.5},

    # ]
    #     orders = [
    #     Order(
    #         user=user,
    #         product=Product.objects.get(id=1),
    #         quantity=qty,
    #         sub_total=qty * Product.objects.get(id=1).selling_price
    #     )
    #     for qty in list(range(1,50))
    # ]
    #     Order.objects.bulk_create(orders)
    # orders = [Order(**order) for order in new_order]

    # for order in new_order:
    #     print(order)
    # receipt = SalesReceipt.objects.last()
    # if receipt.orders is not None:
    #     old_order = receipt.orders.all()
    #     old_order.delete()
    #     new_added_order = Order.objects.bulk_create(orders)
    #     for added in new_added_order:
    #         receipt.add_order(
    #             order=added,
    #             payment_option=SalesReceiptOrder.Paymentchoices.CASH,
    #             remarks="new order added",
    #
    #         )
    current_month = timezone.now().month
    print(current_month)

    # months = timezone.
    # dictMonth={}
    # months=list(calendar.month_name)[1:]
    # for month in months:
    #     dictMonth[month]=0

    # print(dictMonth)

    # print(Order.objects.filter(date__month=current_month))
    # print(timezone.timedelta(days=7))
    # current_day = timezone.now().date()
    # print(current_day)
    # timedelta(days=current_day.weekday() this create 0 - 6 with 0 being Monday
    # 0-m
    # 1-t
    # 2-w
    # 3-t
    # 4-F
    # 5-s
    # 6-s
    current_year = timezone.now().year
    # print(current_year - 1)
    receipts = SalesReceipt.objects.filter(issued=True, date__year=current_year)
    print(receipts)
    # start_of_week = current_day - timedelta(days=current_day.weekday())
    # end_of_week = start_of_week + timedelta(days=6)
    # days_in_the_week_sales = {}
    # dic = {}
    # products = Product.objects.all()
    

    # for p in products:
    #     total_qty = 0
    #     product_orders = p.products.all()
    #     for product in product_orders:
    #         total_qty += product.quantity
    #     dic[p.product_name] = total_qty
    # print(dic)

    # product_name = product.product_name
    # order = Order.objects.last()
    # orders_product=product.products.all()
    # total_qty = 0
    # for product in orders_product:

    #     total_qty += product.quantity
    # print(total_qty)
    # dic[product_name] = 0
    # print(dic)
    # qty_t = 0
    # for key in dic.keys():

    #     if key.id == 5:
    #         orders = key.products.all()
    #         for r in orders:
    #             qty_t += r.quantity
    #    value = qty_t

    # print(orders_product.count())
    # print(order.date)

    # #    receipts for sum for the week
    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts,
    #         order__date__date__range=(start_of_week, current_day),
    #     ).aggregate(gross_sales_for_the_week=Sum("order__sub_total"))
    # )
    # #    receipts for sum for the month
    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts, order__date__month=current_month
    #     ).aggregate(gross_sales_for_month=Sum("order__sub_total"))
    # )
    # #    receipts for sum for the previous month
    # previous_month = current_month - 1
    # if previous_month == 0:
    #     previous_month = 12
    #     receipts = SalesReceipt.objects.filter(issued=True, date__year=current_year - 1)

    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts, order__date__month=previous_month
    #     ).aggregate(gross_sales_for_previous_month=Sum("order__sub_total"))
    # )

    # #    receipts for sum for yesterday
    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts,
    #         order__date__date=current_day - timedelta(days=1),
    #     ).aggregate(gross_sales_for_yesterday=Sum("order__sub_total"))
    # )
    # #    receipts for sum for last month
    # previous_month = current_month - 1
    # if previous_month == 0:
    #     previous_month = 12
    #     receipts = SalesReceipt.objects.filter(issued=True, date__year=current_year - 1)

    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts, order__date__month=previous_month
    #     ).aggregate(gross_sales_for_last_month=Sum("order__sub_total"))
    # )
    # #    receipts for sum for the sales for last week
    # end_of_last_week = start_of_week - timedelta(days=1)
    # start_of_last_week = start_of_week - timedelta(days=7)
    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts,
    #         order__date__date__range=(start_of_last_week, end_of_last_week),
    #     ).aggregate(gross_sales_for_last_week=Sum("order__sub_total"))
    # )
    # #    receipts for sum for the sales for custom dat

    # print(
    #     SalesReceiptOrder.objects.filter(
    #         sales_receipt__in=receipts, order__date__date__range=(first_date, last_date)
    #     ).aggregate(gross_sales_for_custom_date=Sum("order__sub_total"))
    # )
    # for i in range(7):
    #     key_date = start_of_week + timedelta(days=i)
    #     key_date_str = key_date.strftime("%A")
    #     days_in_the_week_sales[key_date_str] = (
    #         SalesReceiptOrder.objects.filter(
    #             sales_receipt__in=receipts, order__date__date=key_date
    #         ).aggregate(weekly_sales=Sum("order__sub_total"))["weekly_sales"]
    #         or 0
    #     )
    # print(days_in_the_week_sales)

    # print(SalesReceiptOrder.objects.filter(sales_receipt__in=receipts, order__date__month=timezone.now().month).aggregate(overal_total=Sum('order__sub_total')))
    # monthly_sales = {}
    # months_in_numbers = {}
    # order = Order.objects.all()
    # for o in order:
    #     print(o.quantity, o.product.selling_price, o.sub_total)
    # months = list(calendar.month_name)[1:]
    # for i, month in enumerate(months, start=1):
    #     monthly_sales[month] = (
    #         SalesReceiptOrder.objects.filter(
    #             sales_receipt__in=receipts, order__date__month=i
    #         ).aggregate(monthly_sales=Sum("order__sub_total"))["monthly_sales"]
    #         or 0
    #     )

    # print(monthly_sales)

    # print(monthly_sales)
    # print(months_in_numbers)

    # for x in range(len(months)):
    #     x += 1
    #     for month in months:
    #         months_in_numbers[month] = x

    # for i, month in enumerate(months, start=1):
    #     months_in_numbers[month] = i
    # print(months_in_numbers)
    # for receipt in receipts:

    #     order_subtotal=receipt.orders.all().annotate(subtotal=ExpressionWrapper(
    #         F('quantity') * F('product__selling_price'),
    #         output_field=DecimalField(max_digits=10, decimal_places=2)
    #         )).aggregate(Sum('subtotal'))
    # print(order_subtotal)
    # for order in order_subtotal:
    #     print(order.subtotal)

    #     print(SalesReceiptOrder.objects.filter(sales_receipt=receipt).annotate(total=Sum(F('orders__order__quantity')*F('orders__order__quantity'))))
    # months_in_year = list(calendar.month_name)[1:]

    # print(months_in_year, current_year)

    # order_Item = receipt.orders

    # for item in order_Item.all():
    #     print(item.quantity)
    # if item.id == 30:
    #     print(item.quantity)
    #     item.quantity = 5
    #     item.save()
    #     print(item.quantity)
    # print(receipt.orders.filter(paid=False).values())
    # print(salesreceipt.orders.all())
    # for r in receipt_obj.orders.all():
    #     print(r)
