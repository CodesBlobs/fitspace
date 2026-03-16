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
  const [summarizing, setSummarizing] = useState(false);
  const [sessionMeals, setSessionMeals] = useState([]);
  const [overallSummary, setOverallSummary] = useState(null);

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

  // Add meal to current session
  const handleAddToSession = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    try {
      const { data } = await api.post('/ai/analyze-meal', { description });
      const newMeal = {
        description,
        mealType,
        ...data.analysis,
        id: Math.random().toString(36).substr(2, 9), // Client-side ID for UI
        loggedAt: new Date().toISOString(),
      };
      setSessionMeals([...sessionMeals, newMeal]);
      setDescription('');
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Finish logging and save all meals
  const handleFinishLogging = async () => {
    if (sessionMeals.length === 0) return;
    setSaving(true);
    setSummarizing(true);
    try {
      // 1. Generate Overall Summary
      const { data: summaryData } = await api.post('/ai/summarize-session', { meals: sessionMeals });
      setOverallSummary(summaryData.summary.overallSummary);

      // 2. Save all meals to DB
      for (const meal of sessionMeals) {
        await api.post('/meals', {
          description: meal.description,
          mealType: meal.mealType,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          fiber: meal.fiber,
          aiAnalysis: JSON.stringify(meal),
        });
      }

      // 3. Refresh history and clear session (but keep summary visible)
      fetchMeals();
      setSessionMeals([]);
    } catch (err) {
      console.error('Failed to finish logging:', err);
    } finally {
      setSaving(false);
      setSummarizing(false);
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

  const removeFromSession = (id) => {
    setSessionMeals(sessionMeals.filter(m => m.id !== id));
  };

  // Group history by date
  const groupedMeals = meals.reduce((acc, meal) => {
    const date = new Date(meal.loggedAt).toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(meal);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Meals & Nutrition</h1>
          <p className="text-text-muted text-sm mt-1">Track your foods and get AI insights for better health</p>
        </div>

        {/* Outer Card: Current Logging Session */}
        <div className="glass-card overflow-hidden mb-12 animate-fade-in" style={{ opacity: 0 }}>
          <div className="bg-lavender-light/30 px-6 py-4 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-lavender-dark">☀️ Logging Session</h2>
              <p className="text-xs text-text-muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
            {sessionMeals.length > 0 && (
              <button 
                onClick={handleFinishLogging} 
                disabled={saving}
                className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
              >
                {saving ? '⏳ Saving...' : '🏁 Finish Logging'}
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Overall Summary (If finished) */}
            {overallSummary && (
              <div className="mb-8 p-6 rounded-2xl bg-mint-light/20 border-2 border-mint-light animate-bounce-in">
                <h3 className="text-sm font-bold text-mint-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                  ✨ Overall Session Summary
                </h3>
                <p className="text-text font-medium leading-relaxed italic">"{overallSummary}"</p>
                <button 
                  onClick={() => setOverallSummary(null)} 
                  className="mt-4 text-xs text-text-muted hover:text-text underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Nested Inner Cards: Each Food Entry */}
            <div className="space-y-4 mb-8">
              {sessionMeals.map((meal) => (
                <div key={meal.id} className="p-5 rounded-2xl bg-surface border-2 border-border/50 shadow-sm animate-fade-in relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-surface-subtle rounded-xl">
                        {mealTypes.find((t) => t.value === meal.mealType)?.icon || '🍽️'}
                      </span>
                      <div>
                        <h4 className="font-bold text-text">{meal.description}</h4>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-peach-light text-peach-dark font-bold uppercase">{meal.calories} cal</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender-light text-lavender-dark font-bold uppercase">P:{meal.protein}g</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromSession(meal.id)}
                      className="text-text-muted hover:text-rose-dark transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* AI Good Parts */}
                  <div className="mt-3 py-3 px-4 rounded-xl bg-sky-light/10 border border-sky-light/30">
                    <p className="text-sm text-sky-dark leading-relaxed">
                      <span className="font-bold">✨ Good Parts:</span> {meal.goodParts}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form (The Plus Section) */}
            <div className="bg-surface-subtle p-6 rounded-3xl border-2 border-dashed border-border/50">
              <div className="flex gap-2 mb-4">
                {mealTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setMealType(t.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      mealType === t.value
                        ? 'bg-lavender-light text-lavender-dark border-2 border-lavender-dark'
                        : 'bg-surface text-text-muted border-2 border-transparent hover:border-border'
                    }`}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input flex-1 min-h-[60px] resize-none"
                  placeholder="What else did you eat? e.g., a handful of almonds"
                  rows={2}
                />
                <button
                  onClick={handleAddToSession}
                  disabled={analyzing || !description.trim()}
                  className="bg-lavender-dark text-white p-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg self-end disabled:opacity-50"
                  title="Add to session"
                >
                  {analyzing ? '⏳' : <span className="text-2xl leading-none">+</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grouped History View */}
        <div className="space-y-10">
          <h2 className="text-xl font-bold text-text">History</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse-soft">
                  <div className="h-6 w-48 bg-lavender-light rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-16 w-full bg-lavender-light/50 rounded-2xl" />
                    <div className="h-16 w-full bg-lavender-light/50 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedMeals).length === 0 ? (
            <div className="glass-card p-12 text-center border-dashed">
              <span className="text-5xl mb-4 block">📸</span>
              <h3 className="text-lg font-semibold text-text">No meals logged yet</h3>
              <p className="text-text-muted mt-2 max-w-xs mx-auto">Start your first logging session above to track your nutrition progress!</p>
            </div>
          ) : (
            Object.entries(groupedMeals).map(([date, dayMeals]) => (
              <div key={date} className="animate-fade-in" style={{ opacity: 0 }}>
                <h3 className="text-sm font-bold text-text-muted mb-4 sticky top-0 py-2 bg-background/80 backdrop-blur-sm z-10">{date}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayMeals.map((meal) => (
                    <div key={meal.id} className="glass-card p-5 group flex items-start gap-4">
                      <span className="text-3xl p-3 bg-white/50 rounded-2xl shadow-sm group-hover:rotate-6 transition-transform">
                        {mealTypes.find((t) => t.value === meal.mealType)?.icon || '🍽️'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text group-hover:text-lavender-dark transition-colors">{meal.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs font-semibold text-peach-dark">{meal.calories?.toFixed(0)} kcal</span>
                          <span className="text-xs text-text-muted">·</span>
                          <span className="text-[10px] text-text-muted uppercase tracking-wider">{meal.mealType}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(meal.id)}
                        className="text-text-light hover:text-rose-dark transition-colors text-sm opacity-0 group-hover:opacity-100 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
