import './globals.css';

export const metadata = {
  title: 'FitSpace — AI-Powered Fitness Assistant',
  description: 'Track your fitness, nutrition, sleep, and wellness with AI-powered insights. Log meals, workouts, water intake, and mood — all in one beautiful app.',
  keywords: 'fitness, nutrition, workout, health, AI, tracker',
  icons: {
    icon: '/logo-premium.png',
    apple: '/logo-premium.png',
  },
};

import { AuthProvider } from '@/lib/auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
