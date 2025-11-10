import React from 'react'
import TypingDots from './TypingDots'

const ChatHeader = ({ 
    chat, 
    total, 
    typingUsers, 
    onBack, 
    isDirect = false, 
    displayName,
    title,
    chatExists 
}) => {
    const isTyping = Object.keys(typingUsers).length > 0
    const finalDisplayName = title || chat?.name || displayName || 'Загрузка...'
    
    const statusText = isDirect 
        ? (chatExists ? 'Личный чат' : 'Новый чат')
        : 'Групповой чат'

    const messageCount = isDirect && !chatExists ? 0 : total

    return (
        <div className="flex-shrink-0 bg-white border-b p-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-semibold text-gray-800 truncate">
                            {finalDisplayName}
                        </h1>
                        <p className="text-sm text-gray-500 truncate">
                            {isTyping ? (
                                <span>
                                    {Object.values(typingUsers)[0]}
                                    {Object.keys(typingUsers).length > 1 ? ' и другие' : ''} печатает
                                    <TypingDots />
                                </span>
                            ) : (
                                <span>
                                    {statusText} • {messageCount} сообщений
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatHeader