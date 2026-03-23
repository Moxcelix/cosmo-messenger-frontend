import React, { useCallback, useEffect, useState } from 'react';
import { Collection } from '../types/models/Chat';
import { ChatListWidget } from './ChatList.widget';
import { ChatViewWidget } from './ChatView.widget';
import { useChat } from '../hooks/useChat';

interface ChatCompositeWidgetProps {
    initialChatId?: string | null;
}

export const ChatCompositeWidget: React.FC<ChatCompositeWidgetProps> = ({
    initialChatId = null
}) => {
    const {
        collection,
        loading: chatsLoading,
        error,
        sendingMessage,
        loadChatsHistory,
        setCurrentChatId,
        sendMessage,
        getChatScrollMeta,
        loadMoreMessages
    } = useChat();

    const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId);

    const scrollThreshold = 200

    useEffect(() => {
        // Загружаем историю чатов при монтировании
        console.log("загрузка")
        loadChatsHistory('', 'prev');
    }, []);

    useEffect(() => {
        console.log('collection changed!')
        console.log(collection)
    }, [chatsLoading]);

    useEffect(() => {
        console.log('selected chat changed')
        setCurrentChatId(selectedChatId)
        console.log(selectedChatId)
    }, [selectedChatId])

    const handleScrolledTop = useCallback(async (): Promise<void> => {
        if (!selectedChatId) return
        if (chatsLoading) return

        const scrollMeta = getChatScrollMeta(selectedChatId)

        if (scrollMeta.has_prev) {
            await loadMoreMessages(selectedChatId, 'prev');
        }
    }, [selectedChatId, chatsLoading, getChatScrollMeta, loadMoreMessages, collection])

    const handleScrolledBottom = useCallback(async (): Promise<void> => {
        if (!selectedChatId) return
        if (chatsLoading) return

        const scrollMeta = getChatScrollMeta(selectedChatId)

        if (scrollMeta.has_next) {
            await loadMoreMessages(selectedChatId, 'next');
        }
    }, [selectedChatId])

    // ChatCompositeWidget
    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Левая панель - фиксированная ширина, свой скролл */}
            <div className="w-80 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
                <ChatListWidget
                    collection={collection}
                    selectedChatId={selectedChatId}
                    onChatSelect={setSelectedChatId}
                />
            </div>

            {/* Правая панель - занимает всё оставшееся пространство */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <ChatViewWidget
                    collection={collection}
                    chatId={selectedChatId}
                    onSendMessage={sendMessage}
                    sendingMessage={sendingMessage}
                    onScrolledBottom={handleScrolledBottom}
                    onScrolledTop={handleScrolledTop}
                    loading={chatsLoading}
                />
            </div>
        </div>
    );
};