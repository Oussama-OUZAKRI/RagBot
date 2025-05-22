export const Input = ({ onSend, isLoading, hasSelectedDocs }) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  // Auto-adjust textarea height
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
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasSelectedDocs 
              ? "Posez une question sur les documents sélectionnés..." 
              : "Tapez un message..."
          }
          disabled={isLoading}
          rows={1}
          className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minHeight: '50px', maxHeight: '120px' }}
        />
        
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`absolute right-2 top-2 p-2 rounded-full ${
            isLoading || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Indicator for selected documents */}
      {hasSelectedDocs && (
        <div className="mt-2 text-xs text-blue-600 flex items-center">
          <FileText className="w-4 h-4 mr-1" />
          Conversation basée sur les documents sélectionnés
        </div>
      )}
    </form>
  )
}