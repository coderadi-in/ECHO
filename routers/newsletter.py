"""
Newsletter core routes management file for the Project.

Manages the routes of newsletter.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template, request, redirect, url_for, flash

# ! ROUTER INIT
news = Blueprint("news", __name__, url_prefix='/newsletter')

# ==================================================
# ROUTES
# ==================================================

# & HOME ROUTE
@news.route('/')
def news_home():
    return render_template('news/home.html')