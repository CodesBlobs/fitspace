'use client';

// ─── Workout Timer Component ────────────────────────────────
// Draggable/Floating timer to track workout duration

import { useState, useEffect, useRef } from 'react';

export default function WorkoutTimer({ onFinish }) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    const finalMinutes = Math.max(1, Math.round(seconds / 60));
    onFinish(finalMinutes);
    setSeconds(0);
  };

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-lavender text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce-soft z-50 border-4 border-white"
      >
        ⏱️
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-64 glass-card p-5 shadow-2xl animate-fade-in z-50 border-t-4 border-lavender">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-lavender-dark">Active Session</h3>
        <button onClick={() => setIsMinimized(true)} className="text-text-muted hover:text-text">➖</button>
      </div>
      
      <div className="text-4xl font-mono font-black text-center mb-6 text-text tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="flex gap-2">
        {!isActive ? (
          <button 
            onClick={() => setIsActive(true)}
            className="flex-1 btn-primary bg-mint hover:bg-mint-dark border-mint-dark/20 text-xs py-2"
          >
            ▶️ Start
          </button>
        ) : (
          <button 
            onClick={() => setIsActive(false)}
            className="flex-1 btn-secondary text-xs py-2"
          >
            ⏸️ Pause
          </button>
        )}
        <button 
          onClick={handleFinish}
          className="flex-1 btn-primary text-xs py-2"
        >
          🏁 Finish
        </button>
      </div>
    </div>
  );
}
