import React from 'react'

const TypingIndicator = ({ typingUsers = {} }) => {
    const typingCount = Object.keys(typingUsers).length
    
    if (typingCount === 0) {
        return null
    }

    const userNames = Object.values(typingUsers)
    
    return (
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
            {/* Анимированные точки */}
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            
            {/* Текст */}
            <div className="text-sm text-blue-700 font-medium">
                {typingCount === 1 ? (
                    <span>{userNames[0]} печатает...</span>
                ) : typingCount === 2 ? (
                    <span>{userNames[0]} и {userNames[1]} печатают...</span>
                ) : (
                    <span>{userNames[0]}, {userNames[1]} и еще {typingCount - 2} печатают...</span>
                )}
            </div>
        </div>
    )
}

export default TypingIndicator