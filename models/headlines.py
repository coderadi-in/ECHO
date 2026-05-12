"""
Headlines database management file for the Project.

Manages the headlines table.
"""

# ? IMPORTS
from plugins import *
from datetime import date

# ! MODEL INIT
class Headline(db.Model):
    """
    Headline database model.
    Stores the data of headline.

    ```python
        headline = Headline(
            user=current_user.id
            title="<title>",
            desc='''<desc>''',
            price=<price>,
            headline='<headline>',
            desc='''<desc>'''
        )
    ```
    """

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)    
    title = db.Column(db.String, nullable=False)
    desc = db.Column(db.TEXT, nullable=False)
    price = db.Column(db.Float, nullable=False)
    gen_headline = db.Column(db.String, nullable=False)
    gen_desc = db.Column(db.TEXT, nullable=False)
    created_at = db.Column(db.Date, default=date.today())