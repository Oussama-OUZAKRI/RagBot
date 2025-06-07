import { Search, Book, X, Settings, MessageCircle } from 'lucide-react';
import { toggleDocumentSelection, getFileIcon } from '../../constants/document';

export const ChatSidebar = ({ 
  isMobile, 
  mobileSidebarOpen, 
  sidebarOpen, 
  setMobileSidebarOpen, 
  setSelectedDocuments, 
  selectedDocuments = [],
  availableDocuments = [], 
  setIsSettingsOpen, 
  isSettingsOpen,
  conversations = [],
  selectedConversation,
  onSelectConversation
}) => {
  return (
    <div 
      className={`
        ${isMobile 
          ? 'absolute inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out'
          : 'relative flex-shrink-0 transition-all duration-300 ease-in-out'
        }
        ${isMobile 
          ? (mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') 
          : (sidebarOpen ? 'w-0' : 'w-72')
        }
        bg-white shadow-lg flex flex-col
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center">
          <Book size={20} className="mr-2 text-blue-600" />
          Documents
        </h2>
        {isMobile && (
          <button 
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un document..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <div className="py-2">
          {/* Section documents sélectionnés */}
          {selectedDocuments?.length > 0 && (
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Sélectionnés ({selectedDocuments.length})
                </span>
                <button 
                  onClick={() => setSelectedDocuments([])} 
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Tout désélectionner
                </button>
              </div>
              <div className="mt-2 space-y-1">
                {availableDocuments
                  ?.filter(doc => selectedDocuments.includes(doc.id))
                  ?.map(doc => (
                    <div 
                      key={`selected-${doc.id}`}
                      className="flex items-center p-2 rounded-md bg-blue-50 text-blue-700"
                    >
                      {getFileIcon(doc.original_filename)}
                      <span className="ml-2 text-sm truncate flex-1">
                        {doc.title || doc.original_filename}
                      </span>
                      <button 
                        onClick={() => toggleDocumentSelection(doc, setSelectedDocuments)}
                        className="ml-1 p-1 rounded-full hover:bg-blue-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Section documents disponibles */}
          <div className="px-4 py-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Documents disponibles
            </h3>
            <div className="space-y-1">
              {!availableDocuments || availableDocuments.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">
                  Aucun document disponible
                </div>
              ) : (
                availableDocuments
                  .filter(doc => !selectedDocuments?.includes(doc.id))
                  .map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleDocumentSelection(doc, setSelectedDocuments)}
                    >
                      {getFileIcon(doc.original_filename)}
                      <span className="ml-2 text-sm truncate">
                        {doc.title || doc.original_filename}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Section historique des conversations */}
          <div className="px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Historique des conversations
            </h3>
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="text-sm text-gray-500 p-2">
                  Aucune conversation
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    className={`flex items-center w-full p-2 rounded-md hover:bg-gray-100 transition-colors ${
                      selectedConversation === conv.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm truncate">
                        Conversation du {new Date(conv.created_at).toLocaleDateString()}
                      </span>
                      {conv.last_message && (
                        <span className="text-xs text-gray-500 truncate">
                          {conv.last_message.slice(0, 30)}...
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          <Settings size={16} className="mr-2" />
          Paramètres avancés
        </button>
      </div>
    </div>
  )
}
