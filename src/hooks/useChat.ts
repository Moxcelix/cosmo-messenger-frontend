import { useCallback, useEffect, useRef, useState } from "react";
import { useServices } from "../context/ServicesContext"
import { useAuth } from "../context/AuthContext";
import { Collection } from "../types/models/Chat";
import { getErrorMessage } from "../utils/getErrorMessage";

const LIMIT = 20;

export interface ScrollMeta {
    has_next: boolean
    has_prev: boolean
}

export const useChat = () => {
    const { authorized, loading: authLoading, authFetch } = useAuth();
    const { chatService } = useServices()

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [collection, setCollection] = useState<Collection | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    const chatScrollMap = useRef(new Map<string, ScrollMeta>());

    const isLoadingChat = useRef(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        if (!authorized || authLoading || !currentChatId || loading) {
            return;
        }

        if (isLoadingChat.current) {
            return;
        }

        if (chatScrollMap.current.has(currentChatId)) {
            return;
        }

        const loadChat = async () => {
            isLoadingChat.current = true;
            try {
                const data = await getChatMessages(currentChatId, "", "prev");
                if (data) {
                    mergeCollection(data, null);
                    chatScrollMap.current.set(currentChatId, {
                        has_next: data.has_next,
                        has_prev: data.has_prev
                    });
                }
            } finally {
                isLoadingChat.current = false;
            }
        };

        loadChat();
    }, [currentChatId]);

    const getChatsHistory = useCallback(async (cursor: string, direction: string): Promise<Collection | null> => {
        setError(null);
        setLoading(true);

        try {
            const coll = await authFetch(chatService.getChatsHistory, cursor, direction, LIMIT);
            return coll;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    }, [authFetch, chatService]);

    const getChatMessages = useCallback(async (chatId: string, cursor: string, direction: string): Promise<Collection | null> => {
        setError(null);
        setLoading(true);

        try {
            const coll = await authFetch(chatService.getChatMessages, chatId, cursor, direction, LIMIT);
            return coll;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    }, [authFetch, chatService]);

    const mergeCollection = useCallback((newCollection: Collection, direction: string | null) => {
        setCollection(prevCollection => {
            if (!prevCollection) {
                return newCollection;
            }

            // Проверяем есть ли реальные изменения
            const hasNewUsers = Object.keys(newCollection.users).length > 0;
            const hasNewChats = Object.keys(newCollection.chats).length > 0;
            const hasNewMessages = Object.keys(newCollection.messages).length > 0;

            // Если нет новых данных, не обновляем
            if (!hasNewUsers && !hasNewChats && !hasNewMessages) {
                return prevCollection;
            }

            // Создаем новые объекты только если есть изменения
            const mergedUsers = hasNewUsers
                ? { ...prevCollection.users, ...newCollection.users }
                : prevCollection.users;

            const mergedChats = hasNewChats
                ? { ...prevCollection.chats, ...newCollection.chats }
                : prevCollection.chats;

            const mergedMessages = hasNewMessages
                ? { ...prevCollection.messages, ...newCollection.messages }
                : prevCollection.messages;

            const has_next = direction === "next"
                ? newCollection.has_next ?? prevCollection.has_next
                : prevCollection.has_next;
            const has_prev = direction === "prev"
                ? newCollection.has_prev ?? prevCollection.has_prev
                : prevCollection.has_prev;

            return {
                users: mergedUsers,
                chats: mergedChats,
                messages: mergedMessages,
                has_next,
                has_prev
            };
        });
    }, []);

    const loadMoreMessages = useCallback(async (chatId: string, direction: string): Promise<void> => {
        if (isLoadingChat.current) {
            return;
        }

        isLoadingChat.current = true;

        const scrollMeta = chatScrollMap.current.get(chatId);
        if (direction === "prev" && !scrollMeta?.has_prev) {
            return;
        }
        if (direction === "next" && !scrollMeta?.has_next) {
            return;
        }

        try {
            let cursor = "";

            if (direction === "prev") {
                const messagesArray = Object.values(collection?.messages || {})
                    .filter(msg => msg.chat_id === chatId)
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                cursor = messagesArray[0].id;

            } else if (direction === "next") {
                const messagesArray = Object.values(collection?.messages || {})
                    .filter(msg => msg.chat_id === chatId)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                cursor = messagesArray[0].id;
            }

            const data = await getChatMessages(chatId, cursor, direction);
            if (data && scrollMeta) {
                mergeCollection(data, null);
                chatScrollMap.current.set(chatId, {
                    has_next: direction === "next" ? data.has_next : scrollMeta.has_next,
                    has_prev: direction === "prev" ? data.has_prev : scrollMeta.has_prev
                });
            }
        } finally {
            isLoadingChat.current = false;
        }
    }, [collection, getChatMessages, mergeCollection])

    const loadChatsHistory = useCallback(async (cursor: string, direction: string): Promise<void> => {
        let newCollection = await getChatsHistory(cursor, direction)

        if (newCollection != null) {
            mergeCollection(newCollection, direction)
        }
    }, [getChatsHistory, mergeCollection])

    const getChatScrollMeta = useCallback((chatId: string): ScrollMeta => {
        return chatScrollMap.current.get(chatId) || { has_next: false, has_prev: false };
    }, []);

    const sendMessage = useCallback(async (chatId: string, content: string): Promise<boolean> => {
        setError(null);
        setSendingMessage(true);

        try {
            await authFetch(chatService.sendChatMessage, chatId, { content });
            return true;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return false;
        } finally {
            setSendingMessage(false);
        }
    }, [authFetch, chatService]);

    return {
        error,
        loading,
        collection,
        currentChatId,
        sendingMessage,
        loadChatsHistory,
        getChatScrollMeta,
        setCurrentChatId,
        sendMessage,
        loadMoreMessages,
    }
}