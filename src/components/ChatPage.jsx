import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../hooks/useChat'
import ProtectedRoute from './ProtectedRoute'
import ChatLayout from '../components/ChatLayout'

const ChatPage = () => {
    const { chatId } = useParams()
    const navigate = useNavigate()
     const { user, loading: authLoading } = useAuth()

    const chat = useChat(chatId, false)

    const handleBack = () => navigate('/chats')

    if (authLoading) {
        return (
            <ProtectedRoute>
                <div className="h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Загрузка...</p>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <ChatLayout
                chat={chat.chat}
                total={chat.total}
                typingUsers={chat.typingUsers}
                onBack={handleBack}
                isDirect={chat.chat?.type=="direct"}
                chatExists={chat.chatExists}
                displayName={chat.chat?.name}
                messages={chat.messages}
                loading={chat.loading}
                hasOlder={chat.hasOlder}
                messagesEndRef={chat.messagesEndRef}
                messagesContainerRef={chat.messagesContainerRef}
                onScroll={chat.handleScroll}
                user={user}
                newMessage={chat.newMessage}
                onMessageChange={chat.handleMessageChange}
                onSendMessage={chat.sendMessage}
                sending={chat.sending}
                isConnected={chat.isConnected}
                onStopTyping={chat.stopTyping}
            />
        </ProtectedRoute>
    )
}

export default ChatPage 