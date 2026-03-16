'use client';

// ─── Auth Context (Unified Next.js App) ──────────────────────
// Uses local API routes and JWT storage in localStorage

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fitspace_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.getMe();
        setUser(user);
      } catch (err) {
        console.error('Auth init failed:', err);
        localStorage.removeItem('fitspace_token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const { token, user } = await api.login(credentials);
    localStorage.setItem('fitspace_token', token);
    setUser(user);
    router.push('/dashboard');
  };

  const register = async (data) => {
    const { token, user } = await api.register(data);
    localStorage.setItem('fitspace_token', token);
    setUser(user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('fitspace_token');
    setUser(null);
    router.push('/login');
  };

  const updateUserInfo = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return safe default during SSR
    return { user: null, loading: true, login: () => {}, register: () => {}, logout: () => {}, updateUserInfo: () => {} };
  }
  return ctx;
}

// ─── Protected Route Wrapper ────────────────────────────────
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse-soft text-lavender-dark font-bold">FitSpace...</div>
      </div>
    );
  }

  return user ? children : null;
}
