'use client';

// ─── Sidebar Navigation ────────────────────────────────────
// Pastel gradient sidebar with icons and active states

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/meals', label: 'Meals', icon: '🍽️' },
  { href: '/workouts', label: 'Workouts', icon: '💪' },
  { href: '/tracking', label: 'Tracking', icon: '💧' },
  { href: '/wellness', label: 'Wellness', icon: '🌿' },
  { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { href: '/log', label: 'Quick Log', icon: '➕', primary: true },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];



export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col" style={{
      background: 'linear-gradient(180deg, #1e1b2e 0%, #2d2745 50%, #1e1b2e 100%)',
    }}>
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 group transition-all duration-300">
          <div className="w-12 h-12 relative">
            <Image
              src="/logo-premium.png"
              alt="FitSpace Premium Logo"
              fill
              className="object-contain filter drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
              sizes="48px"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight group-hover:text-lavender transition-colors">FitSpace</h1>
            <p className="text-[10px] text-lavender uppercase tracking-[0.2em] opacity-60 font-medium">Holistic Wellness</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? (item.primary ? 'bg-rose text-white shadow-lg' : 'bg-lavender-dark/20 text-white shadow-lg shadow-lavender-dark/10')
                  : (item.primary ? 'bg-rose/10 text-rose hover:bg-rose/20' : 'text-gray-400 hover:text-white hover:bg-white/5')
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && !item.primary && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lavender-dark" />
              )}
            </Link>

          );
        })}
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-4 mx-3 mb-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white border border-white/10 shadow-inner" style={{
              background: 'linear-gradient(135deg, #a78bfa, #60b5f6)',
            }}>
              {user.avatar || user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-gray-400 hover:text-rose-dark transition-colors py-1.5 rounded-lg hover:bg-white/5"
          >
            Sign out →
          </button>
        </div>
      )}
    </aside>
  );
}
