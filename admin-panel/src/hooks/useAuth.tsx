import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import api from '../api/client';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedUser = authApi.getCurrentUser();
      if (!storedUser) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.get<{ user: User }>('/auth/me');
        setUser(data.user);
        authApi.setAuth(data.user);
      } catch {
        authApi.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, []);

  const login = async (username: string, password: string) => {
    const { user } = await authApi.login(username, password);
    authApi.setAuth(user);
    setUser(user);
  };

  const logout = async () => {
    await authApi.logout().catch(() => null);
    authApi.clearAuth();
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
