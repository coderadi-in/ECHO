"""
Application billing routes management file for the Project.

Manages the routes of billing.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template, jsonify, send_file, request
from uuid import uuid4
from io import BytesIO
import pandas as pd
from plugins import *
from models import *

# ! INITS
billing = Blueprint('billing', __name__, url_prefix='/billing')
cashfree = CashFree()

# ==================================================
# ROUTES
# ==================================================

# & BILLING PAGE ROUTE
@billing.route('/')
@login_required
def plans():
    return render_template('pages/billing.html')

# & UPGRADE ROUTE
@billing.route('/create-order', methods=['POST'])
@login_required
def create_order():
    order_id = f"order_{uuid4()}"

    customer_details = CustomerDetails(
        customer_id=f"00{current_user.id}",
        customer_email=current_user.email,
        customer_phone=current_user.phone
    )

    order_meta = OrderMeta(
        return_url=f"http://127.0.0.1:5000/billing/payments?order_id={order_id}"
    )

    order = CreateOrderRequest(
        order_id=order_id,
        order_amount=1,
        order_currency="INR",
        customer_details=customer_details,
        order_meta=order_meta
    )

    response = cashfree.PGCreateOrder(order)

    return jsonify({
        "payment_session_id": response.data.payment_session_id
    })

# & PAYMENTS ROUTE
@billing.route('/payments')
@login_required
def check_payment_status():
    order_id = request.args.get('order_id')
    response = cashfree.PGFetchOrder(order_id)
    order_status = response.data.order_status
    amount = response.data.order_amount
    currency = response.data.order_currency
    relevant_page = order_status.lower()
    today = date.today()

    payment = Payment(
        order_id=order_id,
        user=current_user.id,
        status=order_status,
        processed=True,
        amount=amount
    )

    db.session.add(payment)
    db.session.commit()

    if (order_status == "PAID"):
        upgrade_plan()

        return render_template(f"events/{relevant_page}.html", data={
            "order_id": order_id,
            "plan": "Pro",
            "status": order_status,
            "amount": amount,
            "currency": currency,
            "id": payment.id
        })
    
# & EXPORT HISTORY ROUTE
@billing.route('/history/export')
@login_required
def export_history():
    payments_history = current_user.payments
    buffer = BytesIO()

    payments_df = pd.DataFrame({
        'date': payment.date,
        'order_id': payment.order_id,
        'plan': payment.plan,
        'amount': payment.amount,
        'status': payment.status,
        'processed': payment.processed
    } for payment in payments_history)
    payments_df.to_csv(buffer)

    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name='payments.csv',
        mimetype='text/csv'
    )