import { User } from "../entities/user";
import { AuthSession } from "../models/auth-session";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthRepository {
    login(credentials: LoginCredentials): Promise<AuthSession>
    register(data: RegisterData): Promise<User>
    getCurrentUser(): Promise<User>
    refresh(refreshToken: string): Promise<AuthRepository>
    logout(refreshToken: string): Promise<void>
}