// ─── FitSpace Backend — Express Server Entry Point ─────────
// Mounts all route modules, configures CORS & JSON parsing

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const workoutRoutes = require('./routes/workouts');
const trackingRoutes = require('./routes/tracking');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/user');


const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.fitspace.app') || origin.endsWith('.essaycraftedu.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to true for local dev, but restrict in production
    }

  },
  credentials: true
}));

app.use(express.json());

// ─── Health Check ───────────────────────────────────────────
app.get('/from-fitspace/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────────────────
app.use('/from-fitspace/auth', authRoutes);
app.use('/from-fitspace/meals', mealRoutes);
app.use('/from-fitspace/workouts', workoutRoutes);
app.use('/from-fitspace/tracking', trackingRoutes);
app.use('/from-fitspace/ai', aiRoutes);
app.use('/from-fitspace/dashboard', dashboardRoutes);
app.use('/from-fitspace/user', userRoutes);

// ─── Platform API (v1) ──────────────────────────────────────
const v1AnalyticsRoutes = require('./routes/v1/analytics');
const v1AdminRoutes = require('./routes/v1/admin');
const v1PromoRoutes = require('./routes/v1/promo');
const v1GamificationRoutes = require('./routes/v1/gamification');

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', api: 'v1', timestamp: new Date().toISOString() });
});

app.use('/api/v1/analytics', v1AnalyticsRoutes);
app.use('/api/v1/admin', v1AdminRoutes);
app.use('/api/v1/promo', v1PromoRoutes);
app.use('/api/v1/gamification', v1GamificationRoutes);



// ─── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🏋️ FitSpace API running on http://localhost:${PORT}`);
});

module.exports = app;
