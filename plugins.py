"""
Flask-plugins management file.

Manages all Flask-plugins.
"""

# ? IMPORTS
from flask import Flask, flash
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate, migrate, upgrade, init as init_migrator
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from openai import OpenAI
import os
from sqlalchemy import extract
from datetime import date, timedelta

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
def get_response(system_prompt: str, message: str, personality_prompt: str|None = None, token_size: int = 250) -> str:
    """
    Generates a response using AI model.

    :param system_prompt: The prompt to be provided by the system.
    :param message: The prompt to be provided by the user.
    :param personality_prompt: The prompt the be provided to give a personality to the AI to talk like.
    :param token_size: The max token size to generate response.

    ## Usage
    ```python
        response = get_response(
            "You're a professional story-teller.",
            "Talk like a friend.",
            "Create a small 100 words story for a tech-product."
        )
    ```
    """

    api_key = os.getenv("OPENAI_API_KEY")
    if not (api_key):
        return {
            "output": "There're issues in the backend!",
            "status": 503
        }

    try:
        model = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

        if (personality_prompt):
            response = model.responses.create(
                model="openai/gpt-4o-mini",
                input=[
                    { "role": "system", "content": system_prompt + "\n" + personality_prompt },
                    { "role": "user", "content": message },
                ],
                temperature=0.7,
                max_output_tokens=token_size,
            )
        
        else:
            response = model.responses.create(
                model="openai/gpt-4o-mini",
                input=[
                    { "role": "system", "content": system_prompt },
                    { "role": "user", "content": message },
                ],
                temperature=0.7,
                max_output_tokens=token_size,
            )

        return {
            "output": response.output_text,
            "status": 200
        }

    except:
        return {
            "output": "Something went wrong while generating response!",
            "status": 500
        }