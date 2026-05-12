"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from plugins import login_required
from flask import Blueprint, render_template

# ! ROUTER INIT
app = Blueprint("app", __name__, url_prefix='/app')

# ==================================================
# ROUTES
# ==================================================

# & DASHBOARD ROUTE
@app.route("/dashboard")
@login_required
def dashboard():
    return render_template('pages/dashboard.html')

# & CAPTIONS ROUTE
@app.route('/captions')
@login_required
def captions():
    return render_template('pages/captions.html')

# & HEADLINES ROUTE
@app.route('/headlines')
@login_required
def headlines():
    return render_template('pages/headlines.html')

# & SETTINGS ROUTE
@app.route('/settings')
@login_required
def settings():
    return render_template('pages/settings.html')

# & HISTORY ROUTE
@app.route('/history')
@login_required
def history():
    return render_template('pages/history.html')

# & ACCOUNT ROUTE
@app.route('/account')
@login_required
def account():
    return render_template('pages/account.html')