import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-12 px-6" style={{
      background: 'linear-gradient(135deg, #f0fdfa 0%, #fdf4ff 50%, #fff1f2 100%)',
    }}>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-white/30 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <img 
              src="/logo.png" 
              alt="FitSpace Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-800">FitSpace</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all border border-transparent">
            Log In
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2 shadow-md hover:shadow-lg transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center text-center mt-12 mb-24">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/60 border border-white/40 shadow-sm text-sm font-medium text-rose-dark/80 mb-6 animate-fadeIn">
          ✨ Your AI-Powered Fitness Assistant
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight animate-slideUp">
          Shape your health with <br/>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #a78bfa, #f472b6, #60b5f6)' }}>
            intelligent insights.
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-2xl animate-slideUp" style={{ animationDelay: '0.1s' }}>
          Track your meals, workouts, sleep, and mood. Let AI analyze your nutrition and build personalized workouts to help you reach your goals faster.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <Link href="/register" className="btn-primary px-8 py-4 text-lg shadow-xl shadow-rose-light/50 hover:shadow-rose-dark/40 hover:-translate-y-1 transition-all">
            Start Your Journey
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm" style={{ background: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)' }}>
            🥗
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">AI Nutritionist</h3>
          <p className="text-gray-600 leading-relaxed">
            Just type what you ate. Our AI automatically calculates estimated calories, protein, carbs, and fat with tailored health tips.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm" style={{ background: 'linear-gradient(135deg, #eff6ff, #bfdbfe)' }}>
            💪
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Workouts</h3>
          <p className="text-gray-600 leading-relaxed">
            Tell us your equipment and focus area. We'll generate a personalized, step-by-step workout routine instantly.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="glass-card p-8 group hover:-translate-y-2 transition-transform duration-300">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm" style={{ background: 'linear-gradient(135deg, #fff1f2, #fbcfe8)' }}>
            📊
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Holistic Tracking</h3>
          <p className="text-gray-600 leading-relaxed">
            Monitor water intake, sleep quality, and daily mood all in one beautiful, pastel-tinted dashboard.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-24 pt-8 border-t border-black/5 flex justify-between items-center text-gray-500 text-sm">
        <p>© 2026 FitSpace. All rights reserved.</p>
        <p>Built with Next.js & Tailwind</p>
      </footer>
    </div>
  );
}
