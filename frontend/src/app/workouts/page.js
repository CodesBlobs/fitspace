'use client';
export const dynamic = 'force-dynamic';

// ─── Workouts Page (Frontend-only) ──────────────────────────
// Workout logging stored in localStorage

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import WorkoutTimer from '@/components/WorkoutTimer';
import { getWorkouts, addWorkout, deleteWorkout } from '@/lib/store';

const workoutTypes = [
  { value: 'strength', label: 'Strength', icon: '🏋️' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'hiit', label: 'HIIT', icon: '⚡' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'other', label: 'Other', icon: '🎯' },
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('strength');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWorkouts(getWorkouts());
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !duration) return;
    setSaving(true);
    try {
      addWorkout({
        name,
        type,
        duration: parseInt(duration),
        calories: calories ? parseFloat(calories) : null,
        notes: notes || null,
      });
      setName('');
      setDuration('30');
      setCalories('');
      setNotes('');
      setWorkouts(getWorkouts());
    } catch (err) {
      console.error('Failed to log workout:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    deleteWorkout(id);
    setWorkouts(getWorkouts());
  };

  const handleTimerFinish = (seconds) => {
    setDuration(Math.round(seconds / 60).toString());
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Workouts</h1>
            <p className="text-text-muted text-sm mt-1">Log and track your exercise sessions</p>
          </div>
        </div>

        {/* Log Workout Form */}
        <div className="glass-card p-6 mb-8 animate-fade-in" style={{ opacity: 0 }}>
          <h2 className="text-lg font-semibold text-text mb-4">💪 Log a Workout</h2>
          <form onSubmit={handleSubmit}>
            {/* Type Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {workoutTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    type === t.value
                      ? 'bg-lavender-light text-lavender-dark border-2 border-lavender-dark'
                      : 'bg-surface-subtle text-text-muted border-2 border-transparent hover:border-border'
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Workout Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g., Morning Run"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Duration (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Calories Burned (optional)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="input"
                  placeholder="e.g., 350"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  placeholder="Felt great today!"
                />
              </div>
            </div>

            <button type="submit" disabled={saving || !name.trim()} className="btn-primary">
              {saving ? '⏳ Saving...' : '✅ Log Workout'}
            </button>
          </form>
        </div>

        {/* Workout History */}
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">Recent Workouts</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse-soft">
                  <div className="h-4 w-3/4 bg-lavender-light rounded mb-2" />
                  <div className="h-3 w-1/2 bg-lavender-light rounded" />
                </div>
              ))}
            </div>
          ) : workouts.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <span className="text-4xl mb-3 block">💪</span>
              <p className="text-text-muted">No workouts logged yet. Start tracking above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((w) => (
                <div key={w.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in" style={{ opacity: 0 }}>
                  <span className="text-2xl">
                    {workoutTypes.find((t) => t.value === w.type)?.icon || '🎯'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{w.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {w.type} · {w.duration} min · {new Date(w.loggedAt).toLocaleString()}
                    </p>
                  </div>
                  {w.calories && (
                    <span className="text-xs text-peach-dark font-semibold">{w.calories} cal</span>
                  )}
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-text-light hover:text-rose-dark transition-colors text-sm p-1"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <WorkoutTimer onFinish={handleTimerFinish} />
    </AppShell>
  );
}
