import { Cpu } from 'lucide-react';

export const LLMModelsCard = ({ models }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h3 className="font-semibold mb-4 flex items-center">
        <Cpu className="mr-2" size={18} />
        Modèles LLM
      </h3>
      
      <div className="space-y-4">
        {models?.map((model, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{model.name}</p>
              <p className="text-sm text-gray-500">{model.usage.toLocaleString()} requêtes</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              model.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {model.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}