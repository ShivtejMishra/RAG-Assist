import fitz  # PyMuPDF
import docx
import csv
import io
import structlog
from typing import List, Dict, Any

logger = structlog.get_logger()

class DocumentParser:
    @staticmethod
    def parse_pdf(file_content: bytes) -> List[Dict[str, Any]]:
        """Parses a PDF byte stream and returns a list of pages with text."""
        pages = []
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text = page.get_text()
                if text.strip():
                    pages.append({
                        "text": text,
                        "page_number": page_num + 1
                    })
            doc.close()
        except Exception as e:
            logger.error("pdf_parsing_error", error=str(e))
            raise ValueError(f"Failed to parse PDF: {str(e)}")
        return pages

    @staticmethod
    def parse_docx(file_content: bytes) -> List[Dict[str, Any]]:
        """Parses a DOCX byte stream."""
        pages = []
        try:
            doc = docx.Document(io.BytesIO(file_content))
            # DOCX doesn't have native strict page numbers, so we chunk by paragraphs/sections
            # We treat every 4-5 paragraphs as a "logical page" for citation simplicity
            current_text = []
            logical_page = 1
            for para in doc.paragraphs:
                if para.text.strip():
                    current_text.append(para.text)
                if len(current_text) >= 10:  # ~10 paragraphs per page
                    pages.append({
                        "text": "\n".join(current_text),
                        "page_number": logical_page
                    })
                    current_text = []
                    logical_page += 1
            
            if current_text:
                pages.append({
                    "text": "\n".join(current_text),
                    "page_number": logical_page
                })
        except Exception as e:
            logger.error("docx_parsing_error", error=str(e))
            raise ValueError(f"Failed to parse DOCX: {str(e)}")
        return pages

    @staticmethod
    def parse_txt(file_content: bytes) -> List[Dict[str, Any]]:
        """Parses a raw text byte stream."""
        try:
            text = file_content.decode("utf-8", errors="ignore")
            # We chunk raw text by logical chunks or lines
            # Treat every ~2000 characters as a page for citation simplicity
            pages = []
            chunk_size = 2000
            for i in range(0, len(text), chunk_size):
                chunk = text[i:i+chunk_size]
                pages.append({
                    "text": chunk,
                    "page_number": (i // chunk_size) + 1
                })
            return pages
        except Exception as e:
            logger.error("txt_parsing_error", error=str(e))
            raise ValueError(f"Failed to parse TXT: {str(e)}")

    @staticmethod
    def parse_csv(file_content: bytes) -> List[Dict[str, Any]]:
        """Parses a CSV file and converts it to readable row formats."""
        pages = []
        try:
            text_stream = io.StringIO(file_content.decode("utf-8", errors="ignore"))
            reader = csv.reader(text_stream)
            rows = list(reader)
            
            # Group every 30 rows as a "page"
            rows_per_page = 30
            for i in range(0, len(rows), rows_per_page):
                page_rows = rows[i:i+rows_per_page]
                text_content = "\n".join([", ".join(row) for row in page_rows])
                pages.append({
                    "text": text_content,
                    "page_number": (i // rows_per_page) + 1
                })
        except Exception as e:
            logger.error("csv_parsing_error", error=str(e))
            raise ValueError(f"Failed to parse CSV: {str(e)}")
        return pages

    @classmethod
    def parse(cls, filename: str, file_content: bytes) -> List[Dict[str, Any]]:
        """Main dispatcher for document parsing."""
        ext = filename.split(".")[-1].lower()
        if ext == "pdf":
            return cls.parse_pdf(file_content)
        elif ext in ["docx", "doc"]:
            return cls.parse_docx(file_content)
        elif ext == "csv":
            return cls.parse_csv(file_content)
        elif ext in ["txt", "md", "html", "htm"]:
            return cls.parse_txt(file_content)
        else:
            # Fallback to txt parsing
            return cls.parse_txt(file_content)
