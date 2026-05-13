"""
Saved generations management file for the Project.

Manages the saved_generations table.
"""

# ? IMPORTS
from plugins import *
from datetime import date

# ! MODEL INIT
class SavedGen(db.Model):
    """
    SavedGen database model.
    Stores the data of saved generation.

    ```python
        saved = SavedGen(
            user=current_user.id,
            gen_type='Caption',
            gen_id=2
        )
    ```
    """

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    gen_type = db.Column(db.String, nullable=False)
    gen_id = db.Column(db.Integer, nullable=False)