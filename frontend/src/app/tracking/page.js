'use client';

// ─── Tracking Page ──────────────────────────────────────────
// Water, Sleep, and Mood logging with quick-log buttons and history

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import api from '@/lib/api';

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

  // Water state
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);

  // Sleep state
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState(4);
  const [sleepNotes, setSleepNotes] = useState('');
  const [sleepLogs, setSleepLogs] = useState([]);

  // Mood state
  const [mood, setMood] = useState('happy');
  const [energy, setEnergy] = useState(4);
  const [moodNotes, setMoodNotes] = useState('');
  const [moodLogs, setMoodLogs] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchWater(), fetchSleep(), fetchMood()]).then(() => setLoading(false));
  }, []);

  // ─── Water Handlers ────────────────────────────────────────
  const fetchWater = async () => {
    try {
      const { data } = await api.get('/tracking/water');
      setWaterLogs(data.logs);
      setWaterTotal(data.totalToday);
    } catch (err) { console.error(err); }
  };

  const logWater = async (amount) => {
    try {
      await api.post('/tracking/water', { amount });
      fetchWater();
    } catch (err) { console.error(err); }
  };

  // ─── Sleep Handlers ────────────────────────────────────────
  const fetchSleep = async () => {
    try {
      const { data } = await api.get('/tracking/sleep');
      setSleepLogs(data.logs);
    } catch (err) { console.error(err); }
  };

  const logSleep = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tracking/sleep', {
        hours: parseFloat(sleepHours),
        quality: sleepQuality,
        notes: sleepNotes,
      });
      setSleepNotes('');
      fetchSleep();
    } catch (err) { console.error(err); }
  };

  // ─── Mood Handlers ────────────────────────────────────────
  const fetchMood = async () => {
    try {
      const { data } = await api.get('/tracking/mood');
      setMoodLogs(data.logs);
    } catch (err) { console.error(err); }
  };

  const logMood = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tracking/mood', { mood, energy, notes: moodNotes });
      setMoodNotes('');
      fetchMood();
    } catch (err) { console.error(err); }
  };

  const tabs = [
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
    { id: 'mood', label: 'Mood', icon: '😊' },
  ];

  const waterGoal = 2500; // ml
  const waterPercentage = Math.min(100, Math.round((waterTotal / waterGoal) * 100));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text">Tracking</h1>
          <p className="text-text-muted text-sm mt-1">Monitor your water, sleep, and mood</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-lavender-light text-lavender-dark border-2 border-lavender-dark shadow-sm'
                  : 'bg-surface text-text-muted border-2 border-transparent hover:bg-surface-subtle'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═════════════════ WATER TAB ═════════════════ */}
        {activeTab === 'water' && (
          <div className="animate-fade-in" style={{ opacity: 0 }}>
            <div className="glass-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-text mb-4">💧 Water Intake</h2>

              {/* Progress Ring */}
              <div className="flex items-center gap-8 mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e0f2fe" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="#60b5f6" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - waterPercentage / 100)}`}
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-sky-dark">{waterPercentage}%</span>
                    <span className="text-xs text-text-muted">{(waterTotal / 1000).toFixed(1)}L / {(waterGoal / 1000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex-1">
                  <p className="text-sm text-text-muted mb-3">Quick Add</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { amount: 250, label: '1 Glass (250ml)' },
                      { amount: 500, label: 'Bottle (500ml)' },
                      { amount: 330, label: 'Can (330ml)' },
                      { amount: 750, label: 'Large (750ml)' },
                    ].map((opt) => (
                      <button
                        key={opt.amount}
                        onClick={() => logWater(opt.amount)}
                        className="btn-secondary text-xs py-2"
                      >
                        💧 {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Water History */}
            <h3 className="text-sm font-semibold text-text-muted mb-3">Recent Water Logs</h3>
            <div className="space-y-2">
              {waterLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="glass-card p-3 flex items-center gap-3">
                  <span>💧</span>
                  <span className="font-medium text-sm text-sky-dark">{log.amount}ml</span>
                  <span className="text-xs text-text-muted ml-auto">{new Date(log.loggedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════════ SLEEP TAB ═════════════════ */}
        {activeTab === 'sleep' && (
          <div className="animate-fade-in" style={{ opacity: 0 }}>
            <div className="glass-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-text mb-4">😴 Log Sleep</h2>
              <form onSubmit={logSleep}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-1.5">Hours Slept</label>
                    <input
                      type="number"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      className="input"
                      step="0.5"
                      min="0"
                      max="24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Quality</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSleepQuality(q)}
                          className={`w-10 h-10 rounded-xl text-lg transition-all ${
                            q <= sleepQuality
                              ? 'bg-mint-light border-2 border-mint-dark'
                              : 'bg-surface-subtle border-2 border-transparent'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Notes (optional)</label>
                  <input
                    type="text"
                    value={sleepNotes}
                    onChange={(e) => setSleepNotes(e.target.value)}
                    className="input"
                    placeholder="Woke up refreshed..."
                  />
                </div>
                <button type="submit" className="btn-primary">✅ Log Sleep</button>
              </form>
            </div>

            <h3 className="text-sm font-semibold text-text-muted mb-3">Sleep History</h3>
            <div className="space-y-2">
              {sleepLogs.map((log) => (
                <div key={log.id} className="glass-card p-3 flex items-center gap-3">
                  <span>😴</span>
                  <span className="font-medium text-sm text-mint-dark">{log.hours.toFixed(1)}h</span>
                  <span className="text-xs">{'⭐'.repeat(log.quality)}</span>
                  {log.notes && <span className="text-xs text-text-muted truncate">{log.notes}</span>}
                  <span className="text-xs text-text-muted ml-auto">{new Date(log.loggedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════════ MOOD TAB ═════════════════ */}
        {activeTab === 'mood' && (
          <div className="animate-fade-in" style={{ opacity: 0 }}>
            <div className="glass-card p-6 mb-6">
              <h2 className="text-lg font-semibold text-text mb-4">😊 Log Mood</h2>
              <form onSubmit={logMood}>
                {/* Mood Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-muted mb-2">How are you feeling?</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {moodOptions.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(m.value)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl text-sm transition-all ${
                          mood === m.value
                            ? 'bg-sunshine-light border-2 border-sunshine-dark shadow-sm'
                            : 'bg-surface-subtle border-2 border-transparent hover:bg-surface'
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-xs font-medium">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-muted mb-2">Energy Level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setEnergy(e)}
                        className={`w-10 h-10 rounded-xl text-lg transition-all ${
                          e <= energy
                            ? 'bg-peach-light border-2 border-peach-dark'
                            : 'bg-surface-subtle border-2 border-transparent'
                        }`}
                      >
                        ⚡
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-muted mb-1.5">Notes (optional)</label>
                  <input
                    type="text"
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    className="input"
                    placeholder="Had a productive morning..."
                  />
                </div>
                <button type="submit" className="btn-primary">✅ Log Mood</button>
              </form>
            </div>

            <h3 className="text-sm font-semibold text-text-muted mb-3">Mood History</h3>
            <div className="space-y-2">
              {moodLogs.map((log) => (
                <div key={log.id} className="glass-card p-3 flex items-center gap-3">
                  <span className="text-xl">{moodOptions.find((m) => m.value === log.mood)?.emoji || '😊'}</span>
                  <span className="font-medium text-sm text-text capitalize">{log.mood}</span>
                  <span className="text-xs text-text-muted">Energy: {'⚡'.repeat(log.energy)}</span>
                  {log.notes && <span className="text-xs text-text-muted truncate">{log.notes}</span>}
                  <span className="text-xs text-text-muted ml-auto">{new Date(log.loggedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
