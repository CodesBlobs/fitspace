'use client';

// ─── Unified Log Page ─────────────────────────────────────────
// A single interface for logging all daily activities and stats

import { useState, useRef } from 'react';
import AppShell from '@/components/AppShell';

import api from '@/lib/api';

export default function UnifiedLogPage() {
  const [activeTab, setActiveTab] = useState('meal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Form states
  const [mealDesc, setMealDesc] = useState('');
  const [workoutDesc, setWorkoutDesc] = useState('');
  const [sleepHours, setSleepHours] = useState('8');
  const [waterAmount, setWaterAmount] = useState('250');
  const [mood, setMood] = useState('happy');

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // 🎙️ Voice Dictation Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'record.webm');

        setLoading(true);
        try {
          const response = await api.post('/ai/transcribe', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          const text = response.data.text;
          if (activeTab === 'meal') setMealDesc(text);
          else if (activeTab === 'workout') setWorkoutDesc(text);
          
          showSuccess('Voice transcribed! ✨');
        } catch (err) {
          console.error('Transcription failed:', err);
        } finally {
          setLoading(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const logMeal = async (e) => {
// ... existing logMeal code ...

    e.preventDefault();
    setLoading(true);
    try {
      // First analyze via AI
      const analysis = await api.post('/ai/analyze-meal', { description: mealDesc });
      const { calories, protein, carbs, fat } = analysis.data;
      // Then save
      await api.post('/meals', { 
        description: mealDesc, 
        mealType: 'lunch', // Default for quick log
        calories, 
        protein, 
        carbs, 
        fat 
      });
      setMealDesc('');
      showSuccess('Meal logged! 🍽️');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const logWorkout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/workouts', { name: workoutDesc, duration: 30, calories: 250, type: 'strength' });
      setWorkoutDesc('');
      showSuccess('Workout logged! 💪');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const logQuickStat = async (type, data) => {
    setLoading(true);
    try {
      await api.post(`/tracking/${type}`, data);
      showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated! ✨`);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Quick Log</h1>
            <p className="text-text-muted text-sm mt-1">Record your progress in one place</p>
          </div>
          {success && (
            <div className="bg-mint-light text-mint-dark px-4 py-2 rounded-xl text-sm font-bold animate-bounce-soft border border-mint-dark/10">
              {success}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-surface rounded-2xl mb-8 gap-1 border border-lavender-light/50 shadow-inner">
          {[
            { id: 'meal', label: 'Meal', icon: '🍽️' },
            { id: 'workout', label: 'Workout', icon: '💪' },
            { id: 'stats', label: 'Stats', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-lavender-dark shadow-sm'
                  : 'text-text-muted hover:bg-white/50'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Meal Log ─────────────────────────────────────────── */}
        {activeTab === 'meal' && (
          <form onSubmit={logMeal} className="glass-card p-8 animate-fade-in">
            <label className="block text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">What did you eat?</label>
            <div className="relative">
              <textarea
                value={mealDesc}
                onChange={(e) => setMealDesc(e.target.value)}
                placeholder="e.g., Avocado toast with two poached eggs"
                className="input min-h-[120px] mb-6 text-lg p-5 pr-14 leading-relaxed"
                required
              />
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`absolute right-4 top-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isRecording && activeTab === 'meal'
                    ? 'bg-rose text-white animate-pulse'
                    : 'bg-lavender-light text-lavender-dark hover:bg-lavender'
                }`}
                title="Hold to record"
              >
                🎙️
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !mealDesc}
              className="btn-primary w-full py-4 text-lg font-black group relative overflow-hidden"
            >
              <span className="relative z-10">{loading ? '⌛ Analyzing Nutrition...' : '✅ Log Meal'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose to-peach opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
            <p className="text-[10px] text-center text-text-muted mt-4 italic">
              AI will automatically calculate calories and macros for you.
            </p>
          </form>
        )}

        {/* ─── Workout Log ─────────────────────────────────────── */}
        {activeTab === 'workout' && (
          <form onSubmit={logWorkout} className="glass-card p-8 animate-fade-in border-t-4 border-lavender">
            <label className="block text-sm font-bold text-text-muted mb-3 uppercase tracking-wider">Workout Description</label>
            <div className="relative">
              <input
                type="text"
                value={workoutDesc}
                onChange={(e) => setWorkoutDesc(e.target.value)}
                placeholder="e.g., 5km run at the park"
                className="input mb-6 pr-14"
                required
              />
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`absolute right-4 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isRecording && activeTab === 'workout'
                    ? 'bg-rose text-white animate-pulse'
                    : 'bg-lavender-light text-lavender-dark hover:bg-lavender'
                }`}
                title="Hold to record"
              >
                🎙️
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !workoutDesc}
              className="btn-primary bg-lavender hover:bg-lavender-dark border-lavender-dark/20 w-full py-4 text-lg font-black"
            >
              {loading ? '⌛ Saving...' : '✅ Log Workout'}
            </button>
          </form>
        )}

        {/* ─── Quick Stats ─────────────────────────────────────── */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-6 flex items-center justify-between gap-4 border-l-4 border-sky">
              <div className="flex-1">
                <label className="block text-xs font-bold text-sky-dark mb-1 uppercase tracking-tighter">Hydration</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={waterAmount}
                    onChange={(e) => setWaterAmount(e.target.value)}
                    className="input py-2 text-center font-bold"
                  />
                  <span className="text-text-muted">ml</span>
                </div>
              </div>
              <button
                onClick={() => logQuickStat('water', { amount: parseInt(waterAmount) })}
                className="btn-primary bg-sky hover:bg-sky-dark border-sky-dark/20 h-14 w-14 rounded-2xl flex items-center justify-center text-xl"
              >
                💧
              </button>
            </div>

            <div className="glass-card p-6 flex items-center justify-between gap-4 border-l-4 border-mint">
              <div className="flex-1">
                <label className="block text-xs font-bold text-mint-dark mb-1 uppercase tracking-tighter">Sleep</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="input py-2 text-center font-bold"
                    step="0.5"
                  />
                  <span className="text-text-muted">hrs</span>
                </div>
              </div>
              <button
                onClick={() => logQuickStat('sleep', { hours: parseFloat(sleepHours), quality: 4 })}
                className="btn-primary bg-mint hover:bg-mint-dark border-mint-dark/20 h-14 w-14 rounded-2xl flex items-center justify-center text-xl"
              >
                😴
              </button>
            </div>

            <div className="glass-card p-6 grid grid-cols-5 gap-2 border-l-4 border-sunshine">
              {[
                { v: 'happy', e: '😊' },
                { v: 'energetic', e: '⚡' },
                { v: 'calm', e: '😌' },
                { v: 'tired', e: '😴' },
                { v: 'sad', e: '😢' },
              ].map((m) => (
                <button
                  key={m.v}
                  onClick={() => logQuickStat('mood', { mood: m.v, energy: 4 })}
                  className="bg-white/50 hover:bg-sunshine-light aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-105 border border-sunshine-dark/5 shadow-sm"
                >
                  {m.e}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
