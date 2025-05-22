import { useState } from 'react';
import { ThumbsDown, ThumbsUp, Copy, FileText } from 'lucide-react';

export const Message = ({ message, onCopy, onFeedback }) => {
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { text, sender, sources, isError, timestamp } = message
  
  const isBot = sender === 'bot'
  const isUser = sender === 'user'
  
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div 
      className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div 
        className={`relative max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : isError 
              ? 'bg-red-50 text-red-800 border border-red-100' 
              : 'bg-white text-gray-800 shadow-sm border border-gray-100'
        }`}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap text-sm">{text}</div>
        
        {/* Message metadata & actions */}
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <span className={isUser ? 'text-blue-200' : 'text-gray-500'}>
            {formatTime(timestamp)}
          </span>
          
          {/* Actions for bot messages only */}
          {isBot && showActions && (
            <div className="ml-4 flex items-center space-x-2 text-gray-400">
              <button 
                onClick={() => onFeedback(true)} 
                className="p-1 hover:text-blue-600 transition-colors" 
                title="Message utile"
              >
                <ThumbsUp size={14} />
              </button>
              <button 
                onClick={() => onFeedback(false)} 
                className="p-1 hover:text-blue-600 transition-colors" 
                title="Message pas utile"
              >
                <ThumbsDown size={14} />
              </button>
              <button 
                onClick={() => onCopy(text)} 
                className="p-1 hover:text-blue-600 transition-colors" 
                title="Copier le message"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
        
        {/* Sources section */}
        {isBot && sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
              className="text-xs flex items-center text-blue-600 hover:text-blue-800"
            >
              <FileText className="w-4 h-4 mr-1" />
              {isSourcesExpanded ? 'Masquer les sources' : `Afficher les sources (${sources.length})`}
            </button>
            
            {isSourcesExpanded && (
              <div className="mt-2 space-y-2">
                {sources.map((source, idx) => (
                  <div key={idx} className="text-xs p-2 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">{source.document_title || 'Document sans titre'}</div>
                    <div className="text-gray-700">{source.page_content?.slice(0, 150)}...</div>
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