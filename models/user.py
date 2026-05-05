"""
User database management file for the Project.

Manages the user table.
"""

# ? IMPORTS
from plugins import *

# ! MODEL INIT
class User(db.Model, UserMixin):
    """
    User database model.
    Stores the data of user.

    ```python
        user = User(
            name="coderadi",
            email="adi@coderadi.in",
            password="<password>",
            site_url="coderadi.in",
            config_pass="<get_from_dev>"
        )
    ```
    """
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    site_url = db.Column(db.String)
    config_pass = db.Column(db.String, unique=True)