import React, { useMemo, useState, useEffect } from 'react';
import { Collection, Chat, Message } from '../types/models/Chat';
import { formatMessageTime, getLastMessageForChat } from '../utils/chatUtils';
import { useUser } from '../hooks/useUser';

interface ChatListWidgetProps {
    collection: Collection | null;
    selectedChatId?: string | null;
    onChatSelect: (chatId: string) => void;
}

export const ChatListWidget: React.FC<ChatListWidgetProps> = ({
    collection,
    selectedChatId,
    onChatSelect
}) => {
    // ✅ Все хуки вызываются в одном порядке на каждом рендере
    const { getCurrentUser } = useUser();
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // ✅ useEffect для загрузки пользователя
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getCurrentUser();
                setCurrentUserId(user?.id || null);
            } catch (error) {
                console.error('Failed to load user:', error);
                setCurrentUserId(null);
            }
        };
        loadUser();
    }, [getCurrentUser]);

    // ✅ Функция форматирования (не хук, не зависит от порядка)
    const formatMessagePreview = (message: Message | undefined, userId: string | null) => {
        if (!message) return 'Нет сообщений';
        
        if (message.sender_id === userId) {
            return `Вы: ${message.content}`;
        }
        
        const sender = collection?.users[message.sender_id];
        const senderName = sender?.display_name || sender?.username || 'Пользователь';
        return `${senderName}: ${message.content}`;
    };

    // ✅ useMemo — хуки только в топ-уровне
    const chatsWithLastMessage = useMemo(() => {
        if (!collection) return [];
        
        const chatsArray = Object.values(collection.chats);
        if (chatsArray.length === 0) return [];
        
        return chatsArray
            .map(chat => {
                const lastMessage = getLastMessageForChat(chat.id, collection.messages);
                return {
                    ...chat,
                    lastMessage,
                    lastMessageTime: lastMessage?.created_at,
                    messagePreview: formatMessagePreview(lastMessage, currentUserId)
                };
            })
            .sort((a, b) => {
                const timeA = new Date(a.updated_at).getTime();
                const timeB = new Date(b.updated_at).getTime();
                return timeB - timeA;
            });
    }, [collection, currentUserId]);

    // Ранний возврат ПОСЛЕ всех хуков
    if (!collection || Object.values(collection.chats).length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Нет доступных чатов
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100">
            {chatsWithLastMessage.map(chat => (
                <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id)}
                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChatId === chat.id ? 'bg-blue-50' : ''
                        }`}
                >
                    <div className="relative flex-shrink-0">
                        <img
                            src={chat.avatar_url || '/default-avatar.png'}
                            alt={chat.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {chat.name}
                            </h3>
                            {chat.lastMessageTime && (
                                <span className="text-xs text-gray-500">
                                    {formatMessageTime(chat.lastMessageTime)}
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-600 truncate">
                            {chat.messagePreview}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};