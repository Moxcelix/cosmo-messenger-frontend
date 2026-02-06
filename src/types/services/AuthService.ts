import { LoginRequest } from "../requests/LoginRequest";
import { RefreshRequest } from "../requests/RefreshRequest";
import { TokenPair } from "../models/Token";
import { RegisterRequest } from "../requests/RegisterRequest";

export interface AuthService {
    login(request: LoginRequest): Promise<TokenPair>
    refresh(request: RefreshRequest): Promise<TokenPair>
    register(request: RegisterRequest): Promise<void>
    validatePassword(password: string):Promise<void>
}