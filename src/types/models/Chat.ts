export interface Member{
    user_id: string
    role: string
    joined_at: string
}

export interface Chat {
    id: string
    type: string
    name: string
    avatar_url: string
    description: string
    created_at: string
    updated_at: string
    members: Member[]
}

export interface Message{
    id: string
    chat_id: string
    sender_id: string
    content: string
    reply_to_id: string
    edited: boolean
    context_type: string
    created_at: string
}

export interface User{
    user_id: string
    username: string
    display_name: string
    avatar_url: string
}

export interface Collection {
    users: Record<string, User>;
    chats: Record<string, Chat>;
    messages: Record<string, Message>;
    has_next: boolean;
    has_prev: boolean;
}