import { useState, useEffect, useRef } from 'react'
import { ChatSidebar, ChatContent } from '../components'
import { SettingsPopup } from '../components/chat/SettingsPopup'
import { docs } from '../services/documents'
import { chat } from '../services/chat';

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
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);

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
        const response = await docs.getAll();
        console.log('Loaded documents:', response.data);
        setAvailableDocuments(response.data);
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
          const history = await chat.getConversationHistory(conversationId);
          setMessages(history.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: msg.created_at,
            references: msg.references || []
          })));
        } catch (error) {
          console.error('Error loading chat history:', error);
          setError('Erreur lors du chargement de l\'historique');
        }
      }
    };
    
    loadHistory();
  }, [conversationId]);

  // Charger les conversations au montage
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await chat.getConversations();
        setConversations(response);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };
    loadConversations();
  }, []);

  // Mettre à jour la conversation courante
  useEffect(() => {
    const current = conversations.find(c => c.id === selectedConversation);
    setCurrentConversation(current);
  }, [selectedConversation, conversations]);

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
      const response = await chat.sendMessage(
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

  const handleNewConversation = async () => {
    try {
      const newConversation = await chat.createConversation();
      setConversationId(newConversation.id);
      setMessages([]);
      setInput('');
      setSelectedConversation(newConversation.id);
    } catch (error) {
      console.error('Error creating new conversation:', error);
      setError('Erreur lors de la création d\'une nouvelle conversation');
    }
  };

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
        onNewConversation={handleNewConversation}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />

      {/* Main Content */}
      <ChatContent 
        messages={messages}
        isLoading={isLoading}
        selectedDocuments={selectedDocuments}
        availableDocuments={availableDocuments}
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
        selectedConversation={selectedConversation}
        currentConversation={currentConversation}
        handleNewConversation={handleNewConversation} // Ajout de la prop
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