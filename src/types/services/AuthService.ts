import { LoginRequest } from "../requests/LoginRequest";
import { RefreshRequest } from "../requests/RefreshRequest";
import { TokenPair } from "../models/Token";
import { RegisterRequest } from "../requests/RegisterRequest";
import { User } from "../models/User";
import { ChangeEmailRequest } from "../requests/ChangeEmailRequest";
import { ChangePasswordRequest } from "../requests/CahngePasswordRequest";
import { ChangeUsernamRequest } from "../requests/ChangeUsernameRequest";

export interface AuthService {
    login(request: LoginRequest): Promise<TokenPair>
    refresh(request: RefreshRequest): Promise<TokenPair>
    register(request: RegisterRequest): Promise<void>
    validatePassword(password: string): Promise<void>
    activateConfirm(token: string): Promise<void>

    getUser(jwt: string): Promise<User>
    deleteUser(jwt: string): Promise<void>
    resendEmail(jwt: string): Promise<void>
    changeEmail(jwt: string, request: ChangeEmailRequest): Promise<void>
    changePassword(jwt: string, request: ChangePasswordRequest): Promise<void>
    changeUsername(jwt: string, request: ChangeUsernamRequest): Promise<void>
}