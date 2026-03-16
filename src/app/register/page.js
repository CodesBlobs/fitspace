'use client';

// ─── Register Page ──────────────────────────────────────────
// Pastel-styled registration form

import { useState } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth';

function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #dff8ec 0%, #fde8da 50%, #ede6fd 100%)',
    }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in" style={{ opacity: 0 }}>
          <span className="text-5xl mb-3 inline-block">🏋️</span>
          <h1 className="text-3xl font-bold text-text">FitSpace</h1>
          <p className="text-text-muted text-sm mt-1">Start your fitness journey</p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fade-in" style={{ opacity: 0, animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold text-text mb-6">Create account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-light text-rose-dark text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Alex Smith"
                required
              />
            </div>

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
                minLength={6}
              />
              <p className="text-xs text-text-light mt-1">At least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? '⏳ Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-lavender-dark font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
