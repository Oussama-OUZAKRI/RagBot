import { FileText } from 'lucide-react';
import { useState } from 'react';

export const DocumentProcessingSettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState(settings);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h3 className="font-semibold mb-4 flex items-center">
        <FileText className="mr-2" size={18} />
        Traitement des documents
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Taille des fragments par défaut</label>
            <input 
              type="number" 
              name="chunkSize"
              value={formData.chunkSize}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Chevauchement des fragments</label>
            <input 
              type="number" 
              name="overlap"
              value={formData.overlap}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nettoyage des textes</label>
            <div className="flex items-center mt-2">
              <input 
                type="checkbox" 
                id="cleanMarkdown" 
                name="cleanMarkdown"
                checked={formData.cleanMarkdown}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="cleanMarkdown" className="text-sm">Nettoyer le Markdown</label>
            </div>
            <div className="flex items-center mt-1">
              <input 
                type="checkbox" 
                id="cleanHTML" 
                name="cleanHTML"
                checked={formData.cleanHTML}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="cleanHTML" className="text-sm">Nettoyer le HTML</label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Formats supportés</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.supportedFormats.map(format => (
                <span key={format} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {format}
                </span>
              ))}
            </div>
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