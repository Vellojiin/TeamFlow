"use client"

import { User } from "../domain/user.model";
import { apiClient } from "@/src/core/api-client";
import { authStorage } from "@/src/core/auth-storage";
import { createContext, createElement, ReactNode, useCallback, useContext, useEffect, useState } from "react";


interface AuthState {
    user: User | null;
    isLoading: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    register: (email: string, name: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

interface AuthProviderProps {
    children: ReactNode
}

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const accessToken = authStorage.getAccessToken();

        if(!accessToken) {
            setUser(null);
            return;
        }

        try {
            const currentUser = await apiClient<User>("/auth/me");
            setUser(currentUser);
        } catch {
            authStorage.clearTokens();
            setUser(null)
        }
    }, 
    []); //El callback hace la consulta a api/auth/me, si no existe usuario logueado se destruye el token.

    const login = useCallback( async ( email: string, password: string ) => {

        const data = await apiClient<LoginResponse>("/auth/login", {
            method: "POST",
            skipAuth: true,
            body: JSON.stringify({
                email,
                password
            })
        })

        authStorage.setTokens(data.accessToken, data.refreshToken);
        const currentUser = await apiClient<User>("/auth/me");
        setUser(currentUser);

    }, 
    []) //Loguea el usuario lo guarda en la sesion actual y verifica el token

    const register = useCallback(async (email: string, name: string, password: string) => {
        await apiClient<User>("/auth/register", {
            method: "POST",
            skipAuth: true,
            body: JSON.stringify({
                email,
                name,
                password
            })
        })

        await login(email, password);
    }, 
    [login]) //Registra el usuario y lo loguea

    const logout = useCallback(async () => {
        const refreshToken = authStorage.getRefreshToken();

        try {
            if(refreshToken) {
                await apiClient("/auth/logout", {
                    method: "POST",
                    skipAuth: true,
                    body: JSON.stringify({
                        refreshToken
                    })
                })
            } 
        } finally {
                authStorage.clearTokens();
                setUser(null);
            }
    }, 
    [])

    useEffect(() => {
        const hydrateUser = async () => {
            try {
                await refreshUser();
            } finally {
                setIsLoading(false);
            }
        };

        void hydrateUser();
    }, [refreshUser]);

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser
    };

    return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useauth debe utilizarse dentro de un AuthProvider")
    }

    return context
}