import { TokenPair } from "../../types/models/Token";
import { AuthStorage } from "../../types/services/AuthStorage";

export class AuthLocalStorage implements AuthStorage {
    private readonly TOKEN_KEY = "token";

    setToken(pair: TokenPair): void {
        localStorage.setItem(this.TOKEN_KEY, JSON.stringify(pair))
    }
    getToken(): TokenPair | null {
        const tokenStr = localStorage.getItem(this.TOKEN_KEY);
        if (tokenStr == null) {
            return null
        }
        const token = JSON.parse(tokenStr) as TokenPair;
        return token
    }
    clearToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }
    hasToken(): boolean {
        return this.getToken() !== null;
    }
}