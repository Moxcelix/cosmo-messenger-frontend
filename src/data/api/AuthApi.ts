import { TokenPair } from "../../types/models/Token";
import { User } from "../../types/models/User";
import { ChangePasswordRequest } from "../../types/requests/CahngePasswordRequest";
import { ChangeEmailRequest } from "../../types/requests/ChangeEmailRequest";
import { ChangeUsernamRequest } from "../../types/requests/ChangeUsernameRequest";
import { LoginRequest } from "../../types/requests/LoginRequest";
import { RefreshRequest } from "../../types/requests/RefreshRequest";
import { RegisterRequest } from "../../types/requests/RegisterRequest";
import { AuthService } from "../../types/services/AuthService";
import { formatError } from "../../utils/formatError";

//const BASE_URL = 'https://cosmomessenger.ru/api/v2/auth'
const BASE_URL = '/api/v2/auth'

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

    async getUser(jwt: string): Promise<User> {
        const response = await fetch(`${BASE_URL}/user`, {
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

    async resendEmail(jwt: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/user/activate/resend`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }
    }

    async activateConfirm(token: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/user/activate/confirm?token=${token}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }
    }

    async changeEmail(jwt: string, request: ChangeEmailRequest): Promise<void> {
        const response = await fetch(`${BASE_URL}/user/email/change`, {
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

    async changePassword(jwt: string, request: ChangePasswordRequest): Promise<void> {
        const response = await fetch(`${BASE_URL}/user/password/change`, {
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

    async changeUsername(jwt: string, request: ChangeUsernamRequest): Promise<void> {
        const response = await fetch(`${BASE_URL}/user/username/change`, {
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

    async deleteUser(jwt: string): Promise<void> {
        const response = await fetch(`${BASE_URL}/user`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            await formatError(response);
        }
    }
}