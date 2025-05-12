import { Cpu } from 'lucide-react';
import { useState } from 'react';

export const LLMConfigSettings = ({ settings, onSave }) => {
  const [formData, setFormData] = useState(settings);

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
        <Cpu className="mr-2" size={18} />
        Configuration LLM
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Modèle par défaut</label>
            <select
              name="defaultModel"
              value={formData.defaultModel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option>GPT-4</option>
              <option>GPT-4 Turbo</option>
              <option>GPT-3.5 Turbo</option>
              <option>Mistral 7B</option>
              <option>LLaMA 70B</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nombre de fragments par défaut</label>
            <input 
              type="number" 
              name="defaultChunks"
              value={formData.defaultChunks}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Température par défaut</label>
            <input 
              type="number" 
              name="defaultTemperature"
              value={formData.defaultTemperature}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="1"
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Max tokens par défaut</label>
            <input 
              type="number" 
              name="maxTokens"
              value={formData.maxTokens}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
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