import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser } from '../types';
import { shopkeeperService } from '../services/shopkeeperService';
import type { LoginCredentials, RegisterShopkeeperPayload } from '../services/shopkeeperService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterShopkeeperPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'printflow_shopkeeper_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed: AuthUser = JSON.parse(stored);
          if (parsed?.token) {
            try {
              // Verify token with backend /auth/me
              const verifiedUser = await shopkeeperService.getCurrentUser(parsed.token);
              setUser(verifiedUser);
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(verifiedUser));
            } catch {
              // Token expired or invalid
              localStorage.removeItem(AUTH_STORAGE_KEY);
              setUser(null);
            }
          }
        }
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authUser = await shopkeeperService.login(credentials);
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterShopkeeperPayload) => {
    setIsLoading(true);
    try {
      const authUser = await shopkeeperService.register(payload);
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const currentToken = user?.token;
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (currentToken) {
      await shopkeeperService.logout(currentToken);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
