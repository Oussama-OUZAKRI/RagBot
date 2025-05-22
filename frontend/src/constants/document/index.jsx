import { FileText } from 'lucide-react'

export const toggleDocumentSelection = (doc, setSelectedDocuments) => {
  // Use setTimeout to defer state update to next tick
  setTimeout(() => {
    setSelectedDocuments(prev => 
      prev.includes(doc.id) 
        ? prev.filter(id => id !== doc.id) 
        : [...prev, doc.id]
    );
  }, 0);
}

export const handleCopyMessage = (content) => {
  navigator.clipboard.writeText(content)
  // Add toast notification here
}

export const handleFeedback = (messageId, isPositive) => {
  console.log(`Feedback ${isPositive ? 'positif' : 'négatif'} pour le message ${messageId}`)
}

export const handleClearChat = (setMessages) => {
  if (window.confirm('Êtes-vous sûr de vouloir effacer toute la conversation?')) {
    setMessages([])
  }
}

export const toggleSidebar = (isMobile, setMobileSidebarOpen, setSidebarOpen) => {
  if (isMobile) {
    setMobileSidebarOpen(prev => !prev)
  } else {
    setSidebarOpen(prev => !prev)
  }
}

export const getFileIcon = (filename) => {
  if (!filename) return <FileText className="w-5 h-5" />
  
  const ext = filename.split('.').pop().toLowerCase()
  
  switch(ext) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-500" />
    case 'docx':
    case 'doc':
      return <FileText className="w-5 h-5 text-blue-500" />
    case 'xlsx':
    case 'xls':
      return <FileText className="w-5 h-5 text-green-500" />
    case 'pptx':
    case 'ppt':
      return <FileText className="w-5 h-5 text-orange-500" />
    default:
      return <FileText className="w-5 h-5 text-gray-500" />
  }
}