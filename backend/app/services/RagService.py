import logging
from typing import Any, Dict, List, Optional
from app.services.VectorStore import ChromaVectorStoreService

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RAGService:
  """
  Service RAG complet combinant extraction, stockage et recherche
  """
  
  def __init__(
    self,
    vector_store: Optional[ChromaVectorStoreService] = None,
    embedding_dimension: int = 768,
    persist_directory: str = "./chroma_rag_db"
  ):
    """
    Initialise le service RAG
    
    Args:
        vector_store: Service de stockage vectoriel (créé si non fourni)
        embedding_dimension: Dimension des embeddings
        persist_directory: Répertoire de persistance
    """
    # Initialiser le stockage vectoriel
    self.vector_store = vector_store or ChromaVectorStoreService(
      persist_directory=persist_directory,
      embedding_dimension=embedding_dimension
    )
    
    self.embedding_dimension = embedding_dimension
    
    # Statistiques
    self.processed_documents = 0
    self.processed_chunks = 0
      
  def process_document(
    self,
    parsed_document: Dict[str, Any],
    embeddings: List[List[float]],
    document_id: Optional[str] = None
  ) -> str:
    """
    Traite un document pour l'indexation RAG
    
    Args:
      parsed_document: Document analysé (depuis les fonctions d'extraction)
      embeddings: Embeddings des chunks du document
      document_id: ID optionnel du document
        
    Returns:
      ID du document indexé
    """
    # Extraire les chunks du document
    chunks = parsed_document.get("chunks", [])
    
    if not chunks:
      logger.warning("No chunks found in document")
      # Créer un chunk simple si nécessaire
      chunks = [{"text": parsed_document.get("text", ""), "index": 0}]
    
    # Vérifier que nous avons le bon nombre d'embeddings
    if len(chunks) != len(embeddings):
      raise ValueError(f"Number of chunks ({len(chunks)}) must match number of embeddings ({len(embeddings)})")
    
    # Extraire les métadonnées du document
    metadata = parsed_document.get("metadata", {})
    metadata["file_type"] = parsed_document.get("file_type", "unknown")
    
    # Ajouter le document au stockage vectoriel
    chunk_ids = self.vector_store.add_documents(
      chunks=chunks,
      embeddings=embeddings,
      document_id=document_id,
      document_metadata=metadata
    )
    
    # Mettre à jour les statistiques
    self.processed_documents += 1
    self.processed_chunks += len(chunks)
    
    # Retourner l'ID du document (extrait du premier chunk ID)
    if chunk_ids:
      doc_id = chunk_ids[0].split("_chunk_")[0]
      return doc_id
    
    return document_id or "unknown_doc"
  
  def query(
    self,
    query_embedding: List[float],
    k: int = 5,
    filters: Optional[Dict[str, Any]] = None
  ) -> List[Dict[str, Any]]:
    """
    Interroge le système RAG
    
    Args:
      query_embedding: Embedding de la requête
      k: Nombre de résultats à retourner
      filters: Filtres à appliquer à la recherche
        
    Returns:
      Contextes pertinents pour la requête
    """
    # Effectuer la recherche
    results = self.vector_store.search(
      query_embedding=query_embedding,
      k=k,
      filter_criteria=filters
    )
    
    # Enrichir les résultats avec des informations utiles pour le RAG
    for result in results:
      # Ajouter l'ID du document si non présent
      if "document_id" not in result["metadata"]:
        doc_id = result["id"].split("_chunk_")[0]
        result["metadata"]["document_id"] = doc_id
    
    return results

  def get_statistics(self) -> Dict[str, Any]:
    """
    Récupère les statistiques du service RAG
    
    Returns:
      Statistiques du service
    """
    vector_store_stats = self.vector_store.get_stats()
    
    return {
      "processed_documents": self.processed_documents,
      "processed_chunks": self.processed_chunks,
      "vector_store": vector_store_stats
    }
  
  def remove_document(self, document_id: str) -> bool:
    """
    Supprime un document du système RAG
    
    Args:
      document_id: ID du document à supprimer
        
    Returns:
      Succès de l'opération
    """
    return self.vector_store.delete_document(document_id)
  
  def update_document(
    self,
    document_id: str,
    parsed_document: Dict[str, Any],
    embeddings: List[List[float]]
  ) -> str:
    """
    Met à jour un document existant
    
    Args:
      document_id: ID du document à mettre à jour
      parsed_document: Nouveau document analysé
      embeddings: Nouveaux embeddings
        
    Returns:
      ID du document mis à jour
    """
    # Extraire les chunks et métadonnées
    chunks = parsed_document.get("chunks", [])
    metadata = parsed_document.get("metadata", {})
    metadata["file_type"] = parsed_document.get("file_type", "unknown")
    
    # Mettre à jour le document
    self.vector_store.update_document(
      document_id=document_id,
      chunks=chunks,
      embeddings=embeddings,
      document_metadata=metadata
    )
    
    return document_id
  
  def persist(self) -> bool:
    """
    Persiste les données du système RAG
    
    Returns:
      Succès de l'opération
    """
    return self.vector_store.persist()

rag_service = RAGService(persist_directory="./chroma_test_db")
