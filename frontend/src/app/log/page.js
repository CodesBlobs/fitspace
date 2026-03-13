'use client';
export const dynamic = 'force-dynamic';

// ─── Unified Log Page (Unified API) ─────────────────────────
// Quick logging with voice dictation via server APIs

import { useState, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { api } from '@/lib/api';

export default function UnifiedLogPage() {
  const [activeTab, setActiveTab] = useState('meal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [mealDesc, setMealDesc] = useState('');
  const [workoutDesc, setWorkoutDesc] = useState('');
  const [sleepHours, setSleepHours] = useState('8');
  const [waterAmount, setWaterAmount] = useState('250');

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setLoading(true);
        try {
          const text = await api.transcribe(audioBlob);
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
    } catch (err) { console.error('Recording error:', err); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const logMeal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { analysis } = await api.analyzeMeal(mealDesc);
      await api.logMeal({
        description: mealDesc,
        mealType: 'meal',
        ...analysis,
        aiAnalysis: JSON.stringify(analysis)
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
      await api.logWorkout({ name: workoutDesc, duration: 30, type: 'strength' });
      setWorkoutDesc('');
      showSuccess('Workout logged! 💪');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const logQuickStat = async (type, data) => {
    try {
      if (type === 'water') await api.logWater(data.amount);
      else if (type === 'sleep') await api.logSleep(data);
      else if (type === 'mood') await api.logMood(data);
      showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated! ✨`);
    } catch (err) { console.error(err); }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-text tracking-tight uppercase">Express Entry</h1>
            <p className="text-text-muted text-sm mt-1 font-medium">Fast logs, faster results.</p>
          </div>
          {success && (
            <div className="bg-mint-light text-mint-dark px-4 py-2 rounded-xl text-xs font-black animate-bounce-soft border-2 border-mint-dark/10 shadow-sm">
              {success}
            </div>
          )}
        </div>

        <div className="flex p-1.5 bg-surface rounded-2xl mb-8 gap-1 border-2 border-lavender-light/30 shadow-inner">
          {[
            { id: 'meal', label: 'Meal', icon: '🍽️' },
            { id: 'workout', label: 'Workout', icon: '💪' },
            { id: 'stats', label: 'Stats', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-lavender-dark shadow-sm scale-[1.02]'
                  : 'text-text-muted hover:bg-white/50 underline-offset-4'
              }`}
            >
              <span>{tab.icon}</span> {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Meal Log */}
        {activeTab === 'meal' && (
          <form onSubmit={logMeal} className="glass-card p-8 animate-fade-in border-t-4 border-rose">
            <label className="block text-[10px] font-black text-text-muted mb-4 uppercase tracking-[0.2em]">What did we eat?</label>
            <div className="relative">
              <textarea
                value={mealDesc}
                onChange={(e) => setMealDesc(e.target.value)}
                placeholder="Describe your meal..."
                className="input min-h-[140px] mb-6 text-xl p-6 pr-16 leading-relaxed font-medium"
                required
              />
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`absolute right-4 top-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose text-white animate-pulse shadow-rose/40 shadow-xl scale-110'
                    : 'bg-lavender-light text-lavender-dark hover:bg-lavender shadow-md'
                }`}
                title="Hold to record"
              >
                🎙️
              </button>
            </div>
            <button type="submit" disabled={loading || !mealDesc} className="btn-primary w-full py-5 text-xl font-black group relative overflow-hidden">
              <span className="relative z-10">{loading ? '⌛ Analyzing Nutrition...' : '✅ Confirm Meal Log'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-rose to-peach opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </form>
        )}

        {/* Workout Log */}
        {activeTab === 'workout' && (
          <form onSubmit={logWorkout} className="glass-card p-8 animate-fade-in border-t-4 border-lavender">
            <label className="block text-[10px] font-black text-text-muted mb-4 uppercase tracking-[0.2em]">Activity Details</label>
            <div className="relative">
              <input
                type="text"
                value={workoutDesc}
                onChange={(e) => setWorkoutDesc(e.target.value)}
                placeholder="Log your workout..."
                className="input mb-6 h-16 pr-16 text-lg font-bold"
                required
              />
              <button
                type="button"
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                className={`absolute right-4 top-2 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose text-white animate-pulse'
                    : 'bg-lavender-light text-lavender-dark hover:bg-lavender'
                }`}
                title="Hold to record"
              >
                🎙️
              </button>
            </div>
            <button type="submit" disabled={loading || !workoutDesc} className="btn-primary w-full py-5 text-xl font-black bg-lavender hover:bg-lavender-dark border-lavender-dark/20 shadow-lavender/20">
              {loading ? '⌛ Saving...' : '✅ Confirm Workout'}
            </button>
          </form>
        )}

        {/* Quick Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-6 flex items-center justify-between gap-6 border-l-8 border-sky shadow-sky/5 shadow-xl">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-sky-dark mb-1 uppercase tracking-widest">Hydration</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={waterAmount} onChange={(e) => setWaterAmount(e.target.value)} className="input py-2 text-center font-black text-xl w-32" />
                  <span className="text-sm font-bold text-text-muted uppercase">ml</span>
                </div>
              </div>
              <button onClick={() => logQuickStat('water', { amount: parseInt(waterAmount) })} className="bg-sky text-white h-16 w-16 rounded-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-sky/30">💧</button>
            </div>

            <div className="glass-card p-6 flex items-center justify-between gap-6 border-l-8 border-mint shadow-mint/5 shadow-xl">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-mint-dark mb-1 uppercase tracking-widest">Sleep</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} className="input py-2 text-center font-black text-xl w-32" step="0.5" />
                  <span className="text-sm font-bold text-text-muted uppercase">hrs</span>
                </div>
              </div>
              <button onClick={() => logQuickStat('sleep', { hours: parseFloat(sleepHours), quality: 4 })} className="bg-mint text-white h-16 w-16 rounded-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-mint/30">😴</button>
            </div>

            <div className="glass-card p-6 border-l-8 border-sunshine shadow-sunshine/5 shadow-xl">
              <label className="block text-[10px] font-black text-sunshine-dark mb-4 uppercase tracking-widest">Current Vibe</label>
              <div className="grid grid-cols-5 gap-3">
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
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center text-3xl transition-all hover:scale-110 bg-white border-2 border-lavender-light/20 hover:border-sunshine shadow-sm"
                  >
                    {m.e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
