import React, { useEffect, useState, useCallback } from 'react';
import { Collection } from '../types/models/Chat';
import { getOtherUserInDirectChat } from '../utils/chatUtils';
import { useUser } from '../hooks/useUser';
import { User } from '../types/models/User';
import { useNavigate } from 'react-router-dom';
import { ChatHeaderWidget } from './ChatHeader.widget';
import { ChatMessagesWidget } from './ChatMessages.widget';
import MessageInputWidget from './MessageInput.widget';

interface ChatViewWidgetProps {
    collection: Collection | null;
    chatId: string | null;
    sendingMessage: boolean;
    loading: boolean;
    onSendMessage: (chatId: string, message: string) => Promise<boolean>;
    onScrolledBottom?: () => Promise<void>;
    onScrolledTop?: () => Promise<void>;
}

export const ChatViewWidget: React.FC<ChatViewWidgetProps> = ({
    collection,
    chatId,
    sendingMessage,
    loading,
    onSendMessage,
    onScrolledBottom,
    onScrolledTop,
}) => {
    const { getCurrentUser } = useUser();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [messageText, setMessageText] = useState('');
    const [sending, setSending] = useState(false);

    // Получаем текущего пользователя асинхронно
    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };
        loadUser();
    }, []);

    // Открытие профиля собеседника
    const openProfile = useCallback(async () => {
        if (!collection || !chatId) return;

        const chat = collection.chats[chatId];
        if (chat.type === 'direct' && user?.id) {
            const companion = getOtherUserInDirectChat(chat, user.id, collection.users);
            if (companion?.username) {
                navigate('/new/profile/' + companion.username);
            }
        }
    }, [chatId, user, collection, navigate]);

    // Отправка сообщения
    const handleSendMessage = useCallback(async (message: string) => {
        if (!message.trim() || !chatId) return;

        const success = await onSendMessage(chatId, message);
        if (success) {
            setMessageText(''); // Очищаем только при успешной отправке
        }
    }, [chatId, onSendMessage]);

    const handleStopTyping = useCallback(() => {
        // TODO: Реализовать уведомление о прекращении ввода
        console.log('Stopped typing');
    }, []);

    // Проверяем, есть ли чат для отображения
    if (!chatId || !collection) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Выберите чат для начала общения</p>
                </div>
            </div>
        );
    }

    const chat = collection.chats[chatId];
    if (!chat) {
        return (
            <div className="flex flex-col h-full bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Чат не найден</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col h-full">

            {/* Список сообщений - занимает все доступное пространство */}
            <ChatMessagesWidget
                collection={collection}
                chatId={chatId}
                currentUser={user}
                onScrolledBottom={onScrolledBottom}
                onScrolledTop={onScrolledTop}
                loading={loading}
                bottomPadding={80} // Отступ снизу для поля ввода
            />
            <div className="absolute bottom-0-0 left-0 right-0 bg-gradient-to-b from-purple-100 via-purple-100/50 to-transparent pt-2 pb-0 px-4">
                {/* Шапка чата - фиксированная */}
                <ChatHeaderWidget
                    chat={chat}
                    onProfileClick={openProfile}
                />
            </div>
            {/* Поле ввода сообщений - поверх списка сообщений */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-100 via-blue-100/50 to-transparent pt-0 pb-2 px-4">
                <MessageInputWidget
                    newMessage={messageText}
                    onMessageChange={setMessageText}
                    onSendMessage={handleSendMessage}
                    sending={sending}
                    onStopTyping={handleStopTyping}
                    displayName={chat.type === 'direct' ? chat.name : undefined}
                />
            </div> 
        </div>
    );
};