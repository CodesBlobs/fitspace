'use client';
export const dynamic = 'force-dynamic';

// ─── Dashboard Page ─────────────────────────────────────────
// Summary cards, weekly charts, and AI insight (Unified API)

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import AIInsightCard from '@/components/AIInsightCard';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, weeklyData] = await Promise.all([
          api.getSummary(),
          api.getWeeklyTrends(),
        ]);
        setSummary(sumData.summary);
        setWeeklyTrends(weeklyData.weekly);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-10 w-48 bg-lavender-light animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 glass-card animate-pulse" />)}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in" style={{ opacity: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-text tracking-tight">Daily Overview</h1>
            <p className="text-text-muted mt-1 font-medium">Here's how you're performing today.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border-2 border-lavender-light text-lavender-dark px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:translate-y-[-2px] transition-all">
              📅 Today
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Nutrition"
            icon="🍎"
            value={summary.calories.total}
            unit="kcal"
            goal={summary.calories.goal}
            color="rose"
            subtitle={`${summary.calories.protein}g Protein · ${summary.calories.carbs}g Carbs`}
          />
          <StatCard
            title="Activity"
            icon="⚡"
            value={summary.workouts.minutes}
            unit="min"
            goal={summary.workouts.goal}
            color="lavender"
            subtitle={`${summary.workouts.count} workouts today`}
          />
          <StatCard
            title="Hydration"
            icon="💧"
            value={summary.water.total}
            unit="ml"
            goal={summary.water.goal}
            color="sky"
            subtitle={`${(summary.water.goal - summary.water.total).toFixed(0)}ml to go`}
          />
          <StatCard
            title="Sleep"
            icon="😴"
            value={summary.sleep?.hours || 0}
            unit="hrs"
            goal={summary.sleep?.goal || 8}
            color="mint"
            subtitle={summary.sleep ? `Quality: ${'⭐'.repeat(summary.sleep.quality)}` : 'No log yet'}
          />
        </div>

        {/* Middle Section: Trends & AI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-text">Weekly Trends</h3>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase">
                    <span className="w-2 h-2 rounded-full bg-rose" /> Calories
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase">
                    <span className="w-2 h-2 rounded-full bg-lavender" /> Minutes
                  </span>
                </div>
              </div>

              {/* Weekly Chart Mockup (Pure CSS) */}
              <div className="h-48 flex items-end gap-2 md:gap-4 relative pt-4">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                  {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-text w-full" />)}
                </div>
                {weeklyTrends.map((day) => {
                  const calPerc = Math.min(100, (day.calories / 3000) * 100);
                  const minPerc = Math.min(100, (day.workoutMinutes / 60) * 100);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full flex justify-center items-end gap-1 h-full">
                        <div className="w-2 md:w-3 bg-rose-light border-x border-rose-dark/10 rounded-t-sm transition-all group-hover:bg-rose" style={{ height: `${calPerc}%` }} />
                        <div className="w-2 md:w-3 bg-lavender-light border-x border-lavender-dark/10 rounded-t-sm transition-all group-hover:bg-lavender" style={{ height: `${minPerc}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-text-muted">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-text mb-4">Recent Milestones</h3>
              <div className="space-y-4">
                <ActivityItem icon="🎉" text="Hit your water goal 3 days in a row!" time="Just now" color="sky" />
                <ActivityItem icon="🏋️" text="Completed 'Morning Full Body Focus'" time="2 hours ago" color="lavender" />
                <ActivityItem icon="🍲" text="Logged a high-protein breakfast" time="5 hours ago" color="peach" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <AIInsightCard />
            <div className="glass-card p-6 bg-texture-dots">
              <h3 className="font-bold text-text mb-3">Today's Focus</h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-rose-light text-rose-dark flex items-center justify-center text-[10px] font-bold">1</span>
                  Eat 40g more protein
                </li>
                <li className="flex gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-sky-light text-sky-dark flex items-center justify-center text-[10px] font-bold">2</span>
                  Drink 1.2L of water
                </li>
                <li className="flex gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-mint-light text-mint-dark flex items-center justify-center text-[10px] font-bold">3</span>
                  Log your evening mood
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, icon, value, unit, goal, color, subtitle }) {
  const percentage = Math.min(100, (value / goal) * 100);
  const colors = {
    rose: 'text-rose-dark border-rose-dark/10 bg-rose-light/20',
    lavender: 'text-lavender-dark border-lavender-dark/10 bg-lavender-light/20',
    sky: 'text-sky-dark border-sky-dark/10 bg-sky-light/20',
    mint: 'text-mint-dark border-mint-dark/10 bg-mint-light/20',
  };

  return (
    <div className="glass-card p-5 group hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{title}</span>
        <span className="text-xl group-hover:scale-125 transition-transform">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-black text-text">{value}</span>
        <span className="text-xs font-bold text-text-muted">{unit}</span>
      </div>
      <p className="text-[10px] font-bold text-text-muted mb-3 italic">{subtitle}</p>
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden border border-black/5">
        <div className={`h-full rounded-full transition-all duration-1000 ${colors[color]}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ActivityItem({ icon, text, time, color }) {
  const colors = {
    sky: 'bg-sky-light/30 text-sky-dark',
    lavender: 'bg-lavender-light/30 text-lavender-dark',
    peach: 'bg-peach-light/30 text-peach-dark',
  };
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${colors[color] || 'bg-surface'} transition-all group-hover:rotate-12`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-text mb-0.5">{text}</p>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{time}</span>
      </div>
    </div>
  );
}
