'use client';

// ─── Workouts Page ──────────────────────────────────────────
// Workout logging with AI suggestions and workout history

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';
import WorkoutTimer from '@/components/WorkoutTimer';


const workoutTypes = [
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'strength', label: 'Strength', icon: '🏋️' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { value: 'hiit', label: 'HIIT', icon: '⚡' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
];

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [type, setType] = useState('cardio');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => { fetchWorkouts(); }, []);

  const fetchWorkouts = async () => {
    try {
      const { data } = await api.get('/workouts');
      setWorkouts(data.workouts);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const { data } = await api.post('/ai/suggest-workout', {
        preferences: { type, duration: parseInt(duration) || 30 },
      });
      setSuggestion(data.suggestion);
    } catch (err) {
      console.error('Suggestion failed:', err);
    } finally {
      setSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !duration) return;
    setSaving(true);
    try {
      await api.post('/workouts', {
        type,
        name,
        duration: parseInt(duration),
        calories: calories ? parseFloat(calories) : null,
        notes: notes || null,
      });
      setName('');
      setDuration('');
      setCalories('');
      setNotes('');
      fetchWorkouts();
    } catch (err) {
      console.error('Failed to log workout:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  // Use an AI suggestion to pre-fill the form
  const useSuggestion = () => {
    if (!suggestion) return;
    setName(suggestion.name);
    setType(suggestion.type);
    setDuration(String(suggestion.duration));
    setCalories(String(suggestion.estimatedCalories || ''));
    setSuggestion(null);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Workouts</h1>
          <p className="text-text-muted text-sm mt-1">Log workouts and get AI-powered exercise suggestions</p>
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

            {/* Form Fields */}
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
                <label className="block text-sm font-medium text-text-muted mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input"
                  placeholder="30"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Calories Burned (optional)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="input"
                  placeholder="250"
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSuggest}
                disabled={suggesting}
                className="btn-secondary"
              >
                {suggesting ? '⏳ Thinking...' : '🤖 AI Suggest'}
              </button>
              <button type="submit" disabled={saving || !name.trim() || !duration} className="btn-primary">
                {saving ? '⏳ Saving...' : '✅ Log Workout'}
              </button>
            </div>
          </form>

          {/* AI Suggestion */}
          {suggestion && (
            <div className="mt-5 p-5 rounded-xl animate-fade-in" style={{
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(212,197,249,0.3), rgba(184,240,216,0.3))',
            }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-lavender-dark uppercase tracking-wide">🤖 AI Suggestion: {suggestion.name}</h3>
                <button onClick={useSuggestion} className="btn-primary text-xs py-1.5 px-3">
                  Use This
                </button>
              </div>
              <p className="text-sm text-text-muted mb-3">
                {suggestion.type} · {suggestion.duration} min · ~{suggestion.estimatedCalories} cal
              </p>
              {suggestion.exercises && (
                <div className="space-y-2 mb-3">
                  {suggestion.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-lavender-light text-lavender-dark text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-text">{ex.name}</span>
                      <span className="text-text-muted">
                        {ex.sets && `${ex.sets} × `}{ex.reps || ex.duration}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {suggestion.tips && (
                <div className="space-y-1">
                  {suggestion.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-text-muted">💡 {tip}</p>
                  ))}
                </div>
              )}
            </div>
          )}
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
              <p className="text-text-muted">No workouts logged yet. Get moving!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((w) => (
                <div key={w.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in" style={{ opacity: 0 }}>
                  <span className="text-2xl">
                    {workoutTypes.find((t) => t.value === w.type)?.icon || '💪'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text">{w.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {w.type} · {w.duration} min · {new Date(w.loggedAt).toLocaleString()}
                    </p>
                  </div>
                  {w.calories && (
                    <span className="text-sm font-semibold text-lavender-dark">{w.calories.toFixed(0)} cal</span>
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
      <WorkoutTimer onFinish={(mins) => setDuration(String(mins))} />
    </AppShell>

  );
}
