import { TokenPair } from "../models/Token";
import { User } from "../models/User";

export interface AuthStorage {
    setToken(pair: TokenPair): void
    getToken(): TokenPair | null
    clearToken(): void
    hasToken(): boolean
    setUser(user: User): void
    getUser(): User | null
    clearUser(): void
}