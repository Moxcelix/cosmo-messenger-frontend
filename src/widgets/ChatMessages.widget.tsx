import React, { useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { Collection } from '../types/models/Chat';
import { User } from '../types/models/User';
import { formatMessageTime } from '../utils/chatUtils';

interface ChatMessagesWidgetProps {
    collection: Collection | null;
    chatId: string | null;
    currentUser: User | null;
    showNames?: boolean;
    loading?: boolean;
    hasOlder?: boolean;
    hasNewer?: boolean;
    onScrollToBottom?: () => void;
    onScrolledBottom?: () => Promise<void>;
    onScrolledTop?: () => Promise<void>;
    showScrollToBottom?: boolean;
    bottomPadding?: number;
    showEmptyState?: boolean;
    displayName?: string;
}

// Функция для проверки, состоит ли текст только из эмодзи
const isOnlyEmojis = (text: string): boolean => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    
    // Эмодзи и их модификаторы
    const emojiRegex = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji}\u200D(?:\p{Emoji}|\p{Emoji_Presentation})*|\p{Extended_Pictographic})+(?:\u200D\p{Emoji})*$/u;
    
    // Дополнительная проверка: если в строке есть обычные цифры или буквы, это не чистый эмодзи
    const hasNormalCharacters = /[a-zA-Z0-9а-яА-Я]/.test(trimmed);
    
    return !hasNormalCharacters && emojiRegex.test(trimmed);
};
export const ChatMessagesWidget: React.FC<ChatMessagesWidgetProps> = ({
    collection,
    chatId,
    currentUser,
    showNames = false,
    loading = false,
    hasOlder = false,
    hasNewer = false,
    onScrollToBottom,
    onScrolledBottom,
    onScrolledTop,
    showScrollToBottom = false,
    bottomPadding = 0,
    showEmptyState = false,
    displayName
}) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Флаги для управления скроллом
    const hasInitialScrolledRef = useRef(false);
    const isLoadingOlderRef = useRef(false);

    // Сохраняем позицию скролла перед загрузкой
    const scrollPositionBeforeLoadRef = useRef({ scrollTop: 0, scrollHeight: 0 });

    // Форматирование времени
    const formatTime = useCallback((timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    // Форматирование даты для группировки
    const formatDate = useCallback((timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return 'Сегодня';
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Вчера';
        }

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    }, []);

    // Группировка сообщений по датам
    const groupMessagesByDate = useCallback((messages: any[]) => {
        const groups: { date: string; messages: any[] }[] = [];
        let currentDate: string | null = null;

        messages.forEach(message => {
            const messageDate = formatDate(message.created_at);

            if (messageDate !== currentDate) {
                groups.push({
                    date: messageDate,
                    messages: [message]
                });
                currentDate = messageDate;
            } else {
                groups[groups.length - 1].messages.push(message);
            }
        });

        return groups;
    }, [formatDate]);

    // Получаем сообщения для чата и группируем их
    const messageGroups = useMemo(() => {
        if (!chatId || !collection) return [];

        const messagesArray = Object.values(collection.messages)
            .filter(msg => msg.chat_id === chatId)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        return groupMessagesByDate(messagesArray);
    }, [chatId, collection, groupMessagesByDate]);

    // Функция скролла вниз
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'instant') => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior
            });
        }
    }, []);

    // Функция для сохранения позиции скролла перед загрузкой
    const saveScrollPosition = useCallback(() => {
        if (messagesContainerRef.current) {
            scrollPositionBeforeLoadRef.current = {
                scrollTop: messagesContainerRef.current.scrollTop,
                scrollHeight: messagesContainerRef.current.scrollHeight
            };

            console.log(messagesContainerRef.current.scrollHeight)
            console.log(messagesContainerRef.current.scrollTop)
        }
    }, []);

    // Функция для восстановления позиции скролла после загрузки
    const restoreScrollPosition = useCallback(() => {
        if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            const heightDiff = newScrollHeight - scrollPositionBeforeLoadRef.current.scrollHeight;
            console.log(`diff: ${heightDiff}`)
            console.log(`top: ${scrollPositionBeforeLoadRef.current.scrollTop}`)
            console.log(`new top: ${messagesContainerRef.current.scrollTop}`)
            messagesContainerRef.current.scrollTop = scrollPositionBeforeLoadRef.current.scrollTop + heightDiff;
            saveScrollPosition()
        }
    }, [saveScrollPosition]);

    const handleScrolling = useCallback(async (e: React.UIEvent<HTMLDivElement>) => {
        if (isLoadingOlderRef.current) {
            return
        }

        const scrollThreshold = 400
        const target = e.currentTarget;
        const scrollTop = target.scrollTop;
        const scrollHeight = target.scrollHeight;
        const clientHeight = target.clientHeight;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;

        console.log(scrollTop)

        if (scrollTop < scrollThreshold) {
            isLoadingOlderRef.current = true;
            await onScrolledTop?.();
            saveScrollPosition();
        }

        if (scrollBottom < scrollThreshold) {
            await onScrolledBottom?.();
        }
    }, [onScrolledTop, onScrolledBottom, saveScrollPosition])

    useLayoutEffect(() => {
        if (isLoadingOlderRef.current && messageGroups.length > 0) {
            restoreScrollPosition();
            isLoadingOlderRef.current = false;
        }
    }, [messageGroups]);

    // Первоначальный скролл вниз при загрузке чата
    useLayoutEffect(() => {
        if (!hasInitialScrolledRef.current && messageGroups.length > 0 && !loading) {
            scrollToBottom('auto');
            hasInitialScrolledRef.current = true;
        }
    }, [messageGroups, loading, hasInitialScrolledRef]);

    // Сброс флага при смене чата
    useEffect(() => {
        hasInitialScrolledRef.current = false;
        isLoadingOlderRef.current = false;
    }, [chatId]);

    // Проверка наличия чата
    if (!chatId || !collection) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Выберите чат для начала общения</p>
            </div>
        );
    }

    const chat = collection.chats[chatId];
    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Чат не найден</p>
            </div>
        );
    }

    const totalMessages = messageGroups.reduce((acc, group) => acc + group.messages.length, 0);

    return (
        <div className="flex-1 flex flex-col min-h-0 relative bg-gradient-to-b from-purple-100 to-blue-100">
            {/* Контейнер сообщений */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScrolling}
                className="flex-1 overflow-y-auto"
                style={{
                    height: '100%',
                    maxHeight: '100%',
                }}
            >
                <div className="flex flex-col">
                    {totalMessages > 0 ? (
                        <div className="px-4 py-2">
                            {messageGroups.map((group, groupIndex) => (
                                <div key={groupIndex} className="space-y-3">
                                    {/* Разделитель даты */}
                                    <div className="flex justify-center my-4">
                                        <div className="bg-white/50 px-3 py-1 rounded-full text-xs text-gray-600">
                                            {group.date}
                                        </div>
                                    </div>

                                    {/* Сообщения группы */}
                                    {group.messages.map((message) => {
                                        const isOwn = message.sender_id === currentUser?.id;
                                        const sender = collection.users[message.sender_id];
                                        const onlyEmojis = isOnlyEmojis(message.content);
                                        const emojiSize = onlyEmojis ? 'text-5xl' : '';

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-md lg:max-w-lg ${onlyEmojis ? '' : 'px-4 py-2 rounded-2xl'} ${isOwn
                                                    ? onlyEmojis ? 'text-blue-500' : 'bg-blue-500 text-white rounded-br-none'
                                                    : onlyEmojis ? 'text-gray-800' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}>
                                                    {/* Имя отправителя (для групповых чатов) */}
                                                    {(!isOwn && showNames) && sender && (
                                                        <div className="font-medium text-sm mb-1 text-purple-600">
                                                            {sender.display_name || sender.username}
                                                        </div>
                                                    )}

                                                    {/* Текст сообщения */}
                                                    <div className={`break-words whitespace-pre-wrap ${onlyEmojis ? emojiSize : 'text-sm'}`}>
                                                        {message.content}
                                                    </div>

                                                    {/* Время и статус редактирования (только не для эмодзи-сообщений, чтобы не портить вид) */}
                                                    {!onlyEmojis && (
                                                        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            {formatTime(message.created_at)}
                                                            {message.edited && ' (ред.)'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : showEmptyState ? (
                        // Пустое состояние для нового чата
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20">
                            <div className="text-center">
                                <div className="text-6xl mb-4">👋</div>
                                <h3 className="text-lg font-medium mb-2">Начните общение</h3>
                                <p className="text-sm">
                                    Отправьте первое сообщение {displayName || chat.name}
                                </p>
                                <p className="text-xs mt-2 text-gray-400">
                                    Чат будет создан автоматически
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Обычное пустое состояние
                        <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500">Нет сообщений в этом чате</p>
                        </div>
                    )}

                    <div ref={messagesEndRef} />

                    {/* Отступ снизу */}
                    {totalMessages > 0 && bottomPadding > 0 && (
                        <div className="w-full" style={{ height: `${bottomPadding}px` }} />
                    )}
                </div>
            </div>

            {/* Кнопка прокрутки вниз */}
            {showScrollToBottom && (
                <div
                    className="absolute right-4 z-50 transition-all duration-300"
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
            )}
        </div>
    );
};