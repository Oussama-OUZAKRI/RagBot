import { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';
import { docs } from '../../services';

export const DocumentUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    visibility: 'private'
  });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 9),
      status: 'pending'
    }));
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      setFiles(prevFiles => prevFiles.map(file => ({
        ...file,
        status: 'uploading'
      })));
      
      // Ajouter les fichiers
      files.forEach(fileObj => {
        formData.append('file', fileObj.file);
      });

      // Ajouter les métadonnées communes
      formData.append('metadata', JSON.stringify({
        title: metadata.title || files[0].file.name,
        description: metadata.description,
        tags: metadata.tags.split(',').filter(tag => tag.trim()).map(tag => tag.trim()),
        visibility: metadata.visibility,
        files: files.map(f => ({
          name: f.file.name,
          type: f.file.type,
          size: f.file.size
        }))
      }));

      const response = await docs.upload(formData);
      
      setFiles(prevFiles => prevFiles.map((file, idx) => ({
        ...file,
        status: 'success',
        documentId: response.data?.[idx]?.document?.id || null
      })));
      
      // Appeler onUploadSuccess après un téléversement réussi
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (err) {
      console.error('Error uploading documents:', err);
      setFiles(prevFiles => prevFiles.map(file => ({
        ...file,
        status: 'error',
        error: err.message
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <UploadCloud className="mr-2" size={20} />
        Téléverser des documents
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Zone de dépôt */}
        <div 
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Formats supportés: PDF, DOCX, PPTX, TXT (Max 50MB)
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            accept=".pdf,.docx,.txt"
          />
        </div>

        {/* Liste des fichiers sélectionnés */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Fichiers sélectionnés ({files.length})
            </h3>
            <ul className="space-y-2">
              {files.map((fileObj) => (
                <li 
                  key={fileObj.id} 
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    fileObj.status === 'success' ? 'border-green-200 bg-green-50' :
                    fileObj.status === 'error' ? 'border-red-200 bg-red-50' :
                    fileObj.status === 'uploading' ? 'border-blue-200 bg-blue-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-center truncate">
                    <FileText className="flex-shrink-0 h-5 w-5 text-gray-500 mr-3" />
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{fileObj.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                        {fileObj.error && (
                          <span className="text-red-500 ml-2"> - {fileObj.error}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {fileObj.status === 'success' ? (
                      <span className="text-xs text-green-600 mr-2">Terminé</span>
                    ) : fileObj.status === 'error' ? (
                      <span className="text-xs text-red-600 mr-2">Erreur</span>
                    ) : fileObj.status === 'uploading' ? (
                      <span className="text-xs text-blue-600 mr-2">En cours...</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeFile(fileObj.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Métadonnées */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Métadonnées</h3>
          <div className="grid grid-cols-1 gap-4 mx-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Titre (optionnel)</label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Titre du document"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Description (optionnel)</label>
              <textarea
                name="description"
                value={metadata.description}
                onChange={handleMetadataChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="Description du contenu"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Tags (optionnel)</label>
              <input
                type="text"
                name="tags"
                value={metadata.tags}
                onChange={handleMetadataChange}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-red-500 mt-1">Séparez les tags par des virgules</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Visibilité</label>
              <select
                name="visibility"
                value={metadata.visibility}
                onChange={handleMetadataChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="private">Privé (visible seulement par moi)</option>
                <option value="team">Équipe (visible par tous les membres)</option>
                <option value="public">Public (visible par tous)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isUploading || files.length === 0}
          className={`w-full flex justify-center items-center py-2 px-4 rounded-md text-white cursor-pointer ${
            isUploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Téléversement en cours...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2" size={18} />
              Téléverser {files.length > 1 ? `${files.length} documents` : 'le document'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}