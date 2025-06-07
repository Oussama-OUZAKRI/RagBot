import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { docs } from '../services/documents';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    visibility: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'uploadDate',
    direction: 'desc'
  });

  // Chargement initial des documents
  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await docs.getAll();
      // Transformer les données pour inclure les champs calculés
      const transformedDocs = response.data.map(doc => ({
        ...doc,
        uploadDate: new Date(doc.created_at).toLocaleDateString(),
        size: `${(doc.file_size / 1024).toFixed(2)} Ko`,
        type: doc.file_type.split('/')[1]?.toUpperCase() || doc.file_type
      }));
      setDocuments(transformedDocs);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Téléversement de document
  const uploadDocument = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // Utiliser un ID unique au lieu du nom de fichier
        const uploadId = Date.now();
        setUploadProgress(prev => ({
          ...prev,
          [uploadId]: percentCompleted
        }));
      };

      const response = await docs.upload(formData, onUploadProgress);
      const newDocument = response.data;
      setDocuments(prev => [newDocument, ...prev]);
      return { success: true, document: newDocument };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
      setUploadProgress({});
    }
  };

  // Suppression de document
  const deleteDocument = async (id) => {
    try {
      setIsLoading(true);
      await docs.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setSelectedDocuments(prev => prev.filter(docId => docId !== id));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression multiple de documents
  const deleteMultipleDocuments = async (ids) => {
    try {
      setIsLoading(true);
      await Promise.all(ids.map(id => docs.delete(id)));
      setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
      setSelectedDocuments([]);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Mise à jour des métadonnées
  const updateDocumentMetadata = async (id, metadata) => {
    try {
      setIsLoading(true);
      const updatedDoc = await docs.updateMetadata(id, metadata);
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDoc : doc)
      );
      return { success: true, document: updatedDoc };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrage et tri des documents
  const getFilteredDocuments = () => {
    if (!Array.isArray(documents)) return [];
    
    return documents
      .filter(doc => {
        const matchesType = filters.type === 'all' || doc.type?.toLowerCase() === filters.type?.toLowerCase();
        const matchesStatus = filters.status === 'all' || doc.status === filters.status;
        const matchesVisibility = filters.visibility === 'all' || doc.visibility === filters.visibility;
        const isOwnerOrPublic = doc.user_id === user?.id || doc.visibility !== 'private';
        
        return matchesType && matchesStatus && matchesVisibility && isOwnerOrPublic;
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
  };

  // Sélection/désélection de documents
  const toggleDocumentSelection = (id) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id) 
        : [...prev, id]
    );
  };

  // Sélection/désélection de tous les documents
  const toggleSelectAllDocuments = () => {
    const filteredDocs = getFilteredDocuments();
    if (selectedDocuments.length === filteredDocs.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocs.map(doc => doc.id));
    }
  };

  const value = {
    documents,
    filteredDocuments: getFilteredDocuments(),
    isLoading,
    error,
    selectedDocuments,
    uploadProgress,
    filters,
    sortConfig,
    actions: {
      loadDocuments,
      uploadDocument,
      deleteDocument,
      deleteMultipleDocuments,
      updateDocumentMetadata,
      setFilters,
      setSortConfig,
      toggleDocumentSelection,
      toggleSelectAllDocuments,
      clearSelection: () => setSelectedDocuments([])
    }
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}