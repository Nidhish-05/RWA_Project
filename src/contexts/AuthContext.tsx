import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ResidentType, VehicleFormData, TenantDetails } from '@/data/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export type Role = 'resident' | 'admin' | 'collector';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  flatNumber: string;
  floorNumber?: string;
  phone?: string;
  alternatePhone?: string;
  residentType?: ResidentType;
  isRegularPayer?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  flatNumber: string;
  floorNumber: string;
  residentType: ResidentType;
  tenantDetails?: TenantDetails;
  vehicles: VehicleFormData[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// ─── API base URL ─────────────────────────────────────────────────────────────
const API_URL = 'https://rwa-backend-51n6.onrender.com/api';

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
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
      const { user: apiUser, token } = await res.json();
      setUser(apiUser);
      localStorage.setItem('rwa_user', JSON.stringify(apiUser));
      localStorage.setItem('rwa_token', token);
      return { success: true };
    } catch (err: any) {
      console.error('Login failed:', err);
      return { success: false, error: 'Network error — could not reach server. Check CORS / backend URL.' };
    }
  };

  // ─── Register ────────────────────────────────────────────────────────────
  const register = async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      // Strip imageFile from vehicles (can't send File via JSON)
      const vehiclesPayload = payload.vehicles.map(({ imageFile, ...rest }) => rest);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, vehicles: vehiclesPayload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || `Server error (${res.status})` };
      }
      const { user: apiUser, token } = await res.json();
      setUser(apiUser);
      localStorage.setItem('rwa_user', JSON.stringify(apiUser));
      localStorage.setItem('rwa_token', token);
      return { success: true };
    } catch (err: any) {
      console.error('Register failed:', err);
      return { success: false, error: 'Network error — could not reach server. Check CORS / backend URL.' };
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
