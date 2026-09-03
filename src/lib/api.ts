import { getAuthToken, signOut } from '@/lib/authStore';

// Override for local/staging testing via `.env`: EXPO_PUBLIC_API_URL=https://staging.example.com/app
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://refundmoney.tro247.online/app';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 15000;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError(0, 'Kết nối quá chậm, vui lòng thử lại.');
    }
    throw new ApiError(0, 'Không thể kết nối máy chủ, kiểm tra lại mạng.');
  } finally {
    clearTimeout(timeoutId);
  }

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      signOut().catch(() => {});
    }
    let message = `Yêu cầu thất bại (HTTP ${res.status})`;
    if (body && typeof body === 'object' && 'error' in body) {
      message = String((body as { error: unknown }).error);
    }
    throw new ApiError(res.status, message);
  }

  return body as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
};
