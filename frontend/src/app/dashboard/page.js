'use client';

// ─── Dashboard Page ─────────────────────────────────────────
// Summary cards, weekly charts, and AI insight

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import StatCard from '@/components/StatCard';
import AIInsightCard from '@/components/AIInsightCard';
import { BarChart, LineChart } from '@/components/Chart';
import api from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, weeklyRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/weekly'),
      ]);
      setSummary(summaryRes.data.summary);
      setWeekly(weeklyRes.data.weekly);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const moodEmoji = {
    happy: '😊', calm: '😌', energetic: '⚡', tired: '😴', stressed: '😰', sad: '😢',
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse-soft">
                <div className="h-11 w-11 bg-lavender-light rounded-xl mb-3" />
                <div className="h-6 w-16 bg-lavender-light rounded mb-1" />
                <div className="h-4 w-24 bg-lavender-light rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              <StatCard
                icon="🔥"
                label="Calories Today"
                value={summary?.calories?.total?.toFixed(0) || '0'}
                subtitle={`P: ${summary?.calories?.protein?.toFixed(0) || 0}g · C: ${summary?.calories?.carbs?.toFixed(0) || 0}g · F: ${summary?.calories?.fat?.toFixed(0) || 0}g`}
                color="peach"
              />
              <StatCard
                icon="💪"
                label="Workouts Today"
                value={summary?.workouts?.count || 0}
                subtitle={`${summary?.workouts?.minutes || 0} min · ${summary?.workouts?.calories?.toFixed(0) || 0} cal burned`}
                color="lavender"
              />
              <StatCard
                icon="💧"
                label="Water Intake"
                value={`${((summary?.water?.total || 0) / 1000).toFixed(1)}L`}
                subtitle={`Goal: ${(summary?.water?.goal / 1000).toFixed(1)}L · ${Math.min(100, Math.round(((summary?.water?.total || 0) / summary?.water?.goal) * 100))}%`}
                color="sky"
              />
              <StatCard
                icon="😴"
                label="Last Night Sleep"
                value={summary?.sleep ? `${summary.sleep.hours.toFixed(1)}h` : '—'}
                subtitle={summary?.sleep ? `Quality: ${'⭐'.repeat(summary.sleep.quality)}` : 'No data yet'}
                color="mint"
              />
              <StatCard
                icon={summary?.mood ? (moodEmoji[summary.mood.mood] || '😊') : '😊'}
                label="Current Mood"
                value={summary?.mood?.mood ? summary.mood.mood.charAt(0).toUpperCase() + summary.mood.mood.slice(1) : '—'}
                subtitle={summary?.mood ? `Energy: ${summary.mood.energy}/5` : 'No data yet'}
                color="sunshine"
              />
              <StatCard
                icon="🍽️"
                label="Meals Logged"
                value={summary?.mealsLogged || 0}
                subtitle="meals tracked today"
                color="rose"
              />
            </div>

            {/* Charts */}
            {weekly && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Weekly Calories</h3>
                  <BarChart
                    labels={weekly.map((d) => d.label)}
                    data={weekly.map((d) => d.calories)}
                    label="Calories"
                    color="peach"
                  />
                </div>
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Workout Minutes</h3>
                  <BarChart
                    labels={weekly.map((d) => d.label)}
                    data={weekly.map((d) => d.workoutMinutes)}
                    label="Minutes"
                    color="lavender"
                  />
                </div>
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Water Intake (ml)</h3>
                  <LineChart
                    labels={weekly.map((d) => d.label)}
                    data={weekly.map((d) => d.water)}
                    label="Water (ml)"
                    color="sky"
                  />
                </div>
                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-4">Sleep Hours</h3>
                  <LineChart
                    labels={weekly.map((d) => d.label)}
                    data={weekly.map((d) => d.sleep)}
                    label="Hours"
                    color="mint"
                  />
                </div>
              </div>
            )}

            {/* AI Insight */}
            <AIInsightCard />
          </>
        )}
      </div>
    </AppShell>
  );
}
