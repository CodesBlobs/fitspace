'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import WholesomeCard from '@/components/WholesomeCard';
import api from '@/lib/api';

export default function WellnessPage() {
  const [gratitudes, setGratitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGratitudes();
  }, []);

  const fetchGratitudes = async () => {
    try {
      const res = await api.get('/wellness/gratitude');
      setGratitudes(res.data.entries || []);
    } catch (err) {
      console.error('Failed to fetch gratitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Holistic Wellness</h1>
          <p className="text-lavender opacity-70">Focus on the mind, and the body will follow.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Wholesome Corner Card */}
          <div className="h-full">
            <WholesomeCard />
          </div>

          {/* Mindfulness Exercises */}
          <div className="glass-card p-6 border border-mint/10 bg-mint/5 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🧘</span> Mindfulness Space
            </h3>
            
            <div className="space-y-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-medium text-mint mb-1">Box Breathing (4-4-4-4)</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Repeat 3 times to calm your nervous system.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-medium text-sky mb-1">Hydration Intention</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Before you take your next sip of water, think of one small goal you achieved today.
                </p>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-medium text-rose mb-1">Posture Check</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Roll your shoulders back, tuck your chin slightly, and take a deep breath. You are doing great.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gratitude History Full List */}
        <section className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>✨</span> Your Gratitude Journal
          </h2>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl w-full" />)}
            </div>
          ) : gratitudes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gratitudes.map((entry) => (
                <div key={entry.id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-mint/20 transition-colors">
                  <p className="text-sm text-text italic">"{entry.content}"</p>
                  <p className="text-[10px] text-text-muted mt-2 uppercase tracking-tighter">
                    {new Date(entry.loggedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-10 italic">
              Your journal is empty. What's one small thing that made you smile today?
            </p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
