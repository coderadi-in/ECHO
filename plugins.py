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
from openai import OpenAI
import os

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

# * FUNCTION TO SEND MESSAGE TO MODEL
def get_response(system_prompt: str, message: str) -> str:
    """
    Generates a response using AI model.

    :param system_prompt: The prompt to be provided by the system.
    :param message: The prompt to be provided by the user.

    ## Usage
    ```python
        response = get_response(
            "You're a professional story-teller.",
            "Create a small 100 words story for a tech-product."
        )
    ```
    """

    api_key = os.getenv("OPENAI_API_KEY")
    if not (api_key):
        return "There're issues in the backend!"

    try:
        model = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        response = model.responses.create(
            model="openai/gpt-4o-mini",
            input=[
                { "role": "system", "content": system_prompt },
                { "role": "user", "content": message },
            ],
            temperature=0.7,
            max_output_tokens=500,
        )

        return response.output_text

    except:
        return "Something went wrong while generating response!"