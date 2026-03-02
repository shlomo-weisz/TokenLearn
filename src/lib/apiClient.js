const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const AUTH_TOKEN_KEY = 'authToken';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredAuthToken(token) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const token = getStoredAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || payload?.errorCode || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export function normalizeAuthPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { token: null, user: null, raw: payload };
  }

  const token = payload.token || payload.jwt || payload.jwtToken || payload.accessToken || payload.access_token || null;
  const user = payload.user || payload.profile || payload.userDto || payload.currentUser || null;

  return { token, user, raw: payload };
}
