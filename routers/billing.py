"""
Application billing routes management file for the Project.

Manages the routes of billing.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template, jsonify, redirect, url_for, send_file, request
from uuid import uuid4
from io import BytesIO
from plugins import *
from models import *

# ! INITS
billing = Blueprint('billing', __name__, url_prefix='/billing')

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
    session_id = initiate_cf_order()

    return jsonify({
        "payment_session_id": session_id,
    })

# & PAYMENTS ROUTE
@billing.route('/payments')
@login_required
def check_payment_status():
    order_id = request.args.get('order_id')
    response = fetch_cf_status(order_id)

    order_status = response.get('order_status')
    amount = response.get('order_amount')
    currency = response.get('order_currency')
    relevant_page = order_status.lower()

    if (Payment.query.filter_by(order_id=order_id).first()):
        flash("The payment was already processed.", "check")
        return redirect(url_for('app.dashboard'))

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