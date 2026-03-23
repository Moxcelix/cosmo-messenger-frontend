import { Collection } from "../models/Chat";
import { SendMessageRequest } from "../requests/SendMessageRequest";

export interface ChatService {
    getChatsHistory(jwt: string, cursor: string, direction: string, limit: number): Promise<Collection>
    getChatMessages(jwt: string, chatId: string, cursor: string, direction: string, limit: number): Promise<Collection>
    getDirectMessages(jwt: string, username: string, cursor: string, direction: string, limit: number): Promise<Collection>
    sendDirectMessage(jwt: string, username: string, request: SendMessageRequest): Promise<void>
    sendChatMessage(jwt: string, chatId: string, request: SendMessageRequest): Promise<void>
}
