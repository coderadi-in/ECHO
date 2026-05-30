"""
Application admin api routes management file for the Project.

Manages the routes of admin api.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, jsonify, request, send_file
from plugins import *
from models import *

# ! ROUTER INIT
admin = Blueprint('admin', __name__, url_prefix='/api/admin')

# & DECORATOR FOR CHECKING AUTHENTICATION
def admin_authentication_required(func):
    def wrapper():
        admin_id = request.headers.get('admin-id')
        admin_key = request.headers.get('admin-key')

        if (not admin_id) or (admin_id != os.getenv("ADMIN_ID")):
            return jsonify({
                "status": 401,
                "message": "Admin ID is missing or is invalid."
            }), 401
        
        if (not admin_key) or (admin_key != os.getenv("ADMIN_KEY")):
            return jsonify({
                "status": 403,
                "message": "You have admin ID but you need a specific admin KEY to get admin access."
            }), 403
        
        return func()

    return wrapper

# ==================================================
# SETUP
# ==================================================

@admin.route('/logs/download')
@admin_authentication_required
def download_logs():
    log_type = request.args.get('log_type')

    file_path = os.path.join(
        current_app.root_path,
        "logs",
        f"{log_type}.log"
    )

    if (not os.path.exists(file_path)):
        return jsonify({
            "status": 404,
            "message": "The file doesn't exists in the application directory"
        }), 404
    
    return send_file(
        file_path,
        download_name=f"{log_type}.log",
        mimetype="text/plain",
        as_attachment=True
    )