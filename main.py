"""
Main file of the Project.

Binds everything at one place.
"""

# ==================================================
# ENVIRONMENT SETUP
# ==================================================

# ! LOAD VENV
from dotenv import load_dotenv
load_dotenv('.venv/vars.env')

# ==================================================
# BINDING SETUP
# ==================================================

# ? IMPORTS
from flask import Flask, render_template, redirect, url_for
from plugins import *
from routers import *
from models import *
import os
import socket_listeners

# ! SERVER INIT
server = Flask(__name__)
server.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DB_URI")
server.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
server.config['SECRET_KEY'] = os.getenv("SEC_KEY")

# ==================================================
# PLUGINS AND DATABASE
# ==================================================

# & EXTENSIONS BINDING
bind_plugins(server)
bind_routers(server)

# & DATABASE INIT
with server.app_context():
    db.create_all()

# ==================================================
# AUTHENTICATION AND ROUTE REDIRECTION
# ==================================================

# | USER LOADER
@logger.user_loader
def load_user(user):
    return User.query.get(user)

# | BASE ROUTE
@server.route('/')
def index():
    if (current_user.is_authenticated):
        return redirect(url_for("app.index"))
    return render_template("index.html")