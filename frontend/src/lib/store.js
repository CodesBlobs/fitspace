// ─── FitSpace Local Data Store ──────────────────────────────
// localStorage-backed CRUD for all fitness data.
// No backend required. Data persists in the browser.

const KEYS = {
  meals: 'fitspace_meals',
  workouts: 'fitspace_workouts',
  water: 'fitspace_water',
  sleep: 'fitspace_sleep',
  mood: 'fitspace_mood',
  profile: 'fitspace_profile',
};

// ─── Helpers ────────────────────────────────────────────────

function getCollection(key) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch { return []; }
}

function setCollection(key, data) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// ═══════════════════════════════════════════════════════════
// MEALS
// ═══════════════════════════════════════════════════════════

export function getMeals() {
  return getCollection(KEYS.meals).sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
}

export function addMeal(meal) {
  const meals = getCollection(KEYS.meals);
  const entry = { id: generateId(), loggedAt: new Date().toISOString(), ...meal };
  meals.push(entry);
  setCollection(KEYS.meals, meals);
  return entry;
}

export function deleteMeal(id) {
  setCollection(KEYS.meals, getCollection(KEYS.meals).filter(m => m.id !== id));
}

// ═══════════════════════════════════════════════════════════
// WORKOUTS
// ═══════════════════════════════════════════════════════════

export function getWorkouts() {
  return getCollection(KEYS.workouts).sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
}

export function addWorkout(workout) {
  const workouts = getCollection(KEYS.workouts);
  const entry = { id: generateId(), loggedAt: new Date().toISOString(), ...workout };
  workouts.push(entry);
  setCollection(KEYS.workouts, workouts);
  return entry;
}

export function deleteWorkout(id) {
  setCollection(KEYS.workouts, getCollection(KEYS.workouts).filter(w => w.id !== id));
}

// ═══════════════════════════════════════════════════════════
// WATER
// ═══════════════════════════════════════════════════════════

export function getWaterLogs() {
  return getCollection(KEYS.water).sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
}

export function addWater(amount) {
  const logs = getCollection(KEYS.water);
  const entry = { id: generateId(), amount, loggedAt: new Date().toISOString() };
  logs.push(entry);
  setCollection(KEYS.water, logs);
  return entry;
}

export function getWaterTotalToday() {
  const { start, end } = todayRange();
  return getCollection(KEYS.water)
    .filter(l => new Date(l.loggedAt) >= start && new Date(l.loggedAt) < end)
    .reduce((sum, l) => sum + l.amount, 0);
}

// ═══════════════════════════════════════════════════════════
// SLEEP
// ═══════════════════════════════════════════════════════════

export function getSleepLogs() {
  return getCollection(KEYS.sleep).sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
}

export function addSleep({ hours, quality, notes }) {
  const logs = getCollection(KEYS.sleep);
  const entry = { id: generateId(), hours, quality, notes: notes || null, loggedAt: new Date().toISOString() };
  logs.push(entry);
  setCollection(KEYS.sleep, logs);
  return entry;
}

// ═══════════════════════════════════════════════════════════
// MOOD
// ═══════════════════════════════════════════════════════════

export function getMoodLogs() {
  return getCollection(KEYS.mood).sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
}

export function addMood({ mood, energy, notes }) {
  const logs = getCollection(KEYS.mood);
  const entry = { id: generateId(), mood, energy, notes: notes || null, loggedAt: new Date().toISOString() };
  logs.push(entry);
  setCollection(KEYS.mood, logs);
  return entry;
}

// ═══════════════════════════════════════════════════════════
// PROFILE / SETTINGS
// ═══════════════════════════════════════════════════════════

const DEFAULT_PROFILE = {
  name: '',
  avatar: '👤',
  dailyWaterGoal: 2500,
  dailyCaloriesGoal: 2000,
  dailySleepGoal: 8,
  dailyWorkoutGoal: 30,
  weight: null,
  height: null,
};

export function getProfile() {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const stored = JSON.parse(localStorage.getItem(KEYS.profile));
    return { ...DEFAULT_PROFILE, ...stored };
  } catch { return { ...DEFAULT_PROFILE }; }
}

export function updateProfile(updates) {
  const current = getProfile();
  const merged = { ...current, ...updates };
  localStorage.setItem(KEYS.profile, JSON.stringify(merged));
  return merged;
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD AGGREGATION
// ═══════════════════════════════════════════════════════════

export function getDashboardSummary() {
  const { start, end } = todayRange();
  const inRange = (item) => {
    const d = new Date(item.loggedAt);
    return d >= start && d < end;
  };

  const profile = getProfile();
  const todayMeals = getCollection(KEYS.meals).filter(inRange);
  const todayWorkouts = getCollection(KEYS.workouts).filter(inRange);
  const todayWater = getCollection(KEYS.water).filter(inRange);
  const allSleep = getSleepLogs();
  const allMood = getMoodLogs();

  return {
    calories: {
      total: todayMeals.reduce((s, m) => s + (m.calories || 0), 0),
      protein: todayMeals.reduce((s, m) => s + (m.protein || 0), 0),
      carbs: todayMeals.reduce((s, m) => s + (m.carbs || 0), 0),
      fat: todayMeals.reduce((s, m) => s + (m.fat || 0), 0),
      goal: profile.dailyCaloriesGoal,
    },
    workouts: {
      count: todayWorkouts.length,
      minutes: todayWorkouts.reduce((s, w) => s + (w.duration || 0), 0),
      calories: todayWorkouts.reduce((s, w) => s + (w.calories || 0), 0),
      goal: profile.dailyWorkoutGoal,
    },
    water: {
      total: todayWater.reduce((s, w) => s + w.amount, 0),
      goal: profile.dailyWaterGoal,
    },
    sleep: allSleep.length > 0 ? { hours: allSleep[0].hours, quality: allSleep[0].quality, goal: profile.dailySleepGoal } : null,
    mood: allMood.length > 0 ? { mood: allMood[0].mood, energy: allMood[0].energy } : null,
    mealsLogged: todayMeals.length,
  };
}

export function getWeeklyTrends() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const meals = getCollection(KEYS.meals);
  const workouts = getCollection(KEYS.workouts);
  const water = getCollection(KEYS.water);
  const sleep = getCollection(KEYS.sleep);
  const mood = getCollection(KEYS.mood);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekAgo);
    d.setDate(d.getDate() + i);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);

    const inDay = (item) => {
      const dt = new Date(item.loggedAt);
      return dt >= d && dt < next;
    };

    const dayMeals = meals.filter(inDay);
    const dayWorkouts = workouts.filter(inDay);
    const dayWater = water.filter(inDay);
    const daySleep = sleep.filter(inDay);
    const dayMood = mood.filter(inDay);

    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
      workoutMinutes: dayWorkouts.reduce((s, w) => s + (w.duration || 0), 0),
      water: dayWater.reduce((s, w) => s + w.amount, 0),
      sleep: daySleep.length > 0 ? daySleep[0].hours : 0,
      mood: dayMood.length > 0 ? dayMood[dayMood.length - 1].energy : 0,
    });
  }
  return days;
}
