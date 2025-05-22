import { useState, useEffect, useRef } from 'react'
import { ChatSidebar, ChatContent } from '../components'
import { SettingsPopup } from '../components/chat/SettingsPopup'

// Main Chat Page Component
const ChatPage = () => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [availableDocuments, setAvailableDocuments] = useState([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Check for mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  useEffect(() => {
    // Simulate loading documents
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
    // Scroll to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat is loaded
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async (e) => {
    e?.preventDefault()
    
    if (!input.trim()) return
    
    // Add user message
    const userMessage = { 
      id: Date.now(), 
      text: input, 
      sender: 'user',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    setIsLoading(true)
    
    try {
      // Simulate response delay
      setTimeout(() => {
        const assistantMessage = { 
          id: Date.now() + 1,
          text: "Voici une réponse générée par le modèle en utilisant les connaissances issues de vos documents. Cette réponse peut inclure des citations directes et des références aux sources pertinentes que vous avez sélectionnées.",
          sender: 'bot',
          timestamp: new Date().toISOString(),
          sources: selectedDocuments.length > 0 
            ? availableDocuments
                .filter(doc => selectedDocuments.includes(doc.id))
                .slice(0, 2)
                .map(doc => ({ 
                  document_title: doc.title || doc.original_filename,
                  page_content: "Extrait pertinent du document...",
                  page_number: 1
                }))
            : []
        }
        
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1500)
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

  return (
    <div className="flex relative h-full bg-gray-50 gap-4 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Documents Panel */}
      <ChatSidebar 
        isMobile={isMobile}
        mobileSidebarOpen={mobileSidebarOpen}
        sidebarOpen={sidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        setSelectedDocuments={setSelectedDocuments}
        selectedDocuments={selectedDocuments}
        availableDocuments={availableDocuments}
        setIsSettingsOpen={setIsSettingsOpen}
        isSettingsOpen={isSettingsOpen}
      />

      {/* Main Content */}
      <ChatContent 
        messages={messages}
        isLoading={isLoading}
        selectedDocuments={selectedDocuments}
        availableDocuments={availableDocuments}
        setIsSettingsOpen={setIsSettingsOpen}
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        chatEndRef={chatEndRef}
        inputRef={inputRef}
        setSelectedDocuments={setSelectedDocuments}
        setMessages={setMessages}
      />

      {/* Settings Modal */}
      <SettingsPopup 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(settings) => {
          console.log('Nouveaux paramètres:', settings);
          handleSend(null, settings);
        }}
      />
    </div>
  )
}

export default ChatPage;