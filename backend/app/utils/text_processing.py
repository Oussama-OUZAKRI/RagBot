from typing import List
import re

def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> List[str]:
  """
  Découpe un texte en chunks avec un overlap configurable.
  
  Args:
    text: Texte à découper
    chunk_size: Taille maximale d'un chunk (en tokens approximatifs)
    overlap: Nombre de tokens de recouvrement entre chunks
  
  Returns:
    Liste des chunks de texte
  """
  if not text:
    return []
  
  if chunk_size <= overlap:
    raise ValueError("chunk_size must be greater than overlap")
  
  # Séparation par phrases pour éviter de couper au milieu
  sentences = re.split(r'(?<=[.!?])\s+', text)
  
  chunks = []
  current_chunk = []
  current_length = 0
  
  for sentence in sentences:
    sentence_length = len(sentence.split())
    
    if current_length + sentence_length > chunk_size and current_chunk:
      # Ajouter le chunk actuel
      chunk_text = ' '.join(current_chunk)
      chunks.append(chunk_text)
      
      # Préparer le prochain chunk avec overlap
      if overlap > 0:
        overlap_start = max(0, len(current_chunk) - overlap)
        current_chunk = current_chunk[overlap_start:]
        current_length = sum(len(word.split()) for word in current_chunk)
      else:
        current_chunk = []
        current_length = 0
    
    current_chunk.append(sentence)
    current_length += sentence_length
  
  # Ajouter le dernier chunk s'il n'est pas vide
  if current_chunk:
    chunks.append(' '.join(current_chunk))
  
  return chunks