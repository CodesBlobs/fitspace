# 🏋️ FitSpace — AI-Powered Fitness Assistant

A full-stack fitness tracking web app with AI-powered nutrition analysis, workout suggestions, and daily wellness insights.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **PostgreSQL** running locally (or a remote connection string)
- **OpenAI API Key** (optional — the app works with mock data without it)

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and optionally OPENAI_API_KEY
```

### 2. Setup Database

```bash
cd backend
npx prisma migrate dev --name init
npm run seed     # Creates demo user: demo@fitspace.app / demo1234
```

### 3. Start Backend

```bash
cd backend
npm run dev      # Starts on http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
npm run dev      # Starts on http://localhost:3000
```

### 5. Open the app

Visit **http://localhost:3000** and log in with:
- **Email:** `demo@fitspace.app`
- **Password:** `demo1234`

---

## 📁 Project Structure

```
fitspace/
├── backend/                 # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Sample data
│   └── src/
│       ├── index.js         # Server entry point
│       ├── middleware/       # JWT auth
│       ├── routes/           # API routes
│       └── services/         # OpenAI integration
│
├── frontend/                # Next.js + Tailwind
│   └── src/
│       ├── app/             # Pages (dashboard, meals, workouts, tracking)
│       ├── components/      # Reusable UI components
│       └── lib/             # API client & auth context
│
└── README.md
```

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Summary cards, weekly trend charts, AI daily insight |
| 🍽️ Meal Logging | Text input + AI nutrition analysis (calories, macros) |
| 💪 Workout Logging | Type selection, duration, AI workout suggestions |
| 💧 Water Tracking | Quick-add buttons, progress ring, daily goal |
| 😴 Sleep Logging | Hours + quality rating |
| 😊 Mood Tracking | Emoji selector + energy level |
| 🤖 AI Integration | OpenAI-powered analysis, suggestions & insights |
| 🔐 Authentication | JWT-based register/login |

## 🎨 Design

Pastel-tinted UI with glassmorphism cards, gradient buttons, micro-animations, and a dark sidebar. Built with Tailwind CSS.

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWTs | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ❌ (uses mocks) |
| `PORT` | Backend port (default: 5000) | ❌ |
