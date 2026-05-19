"""
Payments database management file for the Project.

Manages the payments table.
"""

# ? IMPORTS
from plugins import *
from datetime import date

# ! MODEL INIT
class Payment(db.Model):
    """
    Payment database model.
    Stores payments data.

    ```python
        payment = Payment(
            order_id="<order_id>",
            plan="Pro",
            status="PAID",
            processed=True
        )
    ```
    """

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    order_id = db.Column(db.String, unique=True, nullable=False)
    date = db.Column(db.Date, default=date.today())
    plan = db.Column(db.String, default="Pro")
    status = db.Column(db.String)
    amount = db.Column(db.Float, nullable=False)
    processed = db.Column(db.Boolean)