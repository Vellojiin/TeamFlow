import { apiClient } from "@/src/core/api-client";
import { AuthTokens, User } from "../domain/user.model";

export async function registerUser(email: string, name: string, password: string){
return apiClient<User>("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({
        email,
        name,
        password
        })
    })
}

export async function loginUser(email: string, password: string): Promise<AuthTokens> {
    return apiClient<AuthTokens>("/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
            email,
            password
        })
    })
}

export async function getCurrentUser(): Promise<User> {
    return apiClient<User>("auth/me")
}

export async function logoutUser(refreshToken: string): Promise<void> {
    await apiClient("auth/logout", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({
            refreshToken
        })
    })
}