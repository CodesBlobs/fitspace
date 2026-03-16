'use client';
export const dynamic = 'force-dynamic';

// ─── Settings Page (Unified API) ────────────────────────────
// Profile updates persisted in Neon DB via Next.js API

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const avatarOptions = ['👤', '🏋️', '🧘', '🏃', '⚡', '🔥', '💪', '🌟', '🎯', '🦾', '🐉', '🦁'];

export default function SettingsPage() {
  const { updateUserInfo } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('👤');
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(2000);
  const [dailyWaterGoal, setDailyWaterGoal] = useState(2500);
  const [dailySleepGoal, setDailySleepGoal] = useState(8);
  const [dailyWorkoutGoal, setDailyWorkoutGoal] = useState(30);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { user } = await api.getProfile();
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setAvatar(user.avatar || '👤');
        setDailyCaloriesGoal(user.dailyCaloriesGoal || 2000);
        setDailyWaterGoal(user.dailyWaterGoal || 2500);
        setDailySleepGoal(user.dailySleepGoal || 8);
        setDailyWorkoutGoal(user.dailyWorkoutGoal || 30);
        setWeight(user.weight || '');
        setHeight(user.height || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user } = await api.updateProfile({
        name, avatar,
        dailyCaloriesGoal, dailyWaterGoal, dailySleepGoal, dailyWorkoutGoal,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
      });
      updateUserInfo(user);
      setSuccess('Profile updated in cloud! ☁️');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AppShell><div className="max-w-2xl mx-auto h-96 glass-card animate-pulse" /></AppShell>;
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-text tracking-tight uppercase">Preferences</h1>
          <p className="text-text-muted text-sm mt-1 font-medium">Fine-tune your environment.</p>
        </div>

        {success && (
          <div className="bg-mint-light text-mint-dark px-4 py-3 rounded-2xl text-xs font-black mb-6 border-2 border-mint-dark/10 shadow-sm animate-bounce-soft">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Picker */}
          <div className="glass-card p-6 border-t-4 border-lavender">
            <h2 className="text-lg font-black text-text mb-6">🎨 Current Vibe</h2>
            <div className="grid grid-cols-6 gap-3">
              {avatarOptions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`text-3xl p-3 rounded-2xl transition-all ${
                    avatar === a
                      ? 'bg-lavender-light border-2 border-lavender-dark scale-110 shadow-lg'
                      : 'bg-surface-subtle opacity-50 hover:bg-surface hover:opacity-100'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-black text-text mb-6">👤 Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Display Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Email (Static)</label>
                <input type="email" value={email} className="input font-bold opacity-50 bg-surface" disabled />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input font-bold" step="0.1" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input font-bold" />
              </div>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="glass-card p-6 border-t-4 border-rose">
            <h2 className="text-lg font-black text-text mb-6">🎯 Success Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Calorie Intake</label>
                <input type="number" value={dailyCaloriesGoal} onChange={(e) => setDailyCaloriesGoal(parseInt(e.target.value))} className="input font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Hydration Target</label>
                <input type="number" value={dailyWaterGoal} onChange={(e) => setDailyWaterGoal(parseInt(e.target.value))} className="input font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Sleep Target (hrs)</label>
                <input type="number" value={dailySleepGoal} onChange={(e) => setDailySleepGoal(parseFloat(e.target.value))} className="input font-bold" step="0.5" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Active Minutes</label>
                <input type="number" value={dailyWorkoutGoal} onChange={(e) => setDailyWorkoutGoal(parseInt(e.target.value))} className="input font-bold" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-5 text-xl font-black group relative overflow-hidden">
            <span className="relative z-10">{saving ? '⌛ Deploying Updates...' : '✅ Save New Preferences'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-lavender to-sky opacity-20" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
