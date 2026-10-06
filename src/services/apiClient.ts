// Centralized API client service
// Handles communication with the Node.js + Express backend

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  public statusCode: number;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string;
  orderToken?: string;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, orderToken, params, headers, body, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const defaultHeaders: Record<string, string> = {};

  // If body is FormData (file upload), let browser set Content-Type with multipart boundary
  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Shopkeeper JWT auth
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Customer order tracking token
  if (orderToken) {
    defaultHeaders['x-order-token'] = orderToken;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    body: isFormData
      ? (body as FormData)
      : body !== undefined
      ? JSON.stringify(body)
      : undefined,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      let errorDetails: unknown = null;

      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        errorDetails = errorJson.errors || errorJson.data || errorJson;
      } catch {
        // Response was not JSON
      }

      if (response.status === 401) {
        // Trigger auth event or handle expired session if needed
      }

      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();

    // The backend uses standardized ApiResponse: { statusCode, data, message, success }
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      (error as Error).message || 'Unable to communicate with the server. Please check your network connection.',
      0
    );
  }
}
