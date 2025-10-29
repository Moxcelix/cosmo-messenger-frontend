import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatListWebSocket } from '../hooks/useChatListWebSocket'
import ProtectedRoute from './ProtectedRoute'

const ChatList = () => {
    const { authFetch, logout, user, loading: authLoading, accessToken } = useAuth()
    const navigate = useNavigate()
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)

    const isMounted = useRef(true)
    const initialLoadDone = useRef(false)

    useChatListWebSocket(accessToken, {
        onChatUpdate: useCallback((updatedChat) => {
            console.log('🔄 Updating chat in list:', updatedChat)
            setChats(prev => prev.map(chat => 
                chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
            ))
        }, []),

        onNewMessage: useCallback((messageData) => {
            console.log('📨 New message received in chat list:', messageData)
            
            setChats(prev => {
                const chatIndex = prev.findIndex(chat => chat.id === messageData.chat_id)
                if (chatIndex === -1) {
                    // Если чата нет в списке, возможно нужно его добавить
                    // или просто игнорировать, т.к. он может быть на другой странице
                    return prev
                }

                const updatedChats = [...prev]
                const chat = updatedChats[chatIndex]
                
                // Обновляем последнее сообщение
                const updatedChat = {
                    ...chat,
                    last_message: {
                        id: messageData.id,
                        content: messageData.content,
                        sender: messageData.sender,
                        timestamp: messageData.timestamp
                    },
                    // Увеличиваем счетчик непрочитанных, если это не наше сообщение
                    unread_count: messageData.sender.id !== user?.id 
                        ? (chat.unread_count || 0) + 1 
                        : chat.unread_count
                }

                // Перемещаем обновленный чат в начало списка
                updatedChats.splice(chatIndex, 1)
                updatedChats.unshift(updatedChat)

                return updatedChats
            })
        }, [user]),

        onChatCreated: useCallback((newChat) => {
            console.log('🆕 Adding new chat to list:', newChat)
            setChats(prev => [newChat, ...prev])
            setTotal(prev => prev + 1)
        }, []),

        onChatDeleted: useCallback((deletedChat) => {
            console.log('🗑️ Removing chat from list:', deletedChat)
            setChats(prev => prev.filter(chat => chat.id !== deletedChat.id))
            setTotal(prev => prev - 1)
        }, [])
    })

    const logoutHandler = () => {
        logout()
        navigate('/login')
    }

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    const loadChats = useCallback(async (pageNum = 1, append = false) => {
        if (loading || !isMounted.current) {
            return
        }

        setLoading(true)

        try {
            const response = await authFetch(`/api/v1/chats?page=${pageNum}&count=10`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (!isMounted.current) {
                return
            }

            if (append) {
                setChats(prev => [...prev, ...data.chats])
            } else {
                setChats(data.chats)
            }

            setHasMore(data.meta.has_next)
            setTotal(data.meta.total)
            setPage(pageNum)
            initialLoadDone.current = true

        } catch (error) {
            console.error('Ошибка загрузки чатов:', error)
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }, [authFetch, loading])

    useEffect(() => {
        if (!authLoading) {
            loadChats(1, false)
        }
    }, [authLoading])

    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

        if (isNearBottom && hasMore && !loading && initialLoadDone.current) {
            loadChats(page + 1, true)
        }
    }, [hasMore, loading, page, loadChats])

    return (
        <ProtectedRoute>
            <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
                {/* Шапка */}
                <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 flex justify-between items-center shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-lg">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Чаты</h1>
                                <p className="text-gray-500 text-sm">
                                    Всего чатов: {total} • Загружено: {chats.length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={logoutHandler}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Выйти
                    </button>
                </div>

                {/* Основной контент с ограничением ширины */}
                <div className="flex-1 flex justify-center p-4">
                    <div className="w-full max-w-2xl">

                        {/* Список чатов */}
                        <div
                            className="overflow-y-auto h-full"
                            onScroll={handleScroll}
                        >
                            {chats.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center bg-white/50 rounded-2xl backdrop-blur-sm">
                                    <div className="w-24 h-24 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div className="text-lg font-medium text-gray-600 mb-2">Чатов пока нет</div>
                                    <div className="text-sm text-gray-500">Создайте новый чат чтобы начать общение</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chats.map(chat => (
                                        <ChatListItem key={chat.id} chat={chat} />
                                    ))}
                                </div>
                            )}

                            {loading && (
                                <div className="flex justify-center p-8">
                                    <div className="flex items-center space-x-3 text-gray-500">
                                        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Загрузка чатов...</span>
                                    </div>
                                </div>
                            )}

                            {!hasMore && chats.length > 0 && (
                                <div className="text-center py-6 text-gray-400 border-t border-gray-200/60 mt-4">
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-px bg-gray-300"></div>
                                        <span className="text-sm">Все чаты загружены</span>
                                        <div className="w-4 h-px bg-gray-300"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

const ChatListItem = ({ chat }) => {
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

    const hasUnread = chat.unread_count > 0
    const navigate = useNavigate()

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

                    {chat.last_message && (
                        <div className="space-y-2">
                            <p className={`text-sm truncate ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                                <span className={`font-medium ${hasUnread ? 'text-purple-600' : 'text-gray-700'}`}>
                                    {chat.last_message.sender.name}:
                                </span>{' '}
                                {chat.last_message.content}
                            </p>

                            <div className="flex items-center space-x-3">
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
                    )}

                    {!chat.last_message && (
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
                </div>
            </div>
        </div>
    )
}

// Вспомогательная функция для иконок типов чатов
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

export default ChatList