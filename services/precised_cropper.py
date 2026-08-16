'''
coderadi &bull; Manages all cropping functions
'''

# ? IMPORTS
from pypdf import PdfReader, PdfWriter
from io import BytesIO
from reportlab.pdfgen import canvas
import re

# & SHIPPING LABEL CROPPING SERVICE
class PrecisedLabelCropper:
    # * CONSTRUCTOR
    def __init__(self, pdf_file):
        self.reader = PdfReader(pdf_file)
        self.writer = PdfWriter()
        self.output = BytesIO()

    # * RESET OUTPUT
    def _reset(self):
        self.writer = PdfWriter()
        self.output = BytesIO()

    # * FUNCTION TO CROP FLIPKART PDF
    def crop_flipkart(self):
        '''
        Crops flipkart shipping label
        '''

        self._reset()

        # CROP PAGES
        for page in self.reader.pages:
            # SETTING FIRST RATIO
            page.mediabox.upper_right = (
                page.mediabox.width * 0.7,
                page.mediabox.height - page.mediabox.height * 0.03
            )

            # SETTING SECOND RATIO
            page.mediabox.lower_left = (
                page.mediabox.width * 0.43,
                page.mediabox.height * 0.55
            )

            # ADDING UPDATED RATIO IN PDF WRITER
            self.writer.add_page(page)
        
        # WRITING NEW PDF
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output

    # * FUNCTION TO CROP SHOPSY PDF
    def crop_shopsy(self):
        '''
        Crops shopsy shipping label
                '''

        self._reset()

        # CROPPING PAGES
        for page in self.reader.pages:
            # SETTING FIRST RATIO
            page.mediabox.upper_right = (
                page.mediabox.width * 0.7,
                page.mediabox.height - page.mediabox.height * 0.03
            )

            # SETTING SECOND RATIO
            page.mediabox.lower_left = (
                page.mediabox.width * 0.43,
                page.mediabox.height * 0.55
            )

            # ADDING UPDATE RATIO IN PDF WRITER
            self.writer.add_page(page)
        
        # WRITING NEW PDF
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output

    # * FUNCTION TO CROP MEESHO PDF
    def crop_meesho(self):
        '''
        Crops meesho shipping label
        
        '''
        
        self._reset()

        # CROPPING PAGES
        for page in self.reader.pages:
            page.mediabox.lower_left = (
                0,
                page.mediabox.height - page.mediabox.height * 0.45
            )

            # ADDING UPDATE RATIO IN PDF WRITER
            self.writer.add_page(page)
        
        # WRITING NEW PDF
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output

    # * FUNCTION TO PROCESS AMAZON INVOICES
    def process_amazon(self):
        '''
        Processes amazon invoices
        
        '''

        # INITIALIZING PDF PROCESSORS
        self._reset()
        stamped_writer = PdfWriter()
        item_index = 0

        # INITIALIZE TEXT EXTRACTION PROCESSORS
        code_pattern = re.compile(r"\|\s*B0[A-Z0-9]+\s*\(\s*([^)]+?)\s*\)")
        qty_pattern = re.compile(r"₹[\d,.]+\s+(\d+)\s+₹")
        results = []

        # EXTRACT PRODUCT_CODE & QUANTITY AND TAKE OUT SHIPPING LABELS IN DIFFERENT PDF
        for (idx, page) in enumerate(self.reader.pages):
            text = page.extract_text() or ""

            if ("Tax Invoice" not in text):
                self.writer.add_page(page)
                continue

            code_match = code_pattern.search(text)
            code = code_match.group(1).strip() if (code_match) else None

            qty_match = qty_pattern.search(text)
            qty = qty_match.group(1).strip() if (qty_match) else None

            if (code) and (qty):
                results.append({
                    'idx': idx,
                    'code': code,
                    'qty': qty
                })

        # STAMPING DATA ON SHIPPING LABELS
        for page in self.writer.pages:
            # ACCESS DIMENSIONS
            width = float(page.mediabox.width)
            height = float(page.mediabox.height)
            
            # INITIALIZE STAMP TEXT
            item = results[item_index]
            stamp = f"({item['code']}) (Qty: {item['qty']})"
            
            # CREATE PAGE WITH STAMP
            packet = BytesIO()
            c = canvas.Canvas(packet, (width, height))

            # STAMP TEXT ON PDF
            c.setFont("Helvetica-Bold", 10)
            c.drawString(60.0, 150.0, stamp)
            c.save()
            packet.seek(0)

            overlay_page = PdfReader(packet).pages[0]
            page.merge_page(overlay_page)
            
            stamped_writer.add_page(page)
            item_index += 1

        stamped_writer.write(self.output)
        self.output.seek(0)
        return self.output
    
# & INVOICE CROPPING SERVICE
class PrecisedInvoiceCropper:
    # * CONSTRUCTOR
    def __init__(self, pdf_file):
        self.reader = PdfReader(pdf_file)
        self.writer = PdfWriter()
        self.output = BytesIO()

    # * RESET OUTPUT
    def _reset(self):
        self.writer = PdfWriter()
        self.output = BytesIO()

    # * FUNCTION TO CROP FLIPKART INVOICE
    def crop_flipkart(self):
        '''
        Crops flipkart invoice

        '''

        self._reset()

        # CROP PAGES
        for page in self.reader.pages:
            # SET FIRST RATIO
            page.mediabox.upper_right = (
                page.mediabox.width,
                page.mediabox.height * 0.55
            )

            # ADD UPDATED RATIO IN PDF WRITER
            self.writer.add_page(page)

        # PROCESS AND RETURN OUTPUT
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output

    # * FUNCTION TO CROP SHOPSY INVOICE
    def crop_shopsy(self):
        '''
        Crops shopsy invoice
        '''

        self._reset()

        # CROP PAGES
        for page in self.reader.pages:
            # SET FIRST RATIO
            page.mediabox.upper_right = (
                page.mediabox.width,
                page.mediabox.height * 0.55
            )

            # ADD UPDATED RATIO IN PDF WRITER
            self.writer.add_page(page)

        # PROCESS AND RETURN OUTPUT
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output

    # * FUNCTION TO CROP MEESHO INVOICE
    def crop_meesho(self):
        '''
        Crops meesho invoice
        '''
        
        self._reset()

        # CROP PAGES
        for page in self.reader.pages:
            page.mediabox.upper_right = (
                page.mediabox.width,
                page.mediabox.height - page.mediabox.height * 0.41
            )

            # ADD UPDATED RATIO IN PDF WRITER
            self.writer.add_page(page)

        # PROCESS AND RETURN OUTPUT
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output

    # * FUNCTION TO SPLIT-OUT AMAZON INVOICE
    def crop_amazon(self):
        '''
        Splits-out amazon invoice
        '''

        self._reset()

        # SPLIT-OUT INVOICES
        for page in self.reader.pages:
            text = page.extract_text() or ""

            if ("Tax Invoice" in text):
                self.writer.add_page(page)
                continue

        # PROCESS AND RETURN OUTPUT
        self.writer.write(self.output)
        self.output.seek(0)
        return self.output