import api from './client';
import type { LoginResponse, User } from '../types';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: (): User | null => {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setAuth: (user: User): void => {
    // JWT is stored in an HttpOnly cookie set by the server — never accessible to JS.
    // Only the non-sensitive user object is kept in sessionStorage for UI state.
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth: (): void => {
    sessionStorage.removeItem('user');
  },
};
