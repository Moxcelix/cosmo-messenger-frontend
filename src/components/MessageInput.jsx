import React from 'react'

const MessageInput = ({
    newMessage,
    onMessageChange,
    onSendMessage,
    sending,
    onStopTyping,
    displayName
}) => {
    const handleSubmit = (e) => {
        e.preventDefault()
        onSendMessage(newMessage)
    }

    const handleInputChange = (e) => {
        onMessageChange(e.target.value)
    }

    return (
        <div className="flex-shrink-0 bg-white border-t p-4 safe-area-bottom">
            <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    onBlur={onStopTyping}
                    placeholder={displayName ? `Введите сообщение для ${displayName}...` : 'Введите сообщение...'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-full font-medium transition-colors flex-shrink-0"
                >
                    {sending ? '...' : '➤'}
                </button>
            </form>
        </div>
    )
}

export default MessageInput