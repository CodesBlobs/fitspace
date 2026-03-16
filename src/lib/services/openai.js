// ─── OpenAI Service ─────────────────────────────────────────
// Wrapper around OpenAI API with prompt templates for fitness features
// Falls back to mock responses when OPENAI_API_KEY is not set

import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const isConfigured = apiKey && apiKey !== 'sk-...' && apiKey.length > 10;
const aiModel = process.env.AI_MODEL || 'gpt-3.5-turbo';

let openai;
if (isConfigured) {
  openai = new OpenAI({ 
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL // Optional: use Ollama or custom endpoint
  });
}

// ─── Analyze Meal Nutrition ─────────────────────────────────
export async function analyzeMeal(description) {
  if (!isConfigured) {
    return getMockMealAnalysis(description);
  }

  try {
    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: 'system',
          content: `You are a nutrition expert. Analyze the meal described and return a JSON object with these fields:
            - calories (number, estimated total kcal)
            - protein (number, grams)
            - carbs (number, grams)
            - fat (number, grams)
            - fiber (number, grams)
            - summary (string, brief 1-2 sentence analysis)
            - healthTips (array of 2-3 short tips)
            Return ONLY valid JSON, no markdown.`,
        },
        { role: 'user', content: `Analyze this meal: ${description}` },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('OpenAI meal analysis error:', err.message);
    return getMockMealAnalysis(description);
  }
}

// ─── Suggest Workout ────────────────────────────────────────
export async function suggestWorkout(preferences) {
  if (!isConfigured) {
    return getMockWorkoutSuggestion();
  }

  try {
    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: 'system',
          content: `You are a certified fitness trainer. Suggest a personalized workout based on the user's preferences. Return a JSON object:
            - name (string, workout name)
            - type (string: cardio/strength/flexibility/hiit)
            - duration (number, minutes)
            - estimatedCalories (number)
            - exercises (array of objects with: name, sets, reps or duration, description)
            - tips (array of 2-3 tips)
            Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Suggest a workout. Preferences: ${JSON.stringify(preferences)}`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('OpenAI workout suggestion error:', err.message);
    return getMockWorkoutSuggestion();
  }
}

// ─── Daily Insight ──────────────────────────────────────────
export async function getDailyInsight(userData) {
  if (!isConfigured) {
    return getMockDailyInsight();
  }

  // Inject a "theme of the day" for variety
  const themes = ['discipline', 'recovery', 'growth', 'consistency', 'mindset', 'nutrition'];
  const dailyTheme = themes[new Date().getDate() % themes.length];

  try {
    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: 'system',
          content: `You are a motivational health coach. Provide a personalized daily insight based on user data.
            Focus theme for today: ${dailyTheme}.
            Return a JSON object:
            - greeting (string, friendly)
            - insight (string, 2-3 sentences of data-driven advice)
            - motivation (string, a UNIQUE quote or tip related to ${dailyTheme})
            - focusArea (string, specific focus today)
            Avoid generic platitudes. Use the user's weekly counts to be specific.
            Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: `Data: ${JSON.stringify(userData)}`,
        },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (err) {
    console.error('OpenAI insight error:', err.message);
    return getMockDailyInsight();
  }
}


// ═══════════════════════════════════════════════════════════
// Mock Responses (when OpenAI is not configured)
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
    summary: `Estimated nutritional breakdown for "${description}". These are approximate values.`,
    healthTips: [
      'Try to include a variety of colorful vegetables in your meals.',
      'Stay hydrated — drink water before and after eating.',
      'Balance your macros across the day for sustained energy.',
    ],
  };
}

function getMockWorkoutSuggestion() {
  return {
    name: 'Full Body Power Circuit',
    type: 'hiit',
    duration: 30,
    estimatedCalories: 350,
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', description: 'Full body warm-up' },
      { name: 'Push-ups', sets: 3, reps: '12', description: 'Chest, shoulders, triceps' },
      { name: 'Bodyweight Squats', sets: 3, reps: '15', description: 'Quads, glutes, core' },
      { name: 'Plank Hold', sets: 3, reps: '45 seconds', description: 'Core stability' },
      { name: 'Mountain Climbers', sets: 3, reps: '20 each side', description: 'Cardio and core' },
      { name: 'Lunges', sets: 3, reps: '10 each leg', description: 'Legs and balance' },
    ],
    tips: [
      'Rest 30-60 seconds between sets.',
      'Focus on form over speed.',
      'Cool down with 5 minutes of stretching.',
    ],
  };
}

function getMockDailyInsight() {
  const insights = [
    {
      greeting: 'Good day, champion! 💪',
      insight: 'Consistency is your superpower. Every small step adds up to big results. Keep showing up for yourself!',
      motivation: '"The only bad workout is the one that didn\'t happen." — Unknown',
      focusArea: 'Try to hit your water intake goal today — hydration fuels everything!',
    },
    {
      greeting: 'Hey there, superstar! ⭐',
      insight: 'Your body is an incredible machine. Feed it well, move it often, and rest it deeply.',
      motivation: '"Take care of your body. It\'s the only place you have to live." — Jim Rohn',
      focusArea: 'Focus on getting quality sleep tonight — it\'s when your body recovers.',
    },
    {
      greeting: 'Keep it up! 🌊',
      insight: 'Small, sustainable changes lead to lifelong habits. You are building a better version of yourself every day.',
      motivation: '"Action is the foundational key to all success." — Pablo Picasso',
      focusArea: 'Take a 10-minute walk after your largest meal to aid digestion.',
    },
    {
      greeting: 'Rise and shine! 🌅',
      insight: 'Progress isn\'t always visible on the scale. Celebrate how you feel — more energetic, stronger, happier.',
      motivation: '"Health is not about the weight you lose, but about the life you gain."',
      focusArea: 'Try adding an extra serving of vegetables to your meals today.',
    },
    {
      greeting: 'Energy check! ⚡',
      insight: 'Listen to your body. Sometimes progress means pushing hard, and sometimes it means active recovery.',
      motivation: '"Rest when you\'re weary. Refresh and renew yourself." — A.P.J. Abdul Kalam',
      focusArea: 'Focus on mobility today. Spend 5 minutes stretching.',
    },
  ];

  return insights[Math.floor(Math.random() * insights.length)];
}
