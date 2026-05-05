"""
Flask-plugins management file.

Manages all Flask-plugins.
"""

# ? IMPORTS
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate, migrate
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required

# ! INITS
db = SQLAlchemy()
socket = SocketIO()
encoder = Bcrypt()
migrator = Migrate()
logger = LoginManager()

# * FUNCTION TO BIND PLUGINS TO THE SERVER
def bind_plugins(server: Flask) -> None:
    """
    Binds all plugins to the server.

    :param server: Flask instance of the Project.

    ## Usage
    ```python
        from flask import Flask
        from plugins import bind_plugins
        
        server = Flask(__name__)
        bind_plugins(server)
    ```
    """

    db.init_app(server)
    socket.init_app(server)
    encoder.init_app(server)
    migrator.init_app(server, db)
    logger.init_app(server)