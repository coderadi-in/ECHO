"""
Captions database management file for the Project.

Manages the captions table.
"""

# ? IMPORTS
from plugins import *
from datetime import date

# ! MODEL INIT
class Caption(db.Model):
    """
    Caption database model.
    Stores the data of caption.

    ```python
        caption = Caption(
            user=current_user.id
            title="<title>",
            desc='''<desc>''',
            price=<price>,
            caption='''<caption>'''
        )
    ```
    """

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String, nullable=False)
    desc = db.Column(db.TEXT, nullable=False)
    price = db.Column(db.Float, nullable=False)
    caption = db.Column(db.TEXT, nullable=False)
    created_at = db.Column(db.Date, default=date.today())