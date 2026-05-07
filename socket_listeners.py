"""
Socket event listener management file for the Project.

Manages all socket listeners.
"""

# ? IMPORTS
from plugins import *
from models import Caption
from ai import SystemPrompts

# & CAPTION GENERATION
@socket.on('captions-sys')
def generate_captions(product: dict) -> str:
    # ACCESS DATA
    title = product['title']
    desc = product['desc']
    price = product['price']

    # DATA VALIDATION
    if (not title) or (not desc) or (not price):
        socket.emit('captions-cl', "The inputs aren't filled properly.")
        return
    
    # RESPONSE GENERATION
    response = get_response(SystemPrompts.CAPTION_GENERATION, f"""Title: {title}, Price: {price}, Desc: {desc}""")

    # EMIT OUTPUT
    socket.emit('captions-cl', response)

    # SAVE OUTPUT IN DB
    new_caption = Caption(
        user=current_user.id,
        title=title,
        desc=desc,
        price=float(price),
        caption=response
    )
    
    db.session.add(new_caption)
    db.session.commit()