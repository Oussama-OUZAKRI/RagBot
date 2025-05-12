import { useState, useEffect } from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import { DocumentUpload, DocumentList } from '../components';
import { useAuth } from '../context/AuthContext';

const DocumentsPage = () => {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    visibility: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'uploadDate',
    direction: 'desc'
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        // Simuler un appel API
        setTimeout(() => {
          const mockDocuments = [
            { 
              id: 'doc1',
              title: 'Documentation produit',
              filename: 'documentation.pdf',
              type: 'pdf',
              size: '2.4 MB',
              chunks: 34,
              status: 'indexed',
              visibility: 'team',
              uploadedBy: user.id,
              uploadDate: '2025-05-05T10:30:00Z',
              indexedAt: '2025-05-05T10:35:00Z'
            },
            { 
              id: 'doc2',
              title: 'Rapport financier Q1',
              filename: 'rapport-financier.docx',
              type: 'docx',
              size: '1.8 MB',
              chunks: 48,
              status: 'indexed',
              visibility: 'private',
              uploadedBy: user.id,
              uploadDate: '2025-05-04T14:15:00Z',
              indexedAt: '2025-05-04T14:20:00Z'
            },
            { 
              id: 'doc3',
              title: 'Présentation clients',
              filename: 'presentation-clients.pptx',
              type: 'pptx',
              size: '5.7 MB',
              chunks: 22,
              status: 'processing',
              visibility: 'team',
              uploadedBy: 'admin',
              uploadDate: '2025-05-03T09:45:00Z',
              indexedAt: null
            },
            { 
              id: 'doc4',
              title: 'Données utilisateurs',
              filename: 'donnees-utilisateurs.xlsx',
              type: 'xlsx',
              size: '3.2 MB',
              chunks: 15,
              status: 'error',
              visibility: 'public',
              uploadedBy: 'admin',
              uploadDate: '2025-05-02T16:20:00Z',
              indexedAt: null,
              error: 'Erreur de parsing'
            }
          ];
          setDocuments(mockDocuments);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors du chargement des documents', error);
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [user?.id]);

  const handleUploadSuccess = (newDocument) => {
    setDocuments([newDocument, ...documents]);
    setIsUploadModalOpen(false);
  };

  const handleDelete = async (docId) => {
    try {
      // Simuler la suppression API
      await new Promise(resolve => setTimeout(resolve, 500));
      setDocuments(documents.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    }
  };

  const handleBulkDelete = async (docIds) => {
    try {
      // Simuler la suppression en masse
      await new Promise(resolve => setTimeout(resolve, 800));
      setDocuments(documents.filter(doc => !docIds.includes(doc.id)));
    } catch (error) {
      console.error('Erreur lors de la suppression en masse', error);
    }
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

  const getFilteredAndSortedDocuments = () => {
    let filteredDocs = documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'all' || doc.type === filters.type;
      const matchesStatus = filters.status === 'all' || doc.status === filters.status;
      const matchesVisibility = filters.visibility === 'all' || doc.visibility === filters.visibility;
      const matchesOwnership = doc.uploadedBy === user.id || doc.visibility !== 'private';
      
      return matchesSearch && matchesType && matchesStatus && matchesVisibility && matchesOwnership;
    });

    return filteredDocs.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return (
    <div className="p-6">
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

      <DocumentList
        documents={getFilteredAndSortedDocuments()}
        isLoading={isLoading}
        searchQuery={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortConfig={sortConfig}
        onSort={handleSort}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        currentUserId={user?.id}
      />

      <DocumentUpload
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        userId={user?.id}
      />
    </div>
  );
};

export default DocumentsPage;