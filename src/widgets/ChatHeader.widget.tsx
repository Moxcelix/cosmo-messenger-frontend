import React, { useCallback } from 'react';
import { Chat } from '../types/models/Chat';
import '../styles/MessageInput.css';

interface ChatHeaderWidgetProps {
    chat: Chat | null;
    onProfileClick?: () => void;
}

export const ChatHeaderWidget: React.FC<ChatHeaderWidgetProps> = ({
    chat,
    onProfileClick
}) => {
    if (!chat) {
        return null;
    }

    // Получаем первую букву названия чата для заглушки
    const firstLetter = chat.name?.charAt(0).toUpperCase() || '?';

    return (
        <div className="p-4 flex justify-center">
            <div
                className="flex items-center gap-3 p-2 pr-4 rounded-full border border-white/40 cursor-pointer w-fit max-w-full transition-all duration-200"
                style={{
                    background: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(5px)',
                }}
                onClick={onProfileClick}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)';
                }}
            >
                {chat.avatar_url ? (
                    <img
                        src={chat.avatar_url}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {firstLetter}
                    </div>
                )}
                <span className="font-semibold text-gray-900 truncate">
                    {chat.name}
                </span>
            </div>
        </div>
    );
};