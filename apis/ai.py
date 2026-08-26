"""
Application AI specific api routes management file for the Project.

Manages the routes of AI specific api.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from flask import Blueprint, jsonify, request, send_file
from plugins import *
from models import *
from collections import defaultdict
from ai import SystemPrompts
from services.barcode import generate_barcode
from services.sheet_gen import SheetGenerator

# ! ROUTER INIT
ai = Blueprint('ai', __name__, url_prefix='/api/ai')

# ! SERVICE INITS
label_generation = SheetGenerator()

# ==================================================
# AI SPECIFIC END-POINTS
# ==================================================

# & END-POINT TO GENERATE A STICKER SHEET
@ai.route('/generate-sticker-sheet', methods=['POST'])
@login_required
@limiter.limit("20 per minute")
def generate_sticker_sheet():
    # REFRESH USER'S PLAN AND CREDITS
    reset_credits()
    downgrade_plan()

    # CHECK CREDITS
    if (current_user.left_credits <= 0):
        return jsonify({
            "status": 402,
            "message": "You're out of credits"
        }), 402

    # ACCESS FORM DATA
    barcode = request.form.get('barcode')
    price = request.form.get('price')
    batch = request.form.get('batch')
    mfg = request.form.get('mfg')
    exp = request.form.get('exp')
    specific = request.form.get('specific')

    # STATES
    barcode_needed = False if not barcode else True
    price_needed = False if not price else True
    batch_needed = False if not batch else True
    mfg_needed = False if not mfg else True
    exp_needed = False if not exp else True
    specific_info_needed = False if not specific else True
    lines = []

    # FORM VALIDATION
    if (
        barcode is None and
        price is None and
        batch is None and
        mfg is None and
        exp is None and
        specific is None
    ):
        return jsonify({
            "status": 400,
            "message": "No input fields"
        }), 400

    # USER PROMPT INITIATION
    user_prompt = f"""barcode_needed: {barcode_needed}
price_needed: {price_needed}
batch_needed: {batch_needed}
mfg_needed: {mfg_needed}
exp_needed: {exp_needed}
specific_info_needed: {specific_info_needed}"""

    # GET GRID TEMPLATE
    grid_templates = get_response(
        SystemPrompts.GRID_CALCULATION,
        user_prompt
    )

    # ERROR HANDLING
    if (grid_templates['status'] != 200):
        logging.error(grid_templates['output'])
        return jsonify(grid_templates), grid_templates['status']

    template = grid_templates['output']
    rows, columns = template.split("/")

    # GENERATE BARCODE
    if (barcode): barcode_image = generate_barcode(barcode, False)
    else: barcode_image = None

    # APPEND LINES
    if (price): lines.append(f"MRP: {price}")
    if (batch): lines.append(f"Batch: {batch}")
    if (mfg): lines.append(f"MFG: {mfg}")
    if (exp): lines.append(f"EXP: {exp}")
    if (specific): lines.append(specific)

    try:
        pdf = label_generation.generate_sheet(
            barcode_image, lines,
            rows=int(rows), columns=int(columns)
        )
    except:
        return jsonify({
            "status": 500,
            "message": "Something went wrong while generating PDF."
        })

    # SAVE OUTPUT IN DB
    new_sheet = BarcodeSheet(
        user=current_user.id,
        barcode=barcode,
        price=price,
        batch=batch,
        mfg=mfg,
        exp=exp,
        specific=specific
    )

    db.session.add(new_sheet)
    current_user.left_credits -= 1
    db.session.commit()

    # RETURN OUTPUT
    return send_file(
        pdf,
        as_attachment=False,
        download_name="echo_sheets.pdf",
        mimetype="application/pdf"
    )