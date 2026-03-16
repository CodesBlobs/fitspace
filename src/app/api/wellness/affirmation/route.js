import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-util';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const isConfigured = !!apiKey;
const aiModel = process.env.AI_MODEL || 'gpt-3.5-turbo';

let openai;
if (isConfigured) {
  openai = new OpenAI({ 
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL 
  });
}

export async function GET(req) {
  try {
    const userId = getUserIdFromRequest(req);
    // userId not strictly required for a generic affirmation, but good for context if we had more user data
    
    if (!isConfigured) {
      const mocks = [
        "Every step you take is a win for your future self. ✨",
        "You are strong, capable, and worthy of health. 💪",
        "Be gentle with yourself today; progress is not always linear. 🌿",
        "Hydration is a love letter to your body. Drink up! 💧",
        "Your worth is not measured by a scale, but by your kindness to yourself. ❤️"
      ];
      return NextResponse.json({ affirmation: mocks[Math.floor(Math.random() * mocks.length)] });
    }

    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate wellness coach. Provide a single, short (one sentence), wholesome affirmation or positive tip for a fitness app user. Focus on holistic health, self-love, and gradual progress. No hashtags.'
        },
        { role: 'user', content: 'Give me a wholesome affirmation for today.' }
      ],
      temperature: 0.8,
    });

    return NextResponse.json({ affirmation: response.choices[0].message.content.trim() });
  } catch (err) {
    console.error('Affirmation error:', err);
    return NextResponse.json({ affirmation: "You are doing great! Keep it up. ✨" });
  }
}
