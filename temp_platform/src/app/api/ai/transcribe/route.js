import { verifyToken, unauthorized } from '@/lib/api-auth';

export async function POST(req) {
  try {
    const userId = verifyToken(req);
    if (!userId) return unauthorized();

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey || elevenLabsApiKey === 'sk-...') {
      return Response.json({ text: 'Mock transcription: I ate a healthy salad for lunch today.' });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': elevenLabsApiKey },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json({ text: data.text });
  } catch (err) {
    console.error('Transcription error:', err);
    return Response.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
