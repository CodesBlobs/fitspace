'use client';
export const dynamic = 'force-dynamic';

// ─── Settings Page (Frontend-only) ──────────────────────────
// User profile and goals stored in localStorage

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { getProfile, updateProfile } from '@/lib/store';
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
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const profile = getProfile();
    setName(profile.name || '');
    setEmail(profile.email || '');
    setAvatar(profile.avatar || '👤');
    setDailyCaloriesGoal(profile.dailyCaloriesGoal || 2000);
    setDailyWaterGoal(profile.dailyWaterGoal || 2500);
    setDailySleepGoal(profile.dailySleepGoal || 8);
    setDailyWorkoutGoal(profile.dailyWorkoutGoal || 30);
    setWeight(profile.weight || '');
    setHeight(profile.height || '');
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const updated = updateProfile({
      name, email, avatar,
      dailyCaloriesGoal, dailyWaterGoal, dailySleepGoal, dailyWorkoutGoal,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
    });
    updateUserInfo(updated);
    setSaving(false);
    setSuccess('Settings saved! ✨');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Settings</h1>
          <p className="text-text-muted text-sm mt-1">Customize your profile and goals</p>
        </div>

        {success && (
          <div className="bg-mint-light text-mint-dark px-4 py-2 rounded-xl text-sm font-bold mb-6 border border-mint-dark/10">
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Picker */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">🎨 Avatar</h2>
            <div className="grid grid-cols-6 gap-3">
              {avatarOptions.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`text-3xl p-3 rounded-2xl transition-all ${
                    avatar === a
                      ? 'bg-lavender-light border-2 border-lavender-dark scale-110 shadow-md'
                      : 'bg-surface-subtle border-2 border-transparent hover:bg-surface hover:scale-105'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">👤 Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input" step="0.1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Height (cm)</label>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input" />
              </div>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">🎯 Daily Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Calories (kcal)</label>
                <input type="number" value={dailyCaloriesGoal} onChange={(e) => setDailyCaloriesGoal(parseInt(e.target.value))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Water (ml)</label>
                <input type="number" value={dailyWaterGoal} onChange={(e) => setDailyWaterGoal(parseInt(e.target.value))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Sleep (hours)</label>
                <input type="number" value={dailySleepGoal} onChange={(e) => setDailySleepGoal(parseFloat(e.target.value))} className="input" step="0.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Workout (min)</label>
                <input type="number" value={dailyWorkoutGoal} onChange={(e) => setDailyWorkoutGoal(parseInt(e.target.value))} className="input" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-4 text-lg font-black">
            {saving ? '⌛ Saving...' : '✅ Save Settings'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
