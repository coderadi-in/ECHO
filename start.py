"""
Run command file for the project.

Runs the project in localhost.
"""

# ? IMPORTS
from main import server

# ! RUN
if (__name__ == "__main__"):
    server.run(debug=True)