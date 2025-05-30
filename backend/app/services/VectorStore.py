import chromadb
import uuid
from typing import List, Dict, Any, Optional
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ChromaVectorStoreService:
  """
  Service de stockage de vecteurs optimisé pour RAG utilisant ChromaDB
  """
  
  def __init__(
    self,
    collection_name: str = "rag_collection",
    persist_directory: Optional[str] = "./chroma_db",
    embedding_dimension: int = 768,
    distance_func: str = "cosine"
  ):
    """
    Initialise le service de stockage vectoriel avec ChromaDB
    
    Args:
      collection_name: Nom de la collection ChromaDB
      persist_directory: Répertoire où persister la base de données (None pour mémoire uniquement)
      embedding_dimension: Dimension des embeddings (768 par défaut pour la plupart des modèles)
      distance_func: Fonction de distance à utiliser ("cosine", "l2", ou "ip")
    """
    self.embedding_dimension = embedding_dimension
    self.distance_func = distance_func
    self.persist_directory = persist_directory
    self.collection_name = collection_name

    # Métadonnées supplémentaires pour le suivi et les statistiques
    self.stats = {
      "document_count": 0,
      "chunk_count": 0,
      "collections": {}
    }
    
    # Initialisation de ChromaDB
    self._initialize_chroma_client()
    
      
  def _initialize_chroma_client(self):
    """Initialise le client et la collection ChromaDB"""
    try:
      # Créer le client ChromaDB - Using the new client initialization approach
      if self.persist_directory:
        logger.info(f"Initializing persistent ChromaDB at {self.persist_directory}")
        self.client = chromadb.PersistentClient(path=self.persist_directory)
      else:
        logger.info("Initializing in-memory ChromaDB")
        self.client = chromadb.Client()
      
      # Vérifier si la collection existe déjà
      collection_exists = False
      try:
        # Check if the collection exists
        collections = self.client.list_collections()
        collection_exists = any(collection.name == self.collection_name for collection in collections)
      except Exception as e:
        logger.warning(f"Failed to check existing collections: {str(e)}")
          
      # Créer ou récupérer la collection
      if collection_exists:
        # Si la collection existe, la récupérer
        self.collection = self.client.get_collection(
          name=self.collection_name
        )
        logger.info(f"Retrieved existing collection '{self.collection_name}'")
      else:
        # Si la collection n'existe pas, la créer
        self.collection = self.client.create_collection(
          name=self.collection_name,
          embedding_function=None,  # Nous fournissons nos propres embeddings
          metadata={"dimension": self.embedding_dimension, "distance_func": self.distance_func}
        )
        logger.info(f"Created new collection '{self.collection_name}'")
              
      # Mettre à jour les statistiques
      self.stats["document_count"] = self.collection.count()
      self.stats["chunk_count"] = self.collection.count()
              
      # Initialiser les statistiques de la collection
      self.stats["collections"][self.collection_name] = {
        "count": self.collection.count(),
        "metadata": self.collection.metadata
      }
            
    except Exception as e:
      logger.error(f"Failed to initialize ChromaDB: {str(e)}")
      raise RuntimeError(f"ChromaDB initialization failed: {str(e)}")
  
  def add_documents(
    self, 
    chunks: List[Dict[str, Any]], 
    embeddings: List[List[float]], 
    document_id: Optional[str] = None,
    document_metadata: Optional[Dict[str, Any]] = None
  ) -> List[str]:
    """
    Ajoute des documents (chunks) avec leurs embeddings à la base de données vectorielle
    
    Args:
      chunks: Liste de dictionnaires contenant le texte et les métadonnées des chunks
      embeddings: Liste des vecteurs d'embedding correspondants
      document_id: ID du document parent (généré automatiquement si non fourni)
      document_metadata: Métadonnées du document parent
        
    Returns:
      Liste des IDs des chunks ajoutés
    """
    if not chunks or not embeddings:
      logger.warning("No chunks or embeddings provided to add_documents")
      return []
        
    if len(chunks) != len(embeddings):
      raise ValueError(f"Number of chunks ({len(chunks)}) must match number of embeddings ({len(embeddings)})")
    
    # Générer un ID de document si non fourni
    doc_id = document_id or f"doc_{uuid.uuid4().hex}"
    
    # Préparer les données pour ChromaDB
    ids = []
    documents = []
    metadatas = []
    
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
      # Générer un ID unique pour le chunk
      chunk_id = f"{doc_id}_chunk_{i}"
      ids.append(chunk_id)
      
      # Extraire le texte du chunk
      if isinstance(chunk, dict) and "text" in chunk:
        chunk_text = chunk["text"]
      elif isinstance(chunk, str):
        chunk_text = chunk
      else:
        chunk_text = str(chunk)
      
      documents.append(chunk_text)
      
      # Préparer les métadonnées enrichies
      chunk_metadata = {}
      
      # Ajouter les métadonnées du document parent
      if document_metadata:
        for key, value in document_metadata.items():
          chunk_metadata[f"doc_{key}"] = value
      
      # Ajouter l'ID du document parent
      chunk_metadata["document_id"] = doc_id
      chunk_metadata["chunk_index"] = i
      
      # Ajouter les métadonnées spécifiques au chunk si disponibles
      if isinstance(chunk, dict):
        for key, value in chunk.items():
          if key != "text" and isinstance(value, (str, int, float, bool)):
            chunk_metadata[key] = value
      
      metadatas.append(chunk_metadata)
    
    try:
      # Ajouter les données à ChromaDB
      self.collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas
      )
      
      # Mettre à jour les statistiques
      self.stats["document_count"] += 1
      self.stats["chunk_count"] += len(chunks)
      self.stats["collections"][self.collection_name]["count"] = self.collection.count()
      
      logger.info(f"Added {len(chunks)} chunks from document {doc_id} to ChromaDB")
      return ids
        
    except Exception as e:
      logger.error(f"Failed to add documents to ChromaDB: {str(e)}")
      raise RuntimeError(f"Adding documents to ChromaDB failed: {str(e)}")
  
  def search(
    self, 
    query_embedding: List[float], 
    k: int = 5,
    filter_criteria: Optional[Dict[str, Any]] = None,
    include_embeddings: bool = False,
    include_distances: bool = True
  ) -> List[Dict[str, Any]]:
    """
    Recherche les chunks les plus similaires à un embedding de requête
    
    Args:
      query_embedding: Vecteur d'embedding de la requête
      k: Nombre de résultats à retourner
      filter_criteria: Critères de filtrage des résultats (par métadonnées)
      include_embeddings: Inclure les embeddings dans les résultats
      include_distances: Inclure les scores de distance dans les résultats
        
    Returns:
      Liste des chunks les plus similaires avec leurs métadonnées
    """
    try:
      # Effectuer la recherche avec ChromaDB
      results = self.collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        where=filter_criteria,  # Filtrage par métadonnées
        include=["documents", "metadatas", "distances", "embeddings"] if include_embeddings else ["documents", "metadatas", "distances"]
      )
      
      # Formater les résultats pour une utilisation plus facile
      formatted_results = []
      
      if not results or not results["ids"] or not results["ids"][0]:
        logger.warning("No results found for query")
        return []
          
      for i in range(len(results["ids"][0])):
        result = {
          "id": results["ids"][0][i],
          "text": results["documents"][0][i],
          "metadata": results["metadatas"][0][i] if results["metadatas"] else {}
        }
        
        if include_distances and "distances" in results:
          result["distance"] = results["distances"][0][i]
            
        if include_embeddings and "embeddings" in results:
          result["embedding"] = results["embeddings"][0][i]
            
        formatted_results.append(result)
          
      logger.info(f"Found {len(formatted_results)} results for query")
      return formatted_results
        
    except Exception as e:
      logger.error(f"Search failed: {str(e)}")
      return []
  
  def delete_document(self, document_id: str) -> bool:
    """
    Supprime un document et tous ses chunks
    
    Args:
      document_id: ID du document à supprimer
        
    Returns:
      Succès de l'opération
    """
    try:
      # Supprimer tous les chunks associés au document
      self.collection.delete(
        where={"document_id": document_id}
      )
      logger.info(f"Deleted document {document_id} from ChromaDB")
      
      # Mettre à jour les statistiques
      self.stats["document_count"] = max(0, self.stats["document_count"] - 1)
      self.stats["collections"][self.collection_name]["count"] = self.collection.count()
      
      return True
    except Exception as e:
      logger.error(f"Failed to delete document {document_id}: {str(e)}")
      return False
  
  def update_document(
    self, 
    document_id: str,
    chunks: List[Dict[str, Any]], 
    embeddings: List[List[float]],
    document_metadata: Optional[Dict[str, Any]] = None
  ) -> List[str]:
    """
    Met à jour un document existant (supprimer puis réinsérer)
    
    Args:
      document_id: ID du document à mettre à jour
      chunks: Nouveaux chunks
      embeddings: Nouveaux embeddings
      document_metadata: Nouvelles métadonnées
        
    Returns:
      Liste des IDs des nouveaux chunks
    """
    # Supprimer l'ancien document
    self.delete_document(document_id)
    
    # Ajouter le nouveau document
    return self.add_documents(
      chunks=chunks,
      embeddings=embeddings,
      document_id=document_id,
      document_metadata=document_metadata
    )
  
  def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
    """
    Récupère tous les chunks d'un document
    
    Args:
        document_id: ID du document
        
    Returns:
        Liste des chunks du document
    """
    try:
      results = self.collection.get(
        where={"document_id": document_id},
        include=["documents", "metadatas", "embeddings"]
      )
      
      if not results or not results["ids"]:
        logger.warning(f"No chunks found for document {document_id}")
        return []
          
      formatted_results = []
      for i in range(len(results["ids"])):
        result = {
          "id": results["ids"][i],
          "text": results["documents"][i],
          "metadata": results["metadatas"][i] if results["metadatas"] else {}
        }
        
        if "embeddings" in results:
          result["embedding"] = results["embeddings"][i]
            
        formatted_results.append(result)
          
      return formatted_results
        
    except Exception as e:
      logger.error(f"Failed to get chunks for document {document_id}: {str(e)}")
      return []
  
  def filter_search(
    self, 
    query_embedding: List[float],
    filters: Dict[str, Any],
    k: int = 5
  ) -> List[Dict[str, Any]]:
    """
    Recherche avec filtrage avancé sur les métadonnées
    
    Args:
      query_embedding: Vecteur d'embedding de la requête
      filters: Critères de filtrage des résultats
      k: Nombre de résultats à retourner
        
    Returns:
        Liste des chunks correspondants
    """
    return self.search(
      query_embedding=query_embedding,
      k=k,
      filter_criteria=filters
    )
  
  def get_stats(self) -> Dict[str, Any]:
    """
    Récupère les statistiques du service
    
    Returns:
      Statistiques du service
    """
    # Mettre à jour les statistiques avant de les retourner
    try:
      self.stats["collections"][self.collection_name]["count"] = self.collection.count()
      self.stats["chunk_count"] = self.collection.count()
    except Exception:
      pass
        
    return self.stats
  
  def persist(self) -> bool:
    """
    Force la persistance de la base de données
    
    Returns:
      Succès de l'opération
    """
    try:
      if self.persist_directory:
        self.client.persist()
        logger.info(f"ChromaDB persisted to {self.persist_directory}")
        return True
      return False
    except Exception as e:
      logger.error(f"Failed to persist ChromaDB: {str(e)}")
      return False
  
  def create_collection(
    self,
    name: str,
    metadata: Optional[Dict[str, Any]] = None
  ) -> bool:
    """
    Crée une nouvelle collection
    
    Args:
      name: Nom de la collection
      metadata: Métadonnées de la collection
        
    Returns:
      Succès de l'opération
    """
    try:
      collection_metadata = metadata or {"dimension": self.embedding_dimension}
      
      # Créer la collection
      self.client.create_collection(
        name=name,
        embedding_function=None,
        metadata=collection_metadata
      )
      
      # Mettre à jour les statistiques
      self.stats["collections"][name] = {
        "count": 0,
        "metadata": collection_metadata
      }
      
      logger.info(f"Created new collection '{name}'")
      return True
    except Exception as e:
      logger.error(f"Failed to create collection '{name}': {str(e)}")
      return False
  
  def use_collection(self, name: str) -> bool:
    """
    Change la collection active
    
    Args:
      name: Nom de la collection
        
    Returns:
      Succès de l'opération
    """
    try:
      self.collection = self.client.get_collection(name=name)
      self.collection_name = name
      
      # Mettre à jour les statistiques
      if name not in self.stats["collections"]:
        self.stats["collections"][name] = {
          "count": self.collection.count(),
          "metadata": self.collection.metadata
        }
          
      logger.info(f"Switched to collection '{name}'")
      return True
    except Exception as e:
      logger.error(f"Failed to switch to collection '{name}': {str(e)}")
      return False
  
  def list_collections(self) -> List[str]:
    """
    Liste toutes les collections disponibles
    
    Returns:
      Liste des noms de collections
    """
    try:
      collections = self.client.list_collections()
      return [collection.name for collection in collections]
    except Exception as e:
      logger.error(f"Failed to list collections: {str(e)}")
      return []
