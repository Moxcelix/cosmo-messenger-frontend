import React from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

const ChatLayout = ({ 
    chat,
    total,
    typingUsers,
    onBack,
    isDirect = false,
    userNotFound = false,
    displayName,
    messages,
    loading,
    hasOlder,
    messagesEndRef,
    messagesContainerRef,
    onScroll,
    user,
    newMessage,
    onMessageChange,
    onSendMessage,
    sending,
    isConnected,
    onStopTyping,
    chatExists,
    showScrollToBottom = false,
    onScrollToBottom
}) => {
    if (userNotFound) {
        return (
            <div className="h-screen-safe safe-area-top safe-area-bottom">
                <div className="h-full flex flex-col bg-gray-50">
                    <ChatHeader 
                        title="Пользователь не найден"
                        onBack={onBack}
                        displayName={displayName}
                    />
                    
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4">😕</div>
                            <h3 className="text-lg font-medium mb-2 text-gray-800">Пользователь не найден</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Пользователь <span className="font-mono">@{displayName}</span> не существует
                            </p>
                            <button
                                onClick={onBack}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                            >
                                Вернуться назад
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const showEmptyState = !loading && messages.length === 0 && isDirect && !chatExists

    return (
        <div className="h-screen-safe safe-area-top safe-area-bottom">
            <div className="h-full flex flex-col bg-gray-50">
                <ChatHeader 
                    chat={chat}
                    total={total}
                    typingUsers={typingUsers}
                    onBack={onBack}
                    isDirect={isDirect}
                    displayName={displayName}
                    chatExists={chatExists}
                />

                <div className="flex-1 min-h-0">
                    <div className="h-full max-w-2xl mx-auto flex flex-col relative">
                        {/* Нежный градиент со звездчатым паттерном */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 pointer-events-none">
                          
                        </div>

                        {/* Основной контент */}
                        <div className="relative z-10 h-full flex flex-col">
                            <MessageList
                                messages={messages}
                                loading={loading}
                                hasOlder={hasOlder}
                                messagesEndRef={messagesEndRef}
                                messagesContainerRef={messagesContainerRef}
                                onScroll={onScroll}
                                user={user}
                                showEmptyState={showEmptyState}
                                displayName={displayName}
                                showScrollToBottom={showScrollToBottom}
                                onScrollToBottom={onScrollToBottom}
                            />

                            <MessageInput
                                newMessage={newMessage}
                                onMessageChange={onMessageChange}
                                onSendMessage={onSendMessage}
                                sending={sending}
                                onStopTyping={onStopTyping}
                                displayName={displayName}
                                disabled={userNotFound}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatLayout