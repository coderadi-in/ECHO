"""
Socket event listener management file for the Project.

Manages all socket listeners.
"""

# ? IMPORTS
from plugins import *
from models import Caption, Headline
from ai import SystemPrompts, TokenSize


# & CAPTION GENERATION
@socket.on("captions-sys")
def generate_captions(product: dict) -> str:
    # ACCESS DATA
    title = product["title"]
    desc = product["desc"]
    price = product["price"]

    # DATA VALIDATION
    if (not title) or (not desc) or (not price):
        socket.emit("captions-cl", "The inputs aren't filled properly.")
        return

    # RESPONSE GENERATION
    response = get_response(
        system_prompt=SystemPrompts.CAPTION_GENERATION,
        message=f"""Title: {title}, Price: {price}, Desc: {desc}""",
        token_size=TokenSize.CAPTION_GENERATION
    )

    # EMIT OUTPUT
    socket.emit("captions-cl", response)

    # SAVE OUTPUT IN DB
    new_caption = Caption(
        user=current_user.id,
        title=title,
        desc=desc,
        price=float(price),
        caption=response,
    )

    db.session.add(new_caption)
    db.session.commit()


# & HEADLINE GENERATION
@socket.on("headlines-sys")
def generate_headlines(product: dict) -> str:
    # ACCESS DATA
    title = product["title"]
    desc = product["desc"]
    price = product["price"]

    # DATA VALIDATION
    if (not title) or (not desc) or (not price):
        socket.emit("headlines-cl", {"headline": "Input Error", "desc": "The inputs aren't filled properly."})
        return

    # RESPONSE GENERATION
    response = get_response(
        system_prompt=SystemPrompts.HEADLINE_GENERATION,
        message=f"""Title: {title}, Price: {price}, Desc: {desc}""",
        token_size=TokenSize.HEADLINE_GENERATION
    )

    output_headline, output_desc = response.split("::", 1)

    # EMIT OUTPUT
    socket.emit("headlines-cl", {"headline": output_headline, "desc": output_desc})

    # SAVE OUTPUT IN DB
    new_headline = Headline(
        user=current_user.id,
        title=title,
        desc=desc,
        price=float(price),
        gen_headline=output_headline,
        gen_desc=output_desc
    )

    db.session.add(new_headline)
    db.session.commit()

# & NORMAL CHAT
@socket.on("response-sys")
def generate_response(data: str) -> str:
    # DATA VALIDATION
    if (not data) or (data.strip() == ""):
        return
    
    tone = current_user.ai_tone or "Mentor"
    lang = current_user.ai_lang or "English"
    creativity = current_user.ai_creativity or 0
    
    # RESPONSE GENERATION
    response = get_response(
        system_prompt=SystemPrompts.RESPONSE_GENERATION,
        message=data,
        personality_prompt=f"Talk like a {tone} in {lang}, and use {creativity * 10}% of your creativity, 0% means you can set creativity according to user's request.",
        token_size=TokenSize.RESPONSE_GENERATION
    )

    # EMIT OUTPUT
    socket.emit("response-cl", { 'response': response })