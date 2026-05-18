"""
Application billing routes management file for the Project.

Manages the routes of billing.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template

# ! ROUTER INIT
billing = Blueprint('billing', __name__, url_prefix='/billing')

# ==================================================
# ROUTES
# ==================================================

# & BILLING PAGE ROUTE
@billing.route('/')
def plans():
    return render_template('pages/billing.html')

# & UPGRADE ROUTE
@billing.route('/upgrade')
def upgrade():
    pass