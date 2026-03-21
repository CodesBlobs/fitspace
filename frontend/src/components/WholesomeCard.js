'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WholesomeCard() {
  const [affirmation, setAffirmation] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWholesomeData();
  }, []);

  const fetchWholesomeData = async () => {
    try {
      const [affRes, gratRes] = await Promise.all([
        api.get('/wellness/affirmation'),
        api.get('/wellness/gratitude'),
      ]);
      setAffirmation(affRes.data.affirmation);
      setHistory(gratRes.data.entries || []);
    } catch (err) {
      console.error('Failed to fetch wholesome data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGratitude = async (e) => {
    e.preventDefault();
    if (!gratitude.trim()) return;
    setSaving(true);
    try {
      const res = await api.post('/wellness/gratitude', { content: gratitude });
      setHistory([res.data.entry, ...history].slice(0, 3));
      setGratitude('');
    } catch (err) {
      console.error('Save gratitude error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-mint/20 to-sky/20 p-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wider flex items-center gap-2">
          <span>🌿</span> Wholesome Corner
        </h3>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* Affirmation */}
        <div className="relative">
          <div className="absolute -top-2 -left-2 text-3xl opacity-20 grayscale">"</div>
          <p className="text-text-muted italic text-sm leading-relaxed px-4 text-center">
            {loading ? 'Thinking happy thoughts...' : affirmation}
          </p>
          <div className="absolute -bottom-2 -right-2 text-3xl opacity-20 grayscale">"</div>
        </div>

        {/* Gratitude Form */}
        <div>
          <label className="text-xs font-medium text-lavender block mb-2">What are you grateful for today?</label>
          <form onSubmit={handleSaveGratitude} className="flex gap-2">
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="e.g. A good cup of coffee..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-mint/50 transition-colors"
            />
            <button
              disabled={saving}
              className="bg-mint/80 hover:bg-mint text-white px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? '...' : 'Save'}
            </button>
          </form>
        </div>

        {/* Recent Gratitude */}
        {history.length > 0 && (
          <div className="mt-auto pt-4 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-3 font-semibold">Recent Gratitude</p>
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="text-mint">✨</span>
                  <span className="truncate">{entry.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
