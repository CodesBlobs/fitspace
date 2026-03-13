'use client';
export const dynamic = 'force-dynamic';

// ─── Tracking Page (Unified API) ────────────────────────────
// Water, Sleep, and Mood logging with server-side DB persistence

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'energetic', emoji: '⚡', label: 'Energetic' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
];

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState('water');
  const [loading, setLoading] = useState(true);

  // Stats
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);
  const [waterGoal, setWaterGoal] = useState(2500);
  
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState(4);
  const [sleepNotes, setSleepNotes] = useState('');
  const [sleepLogs, setSleepLogs] = useState([]);
  
  const [mood, setMood] = useState('happy');
  const [energy, setEnergy] = useState(4);
  const [moodNotes, setMoodNotes] = useState('');
  const [moodLogs, setMoodLogs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [waterData, sleepData, moodData, profileData] = await Promise.all([
        api.getWater(),
        api.getSleep(),
        api.getMood(),
        api.getProfile(),
      ]);
      
      setWaterLogs(waterData.logs);
      setWaterTotal(waterData.totalToday);
      setWaterGoal(profileData.user?.dailyWaterGoal || 2500);
      
      setSleepLogs(sleepData.logs);
      setMoodLogs(moodData.logs);
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  const logWater = async (amount) => {
    try {
      await api.logWater(amount);
      const data = await api.getWater();
      setWaterLogs(data.logs);
      setWaterTotal(data.totalToday);
    } catch (err) { console.error(err); }
  };

  const logSleep = async (e) => {
    e.preventDefault();
    try {
      await api.logSleep({ hours: parseFloat(sleepHours), quality: sleepQuality, notes: sleepNotes });
      setSleepNotes('');
      const data = await api.getSleep();
      setSleepLogs(data.logs);
    } catch (err) { console.error(err); }
  };

  const logMood = async (e) => {
    e.preventDefault();
    try {
      await api.logMood({ mood, energy, notes: moodNotes });
      setMoodNotes('');
      const data = await api.getMood();
      setMoodLogs(data.logs);
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
    { id: 'mood', label: 'Mood', icon: '😊' },
  ];

  const waterPercentage = Math.min(100, Math.round((waterTotal / waterGoal) * 100));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto animate-fade-in" style={{ opacity: 0 }}>
        <div className="mb-8">
          <h1 className="text-2xl font-black text-text tracking-tight uppercase">Health Metrics</h1>
          <p className="text-text-muted text-sm mt-1 font-medium">Tracking is the first step to optimization.</p>
        </div>

        <div className="flex gap-2 mb-8 p-1.5 bg-surface rounded-2xl border-2 border-lavender-light/30 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-lavender-dark shadow-sm scale-[1.02]'
                  : 'text-text-muted hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
             <div className="h-64 glass-card animate-pulse" />
        ) : (
          <>
            {/* WATER TAB */}
            {activeTab === 'water' && (
              <div className="space-y-6">
                <div className="glass-card p-6 border-t-4 border-sky flex flex-col md:flex-row items-center gap-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e0f2fe" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#60b5f6" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - waterPercentage / 100)}`}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-sky-dark">{waterPercentage}%</span>
                      <span className="text-[10px] font-bold text-text-muted uppercase">{(waterTotal / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</span>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Quick Add</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { amount: 250, label: 'Cup (250ml)' },
                        { amount: 500, label: 'Bottle (500ml)' },
                        { amount: 330, label: 'Can (330ml)' },
                        { amount: 750, label: 'Large (750ml)' },
                      ].map((opt) => (
                        <button key={opt.amount} onClick={() => logWater(opt.amount)} className="btn-secondary py-3 text-xs font-bold border-2 border-sky-light/50 hover:border-sky">
                          💧 {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Recent Logs</h3>
                  {waterLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="glass-card p-3 flex items-center gap-3 animate-fade-in">
                      <span className="w-8 h-8 rounded-lg bg-sky-light/20 flex items-center justify-center">💧</span>
                      <span className="font-bold text-sm text-sky-dark">{log.amount}ml</span>
                      <span className="text-[10px] font-bold text-text-muted ml-auto uppercase">{new Date(log.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SLEEP TAB */}
            {activeTab === 'sleep' && (
              <div className="space-y-6">
                <div className="glass-card p-6 border-t-4 border-mint">
                  <h2 className="text-lg font-black text-text mb-6">😴 Log Night Sleep</h2>
                  <form onSubmit={logSleep} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Duration (hours)</label>
                        <input type="number" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="input py-3 font-bold" step="0.5" min="0" max="24" required />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Sleep Quality</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((q) => (
                            <button key={q} type="button" onClick={() => setSleepQuality(q)}
                              className={`w-12 h-12 rounded-2xl text-xl transition-all ${q <= sleepQuality ? 'bg-mint-light border-2 border-mint-dark shadow-sm scale-110' : 'bg-surface-subtle opacity-50'}`}>⭐</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Notes</label>
                      <input type="text" value={sleepNotes} onChange={(e) => setSleepNotes(e.target.value)} className="input" placeholder="e.g. Woke up once, felt refreshed..." />
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 font-black text-lg">✅ Save Sleep Log</button>
                  </form>
                </div>
                <div className="space-y-2">
                   <h3 className="text-xs font-black text-text-muted uppercase tracking-widest px-1">History</h3>
                  {sleepLogs.map((log) => (
                    <div key={log.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in group hover:translate-x-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-mint-light/20 flex items-center justify-center text-xl">😴</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                           <span className="font-black text-mint-dark">{log.hours.toFixed(1)}h</span>
                           <span className="text-xs opacity-80">{'⭐'.repeat(log.quality)}</span>
                        </div>
                        {log.notes && <p className="text-xs text-text-muted mt-1 font-medium">{log.notes}</p>}
                      </div>
                      <span className="text-[10px] font-bold text-text-muted uppercase">{new Date(log.loggedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MOOD TAB */}
            {activeTab === 'mood' && (
              <div className="space-y-6">
                <div className="glass-card p-6 border-t-4 border-sunshine">
                  <h2 className="text-lg font-black text-text mb-6">😊 How's your energy?</h2>
                  <form onSubmit={logMood} className="space-y-6">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {moodOptions.map((m) => (
                        <button key={m.value} type="button" onClick={() => setMood(m.value)}
                          className={`flex flex-col items-center gap-1 py-4 rounded-2xl transition-all ${mood === m.value ? 'bg-sunshine-light border-2 border-sunshine-dark shadow-sm scale-105' : 'bg-surface-subtle opacity-50 hover:opacity-100 hover:bg-surface'}`}>
                          <span className="text-3xl">{m.emoji}</span>
                          <span className="text-[10px] font-black uppercase tracking-tighter mt-1">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Energy Level (1-5)</label>
                      <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((e) => (
                          <button key={e} type="button" onClick={() => setEnergy(e)}
                            className={`flex-1 h-12 rounded-2xl text-xl transition-all flex items-center justify-center ${e <= energy ? 'bg-peach-light border-2 border-peach-dark shadow-sm' : 'bg-surface-subtle opacity-50'}`}>
                            <span className={e <= energy ? 'animate-pulse text-xl' : 'text-sm opacity-30'}>⚡</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-4 font-black text-lg bg-sunshine hover:bg-sunshine-dark border-sunshine-dark/20">✅ Log Mood</button>
                  </form>
                </div>
                <div className="space-y-2">
                   <h3 className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Reflection History</h3>
                  {moodLogs.map((log) => (
                    <div key={log.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in group hover:translate-x-1 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-sunshine-light/20 flex items-center justify-center text-2xl">
                         {moodOptions.find(m => m.value === log.mood)?.emoji || '😊'}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-text capitalize">{log.mood} <span className="text-xs font-bold text-text-muted ml-2">Energy: {'⚡'.repeat(log.energy)}</span></p>
                        {log.notes && <p className="text-xs text-text-muted mt-1 font-medium">{log.notes}</p>}
                      </div>
                       <span className="text-[10px] font-bold text-text-muted uppercase">{new Date(log.loggedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
