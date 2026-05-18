"""
Routers management file for the Project.

Manages all routers in the applications.
"""

# ? IMPORTS
from flask import Flask
from .app import app
from .auth import auth
from .billing import billing

# * FUNCTION TO BIND ALL ROUTERS TO THE SERVER
def bind_routers(server: Flask) -> None:
    """
    Binds all routers to the server.

    :param server: Flask instance of the Project.

    ## Usage
    ```python
        from flask import Flask
        from routers import bind_routers
        
        server = Flask(__name__)
        bind_routers(server)
    ```
    """

    server.register_blueprint(app)
    server.register_blueprint(auth)
    server.register_blueprint(billing)