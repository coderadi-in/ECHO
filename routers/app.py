"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ? IMPORTS
from flask import Blueprint

# ! ROUTER INIT
app = Blueprint("app", __name__, url_prefix='/app')

@app.route("/")
def index():
    return "Index"