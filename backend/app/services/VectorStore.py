import faiss
import numpy as np

class VectorStoreService:
  def __init__(self):
    self.index = faiss.IndexFlatL2(768)  # Dimension des embeddings
    self.documents = []
  
  def add_documents(self, chunks, embeddings):
    self.index.add(np.array(embeddings))
    start_id = len(self.documents)
    self.documents.extend(chunks)
    return start_id
  
  def search(self, query_embedding, k=5):
    distances, indices = self.index.search(np.array([query_embedding]), k)
    return [self.documents[i] for i in indices[0]]