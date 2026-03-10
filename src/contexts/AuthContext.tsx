import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type Role = 'resident' | 'admin' | 'collector';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  flatNumber: string;
  isRegularPayer?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, flatNumber: string) => Promise<boolean>;
  logout: () => void;
}

// ─── API base URL (change to your deployed backend URL in production) ─────────
const API_URL = 'http://localhost:3001/api';

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app load
  useEffect(() => {
    const stored = localStorage.getItem('rwa_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('rwa_user'); }
    }
    setLoading(false);
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const { user: apiUser, token } = await res.json();
      setUser(apiUser);
      localStorage.setItem('rwa_user', JSON.stringify(apiUser));
      localStorage.setItem('rwa_token', token);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  // ─── Register ────────────────────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string,
    flatNumber: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, flatNumber }),
      });
      if (!res.ok) return false;
      const { user: apiUser, token } = await res.json();
      setUser(apiUser);
      localStorage.setItem('rwa_user', JSON.stringify(apiUser));
      localStorage.setItem('rwa_token', token);
      return true;
    } catch (err) {
      console.error('Register failed:', err);
      return false;
    }
  };

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('rwa_user');
    localStorage.removeItem('rwa_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
