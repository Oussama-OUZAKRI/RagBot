import os
from pdfminer.high_level import extract_text as extract_pdf_text
from pdfminer.layout import LAParams
from docx import Document as DocxDocument
from io import BytesIO
import re
import chardet
from typing import Dict, List, Any, Optional

from app.utils.text_processing import create_semantic_chunks

def parse_pdf(file_content: bytes, extract_metadata: bool = True) -> Dict[str, Any]:
  """
  Extraction améliorée de texte depuis un fichier PDF
  
  Args:
    file_content: Contenu binaire du fichier PDF
    extract_metadata: Extraire les métadonnées du document
      
  Returns:
    Dict contenant le texte structuré et les métadonnées
  """
  try:
    # Paramètres améliorés pour l'extraction
    laparams = LAParams(
      line_margin=0.5,  # Meilleure détection des lignes
      word_margin=0.1,  # Espacement des mots optimisé
      char_margin=2.0,  # Meilleure détection des caractères
      all_texts=True    # Récupérer tout le texte
    )
    
    # Extraction avec gestion de la mise en page
    text = extract_pdf_text(
      BytesIO(file_content),
      laparams=laparams,
      detect_vertical=True  # Détecte le texte en orientation verticale
    )
    
    # Prétraitement avancé
    # Conserver les sauts de paragraphes significatifs
    text = re.sub(r'\n\s*\n', '[PARA]', text)  # Marquer les paragraphes
    text = re.sub(r'\s+', ' ', text)           # Normaliser les espaces
    text = text.replace('[PARA]', '\n\n')      # Restaurer les paragraphes
    
    # Détecter et préserver les titres potentiels 
    # (texte court suivi d'un saut de ligne)
    text = re.sub(r'([A-Z][^.!?]{0,60})\n\n', r'[TITLE]\1[/TITLE]\n\n', text)
    
    result = {
      "text": text.strip(),
      "structured_text": structure_text(text),
      "chunks": create_semantic_chunks(text),
      "file_type": "pdf"
    }
    
    # Extraction des métadonnées si demandé
    if extract_metadata:
      # Note: Dans un système réel, vous utiliseriez PyPDF2 ou PyMuPDF 
      # pour extraire les métadonnées
      result["metadata"] = {
          "estimated_page_count": len(re.findall(r'\f', text)) + 1
      }
        
    return result
      
  except Exception as e:
    raise ValueError(f"PDF parsing failed: {str(e)}")

def parse_docx(file_content: bytes, extract_metadata: bool = True) -> Dict[str, Any]:
  """
  Extraction améliorée de texte depuis un fichier DOCX
  
  Args:
    file_content: Contenu binaire du fichier DOCX
    extract_metadata: Extraire les métadonnées du document
      
  Returns:
    Dict contenant le texte structuré et les métadonnées
  """
  try:
    doc = DocxDocument(BytesIO(file_content))
    
    # Extraction du texte avec conservation de la structure
    sections = []
    current_section = []
    current_heading_level = 0
    
    # Extraire paragraphes avec style et formatage
    structured_content = []
    
    for para in doc.paragraphs:
      text = para.text.strip()
      if not text:
        continue
          
      # Détecter les titres par leur style
      style_name = para.style.name.lower() if para.style else ""
      is_heading = "heading" in style_name or "titre" in style_name
      heading_level = 0
      
      if is_heading:
        # Extraire le niveau du titre (Heading 1, Heading 2, etc.)
        heading_match = re.search(r'\d+', style_name)
        if heading_match:
          heading_level = int(heading_match.group(0))
        else:
          heading_level = 1  # Par défaut
        
        structured_content.append({
          "type": "heading",
          "level": heading_level,
          "text": text
        })
        
        # Gestion des sections
        if heading_level <= current_heading_level or current_heading_level == 0:
          if current_section:
            sections.append(current_section)
          current_section = [text]
        else:
          current_section.append(text)
        current_heading_level = heading_level
      else:
        structured_content.append({
          "type": "paragraph",
          "text": text
        })
        if current_section:
          current_section.append(text)
    
    # Ajouter la dernière section
    if current_section:
      sections.append(current_section)
        
    # Texte complet reconstruit
    full_text = "\n\n".join([p["text"] for p in structured_content])

    result = {
      "text": full_text,
      "structured_content": structured_content,
      "sections": sections,
      "chunks": create_semantic_chunks(full_text),
      "file_type": "docx"
    }
    
    # Extraction des métadonnées si demandé
    if extract_metadata:
      core_props = doc.core_properties
      result["metadata"] = {
        "title": core_props.title if hasattr(core_props, 'title') else None,
        "author": core_props.author if hasattr(core_props, 'author') else None,
        "created": core_props.created if hasattr(core_props, 'created') else None,
        "modified": core_props.modified if hasattr(core_props, 'modified') else None,
      }
        
    return result
      
  except Exception as e:
    raise ValueError(f"DOCX parsing failed: {str(e)}")

