import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_USERS } from '@/data/mockData';
import { User, Role } from '@/data/types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  flatNumber: string;
  isRegularPayer?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string, flatNumber: string) => boolean;
  logout: () => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  useEffect(() => {
    const stored = localStorage.getItem('rwa_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('rwa_user'); }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return false;
    const authUser: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role, flatNumber: found.flatNumber, isRegularPayer: found.isRegularPayer };
    setUser(authUser);
    localStorage.setItem('rwa_user', JSON.stringify(authUser));
    return true;
  };

  const register = (name: string, email: string, password: string, flatNumber: string): boolean => {
    if (users.some(u => u.email === email)) return false;
    const newUser: User = { id: String(Date.now()), name, email, password, role: 'resident', flatNumber };
    setUsers(prev => [...prev, newUser]);
    const authUser: AuthUser = { id: newUser.id, name, email, role: 'resident', flatNumber };
    setUser(authUser);
    localStorage.setItem('rwa_user', JSON.stringify(authUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rwa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, allUsers: users }}>
      {children}
    </AuthContext.Provider>
  );
};
