"""
Docs core routes management file for the Project.

Manages the routes of documentation.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
import os

# ! ROUTER INIT
docs = Blueprint("docs", __name__, url_prefix='/docs')

# ==================================================
# ROUTES
# ==================================================

# & HOME ROUTE
@docs.route('/')
def docs_home():
    return render_template('docs/home.html')

# & TOPIC ROUTE
@docs.route('/topics')
def docs_topic():
    # ACCESS TOPIC AND SUB-TOPIC
    topic = request.args.get('topic')
    sub_topic = request.args.get('sub_topic')

    # FETCH THE RELATED DOC PAGE
    relative_path_page = f"docs/{topic}/{sub_topic}.html"
    absolute_page_path = os.path.join(current_app.root_path, "templates", relative_path_page)

    if (os.path.exists(absolute_page_path)):
        return render_template(relative_path_page)

    else:
        flash("The page you were trying to access doesn't exists.", "error")
        return redirect(url_for('docs.docs_home'))