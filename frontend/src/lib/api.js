// ─── API Client ─────────────────────────────────────────────
// Supports separate hosting (multi-project setup)
// Use NEXT_PUBLIC_API_URL in production, falls back to /api for local proxy

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fitspace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fitspace_token');
      localStorage.removeItem('fitspace_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
