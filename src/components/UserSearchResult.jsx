import React from 'react'
import { useNavigate } from 'react-router-dom'

const UserSearchResult = ({ user, onClose }) => {
    const navigate = useNavigate()

    const handleGoToChat = () => {
        if (user.direct_chat_id) {
            navigate(`/chat/${user.direct_chat_id}`)
        } else {
            navigate(`/chat/direct/${user.username}`)
        }
        onClose()
    }

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-sm border border-white/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Найден пользователь</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                </div>
                <div className="flex-1">
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                    {user.bio && (
                        <div className="text-sm text-gray-600 mt-1">{user.bio}</div>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {user.direct_chat_id ? (
                    <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        💬 У вас уже есть чат с этим пользователем
                    </div>
                ) : (
                    <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                        ✨ Начните общение с этим пользователем
                    </div>
                )}
                
                <button
                    onClick={handleGoToChat}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 shadow-sm flex items-center justify-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Перейти к сообщениям</span>
                </button>
            </div>
        </div>
    )
}

export default UserSearchResult