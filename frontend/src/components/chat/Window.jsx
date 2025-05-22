export const Window = ({ messages, onSend, isLoading, documents, selectedDocuments, onDocumentSelect }) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message 
            key={message.id}
            message={message}
            onCopy={() => console.log("Copy message:", message.id)}
            onFeedback={(isPositive) => console.log(`Feedback ${isPositive ? 'positive' : 'negative'} for message ${message.id}`)}
          />
        ))}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t bg-white">
        <Input 
          onSend={onSend} 
          isLoading={isLoading} 
          hasSelectedDocs={selectedDocuments?.length > 0}
        />
      </div>
    </div>
  )
}
