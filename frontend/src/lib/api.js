// ─── API Client (Frontend) ──────────────────────────────────
// Calls the local Next.js API routes

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fitspace_token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/api/auth/me'),

  // Meals
  getMeals: (date) => request(`/api/meals${date ? `?date=${date}` : ''}`),
  logMeal: (mealData) => request('/api/meals', { method: 'POST', body: JSON.stringify(mealData) }),
  deleteMeal: (id) => request(`/api/meals/${id}`, { method: 'DELETE' }),

  // Workouts
  getWorkouts: (date) => request(`/api/workouts${date ? `?date=${date}` : ''}`),
  logWorkout: (workoutData) => request('/api/workouts', { method: 'POST', body: JSON.stringify(workoutData) }),

  // Tracking
  getWater: (date) => request(`/api/tracking/water${date ? `?date=${date}` : ''}`),
  logWater: (amount) => request('/api/tracking/water', { method: 'POST', body: JSON.stringify({ amount }) }),
  getSleep: () => request('/api/tracking/sleep'),
  logSleep: (sleepData) => request('/api/tracking/sleep', { method: 'POST', body: JSON.stringify(sleepData) }),
  getMood: () => request('/api/tracking/mood'),
  logMood: (moodData) => request('/api/tracking/mood', { method: 'POST', body: JSON.stringify(moodData) }),

  // Dashboard
  getSummary: () => request('/api/dashboard/summary'),
  getWeeklyTrends: () => request('/api/dashboard/weekly'),

  // AI
  analyzeMeal: (description) => request('/api/ai/analyze-meal', { method: 'POST', body: JSON.stringify({ description }) }),
  suggestWorkout: (preferences) => request('/api/ai/suggest-workout', { method: 'POST', body: JSON.stringify({ preferences }) }),
  getInsight: () => request('/api/ai/daily-insight'),
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    const res = await fetch('/api/ai/transcribe', {
      method: 'POST',
      headers: { ...getAuthHeaders() }, // Don't set Content-Type, fetch will set it with boundary
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Transcription failed');
    return data.text;
  },

  // Profile
  getProfile: () => request('/api/user/profile'),
  updateProfile: (updates) => request('/api/user/profile', { method: 'PUT', body: JSON.stringify(updates) }),
};
