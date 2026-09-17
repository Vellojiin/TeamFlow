const ACCESS_TOKEN_KEY = "teamflow_access_token"
const REFRESH_TOKEN_KEY = "teamflow_refresh_token"

export const authStorage = {
    getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken(token: string): void {
        if(typeof window === "undefined") return;
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
    },

    getRefreshToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY)
    },

    setRefreshToken(token: string): void {
        if (typeof window === "undefined") return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token)
    },

    setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
        this.setRefreshToken(refreshToken);
    }
    },

    clearTokens(): void{
        if(typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
}