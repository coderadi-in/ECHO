"""
Application store routes management file for the Project.

Manages the routes of store.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template, jsonify, redirect, url_for, send_file, request
from plugins import *

# ! ROUTER INIT
store = Blueprint('store', __name__, url_prefix='/store')

# ==================================================
# ROUTES
# ==================================================

# & STORE ROUTE
@store.route('/')
def store_page():
    if (not current_user.site_url):
        flash("You have't integrated your store yet.", 'error')
        return redirect(url_for('app.dashboard'))
    
    return render_template('pages/store.html')