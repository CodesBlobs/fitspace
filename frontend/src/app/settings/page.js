'use client';

// ─── Settings Page ──────────────────────────────────────────
// Update user goals and profile information

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';


export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    dailyWaterGoal: '',
    dailyCaloriesGoal: '',
    dailySleepGoal: '',
    dailyWorkoutGoal: '',
    weight: '',
    height: '',
    avatar: '',
  });

  const { updateUserInfo } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/user/profile');
      const { user } = data;
      setFormData({
        name: user.name || '',
        dailyWaterGoal: user.dailyWaterGoal || '',
        dailyCaloriesGoal: user.dailyCaloriesGoal || '',
        dailySleepGoal: user.dailySleepGoal || '',
        dailyWorkoutGoal: user.dailyWorkoutGoal || '',
        weight: user.weight || '',
        height: user.height || '',
        avatar: user.avatar || '👤',
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setMessage({ type: 'error', text: 'Failed to load profile settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await api.put('/user/settings', formData);
      updateUserInfo(data.user);
      setMessage({ type: 'success', text: 'Settings updated successfully! ✨' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Update settings failed:', err);
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };


  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Settings</h1>
          <p className="text-text-muted text-sm mt-1">Personalize your fitness goals and profile</p>
        </div>

        {loading ? (
          <div className="glass-card p-8 animate-pulse-soft">
            <div className="space-y-4">
              <div className="h-4 bg-lavender-light rounded w-1/4" />
              <div className="h-10 bg-lavender-light rounded w-full" />
              <div className="h-4 bg-lavender-light rounded w-1/4" />
              <div className="h-10 bg-lavender-light rounded w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Message */}
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium animate-fade-in ${
                message.type === 'success' 
                  ? 'bg-mint-light text-mint-dark border border-mint-dark/20' 
                  : 'bg-rose-light text-rose-dark border border-rose-dark/20'
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Section */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <span>👤</span> Profile Info
              </h2>
              
              {/* Avatar Picker */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-muted mb-3">Choose your Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {['👤', '🏃', '🧘', '🥗', '🥑', '💪', '🔥', '🌊', '⭐', '🏋️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all border-2 ${
                        formData.avatar === emoji 
                          ? 'border-lavender bg-white shadow-sm' 
                          : 'border-transparent bg-surface-subtle hover:bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Alex Smith"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="input"
                      placeholder="70"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="input"
                      placeholder="175"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Goals Section */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <span>🎯</span> Health Goals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Daily Water (ml)</label>
                  <input
                    type="number"
                    name="dailyWaterGoal"
                    value={formData.dailyWaterGoal}
                    onChange={handleChange}
                    className="input border-sky-light focus:border-sky-dark"
                    placeholder="2500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Daily Calories (kcal)</label>
                  <input
                    type="number"
                    name="dailyCaloriesGoal"
                    value={formData.dailyCaloriesGoal}
                    onChange={handleChange}
                    className="input border-peach-light focus:border-peach-dark"
                    placeholder="2000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Daily Sleep (hours)</label>
                  <input
                    type="number"
                    name="dailySleepGoal"
                    value={formData.dailySleepGoal}
                    onChange={handleChange}
                    className="input border-mint-light focus:border-mint-dark"
                    placeholder="8"
                    step="0.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Workout Goal (min)</label>
                  <input
                    type="number"
                    name="dailyWorkoutGoal"
                    value={formData.dailyWorkoutGoal}
                    onChange={handleChange}
                    className="input border-lavender-light focus:border-lavender-dark"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-rose-light/30 hover:shadow-rose-dark/20 transition-all font-bold"
            >
              {saving ? '⏳ Saving Changes...' : '💾 Save Settings'}
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
