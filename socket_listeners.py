"""
Socket event listener management file for the Project.

Manages all socket listeners.
"""

# ? IMPORTS
from plugins import *
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
