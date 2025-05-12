from pdfminer.high_level import extract_text as extract_pdf_text
from docx import Document as DocxDocument
from io import BytesIO
import re

def parse_pdf(file_content: bytes) -> str:
  """Extract text from PDF file"""
  try:
    text = extract_pdf_text(BytesIO(file_content))
    # Nettoyage basique du texte
    text = re.sub(r'\s+', ' ', text).strip()
    return text
  except Exception as e:
    raise ValueError(f"PDF parsing failed: {str(e)}")

def parse_docx(file_content: bytes) -> str:
  """Extract text from DOCX file"""
  try:
    doc = DocxDocument(BytesIO(file_content))
    full_text = []
    for para in doc.paragraphs:
      full_text.append(para.text)
    text = '\n'.join(full_text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text
  except Exception as e:
    raise ValueError(f"DOCX parsing failed: {str(e)}")

def parse_txt(file_content: bytes) -> str:
  """Extract text from plain text file"""
  try:
    text = file_content.decode('utf-8')
    text = re.sub(r'\s+', ' ', text).strip()
    return text
  except Exception as e:
    raise ValueError(f"Text file parsing failed: {str(e)}")