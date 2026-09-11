const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type ApiOptions = RequestInit & {
  token?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { token, headers, ...fetchOptions } = options;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let message = "Something went wrong";
    let errorData: unknown = null;

    try {
      const body = await response.json();
      errorData = body;

      if (typeof body.message === "string") {
        message = body.message;
      } else if (Array.isArray(body.message)) {
        message = body.message.join(", ");
      }
    } catch {
      // Ignorar errores al parsear el JSON si el backend no devolvió un cuerpo JSON válido.
    }

    // Usar ApiError personalizado para capturar status HTTP (401, 403, 404, etc.)
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}