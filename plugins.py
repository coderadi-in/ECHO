"""
Flask-plugins management file.

Manages all Flask-plugins.
"""

# ? IMPORTS
from flask import Flask, flash, current_app
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate, migrate, upgrade, init as init_migrator
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from openai import OpenAI
import os, time
from sqlalchemy import extract
from datetime import date, timedelta
from typing import Literal
import requests
from bs4 import BeautifulSoup
import pandas as pd
from requests.adapters import HTTPAdapter
from requests.exceptions import RetryError
from uuid import uuid4
import logging

# ! INITS
db = SQLAlchemy()
socket = SocketIO()
encoder = Bcrypt()
migrator = Migrate()
logger = LoginManager()
limiter = Limiter( get_remote_address, default_limits=[ "200 per day", "50 per hour" ] )

# ! PLANS LIST
ACCOUNT_PLANS = { "pro": 5000, }

# * FUNCTION TO INITIALIZE LOGGING SETUP
def init_logging_setup():
    """
    Creates basic logging setup.
    """

    # CHECK FOR LOGS FILE
    os.makedirs("logs", exist_ok=True)
    logs_file_path = os.path.join(current_app.root_path, "logs", "errors.log")
    if (not os.path.exists(logs_file_path)): 
        with open(logs_file_path, 'w') as f: pass

    # SETUP LOGGING
    logging.basicConfig(
        level=logging.ERROR,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("logs/errors.log"),
            logging.StreamHandler()
        ]
    )

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
    limiter.init_app(server)

# * FUNCTION TO CREATE A CASHFREE ORDER
def initiate_cf_order():
    """
    Creates a cashfree order.
    """

    url = "https://api.cashfree.com/pg/orders"
    order_id = f"order_{uuid4()}"

    payload = {
        "order_id": order_id,
        "order_currency": "INR",
        "order_amount": 1,
        "customer_details": {
            "customer_id": f"00{current_user.id}",
            "customer_phone": current_user.phone
        },
        "order_meta": {
            "return_url": f"{os.getenv('APP_URL')}/billing/payments?order_id={order_id}"
        }
    }

    headers = {
        "x-api-version": "2025-01-01",
        "x-client-id": os.getenv("CASHFREE_ID"),
        "x-client-secret": os.getenv("CASHFREE_SEC"),
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
    except Exception as e:
        logging.error(str(e))

    return response.json().get("payment_session_id")

# * FUNCTION TO GET CASHFREE ORDER STATUS
def fetch_cf_status(order_id: str) -> dict:
    """
    Fetches a cashfree order status
    """

    url = f"https://sandbox.cashfree.com/pg/orders/{order_id}"

    headers = {
        "x-api-version": "2025-01-01",
        "x-client-id": os.getenv("CASHFREE_ID"),
        "x-client-secret": os.getenv("CASHFREE_SEC"),
        "Content-Type": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        data = response.json()
    except Exception as e:
        logging.error(str(e))


    return {
        "order_status": data.get("order_status"),
        "order_amount": data.get("order_amount"),
        "order_currency": data.get("order_currency"),
        "order_meta": data.get("order_meta")
    }

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
        # USER AUTHENTICATION
        if (not current_user.is_authenticated):
            return {
                "output": "You need to log in to get AI responses.",
                "status": 401
            }

        # RATE LIMITING
        if (current_user.last_generation) and (time.time() - current_user.last_generation < 5):
            logging.warning(f"Got frequent request from user {current_user.id}")
            return {
                "output": "Too many requests, try again after 10 seconds.",
                "status": 429
            }
        
        current_user.last_generation = time.time()
        db.session.commit()

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

    except Exception as e:
        logging.error(str(e))
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
        logging.error(str(e))
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