import { TokenPair } from "../../types/models/Token";
import { User } from "../../types/models/User";
import { AuthStorage } from "../../types/services/AuthStorage";

export class AuthLocalStorage implements AuthStorage {
    private readonly TOKEN_KEY = "token";
    private readonly USER_KEY = "user";

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

    setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }

    getUser(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (userStr == null) {
            return null
        }
        const user = JSON.parse(userStr) as User;
        return user
    }

    clearUser(): void {
        localStorage.removeItem(this.USER_KEY);
    }
}