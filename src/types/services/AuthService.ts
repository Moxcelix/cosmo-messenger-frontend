import { LoginRequest } from "../requests/LoginRequest";
import { RefreshRequest } from "../requests/RefreshRequest";
import { TokenPair } from "../models/Token";
import { RegisterRequest } from "../requests/RegisterRequest";
import { User } from "../models/User";

export interface AuthService {
    login(request: LoginRequest): Promise<TokenPair>
    refresh(request: RefreshRequest): Promise<TokenPair>
    register(request: RegisterRequest): Promise<void>
    validatePassword(password: string): Promise<void>
    getUser(jwt: string): Promise<User>
    resendEmail (jwt: string): Promise<void>
}