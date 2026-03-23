import { Collection, Chat, Message, User } from "../types/models/Chat";

export const getLastMessageForChat = (chatId: string, messages: Record<string, Message>): Message | undefined => {
    const chatMessages = Array.from(Object.values(messages))
        .filter(msg => msg.chat_id === chatId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return chatMessages[0];
};

export const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн`;
    
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};

export const getOtherUserInDirectChat = (chat: Chat, currentUserId: string, users: Record<string, User>): User | undefined => {
    if (chat.type !== 'direct') return undefined;
    
    const otherMember = chat.members.find(member => member.user_id !== currentUserId);
    return otherMember ? users[otherMember.user_id] : undefined;
};