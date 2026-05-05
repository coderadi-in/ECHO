"""
Main file of the Project.

Binds everything at one place.
"""

# ! LOAD VENV
from dotenv import load_dotenv
load_dotenv('.venv/vars.env')

# ? IMPORTS
from flask import Flask, redirect, url_for
from plugins import *
from routers import *
import os

# ! SERVER INIT
server = Flask(__name__)
server.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DB_URI")
server.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
server.config['SECRET_KEY'] = os.getenv("SEC_KEY")

# & EXTENSIONS BINDING
bind_plugins(server)
bind_routers(server)

# & DATABASE INIT
with server.app_context():
    db.create_all()

# | BASE ROUTE
@server.route('/')
def index():
    return redirect(url_for('app.index'))