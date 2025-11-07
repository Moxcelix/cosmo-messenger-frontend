import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import { useTyping } from '../hooks/useTyping'
import ProtectedRoute from './ProtectedRoute'
import TypingDots from './TypingDots'

const DirectChatPage = () => {
    const { username } = useParams()
    const navigate = useNavigate()
    const { authFetch, user, loading: authLoading, accessToken } = useAuth()

    const [chat, setChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasOlder, setHasOlder] = useState(false)
    const [hasNewer, setHasNewer] = useState(false)
    const [total, setTotal] = useState(0)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [userNotFound, setUserNotFound] = useState(false)

    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const isMounted = useRef(true)
    const initialLoadDone = useRef(false)
    const scrollPositionRef = useRef(0)
    const messagesHeightRef = useRef(0)
    const loadThreshold = 200

    const chatExists = chat?.id && total > 0

    const { sendMessage: sendWsMessage, sendTypingIndicator, isConnected } = useChatWebSocket(
        accessToken,
        chatExists ? chat.id : null, 
        {
            onNewMessage: (message) => {
                if (message.chat_id === chat?.id) {
                    setMessages(prev => [...prev, message])
                    setTimeout(() => scrollToBottom(), 100)
                }
            },
            onUserTyping: (data) => {
                if (chatExists) {
                    updateTypingUsers(
                        data.user_id,
                        data.user_name,
                        data.is_typing
                    )
                }
            },
            onMessageEdited: (data) => {
                console.log('Message edited:', data)
            }
        }
    )

    const {
        typingUsers,
        startTyping,
        stopTyping,
        updateTypingUsers,
        cleanup
    } = useTyping(sendTypingIndicator, user?.id)

    const handleMessageChange = useCallback((e) => {
        const value = e.target.value
        setNewMessage(value)

        if (value.trim().length > 0) {
            startTyping()
        } else {
            stopTyping()
        }
    }, [startTyping, stopTyping])

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
            cleanup()
        }
    }, [])

    const loadDirectChat = useCallback(async (cursor = null, dir = 'older') => {
        if (loading || !isMounted.current) return

        if (messagesContainerRef.current) {
            scrollPositionRef.current = messagesContainerRef.current.scrollTop
            messagesHeightRef.current = messagesContainerRef.current.scrollHeight
        }

        setLoading(true)
        setUserNotFound(false)

        try {
            let url = `/api/v1/messages/direct/${username}?dir=${dir}&count=20`
            if (cursor) {
                url += `&cursor=${cursor}`
            }

            const response = await authFetch(url)

            if (response.status === 404) {
                setUserNotFound(true)
                return
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const data = await response.json()

            if (!isMounted.current) return

            setChat(data.chat)

            if (cursor) {
                const newMessages = data.messages.reverse()
                setMessages(prev => {
                    const updatedMessages = dir === 'older'
                        ? [...newMessages, ...prev]
                        : [...prev, ...newMessages]

                    if (messagesContainerRef.current) {
                        requestAnimationFrame(() => {
                            const newScrollHeight = messagesContainerRef.current.scrollHeight
                            const heightDiff = newScrollHeight - messagesHeightRef.current
                            messagesContainerRef.current.scrollTop = scrollPositionRef.current + heightDiff
                        })
                    }

                    return updatedMessages
                })
            } else {
                setMessages(data.messages.reverse())
            }

            setHasOlder(data.meta.has_prev)
            setHasNewer(data.meta.has_next)
            setTotal(data.meta.total)

        } catch (error) {
            console.error('Ошибка загрузки direct чата:', error)
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }, [username, authFetch, loading])

    useEffect(() => {
        if (username && !authLoading) {
            loadDirectChat()
        }
    }, [username, authLoading])

    useEffect(() => {
        if (messages.length > 0 && !loading && !initialLoadDone.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
            initialLoadDone.current = true
        }
    }, [messages, loading])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target
        const isNearTop = scrollTop <= loadThreshold

        if (isNearTop && hasOlder && !loading && chatExists) {
            const oldestMessage = messages[0]
            if (oldestMessage) {
                loadDirectChat(oldestMessage.id, 'older')
            }
        }
    }, [hasOlder, loading, messages, loadDirectChat, chatExists])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        stopTyping()
        setSending(true)

        try {
            if (!chatExists) {
                const response = await authFetch(`/api/v1/messages/direct/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        receiver_username: username,
                        content: newMessage.trim()
                    })
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || 'Failed to create chat')
                }

                const data = await response.json()

                setChat(data.chat)
                setMessages([data])
                setTotal(1)

                loadDirectChat()

            } else if (isConnected && chat?.id) {
                const success = sendWsMessage(newMessage.trim())
                if (!success) {
                    throw new Error('WebSocket not connected')
                }
            } else {
                const response = await authFetch(`/api/v1/messages/chat/${chat.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: newMessage.trim()
                    })
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || 'HTTP send failed')
                }

                loadDirectChat()
            }

            setNewMessage('')

        } catch (error) {
            console.error('Send message error:', error)
            alert(`Ошибка отправки: ${error.message}`)
        } finally {
            setSending(false)
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

        if (date.toDateString() === now.toDateString()) {
            return 'Сегодня'
        }

        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера'
        }

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        })
    }

    const groupMessagesByDate = (messages) => {
        const groups = []
        let currentDate = null

        messages.forEach(message => {
            const messageDate = formatDate(message.timestamp)

            if (messageDate !== currentDate) {
                groups.push({
                    date: messageDate,
                    messages: [message]
                })
                currentDate = messageDate
            } else {
                groups[groups.length - 1].messages.push(message)
            }
        })

        return groups
    }

    const messageGroups = groupMessagesByDate(messages)
    const isTyping = Object.keys(typingUsers).length > 0
    const displayName = chat?.name || username || 'Загрузка...'
    const displayStatus = chatExists ? 'Личный чат' : 'Новый чат'
    if (userNotFound) {
        return (
            <ProtectedRoute>
                <div className="h-screen-safe safe-area-top safe-area-bottom">
                    <div className="h-full flex flex-col bg-gray-50">
                        {/* Шапка чата */}
                        <div className="flex-shrink-0 bg-white border-b p-4">
                            <div className="max-w-2xl mx-auto flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => navigate('/chats')}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-xl font-semibold text-gray-800 truncate">
                                            Пользователь не найден
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Сообщение об ошибке */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">😕</div>
                                <h3 className="text-lg font-medium mb-2 text-gray-800">Пользователь не найден</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Пользователь <span className="font-mono">@{username}</span> не существует
                                </p>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                                >
                                    Вернуться назад
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }
    return (
        <ProtectedRoute>
            {/* Основной контейнер с безопасными областями */}
            <div className="h-screen-safe safe-area-top safe-area-bottom">
                <div className="h-full flex flex-col bg-gray-50">
                    {/* Шапка чата */}
                    <div className="flex-shrink-0 bg-white border-b p-4">
                        <div className="max-w-2xl mx-auto flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => navigate('/chats')}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl font-semibold text-gray-800 truncate">
                                        {displayName}
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
                                                {displayStatus} • {total} сообщений
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Контейнер для сообщений */}
                    <div className="flex-1 min-h-0">
                        <div className="h-full max-w-2xl mx-auto flex flex-col">
                            {/* Область сообщений с прокруткой */}
                            <div className="flex-1 min-h-0">
                                <div
                                    ref={messagesContainerRef}
                                    onScroll={handleScroll}
                                    className="h-full overflow-y-auto px-4 py-2"
                                >
                                    {loading && hasOlder && (
                                        <div className="flex justify-center py-2">
                                            <div className="text-gray-500 text-sm">Загрузка старых сообщений...</div>
                                        </div>
                                    )}

                                    {/* Сообщения или состояние пустого чата */}
                                    {messages.length > 0 ? (
                                        messageGroups.map((group, groupIndex) => (
                                            <div key={groupIndex} className="space-y-3">
                                                {/* Разделитель даты */}
                                                <div className="flex justify-center my-4">
                                                    <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600">
                                                        {group.date}
                                                    </div>
                                                </div>

                                                {/* Сообщения группы */}
                                                {group.messages.map((message) => {
                                                    const isOwn = message.sender.id === user?.id

                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwn
                                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                                : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                                }`}>
                                                                {!isOwn && (
                                                                    <div className="font-medium text-sm mb-1 text-purple-600">
                                                                        {message.sender.name}
                                                                    </div>
                                                                )}
                                                                <div className="text-sm break-words">{message.content}</div>
                                                                <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'
                                                                    }`}>
                                                                    {formatTime(message.timestamp)}
                                                                    {message.edited && ' (ред.)'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))
                                    ) : !loading && (
                                        /* Состояние пустого чата */
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <div className="text-center">
                                                <div className="text-6xl mb-4">👋</div>
                                                <h3 className="text-lg font-medium mb-2">Начните общение</h3>
                                                <p className="text-sm">Отправьте первое сообщение {displayName}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />

                                    {loading && !hasOlder && (
                                        <div className="flex justify-center py-2">
                                            <div className="text-gray-500 text-sm">Загрузка...</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Форма отправки сообщения */}
                            <div className="flex-shrink-0 bg-white border-t p-4 safe-area-bottom">
                                <form onSubmit={sendMessage} className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={handleMessageChange}
                                        onBlur={stopTyping}
                                        placeholder={`Введите сообщение для ${displayName}...`}
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
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default DirectChatPage