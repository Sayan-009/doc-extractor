import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// URLs that should never trigger a token refresh attempt
const AUTH_URLS = ['/auth/login', '/auth/signup', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Don't try to refresh for auth endpoints themselves
    const isAuthRequest = AUTH_URLS.some(url => requestUrl.includes(url));

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        useAuthStore.getState().setAuth(data.user, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout();
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/') {
          window.location.href = '/login';
        }
        // Reject with the ORIGINAL error so the user sees "Invalid credentials" not "Refresh token not found"
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
