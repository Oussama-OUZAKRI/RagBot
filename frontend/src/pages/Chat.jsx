import { useState, useEffect, useRef } from 'react'
import { ChatSidebar, ChatContent } from '../components'
import { SettingsPopup } from '../components/chat/SettingsPopup'
import { sendMessage, getConversationHistory } from '../services/chat'
import { getDocuments } from '../services/documents'

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
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState(null)
  const [retryMessage, setRetryMessage] = useState(null)
  
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
    const loadDocuments = async () => {
      try {
        const documents = await getDocuments();
        setAvailableDocuments(documents.filter(doc => doc.status === 'indexed'));
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    
    loadDocuments();
  }, [])

  useEffect(() => {
    // Scroll to bottom on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat is loaded
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load chat history if we have a conversation ID
  useEffect(() => {
    const loadHistory = async () => {
      if (conversationId) {
        try {
          const history = await getConversationHistory(conversationId)
          setMessages(history.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: msg.created_at,
            references: msg.references || []
          })))
        } catch (error) {
          console.error('Error loading chat history:', error)
        }
      }
    }
    
    loadHistory()
  }, [conversationId])

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
      const response = await sendMessage(
        input,
        selectedDocuments,
        conversationId
      )
      
      const assistantMessage = { 
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: response.created_at,
        references: response.references || []
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Save conversation ID if this is the first message
      if (!conversationId) {
        setConversationId(response.conversation_id)
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message', error)
      
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
      setError('Une erreur s\'est produite. Veuillez réessayer.')
      setRetryMessage(input)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    if (retryMessage) {
      setError(null)
      setInput(retryMessage)
      setRetryMessage(null)
      await handleSend(null)
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
        error={error}
        onRetry={handleRetry}
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