// ============================================================
// TAYEEBA HOUSING LTD. ERP v2.6
// Frontend: Centralized API Client
// - Auto-injects JWT Authorization header
// - Handles 401 → token refresh → retry
// - Handles network errors (offline guard)
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// In-memory token store (never store access token in localStorage)
let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _refreshPromise: Promise<boolean> | null = null;

export function setTokens(access: string, refresh: string) {
  _accessToken = access;
  _refreshToken = refresh;
  // Store refresh token in localStorage (less sensitive than access token)
  try {
    localStorage.setItem('thl_refresh', refresh);
  } catch (e) { /* storage unavailable */ }
}

export function clearTokens() {
  _accessToken = null;
  _refreshToken = null;
  try {
    localStorage.removeItem('thl_refresh');
  } catch (e) { /* storage unavailable */ }
}

export function loadRefreshToken(): string | null {
  try {
    return localStorage.getItem('thl_refresh');
  } catch (e) {
    return null;
  }
}

// Attempt to refresh the access token using the refresh token
async function refreshAccessToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refreshToken = _refreshToken || loadRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        return false;
      }

      const data = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ============================================================
// Main API fetch function
// ============================================================
export interface ApiError {
  error: string;
  code?: string;
  status: number;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkErr) {
    // Network error — API is unreachable
    throw {
      error: 'Cannot connect to the ERP server. Please check your network connection.',
      code: 'NETWORK_ERROR',
      status: 0,
    } as ApiError;
  }

  // Handle 401: attempt token refresh and retry once
  if (response.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(endpoint, options, false);
    }
    // Refresh failed — trigger logout
    clearTokens();
    throw { error: 'Session expired. Please log in again.', code: 'SESSION_EXPIRED', status: 401 } as ApiError;
  }

  // Parse response
  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw {
      error: data?.error || `Request failed with status ${response.status}`,
      code: data?.code || 'API_ERROR',
      status: response.status,
    } as ApiError;
  }

  return data as T;
}

// ============================================================
// Convenience methods
// ============================================================
export const api = {
  get: <T = any>(endpoint: string) => apiFetch<T>(endpoint, { method: 'GET' }),
  
  post: <T = any>(endpoint: string, body: any) => apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  patch: <T = any>(endpoint: string, body: any) => apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }),
  
  put: <T = any>(endpoint: string, body: any) => apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  
  delete: <T = any>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' }),

  // Health check — used by offline guard
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },
};

export default api;
