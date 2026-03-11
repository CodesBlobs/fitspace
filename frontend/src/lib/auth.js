'use client';

// ─── Auth Context ───────────────────────────────────────────
// Provides login/logout/register + protected route wrapper

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Restore user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('fitspace_token');
    const stored = localStorage.getItem('fitspace_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('fitspace_token', token);
      localStorage.setItem('fitspace_user', JSON.stringify(user));
      setUser(user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // alert or set error state if handled higher up
      throw error;
    }
  };

  const register = async (email, password, name) => {
    const { data } = await api.post('/auth/register', { email, password, name });
    localStorage.setItem('fitspace_token', data.token);
    localStorage.setItem('fitspace_user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('fitspace_token');
    localStorage.removeItem('fitspace_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-soft text-4xl">🏋️</div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
