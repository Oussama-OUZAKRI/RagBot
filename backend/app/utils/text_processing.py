
from typing import Dict, List, Any
import nltk
import re

# Télécharger les ressources NLTK nécessaires (à exécuter une fois)
nltk.download('punkt')
nltk.download('stopwords')

def create_semantic_chunks(text: str, max_chunk_size: int = 1000, overlap: int = 100) -> List[Dict[str, Any]]:
  """
  Crée des chunks sémantiques optimisés pour RAG
  
  Args:
    text: Texte à découper en chunks
    max_chunk_size: Taille maximale d'un chunk en caractères
    overlap: Nombre de caractères de chevauchement entre chunks
      
  Returns:
    Liste de chunks avec métadonnées
  """
  # Utiliser NLTK pour une segmentation plus précise
  try:
    sentences = nltk.sent_tokenize(text)
  except:
    # Fallback simple si NLTK n'est pas disponible
    sentences = re.split(r'(?<=[.!?])\s+', text)
  
  chunks = []
  current_chunk = ""
  current_sentences = []
  
  for sentence in sentences:
    if len(current_chunk) + len(sentence) <= max_chunk_size or not current_chunk:
      current_chunk += " " + sentence if current_chunk else sentence
      current_sentences.append(sentence)
    else:
      # Finaliser le chunk courant
      chunks.append(current_chunk.strip())
      
      # Commencer un nouveau chunk avec chevauchement
      overlap_text = ""
      overlap_sentences = []
      
      # Ajouter des phrases précédentes jusqu'à atteindre le chevauchement souhaité
      for prev_sentence in reversed(current_sentences):
        if len(overlap_text) + len(prev_sentence) <= overlap:
          overlap_text = prev_sentence + " " + overlap_text
          overlap_sentences.insert(0, prev_sentence)
        else:
          break
      
      current_chunk = overlap_text + sentence
      current_sentences = overlap_sentences + [sentence]
  
  # Ajouter le dernier chunk s'il n'est pas vide
  if current_chunk:
    chunks.append(current_chunk.strip())
  
  return chunks
