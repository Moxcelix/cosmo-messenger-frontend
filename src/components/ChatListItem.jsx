import React, { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import TypingDots from './TypingDots'

const ChatListItem = memo(({ chat, typingUsers = {} }) => {
    const navigate = useNavigate()
    const isTyping = typingUsers[chat.id] && Object.keys(typingUsers[chat.id]).length > 0

    const getAvatarUrl = (chat) => {
        if (chat.type === 'direct') {
            return '/icons/user-avatar.svg'
        } else {
            return '/icons/group-avatar.svg'
        }
    }

    const getAvatarFallback = (chat) => {
        if (chat.type === 'direct') {
            return chat.name?.charAt(0)?.toUpperCase() || 'U'
        } else {
            return 'G'
        }
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) {
            return 'Сегодня'
        } else if (days === 1) {
            return 'Вчера'
        } else if (days < 7) {
            return `${days} дн. назад`
        } else {
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
        }
    }

    const getChatTypeIcon = (type) => {
        if (type === 'direct') {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        } else {
            return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        }
    }

    const hasUnread = chat.unread_count > 0

    const handleClick = () => {
        navigate(`/chat/${chat.id}`)
    }

    return (
        <div onClick={handleClick} className="group bg-white/70 hover:bg-white backdrop-blur-sm rounded-2xl p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md border border-white/50 hover:border-purple-300">
            <div className="flex items-start space-x-4">
                {/* Аватарка */}
                <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <img
                            src={getAvatarUrl(chat)}
                            alt={chat.name}
                            className="w-8 h-8 text-white"
                            onError={(e) => {
                                e.target.style.display = 'none'
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex'
                                }
                            }}
                        />
                        <div className="hidden text-white font-bold text-lg">
                            {getAvatarFallback(chat)}
                        </div>
                    </div>

                    {/* Бейдж непрочитанных сообщений */}
                    {hasUnread && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                            {chat.unread_count > 9 ? '9+' : chat.unread_count}
                        </div>
                    )}
                </div>

                {/* Контент чата */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-purple-700 transition-colors">
                            {chat.name}
                        </h3>
                        {chat.last_message && (
                            <div className="flex flex-col items-end space-y-1 ml-2 flex-shrink-0">
                                <span className={`text-xs ${hasUnread ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                                    {formatTime(chat.last_message.timestamp)}
                                </span>
                                {chat.last_message.timestamp && (
                                    <span className="text-xs text-gray-400">
                                        {formatDate(chat.last_message.timestamp)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {isTyping ? (
                        <div className="flex items-center space-x-2 text-sm text-purple-600 font-medium">
                            <span>
                                {Object.values(typingUsers[chat.id])[0]}
                                {Object.keys(typingUsers[chat.id]).length > 1 ? ' и другие' : ''} печатает
                                <TypingDots />
                            </span>
                        </div>
                    ) : chat.last_message ? (
                        <p className={`text-sm truncate ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                            <span className={`font-medium ${hasUnread ? 'text-purple-600' : 'text-gray-700'}`}>
                                {chat.last_message.sender.name}:
                            </span>{' '}
                            {chat.last_message.content}
                        </p>
                    ) : (
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            {getChatTypeIcon(chat.type)}
                            <span className="capitalize">
                                {chat.type === 'direct' ? 'личный чат' : 'групповой чат'}
                            </span>
                            {chat.members_count > 0 && (
                                <>
                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    <span>{chat.members_count} участников</span>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <span className="capitalize">
                                {chat.type === 'direct' ? 'личный' : 'групповой'}
                            </span>
                        </div>

                        {chat.members_count > 0 && (
                            <>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <div className="flex items-center space-x-1 text-xs text-gray-400">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                    <span>{chat.members_count}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})

export default ChatListItem