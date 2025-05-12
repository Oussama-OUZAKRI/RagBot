import { useState, useEffect, useRef } from 'react'
import { Message } from './Message'
import { Input } from './Input'
import { chat } from '../../services/'
import { useDocument } from '../../context/DocumentContext'

export const ChatWindow = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState([])
  const messagesEndRef = useRef(null)
  const { documents } = useDocument()

  // Charger l'historique au montage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chat.getChatHistory()
        setMessages(history)
      } catch (error) {
        console.error("Failed to load chat history", error)
      }
    }
    loadHistory()
  }, [])

  // Scroll vers le bas à chaque nouveau message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Envoyer un message
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
      // Envoyer au backend
      const response = await chat.sendMessage(message, selectedDocs)
      const botMessage = { 
        id: `bot-${Date.now()}`,
        text: response.answer, 
        sender: 'bot',
        sources: response.sources,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = { 
        id: `error-${Date.now()}`,
        text: 'Sorry, an error occurred. Please try again.', 
        sender: 'bot',
        isError: true,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Gestion de la sélection des documents
  const toggleDocumentSelection = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* En-tête avec sélection de documents */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">RAG Chat</h2>
          <div className="flex space-x-2 overflow-x-auto max-w-xs md:max-w-md">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => toggleDocumentSelection(doc.id)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  selectedDocs.includes(doc.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {doc.title || doc.original_filename}
              </button>
            ))}
          </div>
        </div>
        {selectedDocs.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Using {selectedDocs.length} selected document(s)
          </p>
        )}
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium">Start a conversation</h3>
            <p>Ask questions about your documents</p>
            <p className="text-sm mt-2">Select documents above to focus the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <Message 
              key={msg.id}
              id={msg.id}
              text={msg.text} 
              sender={msg.sender} 
              sources={msg.sources}
              isError={msg.isError}
              timestamp={msg.timestamp}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Zone de saisie */}
      <div className="p-4 border-t bg-white">
        <Input 
          onSend={handleSend} 
          isLoading={isLoading} 
          hasSelectedDocs={selectedDocs.length > 0}
        />
      </div>
    </div>
  )
}