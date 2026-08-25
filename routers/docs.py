"""
Docs core routes management file for the Project.

Manages the routes of documentation.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template, request, redirect, url_for, flash

# ! ROUTER INIT
docs = Blueprint("docs", __name__, url_prefix='/docs')

# ==================================================
# ROUTES
# ==================================================

# & HOME ROUTE
@docs.route('/')
def docs_home():
    return render_template('docs/home.html')