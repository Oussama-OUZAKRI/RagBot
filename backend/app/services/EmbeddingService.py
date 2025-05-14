# backend/app/services/embedding.py
import openai
import numpy as np
from typing import List
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.EMBEDDING_MODEL

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Get embeddings for a list of text strings
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors (each vector is a list of floats)
        """
        try:
            # Clean empty strings
            texts = [text.strip() for text in texts if text.strip()]
            
            if not texts:
                return []
                
            response = self.client.embeddings.create({
                model: self.model,
                input: texts,
                encoding_format: "float"
            })
            
            # Return embeddings in order
            return [data.embedding for data in response.data]
            
        except Exception as e:
            logger.error(f"Error getting embeddings: {str(e)}")
            raise

# Singleton instance
embedding_service = EmbeddingService()

def get_embedding_service() -> EmbeddingService:
    return embedding_service
