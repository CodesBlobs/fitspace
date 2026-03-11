'use client';

// ─── Meals Page ─────────────────────────────────────────────
// Meal logging with AI analysis, text input, and meal history

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

export default function MealsPage() {
  const [meals, setMeals] = useState([]);
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => { fetchMeals(); }, []);

  const fetchMeals = async () => {
    try {
      const { data } = await api.get('/meals');
      setMeals(data.meals);
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
    }
  };

  // AI meal analysis
  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze-meal', { description });
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Log meal (with optional AI data)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    try {
      const payload = {
        description,
        mealType,
        ...(analysis && {
          calories: analysis.calories,
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
          fiber: analysis.fiber,
          aiAnalysis: JSON.stringify(analysis),
        }),
      };
      await api.post('/meals', payload);
      setDescription('');
      setAnalysis(null);
      fetchMeals();
    } catch (err) {
      console.error('Failed to log meal:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/meals/${id}`);
      setMeals(meals.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Meals & Nutrition</h1>
          <p className="text-text-muted text-sm mt-1">Log your meals and get AI-powered nutrition analysis</p>
        </div>

        {/* Log Meal Form */}
        <div className="glass-card p-6 mb-8 animate-fade-in" style={{ opacity: 0 }}>
          <h2 className="text-lg font-semibold text-text mb-4">🍽️ Log a Meal</h2>
          <form onSubmit={handleSubmit}>
            {/* Meal Type Selector */}
            <div className="flex gap-2 mb-4">
              {mealTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setMealType(t.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    mealType === t.value
                      ? 'bg-lavender-light text-lavender-dark border-2 border-lavender-dark'
                      : 'bg-surface-subtle text-text-muted border-2 border-transparent hover:border-border'
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="mb-4">
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setAnalysis(null); }}
                className="input min-h-[80px] resize-none"
                placeholder="Describe your meal... e.g., Grilled chicken salad with avocado and quinoa"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !description.trim()}
                className="btn-secondary"
              >
                {analyzing ? '⏳ Analyzing...' : '🤖 AI Analyze'}
              </button>
              <button type="submit" disabled={saving || !description.trim()} className="btn-primary">
                {saving ? '⏳ Saving...' : '✅ Log Meal'}
              </button>
            </div>
          </form>

          {/* AI Analysis Result */}
          {analysis && (
            <div className="mt-5 p-5 rounded-xl animate-fade-in" style={{
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(184,240,216,0.3), rgba(186,230,253,0.3))',
            }}>
              <h3 className="text-sm font-semibold text-mint-dark uppercase tracking-wide mb-3">🤖 AI Nutrition Analysis</h3>
              <div className="grid grid-cols-5 gap-3 mb-3">
                {[
                  { label: 'Calories', value: `${analysis.calories}`, unit: 'kcal', color: 'peach' },
                  { label: 'Protein', value: `${analysis.protein}`, unit: 'g', color: 'lavender' },
                  { label: 'Carbs', value: `${analysis.carbs}`, unit: 'g', color: 'sky' },
                  { label: 'Fat', value: `${analysis.fat}`, unit: 'g', color: 'rose' },
                  { label: 'Fiber', value: `${analysis.fiber}`, unit: 'g', color: 'mint' },
                ].map((item) => (
                  <div key={item.label} className={`p-3 rounded-xl bg-${item.color}-light text-center`}>
                    <div className={`text-lg font-bold text-${item.color}-dark`}>{item.value}</div>
                    <div className="text-xs text-text-muted">{item.label} ({item.unit})</div>
                  </div>
                ))}
              </div>
              {analysis.summary && <p className="text-sm text-text-muted">{analysis.summary}</p>}
              {analysis.healthTips && (
                <div className="mt-3 space-y-1">
                  {analysis.healthTips.map((tip, i) => (
                    <p key={i} className="text-xs text-text-muted">💡 {tip}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Meal History */}
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">Recent Meals</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse-soft">
                  <div className="h-4 w-3/4 bg-lavender-light rounded mb-2" />
                  <div className="h-3 w-1/2 bg-lavender-light rounded" />
                </div>
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <span className="text-4xl mb-3 block">🍽️</span>
              <p className="text-text-muted">No meals logged yet. Start tracking above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <div key={meal.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in" style={{ opacity: 0 }}>
                  <span className="text-2xl">
                    {mealTypes.find((t) => t.value === meal.mealType)?.icon || '🍽️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{meal.description}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {meal.mealType} · {new Date(meal.loggedAt).toLocaleString()}
                    </p>
                  </div>
                  {meal.calories && (
                    <div className="flex gap-3 text-xs text-text-muted">
                      <span className="text-peach-dark font-semibold">{meal.calories.toFixed(0)} cal</span>
                      <span>P:{meal.protein?.toFixed(0)}g</span>
                      <span>C:{meal.carbs?.toFixed(0)}g</span>
                      <span>F:{meal.fat?.toFixed(0)}g</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(meal.id)}
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
    </AppShell>
  );
}
