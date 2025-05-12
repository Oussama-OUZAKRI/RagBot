import { Database } from 'lucide-react';
import { useState } from 'react';

export const VectorDBSettings = ({ config, onSave }) => {
  const [formData, setFormData] = useState(config);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h3 className="font-semibold mb-4 flex items-center">
        <Database className="mr-2" size={18} />
        Base de données vectorielle
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Type de base de données</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>FAISS</option>
              <option>ChromaDB</option>
              <option>Weaviate</option>
              <option>Pinecone</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Type d'embedding</label>
            <select
              name="embedding"
              value={formData.embedding}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>OpenAI Ada 002</option>
              <option>MiniLM-L6</option>
              <option>Mistral MiniLM</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Dimensions vectorielles</label>
            <input 
              type="number" 
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Distance métrique</label>
            <select
              name="metric"
              value={formData.metric}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>Cosine</option>
              <option>L2</option>
              <option>Dot Product</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}