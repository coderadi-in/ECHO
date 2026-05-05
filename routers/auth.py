"""
Application authorization routes management file for the Project.

Manages the auth related routes.
"""

# ? IMPORTS
from flask import Blueprint

# ! ROUTER INIT
auth = Blueprint("auth", __name__, url_prefix='/auth')

# & INDEX
@auth.route('/')
def index():
    return "Auth index"