def parse_txt(file_content: bytes) -> Dict[str, Any]:
  """
  Extraction robuste de texte depuis un fichier texte
  
  Args:
      file_content: Contenu binaire du fichier texte
      filename: Nom du fichier pour contexte
      
  Returns:
      Dict contenant le texte et les informations structurées
  """
  try:
    # Détection automatique de l'encodage
    detected = chardet.detect(file_content)
    encoding = detected['encoding'] if detected['confidence'] > 0.7 else 'utf-8'
    
    try:
      text = file_content.decode(encoding)
    except UnicodeDecodeError:
      # Fallback sur encodages courants
      encodings_to_try = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
      for enc in encodings_to_try:
        try:
          text = file_content.decode(enc)
          break
        except UnicodeDecodeError:
          continue
      else:
        # Si tous les encodages échouent
        text = file_content.decode('utf-8', errors='replace')
    
    # Prétraitement amélioré
    # Détecter les paragraphes
    text = re.sub(r'\r\n', '\n', text)  # Normaliser les sauts de ligne
    
    # Préserver structure potentielle (lignes commençant par des chiffres ou symboles)
    # pouvant indiquer des listes ou sections numérotées
    text = re.sub(r'\n(\d+[\.\)]) ', r'\n[LIST]\1 ', text)
    text = re.sub(r'\n([•\-\*]) ', r'\n[BULLET]\1 ', text)
    
    # Identifier les titres potentiels (lignes courtes suivies de lignes vides)
    text = re.sub(r'\n([A-Z][^\n]{0,50})\n\n', r'\n[TITLE]\1[/TITLE]\n\n', text)
    
    # Reconstruire structure
    structured_text = structure_text(text)
    
    result = {
      "text": text.strip(),
      "structured_text": structured_text,
      "chunks": create_semantic_chunks(text),
      "file_type": "txt",
    }
        
    return result
      
  except Exception as e:
    raise ValueError(f"Text file parsing failed: {str(e)}")

def structure_text(text: str) -> List[Dict[str, Any]]:
  """
  Analyse le texte pour détecter sa structure
  
  Args:
    text: Texte à analyser
      
  Returns:
    Liste d'éléments structurés (paragraphes, titres, listes)
  """
  # Diviser en paragraphes
  paragraphs = re.split(r'\n\s*\n', text)
  
  structured_elements = []
  
  for para in paragraphs:
    if not para.strip():
      continue
        
    # Détection des titres
    title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', para)
    if title_match:
      structured_elements.append({
        "type": "heading",
        "text": title_match.group(1).strip(),
        "level": 1  # Niveau par défaut
      })
      continue
        
    # Détection des listes
    if "[LIST]" in para or "[BULLET]" in para:
      items = []
      lines = para.split('\n')
      for line in lines:
        if "[LIST]" in line:
          item_text = line.replace("[LIST]", "").strip()
          items.append({"type": "numbered", "text": item_text})
        elif "[BULLET]" in line:
          item_text = line.replace("[BULLET]", "").strip()
          items.append({"type": "bullet", "text": item_text})
        else:
          items.append({"type": "text", "text": line.strip()})
              
      structured_elements.append({
        "type": "list",
        "items": items
      })
      continue
        
    # Paragraphe standard
    structured_elements.append({
      "type": "paragraph",
      "text": para.strip()
    })
      
  return structured_elements