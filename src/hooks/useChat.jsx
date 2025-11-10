// hooks/useChat.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChatWebSocket } from './useChatWebSocket'
import { useTyping } from './useTyping'

export const useChat = (chatIdentifier, isDirect = false) => {
    const { authFetch, user, accessToken, loading: authLoading } = useAuth()

    const [chat, setChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasOlder, setHasOlder] = useState(false)
    const [hasNewer, setHasNewer] = useState(false)
    const [total, setTotal] = useState(0)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [userNotFound, setUserNotFound] = useState(false)
    const [initialized, setInitialized] = useState(false)

    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const isMounted = useRef(true)
    const initialLoadDone = useRef(false)
    const scrollPositionRef = useRef(0)
    const messagesHeightRef = useRef(0)
    const loadThreshold = 200

    //Для директ-чата чат может не существовать изначально - это нормально
    const chatExists = chat?.id
    const effectiveChatId = chatExists ? chat.id : (isDirect ? null : chatIdentifier)

    const { sendMessage: sendWsMessage, sendTypingIndicator, isConnected } = useChatWebSocket(
        accessToken,
        effectiveChatId,
        {
            onNewMessage: (message) => {
                // Для директ-чата принимаем сообщения даже если чат еще не создан
                if (isDirect || message.chat_id === effectiveChatId) {
                    setMessages(prev => [...prev, message])
                    setTimeout(() => scrollToBottom(), 100)
                }
            },
            onUserTyping: (data) => {
                if (effectiveChatId || isDirect) {
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

    const handleMessageChange = useCallback((value) => {
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

    const loadMessages = useCallback(async (cursor = null, dir = 'older') => {
        if (authLoading || !user || loading || !isMounted.current) return

        if (messagesContainerRef.current) {
            scrollPositionRef.current = messagesContainerRef.current.scrollTop
            messagesHeightRef.current = messagesContainerRef.current.scrollHeight
        }

        setLoading(true)
        setUserNotFound(false)

        try {
            let url = isDirect
                ? `/api/v1/messages/direct/${chatIdentifier}?dir=${dir}&count=20`
                : `/api/v1/messages/chat/${chatIdentifier}?dir=${dir}&count=20`

            if (cursor) {
                url += `&cursor=${cursor}`
            }

            const response = await authFetch(url)

            if (response.status === 404 && isDirect) {
                setUserNotFound(false)
                setMessages([])
                setTotal(0)
                setHasOlder(false)
                setHasNewer(false)
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
            setInitialized(true)

        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error)
            if (error.message.includes('404') && isDirect) {
                setMessages([])
                setTotal(0)
            }
        } finally {
            if (isMounted.current) {
                setLoading(false)
            }
        }
    }, [chatIdentifier, authFetch, loading, isDirect])


    useEffect(() => {
        if (chatIdentifier && !initialized && !authLoading) {
            loadMessages()
        }
    }, [chatIdentifier, initialized, authLoading])

    useEffect(() => {
        if (messages.length > 0 && !loading && !initialLoadDone.current) {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
                initialLoadDone.current = true
            }
        }
    }, [messages, loading])

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleScroll = useCallback((e) => {
        const { scrollTop } = e.target
        const isNearTop = scrollTop <= loadThreshold

        if (isNearTop && hasOlder && !loading && (effectiveChatId || isDirect)) {
            const oldestMessage = messages[0]
            if (oldestMessage) {
                loadMessages(oldestMessage.id, 'older')
            }
        }
    }, [hasOlder, loading, messages, loadMessages, effectiveChatId, isDirect])

    const sendMessage = async (messageContent) => {
        if (!messageContent.trim() || sending) return false

        stopTyping()
        setSending(true)

        try {
            if (isDirect && !chatExists) {
                console.log('Creating new direct chat with message...')
                const response = await authFetch(`/api/v1/messages/direct/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        receiver_username: chatIdentifier,
                        content: messageContent.trim()
                    })
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Пользователь не найден')
                    }
                    const errorText = await response.text()
                    throw new Error(errorText || 'Failed to create chat')
                }

                const data = await response.json()
                console.log('Direct chat created:', data)

                setChat(data.chat)
                setMessages([data])
                setTotal(1)

                setTimeout(() => loadMessages(), 100)

                return true

            } else if (isConnected && effectiveChatId) {
                const success = sendWsMessage(messageContent.trim())
                if (!success) {
                    throw new Error('WebSocket not connected')
                }
                return true
            } else {
                const url = isDirect
                    ? `/api/v1/messages/direct/`
                    : `/api/v1/messages/chat/${effectiveChatId}`

                const body = isDirect
                    ? { receiver_username: chatIdentifier, content: messageContent.trim() }
                    : { content: messageContent.trim() }

                const response = await authFetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body)
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || 'HTTP send failed')
                }

                if (!isDirect) {
                    loadMessages()
                }
                return true
            }

        } catch (error) {
            console.error('Send message error:', error)
            if (error.message.includes('404') || error.message.includes('не найден')) {
                setUserNotFound(true)
            }
            throw error
        } finally {
            setSending(false)
        }
    }

    const handleSendMessage = async (messageContent) => {
        try {
            const success = await sendMessage(messageContent)
            if (success) {
                setNewMessage('')
            }
            return success
        } catch (error) {
            throw error
        }
    }

    const reloadChat = useCallback(() => {
        setInitialized(false)
        loadMessages()
    }, [loadMessages, authLoading])

    return {
        // State
        chat,
        messages,
        loading,
        hasOlder,
        hasNewer,
        total,
        newMessage,
        setNewMessage,
        sending,
        userNotFound,
        typingUsers,
        isConnected,
        initialized,

        // Refs
        messagesEndRef,
        messagesContainerRef,

        // Handlers
        handleMessageChange,
        handleScroll,
        sendMessage: handleSendMessage,
        loadMessages,
        scrollToBottom,
        reloadChat,

        // Typing
        startTyping,
        stopTyping,

        // Flags
        chatExists,
        isDirect,
        chatIdentifier
    }
}