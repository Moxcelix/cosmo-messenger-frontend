import { useEffect, useRef, useState, useCallback } from 'react'
import { useWebSocket } from './useWebSocket'

export const useChatListWebSocket = (accessToken, callbacks = {}) => {
    const {
        onChatUpdate,
        onNewMessage,
        onChatCreated,
        onChatDeleted,
        onUserTyping,
    } = callbacks

    const wsUrl = accessToken
        ? `ws://localhost:4000/ws/?token=${accessToken}`
        : null

    const { sendMessage, onMessage, isConnected } = useWebSocket(wsUrl)

    const handleMessage = useCallback((data) => {
        switch (data.type) {
            case 'chat_updated':
                console.log('Chat updated:', data.payload)
                onChatUpdate?.(data.payload)
                break
            case 'new_message':
                console.log('New message for chat list:', data.payload)
                onNewMessage?.(data.payload)
                break
            case 'chat_created':
                console.log('Chat created:', data.payload)
                onChatCreated?.(data.payload)
                break
            case 'chat_deleted':
                console.log('Chat deleted:', data.payload)
                onChatDeleted?.(data.payload)
                break
            case 'user_typing':
                console.log('User typing:', data.payload)
                onUserTyping?.(data.payload)
                break
            default:
                console.log('Unknown chat list message type:', data.type)
        }
    }, [onChatUpdate, onNewMessage, onChatCreated, onChatDeleted, onUserTyping])

    const unsubscribeRef = useRef()
    useEffect(() => {
        if (wsUrl) {
            unsubscribeRef.current = onMessage(handleMessage)
        }

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
            }
        }
    }, [wsUrl, onMessage, handleMessage])

    return {
        isConnected
    }
}