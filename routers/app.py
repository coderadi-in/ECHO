"""
Application core routes management file for the Project.

Manages the routes of core app functionalities.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from plugins import login_required, current_user, extract
from flask import Blueprint, render_template, request, redirect, url_for, flash
from models import *
from plugins import *
from datetime import date

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
    total_captions_count = len(current_user.captions)
    total_headlines_count = len(current_user.headlines)
    total_gens = total_captions_count + total_headlines_count

    # COUNT CURRENT MONTH'S GENERATIONS
    month_captions_count = Caption.query.filter(
        Caption.user == current_user.id,
        extract('month', Caption.created_at) == date.today().month
    ).count()

    month_headlines_count = Headline.query.filter(
        Headline.user == current_user.id,
        extract('month', Headline.created_at) == date.today().month
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
def handle_data(function):
    if (function == 'clear'):
        # >>> ADD CODE TO CLEAR DATA
        pass
    
    elif (function == 'export'):
        # >>> ADD CODE TO EXPORT DATA
        pass

    else:
        flash("Couldn't file proper function to handle data.", "error")
        return redirect(url_for('app.settings'))

# & HISTORY ROUTE
@app.route('/history')
@login_required
def history():
    return render_template('pages/history.html')

# & ACCOUNT ROUTE
@app.route('/account')
@login_required
def account():
    return render_template('pages/account.html')