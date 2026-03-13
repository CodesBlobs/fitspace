// ─── FitSpace AI Service (Browser-side) ─────────────────────
// Calls OpenAI and ElevenLabs directly from the browser.
// Falls back to mock responses when keys are not configured.

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
const OPENAI_BASE_URL = process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo';
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';

const isOpenAIConfigured = OPENAI_API_KEY.length > 10;
const isElevenLabsConfigured = ELEVENLABS_API_KEY.length > 10;

// ─── OpenAI Chat Helper ─────────────────────────────────────

async function chatCompletion(systemPrompt, userMessage, temperature = 0.7) {
  const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

// ═══════════════════════════════════════════════════════════
// MEAL ANALYSIS
// ═══════════════════════════════════════════════════════════

export async function analyzeMeal(description) {
  if (!isOpenAIConfigured) return getMockMealAnalysis(description);

  try {
    return await chatCompletion(
      `You are a nutrition expert. Analyze the meal and return JSON: { calories: number, protein: number, carbs: number, fat: number, fiber: number, summary: string, healthTips: string[] }. Return ONLY valid JSON.`,
      `Analyze this meal: ${description}`,
      0.3
    );
  } catch (err) {
    console.error('AI meal analysis error:', err);
    return getMockMealAnalysis(description);
  }
}

// ═══════════════════════════════════════════════════════════
// WORKOUT SUGGESTION
// ═══════════════════════════════════════════════════════════

export async function suggestWorkout(preferences) {
  if (!isOpenAIConfigured) return getMockWorkoutSuggestion();

  try {
    return await chatCompletion(
      `You are a fitness trainer. Suggest a workout. Return JSON: { name, type, duration, estimatedCalories, exercises: [{ name, sets, reps, description }], tips: string[] }. Return ONLY valid JSON.`,
      `Suggest a workout. Preferences: ${JSON.stringify(preferences)}`,
      0.7
    );
  } catch (err) {
    console.error('AI workout suggestion error:', err);
    return getMockWorkoutSuggestion();
  }
}

// ═══════════════════════════════════════════════════════════
// DAILY INSIGHT
// ═══════════════════════════════════════════════════════════

export async function getDailyInsight(userData) {
  if (!isOpenAIConfigured) return getMockDailyInsight();

  const themes = ['discipline', 'recovery', 'growth', 'consistency', 'mindset', 'nutrition'];
  const dailyTheme = themes[new Date().getDate() % themes.length];

  try {
    return await chatCompletion(
      `You are a motivational health coach. Focus theme: ${dailyTheme}. Return JSON: { greeting, insight, motivation, focusArea }. Be specific to the user's data. Return ONLY valid JSON.`,
      `Data: ${JSON.stringify(userData)}`,
      0.8
    );
  } catch (err) {
    console.error('AI insight error:', err);
    return getMockDailyInsight();
  }
}

// ═══════════════════════════════════════════════════════════
// VOICE TRANSCRIPTION (ElevenLabs)
// ═══════════════════════════════════════════════════════════

export async function transcribeAudio(audioBlob) {
  if (!isElevenLabsConfigured) {
    return 'Mock transcription: I ate a bowl of oats with blueberries and a coffee.';
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model_id', 'scribe_v2');

    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      body: formData,
    });

    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);
    const data = await res.json();
    return data.text;
  } catch (err) {
    console.error('ElevenLabs transcription error:', err);
    return 'Transcription failed. Please type your entry instead.';
  }
}

// ═══════════════════════════════════════════════════════════
// MOCK RESPONSES
// ═══════════════════════════════════════════════════════════

function getMockMealAnalysis(description) {
  const words = description.toLowerCase();
  let calories = 450, protein = 25, carbs = 45, fat = 15, fiber = 5;
  if (words.includes('salad')) { calories = 250; protein = 8; carbs = 20; fat = 12; fiber = 8; }
  else if (words.includes('burger')) { calories = 650; protein = 35; carbs = 40; fat = 35; fiber = 3; }
  else if (words.includes('chicken')) { calories = 400; protein = 40; carbs = 15; fat = 12; fiber = 2; }
  else if (words.includes('pasta')) { calories = 550; protein = 18; carbs = 65; fat = 18; fiber = 4; }
  else if (words.includes('smoothie')) { calories = 300; protein = 12; carbs = 50; fat = 5; fiber = 6; }
  return {
    calories, protein, carbs, fat, fiber,
    summary: `Estimated nutritional breakdown for "${description}".`,
    healthTips: ['Include colorful vegetables.', 'Stay hydrated.', 'Balance your macros.'],
  };
}

function getMockWorkoutSuggestion() {
  return {
    name: 'Full Body Power Circuit', type: 'hiit', duration: 30, estimatedCalories: 350,
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', description: 'Warm-up' },
      { name: 'Push-ups', sets: 3, reps: '12', description: 'Chest & triceps' },
      { name: 'Squats', sets: 3, reps: '15', description: 'Quads & glutes' },
      { name: 'Plank', sets: 3, reps: '45 seconds', description: 'Core' },
      { name: 'Mountain Climbers', sets: 3, reps: '20 each', description: 'Cardio & core' },
      { name: 'Lunges', sets: 3, reps: '10 each', description: 'Legs & balance' },
    ],
    tips: ['Rest 30-60s between sets.', 'Focus on form.', 'Cool down with stretching.'],
  };
}

function getMockDailyInsight() {
  const insights = [
    { greeting: 'Good day, champion! 💪', insight: 'Consistency is your superpower.', motivation: '"The only bad workout is the one that didn\'t happen."', focusArea: 'Hit your water goal today!' },
    { greeting: 'Hey there, superstar! ⭐', insight: 'Feed your body well, move it often.', motivation: '"Take care of your body. It\'s the only place you have to live." — Jim Rohn', focusArea: 'Focus on quality sleep tonight.' },
    { greeting: 'Keep it up! 🌊', insight: 'Small changes lead to lifelong habits.', motivation: '"Action is the foundational key to all success." — Picasso', focusArea: 'Walk 10 minutes after your largest meal.' },
    { greeting: 'Rise and shine! 🌅', insight: 'Celebrate how you feel — not just the scale.', motivation: '"Health is about the life you gain."', focusArea: 'Add extra vegetables today.' },
    { greeting: 'Energy check! ⚡', insight: 'Listen to your body. Rest is progress too.', motivation: '"Rest when you\'re weary." — A.P.J. Abdul Kalam', focusArea: 'Spend 5 minutes stretching.' },
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}
