'use client';
export const dynamic = 'force-dynamic';

// ─── Meals Page (Unified API) ───────────────────────────────
// Meal logging with AI analysis via server routes

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

export default function MealsPage() {
  const [meals, setMeals] = useState([]);
  const [description, setDescription] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const data = await api.getMeals();
      setMeals(data.meals);
    } catch (err) {
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMeal = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setAnalyzing(true);
    try {
      // 1. Get AI analysis from server
      const { analysis } = await api.analyzeMeal(description);
      
      // 2. Log final meal entry to DB
      await api.logMeal({
        description,
        mealType,
        ...analysis,
        aiAnalysis: JSON.stringify(analysis)
      });

      setDescription('');
      fetchMeals();
    } catch (err) {
      console.error('Meal logging failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await api.deleteMeal(id);
      setMeals(meals.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text tracking-tight">Nutrition Tracker</h1>
          <p className="text-text-muted text-sm mt-1">AI-powered calorie and macro estimation.</p>
        </div>

        {/* Input Card */}
        <div className="glass-card p-6 mb-8 border-t-4 border-rose relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="text-6xl">🥘</span>
          </div>
          
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <span>🍽️</span> What did you eat?
          </h2>

          <form onSubmit={handleLogMeal} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Avocado toast with two poached eggs"
                  className="input min-h-[100px] resize-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="input py-3"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
                <button
                  type="submit"
                  disabled={analyzing || !description.trim()}
                  className="btn-primary h-full font-black text-lg group overflow-hidden"
                >
                  <span className="relative z-10">{analyzing ? '⌛ Analyzing...' : '✅ Log'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose to-peach opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest italic">
              AI will automatically estimate calories, protein, carbs, and fats.
            </p>
          </form>
        </div>

        {/* List */}
        <div>
          <h2 className="text-lg font-bold text-text mb-4">Today's Logs</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 glass-card animate-pulse" />)}
            </div>
          ) : meals.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-text-muted font-bold">No meals logged today. Better get eating! 🥯</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div key={meal.id} className="glass-card p-5 group flex items-start gap-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-lavender-light/30 flex items-center justify-center text-2xl">
                    {meal.mealType === 'breakfast' ? '🥐' : meal.mealType === 'lunch' ? '🥗' : meal.mealType === 'dinner' ? '🥩' : '🍎'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-black text-text leading-tight">{meal.description}</p>
                      <button 
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-text-light hover:text-rose-dark transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                       <MacroBadge label="kcal" value={meal.calories} color="lavender" />
                       <MacroBadge label="Prot" value={`${meal.protein}g`} color="rose" />
                       <MacroBadge label="Carb" value={`${meal.carbs}g`} color="sky" />
                       <MacroBadge label="Fat" value={`${meal.fat}g`} color="peach" />
                    </div>
                    <p className="text-[10px] font-bold text-text-muted uppercase mt-3 tracking-tighter">
                      {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function MacroBadge({ label, value, color }) {
  const colors = {
    rose: 'bg-rose-light/40 text-rose-dark',
    lavender: 'bg-lavender-light/40 text-lavender-dark',
    sky: 'bg-sky-light/40 text-sky-dark',
    peach: 'bg-peach-light/40 text-peach-dark',
  };
  return (
    <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${colors[color]}`}>
      {value} <span className="opacity-50">{label}</span>
    </div>
  );
}
