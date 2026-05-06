"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ? IMPORTS
from flask import Blueprint, render_template

# ! ROUTER INIT
app = Blueprint("app", __name__, url_prefix='/app')

@app.route("/dashboard")
def dashboard():
    return render_template('pages/dashboard.html')