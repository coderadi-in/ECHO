"""
API Routers management file for the Project.

Manages all API routers in the applications.
"""

# ? IMPORTS
from flask import Flask
from .user import user

# * FUNCTION TO BIND ALL APIs TO THE SERVER
def bind_apis(server: Flask):
    """
    Binds all API routers to the server.

    :param server: Flask instance of the Project.

    ## Usage
    ```python
        from flask import Flask
        from apis import bind_apis

        server = Flask(__name__)
        bind_apis(server)
    ```
    """

    server.register_blueprint(user)