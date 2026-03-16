// ─── OpenAI Service (Server-side) ───────────────────────────
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';
const isConfigured = apiKey.length > 10;
const aiModel = process.env.AI_MODEL || 'gpt-3.5-turbo';

let openai;
if (isConfigured) {
  openai = new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL });
}

export async function analyzeMeal(description) {
  if (!isConfigured) return getMockMealAnalysis(description);
  try {
    const r = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: 'You are a nutrition expert. Analyze the meal and return JSON: { calories, protein, carbs, fat, fiber, summary, healthTips }. Return ONLY valid JSON.' },
        { role: 'user', content: `Analyze this meal: ${description}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(r.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI meal error:', err.message);
    return getMockMealAnalysis(description);
  }
}

export async function suggestWorkout(preferences) {
  if (!isConfigured) return getMockWorkoutSuggestion();
  try {
    const r = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: 'You are a fitness trainer. Suggest a workout. Return JSON: { name, type, duration, estimatedCalories, exercises: [{ name, sets, reps, description }], tips }. Return ONLY valid JSON.' },
        { role: 'user', content: `Preferences: ${JSON.stringify(preferences)}` },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(r.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI workout error:', err.message);
    return getMockWorkoutSuggestion();
  }
}

export async function getDailyInsight(userData) {
  if (!isConfigured) return getMockDailyInsight();
  const themes = ['discipline', 'recovery', 'growth', 'consistency', 'mindset', 'nutrition'];
  const dailyTheme = themes[new Date().getDate() % themes.length];
  try {
    const r = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: 'system', content: `You are a motivational health coach. Focus: ${dailyTheme}. Return JSON: { greeting, insight, motivation, focusArea }. Use the user's data. Return ONLY valid JSON.` },
        { role: 'user', content: `Data: ${JSON.stringify(userData)}` },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });
    return JSON.parse(r.choices[0].message.content);
  } catch (err) {
    console.error('OpenAI insight error:', err.message);
    return getMockDailyInsight();
  }
}

// ─── Mock Fallbacks ─────────────────────────────────────────
function getMockMealAnalysis(description) {
  const w = description.toLowerCase();
  let c = 450, p = 25, ca = 45, f = 15, fi = 5;
  if (w.includes('salad')) { c = 250; p = 8; ca = 20; f = 12; fi = 8; }
  else if (w.includes('burger')) { c = 650; p = 35; ca = 40; f = 35; fi = 3; }
  else if (w.includes('chicken')) { c = 400; p = 40; ca = 15; f = 12; fi = 2; }
  else if (w.includes('pasta')) { c = 550; p = 18; ca = 65; f = 18; fi = 4; }
  return { calories: c, protein: p, carbs: ca, fat: f, fiber: fi, summary: `Estimated breakdown for "${description}".`, healthTips: ['Eat colorful veggies.', 'Stay hydrated.', 'Balance your macros.'] };
}

function getMockWorkoutSuggestion() {
  return {
    name: 'Full Body Power Circuit', type: 'hiit', duration: 30, estimatedCalories: 350,
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: '30s', description: 'Warm-up' },
      { name: 'Push-ups', sets: 3, reps: '12', description: 'Chest' },
      { name: 'Squats', sets: 3, reps: '15', description: 'Legs' },
      { name: 'Plank', sets: 3, reps: '45s', description: 'Core' },
    ],
    tips: ['Rest 30-60s between sets.', 'Focus on form.', 'Cool down with stretching.'],
  };
}

function getMockDailyInsight() {
  const insights = [
    { greeting: 'Good day, champion! 💪', insight: 'Consistency is your superpower.', motivation: '"The only bad workout is the one that didn\'t happen."', focusArea: 'Hit your water goal today!' },
    { greeting: 'Hey superstar! ⭐', insight: 'Feed your body well, move often.', motivation: '"Take care of your body — it\'s the only place you live." — Jim Rohn', focusArea: 'Focus on sleep tonight.' },
    { greeting: 'Keep it up! 🌊', insight: 'Small changes build lifelong habits.', motivation: '"Action is the key to success." — Picasso', focusArea: 'Walk after your biggest meal.' },
    { greeting: 'Rise and shine! 🌅', insight: 'Celebrate how you feel.', motivation: '"Health is about the life you gain."', focusArea: 'Add extra veggies today.' },
    { greeting: 'Energy check! ⚡', insight: 'Listen to your body.', motivation: '"Rest when weary." — A.P.J. Abdul Kalam', focusArea: '5 mins of stretching.' },
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}
