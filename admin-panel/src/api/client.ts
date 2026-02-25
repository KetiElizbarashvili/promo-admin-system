import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Send the HttpOnly auth cookie on every request
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle 401 responses — redirect to login except during the login request itself
// (a failed login legitimately returns 401; we want that error to surface in the UI)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
