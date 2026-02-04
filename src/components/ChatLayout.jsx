import React from 'react'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ForbiddenChat from './ForbiddenChat'
import '../styles/ChatLayout.css'

const ChatLayout = ({
    chat,
    total,
    typingUsers,
    onBack,
    isDirect,
    chatExists,
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
    showScrollToBottom,
    onScrollToBottom,
    userNotFound,
    forbidden = false
}) => {
    
    if (forbidden) {
        return <ForbiddenChat onBack={onBack} />
    }

    return (
        <div className="chat-layout-wrapper">
            <div className="chat-layout">
                <ChatHeader 
                    chat={chat}
                    total={total}
                    typingUsers={typingUsers}
                    onBack={onBack}
                    isDirect={isDirect}
                    displayName={displayName}
                    chatExists={chatExists}
                />
                
                <div className="messages-mask-container">
                    <div className="mask-top"></div>
                    
                    <MessageList
                        showNames={!isDirect}
                        messages={messages}
                        loading={loading}
                        hasOlder={hasOlder}
                        messagesEndRef={messagesEndRef}
                        messagesContainerRef={messagesContainerRef}
                        onScroll={onScroll}
                        user={user}
                        showEmptyState={isDirect && !chatExists}
                        displayName={displayName}
                        showScrollToBottom={showScrollToBottom}
                        onScrollToBottom={onScrollToBottom}
                        typingUsers={typingUsers}
                        total={total}
                        bottomPadding={80}
                    />
                    <div className="mask-bottom"></div>
                </div>
                
                <div className="message-input-absolute-wrapper">
                    <MessageInput
                        newMessage={newMessage}
                        onMessageChange={onMessageChange}
                        onSendMessage={onSendMessage}
                        sending={sending}
                        onStopTyping={onStopTyping}
                        displayName={displayName}
                    />
                </div>
            </div>
        </div>
    )
}

export default ChatLayout