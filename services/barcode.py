# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from io import BytesIO
import barcode
from barcode.writer import ImageWriter

# ==================================================
# FUNCTIONS
# ==================================================

# * FUNCTION TO GENERATE BARCODE
def generate_barcode(code: str, with_label: bool = True) -> BytesIO:
    '''
    Generates barcode image in memory

    :param code: The code to encode in barcode.
    :rtype: io.BytesIo
    '''

    buffer = BytesIO()

    barcode_class = barcode.get_barcode_class("code128")
    barcode_class.default_writer_options['write_text'] = with_label
    generated_barcode = barcode_class(code, writer=ImageWriter())

    generated_barcode.write(buffer)
    buffer.seek(0)

    return buffer