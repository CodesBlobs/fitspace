'use client';

// ─── Auth Context (Frontend-Only) ───────────────────────────
// No server, no JWT. Profile stored in localStorage.

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile } from './store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const profile = getProfile();
    if (profile.name) {
      setUser(profile);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Frontend-only: just set a profile
    const profile = updateProfile({ name: email.split('@')[0], email });
    setUser(profile);
    router.push('/dashboard');
  };

  const register = async (email, password, name) => {
    const profile = updateProfile({ name, email });
    setUser(profile);
    router.push('/dashboard');
  };

  const updateUserInfo = (updates) => {
    const updated = updateProfile(updates);
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem('fitspace_profile');
    setUser(null);
    router.push('/login');
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
    // Return safe default during SSR/prerendering
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-soft text-4xl">🏋️</div>
      </div>
    );
  }

  if (!user) return null;
  return children;
}
