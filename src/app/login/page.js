'use client';

// ─── Login Page ─────────────────────────────────────────────
// Pastel-styled login form

import { useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #ede6fd 0%, #e0f2fe 50%, #dff8ec 100%)',
    }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in" style={{ opacity: 0 }}>
          <span className="text-5xl mb-3 inline-block">🏋️</span>
          <h1 className="text-3xl font-bold text-text">FitSpace</h1>
          <p className="text-text-muted text-sm mt-1">AI-Powered Fitness Assistant</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fade-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-text mb-6">Welcome back</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-light text-rose-dark text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? '⏳ Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-lavender-dark font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-text-light mt-4 animate-fade-in" style={{ opacity: 0, animationDelay: '0.2s' }}>
          Demo: demo@fitspace.app / demo1234
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
