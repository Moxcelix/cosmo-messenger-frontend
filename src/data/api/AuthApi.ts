import { TokenPair } from "../../types/models/Token";
import { LoginRequest } from "../../types/requests/LoginRequest";
import { RefreshRequest } from "../../types/requests/RefreshRequest";
import { RegisterRequest } from "../../types/requests/RegisterRequest";
import { AuthService } from "../../types/services/AuthService";
import { formatError } from "../../utils/formatError";

const BASE_URL = 'https://cosmomessenger.ru/api/v2/auth'

export class AuthApi implements AuthService {
    async login(request: LoginRequest): Promise<TokenPair> {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }

        const data: TokenPair = await response.json();
        return data;
    }

    async refresh(request: RefreshRequest): Promise<TokenPair> {
        const response = await fetch(`${BASE_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }

        const data: TokenPair = await response.json();
        return data;
    }

    async register(request: RegisterRequest): Promise<void> {
        const response = await fetch(`${BASE_URL}/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }
    }

    async validatePassword(password: string): Promise<void> {
        const encodedPassword = encodeURIComponent(password);

        const response = await fetch(`${BASE_URL}/password/validate?password=${encodedPassword}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }

        return;
    }
}