import React from 'react'

const MessageList = ({
    showNames,
    messages,
    loading,
    hasOlder,
    messagesEndRef,
    messagesContainerRef,
    onScroll,
    user,
    showEmptyState = false,
    displayName,
    showScrollToBottom = false,
    onScrollToBottom,
    bottomPadding = 0
}) => {
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
        <div className="flex-1 min-h-0 relative">
            <div
                ref={messagesContainerRef}
                onScroll={onScroll}
                className="h-full overflow-y-auto"
            >
                <div className="h-full">
                    {loading && hasOlder && (
                        <div className="flex justify-center py-2">
                            <div className="text-gray-500 text-sm">Загрузка старых сообщений...</div>
                        </div>
                    )}

                    {messages.length > 0 ? (
                        <div className="px-4 py-2">
                            {messageGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="space-y-3">
                                    <div className="flex justify-center my-4">
                                        <div className="bg-white/50 px-3 py-1 rounded-full text-xs text-gray-600">
                                            {group.date}
                                        </div>
                                    </div>

                                    {group.messages.map((message) => {
                                        const isOwn = message.sender.id === user?.id

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwn
                                                    ? 'bg-white text-gray-800 rounded-br-none'
                                                    : 'bg-white/50 text-gray-800 rounded-bl-none'
                                                    }`}>
                                                    {(!isOwn && showNames) && (
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
                            ))}
                        </div>
                    ) : showEmptyState && (
                        // Специальное состояние для нового директ-чата
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <div className="text-center">
                                <div className="text-6xl mb-4">👋</div>
                                <h3 className="text-lg font-medium mb-2">Начните общение</h3>
                                <p className="text-sm">Отправьте первое сообщение {displayName}</p>
                                <p className="text-xs mt-2 text-gray-400">Чат будет создан автоматически</p>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                    {messages.length > 0 &&
                        <div
                            className="w-full"
                            style={{
                                height: `${bottomPadding}px`
                            }}
                        ></div>
                    }

                    {loading && !hasOlder && (
                        <div className="flex justify-center py-2">
                            <div className="text-gray-500 text-sm">Загрузка...</div>
                        </div>
                    )}
                </div>
            </div>

            <div
                className={`absolute right-4 z-50 transition-all duration-300 ${showScrollToBottom
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-50 translate-y-4 pointer-events-none'
                    }`}
                style={{
                    bottom: `calc(${bottomPadding}px + 1rem)`
                }}
            >
                <button
                    onClick={onScrollToBottom}
                    className="w-12 h-12 bg-white text-blue-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
                    aria-label="Прокрутить вниз"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default MessageList