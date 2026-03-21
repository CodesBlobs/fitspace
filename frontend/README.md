# 🏋️ FitSpace — Unified AI Fitness Assistant

A full-stack fitness tracking web app with AI-powered nutrition analysis, workout suggestions, and daily wellness insights. Now unified into a single Next.js application for seamless deployment.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** running locally (or a remote connection string)
- **OpenAI API Key** (optional — the app works with mock data without it)

### 1. Setup
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and optionally OPENAI_API_KEY
```

### 2. Setup Database
```bash
npx prisma migrate dev --name init
npm run seed     # Creates demo user: demo@fitspace.app / demo1234
```

### 3. Start App
```bash
npm run dev      # Starts on http://localhost:3000
```

---

## 📁 Project Structure

```
fitspace/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Sample data
├── src/
│   ├── app/             # Application pages & API Routes
│   │   ├── api/         # Backend API Handlers
│   ├── components/      # Reusable UI components
│   └── lib/             # Logic, Services & Auth
├── package.json         # Unified dependencies & scripts
└── README.md
```

## ✨ Features

- 📊 **Dashboard**: Summary cards, weekly trend charts, AI daily insight.
- 🍽️ **Meal Logging**: Text input + AI nutrition analysis.
- 💪 **Workout Logging**: Type selection, duration, AI workout suggestions.
- 💧 **Water Tracking**: Quick-add buttons, progress ring, daily goal.
- 😴 **Sleep & Mood**: Track wellness habits over time.
- 🤖 **AI Integration**: OpenAI powered analysis and speech-to-text.

## 🚀 Vercel Deployment

This project is optimized for Vercel.
- The `postinstall` script automatically runs `prisma generate`.
- Ensure you set the required environment variables in your Vercel project settings.
