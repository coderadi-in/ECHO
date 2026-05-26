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
from cashfree_pg.api_client import Cashfree
from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
import os
from sqlalchemy import extract
from datetime import date, timedelta
from typing import Literal
import requests
from bs4 import BeautifulSoup
import pandas as pd
from requests.adapters import HTTPAdapter
from requests.exceptions import RetryError

# ! INITS
db = SQLAlchemy()
socket = SocketIO()
encoder = Bcrypt()
migrator = Migrate()
logger = LoginManager()

# ! HTTPS ERROR MESSAGES
ERR_MESSAGES = {
    requests.exceptions.ConnectTimeout: ["Can't connect with the store!", "error"],
    requests.exceptions.ReadTimeout: ["Can't get data of the store!", "error"],
}

# ! PLANS LIST
ACCOUNT_PLANS = { "pro": 5000, }

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

# * FUNCTION TO CREATE A CASHFREE INSTANCE
def CF_client(env = Cashfree.SANDBOX):
    """
    Creates a Cashfree instance.

    :param env: The environment type.

    ## Environment types
    1. Cashfree.SANDBOX - for development
    2. Cashfree.PRODUCTION - for production
    """

    cf_client = Cashfree(
        XEnvironment=Cashfree.SANDBOX,
        XClientId=os.getenv("CASHFREE_ID"),
        XClientSecret=os.getenv("CASHFREE_SEC")
    )

    return cf_client

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
    
# * FUNCTION TO RESET USER CREDITS
def reset_credits():
    """
    Resets user credits.
    Works if user has "Free" plan and last reset is 30 days ago.
    """

    # CHECK IF USER HAS FREE PLAN AND RENEWAL DATE HAS PASSED
    if (current_user.plan.lower() == "free") and (date.today() >= current_user.renewal_date + timedelta(days=1)):
        current_user.total_credits, current_user.left_credits = 50, 50
        current_user.renewal_date = date.today() + timedelta(days=30)
        db.session.commit()
        return { "status": 200, "message": "User's credits has been reset." }
    
    return { "status": 400, "message": "User has paid plan or renewal hasn't passed." }

# * FUNCTION TO UPGRADE USER PLAN
def upgrade_plan(plan: str = "pro"):
    """
    Upgrades user's credits if user upgrades plan, according to generations.
    """

    plan = plan.lower()

    # CHECK IF PLAN TYPE IS VALID
    if (plan not in ACCOUNT_PLANS.keys()):
        return { "status": 422, "message": "Invalid plan type." }

    # SET VALUE
    T1 = current_user.total_credits # Old total credits of user
    L1 = current_user.left_credits  # Old left credits of user
    T2 = ACCOUNT_PLANS[plan]        # New total credits of user

    # PUT VALUES IN FORMULA
    G = T1 - L1 # G = Total number of generations.
    L2 = T2 - G # L2 = New left credits of user.

    # SAVE NEW VALUES IN USER MODEL
    current_user.plan = plan
    current_user.total_credits = T2
    current_user.left_credits = L2
    current_user.renewal_date = date.today() + timedelta(days=30)
    db.session.commit()
    { "status": 200, "message": "User's plan type upgraded." }

# * FUNCTION TO DOWNGRADE USER PLAN
def downgrade_plan():
    """
    Downgrades user's plan if renewal date is passed.
    """

    # CHECK IF USER HAS FREE PLAN OR RENEWAL HAS NOT PASSED
    if (current_user.plan.lower() == "free") or (date.today() < current_user.renewal_date + timedelta(days=1)):
        return { "status": 400, "message": "User has free plan or renewal date hasn't passed." }

    # DOWNGRADE USER'S PLAN
    current_user.plan = "free"
    current_user.total_credits, current_user.total_credits = 50, 50
    current_user.renewal_date = date.today() + timedelta(days=30)
    db.session.commit()
    return { "status": 200, "message": "User's plan has been downgraded." }

# * FUNCTION TO SCRAPE USER'S STORE
def scrape_store() -> bool|pd.DataFrame:
    """
    Scrapes the store of user and get product insights.
    """
    store_url = current_user.site_url
    if (not store_url): return False

    try:
        fetch_session = requests.Session()
        fetch_session.mount("https://", HTTPAdapter(max_retries=3))
        response = fetch_session.get(store_url, timeout=(5, 5))
    
    except Exception as e:
        print(e)
        return False
    
    soup = BeautifulSoup(response.text, 'html.parser')
    products = {
        "Title": [],
        "Price": [],
        "Desc": []
    }

    cards = soup.find_all(attrs={'class': 'product_card'})

    for card in cards:
        products["Title"].append(card.find(attrs={'class': 'product_title'}).text)
        products["Price"].append(card.find(attrs={'class': 'product_price'}).text)
        products["Desc"].append(card.find(attrs={'class': 'product_desc'}).text)

    return pd.DataFrame(products)