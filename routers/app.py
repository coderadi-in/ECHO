"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template

# ! ROUTER INIT
app = Blueprint("app", __name__, url_prefix='/app')

# ==================================================
# ROUTES
# ==================================================

# & DASHBOARD ROUTE
@app.route("/dashboard")
def dashboard():
    return render_template('pages/dashboard.html')

# & CAPTIONS ROUTE
@app.route('/captions')
def captions():
    return render_template('pages/captions.html')

# & HEADLINES ROUTE
@app.route('/headlines')
def headlines():
    return render_template('pages/headlines.html')

# & SETTINGS ROUTE
@app.route('/settings')
def settings():
    return render_template('pages/settings.html')