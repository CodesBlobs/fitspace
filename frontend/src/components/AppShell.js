'use client';

// ─── App Shell ──────────────────────────────────────────────
// Wraps authenticated pages with AuthProvider + Sidebar

import Sidebar from '@/components/Sidebar';
import { ProtectedRoute } from '@/lib/auth';

export default function AppShell({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
