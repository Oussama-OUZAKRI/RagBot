import { useState, useEffect, useRef } from 'react'
import { FileText, Settings, Book } from 'lucide-react'
import { Window } from '../components'
import { useAuth } from '../context/AuthContext'

const ChatPage = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [availableDocuments, setAvailableDocuments] = useState([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const chatEndRef = useRef(null)

  useEffect(() => {
    // Simuler le chargement des documents
    const mockDocuments = [
      { id: '1', title: 'Documentation produit', original_filename: 'doc.pdf', status: 'indexed' },
      { id: '2', title: 'Rapport financier 2024', original_filename: 'finance.docx', status: 'indexed' },
      { id: '3', title: 'Présentation clients', original_filename: 'clients.pptx', status: 'indexed' },
      { id: '4', title: 'Données utilisateurs', original_filename: 'data.xlsx', status: 'processing' },
      { id: '5', title: 'Procédures internes', original_filename: 'procedures.pdf', status: 'indexed' },
    ]
    
    setAvailableDocuments(mockDocuments.filter(doc => doc.status === 'indexed'))
  }, [])

  useEffect(() => {
    // Scroll vers le bas à chaque nouveau message
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (message) => {
    if (!message.trim()) return
    
    // Ajouter le message utilisateur
    const userMessage = { 
      id: Date.now(), 
      text: message, 
      sender: 'user',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    
    setIsLoading(true)
    
    try {
      // Simuler un délai de réponse
      setTimeout(() => {
        const assistantMessage = { 
          id: Date.now() + 1,
          text: "Voici une réponse générée par le modèle en utilisant les connaissances issues de vos documents. Cette réponse peut inclure des citations directes et des références aux sources pertinentes que vous avez sélectionnées.",
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sources: selectedDocuments.length > 0 
            ? selectedDocuments.slice(0, 2).map(doc => ({ 
                document_title: doc.title || doc.original_filename,
                page_content: "Extrait pertinent du document...",
                page_number: 1
              }))
            : []
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message', error)
      setIsLoading(false)
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer.",
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isError: true
        }
      ])
    }
  }

  const toggleDocumentSelection = (docId) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    )
  }

  const handleFeedback = (messageId, isPositive) => {
    console.log(`Feedback ${isPositive ? 'positif' : 'négatif'} pour le message ${messageId}`)
    // Implémenter l'appel API pour le feedback
  }

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
    // Ajouter une notification/toast si nécessaire
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Panneau latéral des documents - visible uniquement sur desktop */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium flex items-center">
            <Book size={18} className="mr-2" />
            Documents disponibles
          </h3>
        </div>
        <div className="overflow-y-auto flex-grow">
          {availableDocuments.map((doc) => (
            <div 
              key={doc.id}
              className={`p-3 flex items-center cursor-pointer hover:bg-gray-100 ${
                selectedDocuments.includes(doc.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => toggleDocumentSelection(doc.id)}
            >
              <FileText 
                size={18} 
                className={selectedDocuments.includes(doc.id) ? 'text-blue-500' : 'text-gray-500'} 
              />
              <span className="ml-2 text-sm truncate">{doc.title || doc.original_filename}</span>
            </div>
          ))}
        </div>
        {user?.isAdmin && (
          <div className="p-4 border-t border-gray-200">
            <button 
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <Settings size={16} className="mr-2" />
              Paramètres avancés
            </button>
          </div>
        )}
      </div>

      {/* Fenêtre de chat principale */}
      <Window 
        messages={messages}
        onSend={handleSend}
        isLoading={isLoading}
        documents={availableDocuments}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={toggleDocumentSelection}
      />

      {/* Paramètres (modal) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Paramètres avancés</h3>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setIsSettingsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium mb-3">Configuration RAG</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de fragments à récupérer</label>
                    <select className="w-full border border-gray-300 rounded-md p-2">
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seuil de similarité</label>
                    <input type="range" min="0" max="1" step="0.1" className="w-full" />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Modèle LLM</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                    <select className="w-full border border-gray-300 rounded-md p-2">
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5">GPT-3.5</option>
                      <option value="claude">Claude</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Température</label>
                    <input type="range" min="0" max="1" step="0.1" className="w-full" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage