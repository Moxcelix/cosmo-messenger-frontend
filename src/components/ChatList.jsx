import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatListWebSocket } from '../hooks/useChatListWebSocket'
import ChatListItem from './ChatListItem'
import ProtectedRoute from './ProtectedRoute'
import UserSearch from './UserSearch'
import UserSearchResult from './UserSearchResult'

const ChatList = () => {
    const { authFetch, logout, user, loading: authLoading, accessToken } = useAuth()
    const navigate = useNavigate()
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [typingChats, setTypingChats] = useState({})
    const [searchResult, setSearchResult] = useState(null)
    const [showScrollTop, setShowScrollTop] = useState(false)

    const isMounted = useRef(true)
    const initialLoadDone = useRef(false)
    const scrollContainerRef = useRef(null)

    useChatListWebSocket(accessToken, {
        onNewMessage: useCallback((messageData) => {
            setChats(prev => {
                const chatIndex = prev.findIndex(chat => chat.id === messageData.chat_id)
                if (chatIndex === -1) return prev

                const updatedChats = [...prev]
                const chat = updatedChats[chatIndex]

                const updatedChat = {
                    ...chat,
                    last_message: {
                        id: messageData.id,
                        content: messageData.content,
                        sender: messageData.sender,
                        timestamp: messageData.timestamp
                    },
                    unread_count: messageData.sender.id !== user?.id
                        ? (chat.unread_count || 0) + 1
                        : chat.unread_count
                }

                updatedChats.splice(chatIndex, 1)
                updatedChats.unshift(updatedChat)

                return updatedChats
            })
        }, [user]),

        onUserTyping: useCallback((typingData) => {
            setTypingChats(prev => {
                const newState = { ...prev }

                if (typingData.is_typing) {
                    if (!newState[typingData.chat_id]) {
                        newState[typingData.chat_id] = {}
                    }
                    newState[typingData.chat_id][typingData.user_id] = typingData.user_name
                } else {
                    if (newState[typingData.chat_id]) {
                        delete newState[typingData.chat_id][typingData.user_id]
                        if (Object.keys(newState[typingData.chat_id]).length === 0) {
                            delete newState[typingData.chat_id]
                        }
                    }
                }

                return newState
            })
        }, []),
        onChatCreated: useCallback((chatData) => {
            setChats(prev => {
                const existingChatIndex = prev.findIndex(chat => chat.id === chatData.id)
                
                if (existingChatIndex !== -1) {
                    const updatedChats = [...prev]
                    updatedChats[existingChatIndex] = chatData
                    return updatedChats
                } else {
                    return [chatData, ...prev]
                }
            })
            
            setTotal(prev => prev + 1)
        }, []),

        onChatUpdate: useCallback((chatData) => {
            setChats(prev => {
                const chatIndex = prev.findIndex(chat => chat.id === chatData.id)
                
                if (chatIndex === -1) {
                    return [chatData, ...prev]
                }

                const updatedChats = [...prev]
                updatedChats[chatIndex] = chatData
                
                if (chatData.last_message && chatData.last_message.timestamp) {
                    const currentChat = updatedChats[chatIndex]
                    updatedChats.splice(chatIndex, 1)
                    updatedChats.unshift(currentChat)
                }
                
                return updatedChats
            })
        }, [])
    })

    const logoutHandler = () => {
        logout()
        navigate('/login')
    }

    const handleUserFound = (userData) => {
        setSearchResult(userData)
    }

    const handleCloseSearchResult = () => {
        setSearchResult(null)
    }

    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            })
        }
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

        setShowScrollTop(scrollTop > 100)

        if (isNearBottom && hasMore && !loading && initialLoadDone.current) {
            loadChats(page + 1, true)
        }
    }, [hasMore, loading, page, loadChats])


    return (
        <ProtectedRoute>
            {/* Фиксированный градиентный фон */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-blue-50 -z-10"></div>
            
            {/* Основной контейнер без прокрутки */}
            <div className="h-screen flex flex-col relative overflow-hidden">
                {/* Шапка */}
                <div className="flex-shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 flex justify-between items-center shadow-sm relative z-10">
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

                {/* Контейнер для контента с фиксированной высотой */}
                <div className="flex-1 flex justify-center p-4 relative z-10 overflow-hidden">
                    <div className="w-full max-w-2xl flex flex-col h-full">
                        {/* Поиск пользователей */}
                        <div className="flex-shrink-0">
                            <UserSearch onUserFound={handleUserFound} />
                        </div>

                        {/* Результат поиска */}
                        {searchResult && (
                            <div className="flex-shrink-0">
                                <UserSearchResult
                                    user={searchResult}
                                    onClose={handleCloseSearchResult}
                                />
                            </div>
                        )}

                        {/* Контейнер для списка чатов с прокруткой */}
                        <div className="flex-1 min-h-0"> 
                            <div
                                ref={scrollContainerRef}
                                className="overflow-y-auto h-full"
                                onScroll={handleScroll}
                            >
                                {chats.length === 0 && !loading && !searchResult ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center bg-white/50 rounded-2xl backdrop-blur-sm">
                                        <div className="w-24 h-24 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <div className="text-lg font-medium text-gray-600 mb-2">Чатов пока нет</div>
                                        <div className="text-sm text-gray-500">
                                            Начните общение - найдите пользователя выше
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pb-2"> {/* Добавил отступ снизу */}
                                        {chats.map(chat => (
                                            <ChatListItem key={chat.id} chat={chat} typingUsers={typingChats} />
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

                {/* Кнопка "Наверх" */}
                <button
                    onClick={scrollToTop}
                    className={`fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 ${
                        showScrollTop 
                            ? 'opacity-100 translate-y-0' 
                            : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                    aria-label="Прокрутить наверх"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                </button>
            </div>
        </ProtectedRoute>
    )
}

export default ChatList