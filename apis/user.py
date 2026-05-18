"""
Application user specific api routes management file for the Project.

Manages the routes of user specific api.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, jsonify, request
from plugins import *
from models import *
from collections import defaultdict

# ! ROUTER INIT
user = Blueprint('user', __name__, url_prefix='/api/user')

# ==================================================
# USER SPECIFIC END-POINTS
# ==================================================

# & END-POINT TO GET USER'S MONTHLY CREDIT USAGE
@user.route('/credits/monthly-usage')
def get_monthly_usage():
    # VALUES DEFINITION
    today = date.today()
    start = today.replace(day=1)

    dates, counts = [], []
    current = start
    gens = defaultdict(int)

    # FETCH CURRENT USER'S GENERATIONS
    captions = Caption.query.filter(
        Caption.user == current_user.id,
        extract('month', Caption.created_at) == today.month
    ).all()
    
    headlines = Headline.query.filter(
        Headline.user == current_user.id,
        extract('month', Headline.created_at) == today.month
    ).all()

    # COUNT GENERATIONS IN DICT [DEFAULT = 0]
    for caption in captions:
        gens[caption.created_at] += 1

    for headline in headlines:
        gens[headline.created_at] += 1

    # APPEND ALL COUNTS AND DATES IN A LIST
    while (current <= today):
        dates.append(current.strftime("%d"))
        counts.append(gens[current])

        current += timedelta(days=1)

    # RETURN RESPONSE
    return jsonify({
        "dates": dates,
        "counts": counts
    })