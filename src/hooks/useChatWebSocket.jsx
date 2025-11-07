import { useEffect } from 'react'
import { useWebSocket } from './useWebSocket'
import { useSound } from './useSound'
import { getCurrentUserId } from '../utils/user'

export const useChatWebSocket = (accessToken, chatId, callbacks = {}) => {
    const {
        onNewMessage,
        onUserTyping,
        onMessageEdited
    } = callbacks

    const { playSound } = useSound()

    const WS_URL = import.meta.env.VITE_WS_URL;

    const wsUrl = accessToken && chatId 
        ? `${WS_URL}/ws/?token=${accessToken}`
        : null

    const { sendMessage, onMessage, isConnected } = useWebSocket(wsUrl)

    useEffect(() => {
        if (!wsUrl) return

        console.log('Setting up WebSocket message handlers for chat:', chatId)

        const unsubscribe = onMessage((data) => {
            console.log('Processing WebSocket message:', data.type)
            switch (data.type) {
                case 'new_message':
                    if (data.payload.sender.id != getCurrentUserId()) {
                        playSound()
                    }
                    onNewMessage?.(data.payload)
                    break
                case 'user_typing':
                    console.log('User typing:', data.payload)
                    onUserTyping?.(data.payload)
                    break
                case 'message_edited':
                    console.log('Message edited:', data.payload)
                    onMessageEdited?.(data.payload)
                    break
                default:
                    console.log('Unknown WebSocket message type:', data.type)
            }
        })

        return unsubscribe
    }, [wsUrl, onMessage, onNewMessage, onUserTyping, onMessageEdited, playSound])

    const sendChatMessage = (content) => {
        if (!chatId) {
            console.error('No chatId provided for sending message')
            return false
        }

        return sendMessage({
            type: 'send_message',
            payload: {
                content,
                chat_id: chatId
            }
        })
    }

    const sendTypingIndicator = (isTyping) => {
        if (!chatId) return false
        return sendMessage({
            type: 'typing',
            payload: {
                chat_id: chatId,
                is_typing: isTyping
            }
        })
    }

    return {
        sendMessage: sendChatMessage,
        sendTypingIndicator,
        isConnected
    }
}