'''
coderadi &bull; Manages all sheets functions
'''

# ? IMPORTS
from io import BytesIO
from typing import Literal

from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import inch
from reportlab.lib.pagesizes import A4

class LabelGridPDFService:
    def build_sheet(
        self, 
        label_type: Literal['fba', 'batch'],
        labels: list[dict], 
        grid: tuple[int] = (10, 4), 
        outlined: bool = True,
    ) -> BytesIO:
        """
        labels = [
            {"code": "ABC123", "lines": ["Product A", "₹99"]},
            ...
        ]
        """

        rows, cols = grid

        pdf_buffer = BytesIO()
        c = canvas.Canvas(pdf_buffer, pagesize=A4)

        page_width, page_height = A4

        cell_w = page_width / cols
        cell_h = page_height / rows

        for i, label in enumerate(labels):
            col = i % cols
            row = i // cols

            if row >= rows:
                break  # max row * col

            x = col * cell_w
            y = page_height - ((row + 1) * cell_h)

            if (label_type == "fba"):
                self.draw_fba_label(c, x, y, cell_w, cell_h, label)
            elif (label_type == "batch"):
                self.draw_batch_label(c, x, y, cell_w, cell_h, label)

        c.showPage()
        c.save()

        pdf_buffer.seek(0)
        return pdf_buffer


    def draw_fba_label(
        self,
        c: canvas.Canvas,
        x: int|float, y: int|float,
        w: int|float, h: int|float,
        label: dict, outlined: bool = True
    ):
        padding = 10        
        if (outlined): c.rect(x, y, w, h)

        # -------------------------
        # BARCODE AT TOP
        # -------------------------
        barcode_height = 40
        barcode_img = ImageReader(label["barcode"])

        c.drawImage(
            barcode_img,
            x + padding,
            y + h - barcode_height - padding,
            width=w - 2 * padding,
            height=barcode_height,
            preserveAspectRatio=True
        )

        # -------------------------
        # TEXT BELOW BARCODE
        # -------------------------
        text_y = y + h - barcode_height - 15
        c.setFont("Helvetica", 9)

        for line in label["lines"]:
            c.drawString(x + padding, text_y, line)
            text_y -= 12

    def draw_batch_label(
        self,
        c: canvas.Canvas,
        x: int|float, y: int|float,
        w: int|float, h: int|float,
        label: dict, outlined: bool = True
    ):
        padding = 10
        if (outlined): c.rect(x, y, w, h)

        # -------------------------
        # BARCODE AT TOP
        # -------------------------
        barcode_height = 40
        barcode_img = ImageReader(label["barcode"])

        c.drawImage(
            barcode_img,
            x + padding,
            y + h - barcode_height - padding / 2,
            width=w - 2 * padding,
            height=barcode_height,
            preserveAspectRatio=True
        )

        # -------------------------
        # TEXT BELOW BARCODE
        # -------------------------
        dataset = label["lines"]
        text_y = y + h - barcode_height - 15
        c.setFont("Helvetica", 9)

        c.drawString(x + padding, text_y, dataset["id"])
        c.drawString(x + padding + 100, text_y, dataset["variant"])
        
        text_y -= 12
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + padding, text_y, dataset["price"])
        c.drawString(x + padding + 75, text_y, dataset["batch"])

        text_y -= 12
        c.setFont("Helvetica", 9)
        c.drawString(x + padding, text_y, dataset["mfd"])

        if (dataset["exp"]):
            text_y -= 12
            c.drawString(x + padding, text_y, dataset["exp"])