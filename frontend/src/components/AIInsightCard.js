'use client';

// ─── AI Insight Card (Frontend-only) ────────────────────────
// Calls OpenAI directly from the browser

import { useState, useEffect } from 'react';
import { getDailyInsight } from '@/lib/ai';
import { getDashboardSummary } from '@/lib/store';

export default function AIInsightCard() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsight();
  }, []);

  const fetchInsight = async () => {
    try {
      setLoading(true);
      const summary = getDashboardSummary();
      const userData = {
        mealsLoggedThisWeek: summary.mealsLogged,
        workoutsThisWeek: summary.workouts.count,
        recentMoods: summary.mood ? [summary.mood.mood] : [],
      };
      const result = await getDailyInsight(userData);
      setInsight(result);
    } catch (err) {
      console.error('Failed to fetch insight:', err);
      setInsight({
        greeting: 'Welcome back! 💪',
        insight: 'Keep tracking your progress — consistency is key!',
        motivation: '"The body achieves what the mind believes."',
        focusArea: 'Stay hydrated and active today.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse-soft">
        <div className="h-4 bg-lavender-light rounded w-1/3 mb-3" />
        <div className="h-3 bg-lavender-light rounded w-full mb-2" />
        <div className="h-3 bg-lavender-light rounded w-2/3" />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <div className="glass-card p-6 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(212, 197, 249, 0.25) 0%, rgba(186, 230, 253, 0.25) 50%, rgba(184, 240, 216, 0.25) 100%)',
    }}>
      <span className="absolute top-4 right-4 text-2xl animate-sparkle">✨</span>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <h3 className="text-sm font-semibold text-lavender-dark uppercase tracking-wide">AI Daily Insight</h3>
      </div>

      <p className="text-lg font-semibold text-text mb-2">{insight.greeting}</p>
      <p className="text-sm text-text-muted leading-relaxed mb-3">{insight.insight}</p>

      <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
        <p className="text-sm italic text-lavender-dark">{insight.motivation}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">🎯</span>
        <p className="text-sm text-text-muted"><strong className="text-text">Focus:</strong> {insight.focusArea}</p>
      </div>

      <button
        onClick={fetchInsight}
        className="mt-4 text-xs text-lavender-dark hover:text-lavender font-medium transition-colors"
      >
        ↻ Get new insight
      </button>
    </div>
  );
}
