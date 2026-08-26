"""
BarcodeSheet database management file for the Project.

Manages the barcode-sheet table.
"""

# ? IMPORTS
from plugins import *
from datetime import date

# ! MODEL INIT
class BarcodeSheet(db.Model):
    """
    BarcodeSheet database model.
    Stores the data of barcode-sheet.

    ```python
        barcode_sheet = BarcodeSheet(
            user=current_user.id,
            barcode="<barcode>",
            price="<price>",
            batch="<batch>",
            mfg="<mfg>",
            exp="<exp>"
            specific="<specific>"
        )
    ```
    """

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    barcode = db.Column(db.String(50))
    price = db.Column(db.String(50))
    batch = db.Column(db.String(50))
    mfg = db.Column(db.String(50))
    exp = db.Column(db.String(50))
    specific = db.Column(db.String(50))
    created_at = db.Column(db.Date, default=date.today())
    deleted = db.Column(db.Boolean, default=False)