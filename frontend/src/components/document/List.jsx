import { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, ChevronDown, ChevronUp, 
  Download, Trash2, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { documents as docs } from '../../services';

export const DocumentList = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    visibility: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'uploadedAt',
    direction: 'desc'
  });
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await docs.getAll();
        const data = response.data.map(doc => ({
          ...doc,
          uploadedAt: new Date(doc.created_at).toLocaleDateString(),
          size: `${(doc.file_size / 1024).toFixed(2)} Ko`
        }));
        setDocuments(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectDoc = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
      await docs.delete(docId);
      setDocuments(documents.filter(doc => doc.id !== docId));
      setSelectedDocs(selectedDocs.filter(id => id !== docId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDocs.length === 0) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedDocs.length} document(s) ?`)) return;
    
    try {
      setIsBulkActionLoading(true);
      // Simuler la suppression en masse
      await Promise.all(selectedDocs.map(id => docs.delete(id)));
      setDocuments(documents.filter(doc => !selectedDocs.includes(doc.id)));
      setSelectedDocs([]);
    } catch (err) {
      console.error('Erreur lors de la suppression en masse:', err);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkVisibility = async (visibility) => {
    if (selectedDocs.length === 0) return;
    
    try {
      setIsBulkActionLoading(true);
      // Simuler la mise à jour en masse
      setDocuments(documents.map(doc => 
        selectedDocs.includes(doc.id) ? { ...doc, visibility } : doc
      ));
      setSelectedDocs([]);
    } catch (err) {
      console.error('Erreur lors de la mise à jour en masse:', err);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Filtrer et trier les documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = searchQuery === '' || 
        (doc.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) || 
         doc.original_filename?.toLowerCase()?.includes(searchQuery.toLowerCase()));
      const matchesType = filters.type === 'all' || doc.file_type === filters.type;
      const matchesStatus = filters.status === 'all' || doc.status === filters.status;
      const matchesVisibility = filters.visibility === 'all' || doc.visibility === filters.visibility;
      const matchesOwnership = (user?.id && (doc.uploadedBy === user.id)) || doc.visibility !== 'private';
      
      return matchesSearch && matchesType && matchesStatus && matchesVisibility && matchesOwnership;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const getStatusBadge = (status) => {
    const statusMap = {
      indexed: { color: 'green', text: 'Indexé' },
      processing: { color: 'blue', text: 'En traitement' },
      error: { color: 'red', text: 'Erreur' }
    };
    const { color, text } = statusMap[status] || { color: 'gray', text: 'Inconnu' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800`}>
        {text}
      </span>
    );
  };

  const getVisibilityBadge = (visibility) => {
    const visibilityMap = {
      private: { icon: <EyeOff size={14} className="mr-1" />, text: 'Privé' },
      team: { icon: <Eye size={14} className="mr-1" />, text: 'Équipe' },
      public: { icon: <Eye size={14} className="mr-1" />, text: 'Public' }
    };
    const { icon, text } = visibilityMap[visibility] || { icon: null, text: 'Inconnu' };
    return (
      <span className="flex items-center text-xs text-gray-600">
        {icon}
        {text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold flex items-center">
          <FileText className="mr-2" size={20} />
          Mes documents ({filteredDocuments.length})
        </h2>
        
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher des documents..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Filtres et actions groupées */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="pptx">PPTX</option>
              <option value="txt">TXT</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Filter size={14} />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="indexed">Indexés</option>
              <option value="processing">En traitement</option>
              <option value="error">Erreur</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Filter size={14} />
            </div>
          </div>
          
          <div className="relative">
            <select
              value={filters.visibility}
              onChange={(e) => handleFilterChange('visibility', e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Toutes visibilités</option>
              <option value="private">Privé</option>
              <option value="team">Équipe</option>
              <option value="public">Public</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <Filter size={14} />
            </div>
          </div>
        </div>

        {selectedDocs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkVisibility('private')}
              disabled={isBulkActionLoading}
              className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
            >
              {isBulkActionLoading ? (
                <Loader2 className="animate-spin mr-1" size={14} />
              ) : (
                <EyeOff className="mr-1" size={14} />
              )}
              Privé
            </button>
            <button
              onClick={() => handleBulkVisibility('team')}
              disabled={isBulkActionLoading}
              className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
            >
              {isBulkActionLoading ? (
                <Loader2 className="animate-spin mr-1" size={14} />
              ) : (
                <Eye className="mr-1" size={14} />
              )}
              Équipe
            </button>
            <button
              onClick={() => handleBulkVisibility('public')}
              disabled={isBulkActionLoading}
              className="flex items-center text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
            >
              {isBulkActionLoading ? (
                <Loader2 className="animate-spin mr-1" size={14} />
              ) : (
                <Eye className="mr-1" size={14} />
              )}
              Public
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkActionLoading}
              className="flex items-center text-xs bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded"
            >
              {isBulkActionLoading ? (
                <Loader2 className="animate-spin mr-1" size={14} />
              ) : (
                <Trash2 className="mr-1" size={14} />
              )}
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Tableau des documents */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun document trouvé
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Titre
                    {sortConfig.key === 'title' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1" size={16} /> : 
                        <ChevronDown className="ml-1" size={16} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('uploadedAt')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'uploadedAt' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="ml-1" size={16} /> : 
                        <ChevronDown className="ml-1" size={16} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibilité
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => handleSelectDoc(doc.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded bg-gray-100 text-gray-500">
                        <FileText size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-sm text-gray-500">{doc.filename}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 uppercase">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doc.status)}
                    {doc.error && (
                      <div className="text-xs text-red-500 mt-1">{doc.error}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getVisibilityBadge(doc.visibility)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        title="Télécharger"
                        className="text-blue-600 cursor-pointer hover:text-blue-900"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        title="Supprimer"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 cursor-pointer hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}