import { TokenPair } from "../models/Token";

export interface AuthStorage {
    setToken(pair: TokenPair): void
    getToken(): TokenPair | null
    clearToken(): void
    hasToken(): boolean
}