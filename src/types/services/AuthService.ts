import { LoginRequest } from "../requests/LoginRequest";
import { RefreshRequest } from "../requests/RefreshRequest";
import { TokenPair } from "../models/Token";
import { RegisterRequest } from "../requests/RegisterRequest";
import { User } from "../models/User";
import { ChangeEmailRequest } from "../requests/ChangeEmailRequest";

export interface AuthService {
    login(request: LoginRequest): Promise<TokenPair>
    refresh(request: RefreshRequest): Promise<TokenPair>
    register(request: RegisterRequest): Promise<void>
    validatePassword(password: string): Promise<void>
    activateConfirm(token: string): Promise<void>

    getUser(jwt: string): Promise<User>
    resendEmail(jwt: string): Promise<void>
    changeEmail(jwt: string, request: ChangeEmailRequest): Promise<void>
}