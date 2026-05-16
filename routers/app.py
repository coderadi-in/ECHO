"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from plugins import login_required, current_user, extract
from flask import Blueprint, render_template, request, redirect, url_for, flash, send_file
from models import *
from plugins import *
from datetime import date
import pandas as pd
from zipfile import ZipFile
from io import BytesIO

# ! ROUTER INIT
app = Blueprint("app", __name__, url_prefix='/app')

# ==================================================
# ROUTES
# ==================================================

# & DASHBOARD ROUTE
@app.route("/dashboard")
@login_required
def dashboard():
    # COUNT TOTAL GENERATIONS
    total_captions_count = Caption.query.filter(
        Caption.user == current_user.id,
        Caption.deleted == False
    ).count()

    total_headlines_count = Headline.query.filter(
        Headline.user == current_user.id,
        Headline.deleted == False
    ).count()

    total_gens = total_captions_count + total_headlines_count

    # COUNT CURRENT MONTH'S GENERATIONS
    month_captions_count = Caption.query.filter(
        Caption.user == current_user.id,
        extract('month', Caption.created_at) == date.today().month,
        Caption.deleted == False
    ).count()

    month_headlines_count = Headline.query.filter(
        Headline.user == current_user.id,
        extract('month', Headline.created_at) == date.today().month,
        Headline.deleted == False
    ).count()

    month_gens = month_captions_count + month_headlines_count

    return render_template('pages/dashboard.html', data={
        'total_gens': total_gens,
        'monthly_gens': month_gens,
        'saved_count': len(current_user.saved),
    })

# & CAPTIONS ROUTE
@app.route('/captions')
@login_required
def captions():
    return render_template('pages/captions.html')

# & HEADLINES ROUTE
@app.route('/headlines')
@login_required
def headlines():
    return render_template('pages/headlines.html')

# & SETTINGS ROUTE
@app.route('/settings')
@login_required
def settings():
    return render_template('pages/settings.html')

# | SETTINGS UPDATE ROUTE
@app.route('/settings/update/<field>', methods=['POST'])
@login_required
def update_settings(field):
    if (field == 'profile'):
        current_user.name = request.form.get('name', current_user.name)
        current_user.email = request.form.get('email', current_user.email)
        current_user.site_url = request.form.get('site_url', current_user.site_url)
        db.session.commit()

        flash("Your profile has been updated.", "check_circle")
        return redirect(url_for('app.dashboard'))
    
    elif (field == 'ai-preferences'):
        ai_tone = request.form.get('tone', current_user.ai_tone)
        ai_creativity = request.form.get('creativity', current_user.ai_creativity)
        ai_lang = request.form.get('lang', current_user.ai_lang)

        current_user.ai_tone = ai_tone
        current_user.ai_creativity = ai_creativity
        current_user.ai_lang = ai_lang
        db.session.commit()

        flash("Your AI preferences has been updated.", "check_circle")
        return redirect(url_for('app.dashboard'))
    
    elif (field == 'security'):
        old_password = request.form.get('oldPassword')
        new_password = request.form.get('newPassword')

        if (not old_password) or (not new_password):
            flash("The inputs aren't filled properly", "error")
            return redirect(url_for('app.settings'))

        if not (encoder.check_password_hash(current_user.password, old_password)):
            flash("Invalid password", "error")
            return redirect(url_for('app.settings'))
        
        current_user.password = new_password
        db.session.commit()

        flash("Your security password has been updated.", "check_circle")
        return redirect(url_for('app.dashboard'))
    
    else:
        flash("Couldn't find proper field to update.", "error")
        return redirect(url_for('app.settings'))
    
# | SETTINGS DATA ROUTE
@app.route('/settings/data/<function>')
@login_required
def handle_data(function):
    if (function == 'clear'):
        for caption in current_user.captions:
            caption.deleted = True

        for headline in current_user.headlines:
            headline.deleted = True

        db.session.commit()
        flash("The generation history is cleared.", "check_circle")
        return redirect(url_for('app.dashboard'))
    
    elif (function == 'export'):
        # CREATE A DF CONTAINING GENERATED CAPTIONS
        selected_captions = current_user.captions
        captions_dataframe = pd.DataFrame({
            "title": caption.title,
            "desc": caption.desc,
            "price": caption.price,
            "caption": caption.caption,
            "created_at": caption.created_at
        } for caption in selected_captions)
        captions_dataframe.to_csv("captions.csv")
        
        # CREATE A DF CONTAINING GENERATED HEADLINES
        selected_headlines = current_user.headlines
        headlines_dataframe = pd.DataFrame({
            "title": headline.title,
            "desc": headline.desc,
            "price": headline.price,
            "headline": headline.gen_headline,
            "sub-headline": headline.gen_desc,
            "created_at": headline.created_at
        } for headline in selected_headlines)        
        headlines_dataframe.to_csv("headlines.csv")

        # BIND CSVs IN ZIP
        files_to_bind = [ "captions.csv", "headlines.csv" ]
        stream = BytesIO()

        with ZipFile(stream, 'w') as zf:
            for file in files_to_bind:
                zf.write(file, os.path.basename(file))

        stream.seek(0)
        os.remove("captions.csv")
        os.remove("headlines.csv")

        # RETURN OUTPUT FILE
        flash("The data has been exported to your device.", "file_export")
        return send_file(
            stream,
            as_attachment=True,
            download_name="echo_data.zip",
            mimetype="application/zip"
        )

    else:
        flash("Couldn't file proper function to handle data.", "error")
        return redirect(url_for('app.settings'))

# & HISTORY ROUTE
@app.route('/history')
@login_required
def history():
    return render_template('pages/history.html')

# | DELETE GENERATION ROUTE
@app.route('/history/delete/<category>')
@login_required
def delete_generation(category):
    gen, gen_id = None, request.args.get('id')

    if (not gen_id):
        flash("Couldn't find the generation to delete.", "error")
        return redirect(url_for('app.history'))
    
    if (category.lower() == 'caption'):
        gen = Caption.query.get(gen_id)

    elif (category.lower() == 'headline'):
        gen = Headline.query.get(gen_id)

    if (not gen):
        flash("Couldn't find the generation to delete.", "error")
        return redirect(url_for('app.history'))
        
    gen.deleted = True
    db.session.commit()

    flash("The generation has been deleted.", "check_circle")
    return redirect(url_for('app.history'))

# & ACCOUNT ROUTE
@app.route('/account')
@login_required
def account():
    return render_template('pages/account.html')