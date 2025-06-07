import { X, ChevronLeft, Menu, MessageCircle, Send, Trash2, RefreshCcw, Plus, Bug } from 'lucide-react'
import { Message } from './'
import { getFileIcon, handleClearChat, handleCopyMessage, handleFeedback, toggleDocumentSelection, toggleSidebar } from '../../constants/document'
import { useState } from 'react'

const ChatContent = ({
  messages,
  isLoading,
  selectedDocuments,
  availableDocuments,
  isMobile,
  sidebarOpen,
  input,
  setInput,
  handleSend,
  chatEndRef,
  inputRef,
  setSelectedDocuments,
  setMobileSidebarOpen,
  setSidebarOpen,
  setMessages,
  error,
  onRetry,
  selectedConversation,
  currentConversation,
  handleNewConversation, // Assurez-vous que cette prop est bien destructurée
}) => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <button 
          onClick={() => toggleSidebar(isMobile, setMobileSidebarOpen, setSidebarOpen)} 
          className="p-2 mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
        >
          {isMobile || !sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold">RAG Chat Assistant</h1>
          {selectedConversation ? (
            <p className="text-xs text-gray-500">
              Conversation du {new Date(currentConversation?.created_at).toLocaleDateString()}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNewConversation} // Utilisation correcte de la prop
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Nouvelle conversation"
          >
            <Plus size={20} />
          </button>
          <div className="flex gap-2">
            {error && onRetry && (
              <button
                onClick={onRetry}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                title="Réessayer le dernier message"
              >
                <RefreshCcw size={18} />
              </button>
            )}
            <button 
              onClick={() => handleClearChat(setMessages)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
              title="Effacer la conversation"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Afficher/masquer le débogage"
            >
              <Bug size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="bg-gray-50 border-b border-gray-200 p-4 text-sm font-mono overflow-auto max-h-[300px]">
          <h3 className="font-bold mb-2">Informations de débogage:</h3>
          <div className="space-y-2">
            <div>
              <strong>Documents sélectionnés:</strong>
              <pre className="bg-white p-2 rounded">
                {JSON.stringify(selectedDocuments, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Conversation courante:</strong>
              <pre className="bg-white p-2 rounded">
                {JSON.stringify(currentConversation, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Dernier message:</strong>
              <pre className="bg-white p-2 rounded">
                {JSON.stringify(messages[messages.length - 1], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-600 text-white p-4 rounded-full mb-4">
              <MessageCircle size={28} />
            </div>
            <h2 className="text-xl font-semibold mb-2">Commencez une conversation</h2>
            <p className="text-gray-600 max-w-md">
              Posez des questions sur vos documents ou discutez de n'importe quel sujet.
              {selectedDocuments.length === 0 && " Sélectionnez des documents pour une assistance plus précise."}
            </p>
            
            {availableDocuments.length > 0 && selectedDocuments.length === 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Documents suggérés:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableDocuments.slice(0, 3).map(doc => (
                    <button
                      key={`quick-${doc.id}`}                      
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDocumentSelection(doc, setSelectedDocuments);
                      }}
                      className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      {getFileIcon(doc.original_filename)}
                      <span className="ml-2 text-sm">{doc.title || doc.original_filename}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-600 mb-2">Questions suggérées:</p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => setInput("Résumez les points clés des documents sélectionnés")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-left"
                >
                  Résumez les points clés des documents sélectionnés
                </button>
                <button 
                  onClick={() => setInput("Quelles sont les informations importantes à retenir dans ces documents ?")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-left"
                >
                  Quelles sont les informations importantes à retenir dans ces documents ?
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((message) => (
              <Message 
                key={message.id}
                message={message}
                onCopy={() => handleCopyMessage(message.text)}
                onFeedback={(isPositive) => handleFeedback(message.id, isPositive)}
              />
            ))}
            <div ref={chatEndRef} />
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex px-4 py-3 bg-white rounded-lg shadow-sm max-w-[85%]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedDocuments.length > 0 
                ? "Posez une question sur les documents sélectionnés..." 
                : "Tapez un message..."
              }
              rows={1}
              className="flex-1 py-3 pl-4 pr-12 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ 
                minHeight: '50px',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 p-2 rounded-full ${
                isLoading || !input.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          
          {selectedDocuments.length > 0 && (
            <div className="flex mt-2 overflow-x-auto pb-1 -mx-1 px-1">
              {availableDocuments
                .filter(doc => selectedDocuments.includes(doc.id))
                .map((doc) => (
                  <div 
                    key={`input-${doc.id}`}
                    className="flex items-center px-2 py-1 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 mr-2 whitespace-nowrap"
                  >
                    {getFileIcon(doc.original_filename)}
                    <span className="ml-1 truncate max-w-[100px]">{doc.title || doc.original_filename}</span>                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDocumentSelection(doc, setSelectedDocuments);
                      }}
                      className="ml-1 hover:bg-blue-100 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default ChatContent
