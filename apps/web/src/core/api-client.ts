import { authStorage } from "./auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(customHeaders);
  if (!(restOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = authStorage.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response = await fetch(url, {
    ...restOptions,
    headers,
  });

  // Manejo de expiración de Access Token (401) con rotación transparente
  if (response.status === 401 && !skipAuth && !endpoint.includes("/auth/")) {
    if (isRefreshing) {
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(url, { ...restOptions, headers });
      } catch (err) {
        throw err;
      }
    } else {
      isRefreshing = true;
      const refreshToken = authStorage.getRefreshToken();

      if (!refreshToken) {
        authStorage.clearTokens();
        isRefreshing = false;
        throw new ApiError(401, "Sesión expirada");
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Refresh token inválido");
        }

        const data = await refreshResponse.json();
        authStorage.setTokens(data.accessToken, data.refreshToken);

        processQueue(null, data.accessToken);
        isRefreshing = false;

        headers.set("Authorization", `Bearer ${data.accessToken}`);
        response = await fetch(url, { ...restOptions, headers });
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        authStorage.clearTokens();
        isRefreshing = false;
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new ApiError(401, "Sesión expirada");
      }
    }
  }

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (_) {
      // Si la respuesta no es JSON
    }
    const errorMessage = Array.isArray(errorData.message)
  ? errorData.message.join(", ")
  : errorData.message || "Error en la petición HTTP";
    throw new ApiError(response.status, errorMessage, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}