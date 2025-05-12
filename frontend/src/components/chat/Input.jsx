import { useState, useRef, useEffect } from 'react'
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

export const Input = ({ onSend, isLoading, hasSelectedDocs }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Ajuster la hauteur du textarea automatiquement
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return
    
    onSend(message)
    setMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end space-x-2">
        {/* Zone de texte */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasSelectedDocs 
              ? "Ask about the selected documents..." 
              : "Type a message or select documents above..."
          }
          disabled={isLoading}
          rows={1}
          className="flex-1 p-3 pr-10 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Bouton d'envoi */}
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`p-2 rounded-full ${
            isLoading 
              ? 'bg-gray-300 text-gray-500'
              : message.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Indicateur de documents sélectionnés */}
      {hasSelectedDocs && (
        <div className="absolute -top-6 left-0 text-xs text-blue-600">
          Chatting with selected documents
        </div>
      )}
    </form>
  )
}