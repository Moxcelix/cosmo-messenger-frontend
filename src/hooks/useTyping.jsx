import { useState, useCallback, useRef } from 'react'

export const useTyping = (sendTypingIndicator, currentUserId) => {
    const [typingUsers, setTypingUsers] = useState({})
    const typingTimeoutRef = useRef(null)

    const startTyping = useCallback(() => {
        if (sendTypingIndicator) {
            sendTypingIndicator(true)
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping()
            }, 3000)
        }
    }, [sendTypingIndicator])

    const stopTyping = useCallback(() => {
        if (sendTypingIndicator) {
            sendTypingIndicator(false)
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = null
            }
        }
    }, [sendTypingIndicator])

    const updateTypingUsers = useCallback((userId, userName, isTyping) => {
        if (userId === currentUserId) return

        setTypingUsers(prev => {
            const newState = { ...prev }
            if (isTyping) {
                newState[userId] = userName
            } else {
                delete newState[userId]
            }
            return newState
        })
    }, [currentUserId])

    const cleanup = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
    }, [])

    return {
        typingUsers,
        startTyping,
        stopTyping,
        updateTypingUsers,
        cleanup
    }
}