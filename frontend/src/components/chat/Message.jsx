import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const Message = ({ id, text, sender, sources, isError, timestamp }) => {
  const [expandedSources, setExpandedSources] = useState(false)
  const { user } = useAuth()
  const isBot = sender === 'bot'
  const isUser = sender === 'user'

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      data-message-id={id}
    >
      <div 
        className={`max-w-[85%] rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : isError 
              ? 'bg-red-100 text-red-800 rounded-bl-none' 
              : 'bg-white text-gray-800 shadow rounded-bl-none'
        }`}
      >
        {/* Texte du message */}
        <div className="whitespace-pre-wrap">{text}</div>
        
        {/* Métadonnées */}
        <div className={`mt-1 flex items-center justify-between text-xs ${
          isUser ? 'text-blue-100' : isError ? 'text-red-600' : 'text-gray-500'
        }`}>
          <span>{formatTime(timestamp)}</span>
          
          {isUser && user?.isAdmin && (
            <button 
              className="ml-2 hover:opacity-70"
              onClick={() => console.log('Delete message', id)} // À implémenter
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Sources (pour les réponses du bot) */}
        {isBot && sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-opacity-20 border-gray-400">
            <button
              onClick={() => setExpandedSources(!expandedSources)}
              className="text-xs flex items-center text-blue-500 hover:text-blue-700"
            >
              <FileText className="w-4 h-4 mr-1" />
              {expandedSources ? 'Hide sources' : `Show ${sources.length} source(s)`}
            </button>
            
            {expandedSources && (
              <div className="mt-2 space-y-1">
                {sources.map((source, idx) => (
                  <div key={idx} className="text-xs p-2 bg-gray-100 rounded">
                    <div className="font-medium">{source.document_title || 'Untitled Document'}</div>
                    <div className="text-gray-600">{source.page_content?.slice(0, 150)}...</div>
                    <div className="text-gray-500 text-xs mt-1">Page: {source.page_number || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}