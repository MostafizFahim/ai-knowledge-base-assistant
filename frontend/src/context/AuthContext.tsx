import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from '../api/types';

type AuthContextValue = {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setSession: (response: AuthResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('kb_token'));
  const [email, setEmail] = useState(() => localStorage.getItem('kb_email'));

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      email,
      isAuthenticated: Boolean(token),
      setSession: (response) => {
        localStorage.setItem('kb_token', response.token);
        localStorage.setItem('kb_email', response.email);
        setToken(response.token);
        setEmail(response.email);
      },
      logout: () => {
        localStorage.removeItem('kb_token');
        localStorage.removeItem('kb_email');
        setToken(null);
        setEmail(null);
      }
    };
  }, [email, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
