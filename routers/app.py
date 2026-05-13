"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from plugins import login_required, current_user, extract
from flask import Blueprint, render_template
from models import *
from datetime import date

# ! ROUTER INIT
app = Blueprint("app", __name__, url_prefix='/app')

# ==================================================
# ROUTES
# ==================================================

# & DASHBOARD ROUTE
@app.route("/dashboard")
@login_required
def dashboard():
    # COUNT TOTAL GENERATIONS
    total_captions_count = len(current_user.captions)
    total_headlines_count = len(current_user.headlines)
    total_gens = total_captions_count + total_headlines_count

    # COUNT CURRENT MONTH'S GENERATIONS
    month_captions_count = Caption.query.filter(
        Caption.user == current_user.id,
        extract('month', Caption.created_at) == date.today().month
    ).count()

    month_headlines_count = Headline.query.filter(
        Headline.user == current_user.id,
        extract('month', Headline.created_at) == date.today().month
    ).count()

    month_gens = month_captions_count + month_headlines_count

    return render_template('pages/dashboard.html', data={
        'total_gens': total_gens,
        'monthly_gens': month_gens,
        'saved_count': len(current_user.saved),
    })

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