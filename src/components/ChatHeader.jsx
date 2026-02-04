import React from 'react'
import '../styles/ChatHeader.css'
import TypingDots from './TypingDots'

const ChatHeader = ({
    chat,
    typingUsers,
    onBack,
    isDirect,
    displayName,
    total
}) => {
    // Получаем первую букву для аватарки
    const getInitials = (name) => {
        if (!name) return '?'
        return name.charAt(0).toUpperCase()
    }

    const statusText = 'онлайн'

    // Определяем статус
    const isTyping = Object.keys(typingUsers).length > 0

    return (
        <div className="chat-header">


            <div className="user-info">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="avatar-container">
                    <div className="avatar-circle">
                        {getInitials(displayName || chat?.name)}
                    </div>
                </div>

                <div className="user-details">
                    {/* Имя пользователя - наезжает на статус */}
                    <div className="user-name">
                        {displayName || chat?.name || 'Беседа'}
                    </div>

                    {/* Большой статус на заднем фоне */}
                    {/* <div className={`user-status-background ${isTyping ? 'typing' : ''}`}>
                        {isTyping ? 'печатает...' : 'ОНЛАЙН '}
                    </div> */}

                    <p className="status-text">
                        {isTyping ? (
                            <span>
                                {Object.values(typingUsers)[0]}
                                {Object.keys(typingUsers).length > 1 ? ' и другие' : ''} печатает
                                <TypingDots />
                            </span>
                        ) : (
                            <span>
                                {statusText}
                            </span>
                        )}
                    </p>

                </div>
            </div>

        </div>
    )
}

export default ChatHeader