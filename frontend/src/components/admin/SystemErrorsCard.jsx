import { AlertTriangle } from 'lucide-react';

export const SystemErrorsCard = ({ errorCount }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h3 className="font-semibold mb-4 flex items-center">
        <AlertTriangle className="mr-2" size={18} />
        Erreurs système
      </h3>
      
      {errorCount > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-red-50 text-red-800 rounded-lg">
            <AlertTriangle size={18} className="mr-2" />
            <div>
              <p className="font-medium">Erreur de connexion à la base de données</p>
              <p className="text-sm">Il y a 3 heures - Résolue</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-yellow-50 text-yellow-800 rounded-lg">
            <AlertTriangle size={18} className="mr-2" />
            <div>
              <p className="font-medium">Temps d'attente élevé pour le modèle GPT-4</p>
              <p className="text-sm">Il y a 1 jour - Non résolue</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>Aucune erreur système récente</p>
        </div>
      )}
    </div>
  );
}