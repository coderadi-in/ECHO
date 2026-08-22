"""
Manages the SheetGenerator Class.
Generates PDFs.
"""

# ==================================================
# SETUP
# ==================================================

# ? IMPORTS
from io import BytesIO
from reportlab.pdfgen.canvas import Canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

# ==================================================
# SHEET GENERATOR LOGIC
# ==================================================

class SheetGenerator:
    def __init__(self):
        """Creates a SheetGenerator instance."""

        self.FONT_SIZE = 12
        self.PADDING = 10
        self.PAGE_W, self.PAGE_H = A4

    # * FUNCTION TO DRAW A STICKER
    def _draw_sticker(
        self, canvas: Canvas, barcode_image: BytesIO|None, lines: list[str], *,
        x: int, y: int, w: int, barcode_h: int = 40
    ):
        '''
        Draws a sticker to provided coordinates and data.
        '''

        # ADD BARCODE IMAGE
        barcode_w = w - (self.PADDING * 2)
        barcode_x = x + self.PADDING
        barcode_y = self.PAGE_H - (y + self.PADDING + barcode_h)

        if (barcode_image):
            image_buffer = ImageReader(barcode_image)
            canvas.drawImage(
                image_buffer, barcode_x, barcode_y,
                barcode_w, barcode_h
            )

        # ADD TEXT
        text_y = barcode_y - (self.FONT_SIZE + 3)
        text_x = x + self.PADDING
        for line in lines:
            canvas.drawString(text_x, text_y, line)
            text_y -= (self.FONT_SIZE + 3)

    # * FUNCTION TO GENERATE THE STICKER SHEET
    def generate_sheet(
            self, barcode_image: BytesIO|None, lines: list[str],
            *, rows: int, columns: int, border: bool = False
    ):
        '''
        Generates a complete sheet of stickers
        '''

        buffer = BytesIO()
        canvas = Canvas(buffer, pagesize=A4)
        canvas.setFont("Helvetica", self.FONT_SIZE)

        # Calculation partitions of sticker
        partition_x = self.PAGE_W // columns
        partition_y = self.PAGE_H // rows

        # Draw borders
        if (border):
            for x in range(partition_x+1):
                x_cord = x * partition_x
                canvas.line(
                    x1=x_cord, y1=0,
                    x2=x_cord, y2=self.PAGE_H
                )

            for y in range(partition_y+1):
                y_cord = y * partition_y
                canvas.line(
                    x1=0, y1=y_cord,
                    x2=self.PAGE_W, y2=y_cord
                )

        # Draw stickers
        for row in range(rows):
            for col in range(columns):
                self._draw_sticker(
                    canvas, barcode_image, lines,
                    x=col*partition_x,
                    y=row*partition_y,
                    w=partition_x
                )

        # Finish and return
        canvas.showPage()
        canvas.save()
        buffer.seek(0)
        return buffer