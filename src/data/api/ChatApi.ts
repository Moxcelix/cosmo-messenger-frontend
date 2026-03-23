import { Collection } from "../../types/models/Chat";
import { SendMessageRequest } from "../../types/requests/SendMessageRequest";
import { ChatService } from "../../types/services/ChatService";
import { formatError } from "../../utils/formatError";

const BASE_URL = '/api/v2/chat'

export class ChatApi implements ChatService {
    async getChatsHistory(jwt: string, cursor: string, direction: string, limit: number): Promise<Collection> {
        const response = await fetch(`${BASE_URL}/history?cursor=${cursor}&direction=${direction}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }

        return await response.json();
    }

    async getChatMessages(jwt: string, chatId: string, cursor: string, direction: string, limit: number): Promise<Collection> {
        const response = await fetch(`${BASE_URL}/${chatId}/messages?cursor=${cursor}&direction=${direction}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }

        return await response.json();
    }

    async getDirectMessages(jwt: string, username: string, cursor: string, direction: string, limit: number): Promise<Collection> {
        const response = await fetch(`${BASE_URL}/direct/${username}/messages?cursor=${cursor}&direction=${direction}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }

        return await response.json();
    }

    async sendDirectMessage(jwt: string, username: string, request: SendMessageRequest): Promise<void> {
        const response = await fetch(`${BASE_URL}/direct/${username}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }
    }

    async sendChatMessage(jwt: string, chatId: string, request: SendMessageRequest): Promise<void> {
        const response = await fetch(`${BASE_URL}/${chatId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }
    }

}