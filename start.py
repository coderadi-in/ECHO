"""
Run command file for the project.

Runs the project in localhost.
"""

# ? IMPORTS
from main import server
from plugins import socket

# ! RUN
if (__name__ == "__main__"):
    socket.run(server, debug=True)
