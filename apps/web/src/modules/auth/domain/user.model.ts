export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}