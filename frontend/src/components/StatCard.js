'use client';

// ─── Stat Card ──────────────────────────────────────────────
// Reusable dashboard card with icon, value, label, gradient accent

export default function StatCard({ icon, label, value, subtitle, color = 'lavender', className = '' }) {
  const colorMap = {
    lavender: { bg: 'bg-lavender-light', accent: 'bg-lavender-dark', text: 'text-lavender-dark' },
    mint: { bg: 'bg-mint-light', accent: 'bg-mint-dark', text: 'text-mint-dark' },
    peach: { bg: 'bg-peach-light', accent: 'bg-peach-dark', text: 'text-peach-dark' },
    sky: { bg: 'bg-sky-light', accent: 'bg-sky-dark', text: 'text-sky-dark' },
    rose: { bg: 'bg-rose-light', accent: 'bg-rose-dark', text: 'text-rose-dark' },
    sunshine: { bg: 'bg-sunshine-light', accent: 'bg-sunshine-dark', text: 'text-sunshine-dark' },
  };

  const c = colorMap[color] || colorMap.lavender;

  return (
    <div className={`glass-card p-5 animate-fade-in ${className}`} style={{ opacity: 0 }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-bold ${c.text} mb-0.5`}>{value}</div>
      <div className="text-sm text-text-muted font-medium">{label}</div>
      {subtitle && <div className="text-xs text-text-light mt-1">{subtitle}</div>}
      <div className={`h-1 rounded-full ${c.accent} mt-3 opacity-30`} />
    </div>
  );
}
