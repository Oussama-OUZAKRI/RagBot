# backend/app/services/rag_service.py
from openai import OpenAI
from ..core.config import settings

class RAGService:
  def __init__(self):
    self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    self.vector_store = VectorStoreService()
  
  def generate_response(self, query: str, user_id: str):
    # Retrieve relevant chunks
    query_embedding = get_embeddings().encode_query(query)
    chunks = self.vector_store.search(query_embedding, k=5)
    
    # Build context
    context = "\n".join([chunk.text for chunk in chunks])
    
    # Call LLM
    response = self.client.chat.completions.create(
      model="gpt-4",
      messages=[
        {"role": "system", "content": f"Answer based on context:\n{context}"},
        {"role": "user", "content": query}
      ]
    )
    
    return {
      "answer": response.choices[0].message.content,
      "sources": [chunk.metadata for chunk in chunks]
    }