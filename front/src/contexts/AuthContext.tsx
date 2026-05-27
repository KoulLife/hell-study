import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { user as userApi, auth as authApi } from '@/lib/api';
import type { User } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userApi.getMe()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (loginId: string, password: string) => {
    await authApi.login({ loginId, password });
    const me = await userApi.getMe();
    setCurrentUser(me);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
