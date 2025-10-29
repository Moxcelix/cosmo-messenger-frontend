import { useEffect, useRef, useState, useCallback } from 'react'

export const useWebSocket = (url) => {
    const wsRef = useRef(null)
    const [isConnected, setIsConnected] = useState(false)
    const messageHandlersRef = useRef(new Set())
    const reconnectTimeoutRef = useRef(null)

    const sendMessage = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message))
            return true
        }
        console.warn('WebSocket not connected, cannot send message')
        return false
    }, [])

    const onMessage = useCallback((handler) => {
        messageHandlersRef.current.add(handler)
        return () => {
            messageHandlersRef.current.delete(handler)
        }
    }, [])

    const connect = useCallback(() => {
        if (!url) {
            console.log('No URL provided for WebSocket')
            return
        }


        if (wsRef.current?.readyState === WebSocket.CONNECTING ||
            wsRef.current?.readyState === WebSocket.OPEN) {
            return
        }

        console.log('Creating new WebSocket connection...')
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
            console.log('WebSocket connected successfully')
            setIsConnected(true)
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }
        }

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                messageHandlersRef.current.forEach(handler => {
                    try {
                        handler(data)
                    } catch (error) {
                        console.error('Error in WebSocket message handler:', error)
                    }
                })
            } catch (error) {
                console.error('Error parsing WebSocket message:', error)
            }
        }

        ws.onclose = (event) => {
            console.log('WebSocket disconnected:', {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean
            })
            setIsConnected(false)

            if (event.code !== 1000 && !event.wasClean) {
                console.log('Will attempt reconnect in 2s...')
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 2000)
            }
        }

        ws.onerror = (error) => {
            console.error('WebSocket connection error:', error)
        }
    }, [url])

    useEffect(() => {
        if (url) {
            connect()
        }

        return () => {
            console.log(' Cleaning up WebSocket connection')

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
                reconnectTimeoutRef.current = null
            }

            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted')
                wsRef.current = null
            }

            setIsConnected(false)
        }
    }, [url]) // Только url как зависимость

    return {
        sendMessage,
        onMessage,
        isConnected
    }
}