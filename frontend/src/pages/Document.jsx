import { useState } from 'react';
import { Upload as UploadIcon, X } from 'lucide-react';
import { DocumentUpload, DocumentList } from '../components';

const DocumentsPage = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Documents</h1>
        
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
        >
          <UploadIcon className="mr-2" size={18} />
          Téléverser un document
        </button>
      </div>

      {/* Modal List */}
      <DocumentList refreshTrigger={refreshTrigger} />

      {/* Modal Upload */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Téléverser des documents</h2>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6 cursor-pointer" />
              </button>
            </div>
            <div className="p-4">
              <DocumentUpload
                onUploadSuccess={() => {
                  handleUploadSuccess();
                  setIsUploadModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;