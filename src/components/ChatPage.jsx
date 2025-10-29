import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChatWebSocket } from '../hooks/useChatWebSocket'
import ProtectedRoute from './ProtectedRoute'

const ChatPage = () => {
    const { chatId } = useParams()
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

    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const isMounted = useRef(true)
    const initialLoadDone = useRef(false)
    const scrollPositionRef = useRef(0)
    const messagesHeightRef = useRef(0)
    const loadThreshold = 200

    const { sendMessage: sendWsMessage, isConnected } = useChatWebSocket(
        accessToken,
        chatId,
        {
            onNewMessage: (message) => {
                if (message.chat_id == chatId) {
                    setMessages(prev => [...prev, message])
                    setTimeout(() => scrollToBottom(), 100)
                }
            },
            onUserTyping: (data) => {
                console.log('User is typing:', data)
            },
            onMessageEdited: (data) => {
                console.log('Message edited:', data)
            }
        }
    )

    useEffect(() => {
        isMounted.current = true
        return () => {
            isMounted.current = false
        }
    }, [])

    const loadMessages = useCallback(async (cursor = null, dir = 'older') => {
        if (loading || !isMounted.current) return

        if (messagesContainerRef.current) {
            scrollPositionRef.current = messagesContainerRef.current.scrollTop
            messagesHeightRef.current = messagesContainerRef.current.scrollHeight
        }

        setLoading(true)

        try {
            let url = `/api/v1/messages/chat/${chatId}?dir=${dir}&count=20`
            if (cursor) {
                url += `&cursor=${cursor}`
            }

            const response = await authFetch(url)
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

            console.log(data.meta)
            setHasOlder(data.meta.has_prev)
            setHasNewer(data.meta.has_next)
            setTotal(data.meta.total)

        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error)
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }, [chatId, authFetch, loading])

    useEffect(() => {
        if (chatId && !authLoading) {
            loadMessages()
        }
    }, [chatId, authLoading])

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

        if (isNearTop && hasOlder && !loading) {
            const oldestMessage = messages[0]
            if (oldestMessage) {
                loadMessages(oldestMessage.id, 'older')
            }
        }
    }, [hasOlder, loading, messages, loadMessages])

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        try {
            if (isConnected) {
                const success = sendWsMessage(newMessage.trim())
                if (success) {
                    setNewMessage('')
                } else {
                    throw new Error('WebSocket not connected')
                }
            } else {
                console.log('Using HTTP fallback for message sending')
                const response = await authFetch(`/api/v1/messages/chat/${chatId}`, {
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

                setNewMessage('')
                loadMessages()
            }

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

    return (
        <ProtectedRoute>
            <div className="h-screen flex flex-col bg-gray-50">
                {/* Шапка чата */}
                <div className="bg-white border-b p-4 shadow-sm">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-800">
                                    {chat?.name || 'Загрузка...'}
                                </h1>
                                <p className="text-sm text-gray-500">
                                    {chat?.type === 'direct' ? 'Личный чат' : 'Групповой чат'} • {total} сообщений
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Контейнер для сообщений с ограничением ширины */}
                <div className="flex-1 flex justify-center overflow-hidden">
                    <div className="w-full max-w-2xl flex flex-col">

                        {/* Сообщения */}
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4"
                        >
                            {loading && hasOlder && (
                                <div className="flex justify-center py-2">
                                    <div className="text-gray-500 text-sm">Загрузка старых сообщений...</div>
                                </div>
                            )}

                            {messageGroups.map((group, groupIndex) => (
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
                                                    <div className="text-sm">{message.content}</div>
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
                            ))}

                            <div ref={messagesEndRef} />

                            {loading && !hasOlder && (
                                <div className="flex justify-center py-2">
                                    <div className="text-gray-500 text-sm">Загрузка...</div>
                                </div>
                            )}
                        </div>

                        {/* Форма отправки сообщения */}
                        <div className="bg-white border-t p-4">
                            <form onSubmit={sendMessage} className="flex space-x-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Введите сообщение..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={sending || !isConnected}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending || !isConnected}
                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-full font-medium transition-colors"
                                >
                                    {sending ? '...' : 'Отправить'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default ChatPage