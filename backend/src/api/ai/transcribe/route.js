import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/services/elevenlabs';
import { refineTranscription } from '@/lib/services/openai';
import { getUserIdFromRequest } from '@/lib/auth-util';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

export async function POST(req) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const tempPath = path.join(tmpdir(), `upload-${Date.now()}.webm`);
    
    fs.writeFileSync(tempPath, buffer);

    console.log(`Transcribing audio for user ${userId}...`);
    const rawText = await transcribeAudio(tempPath);
    console.log(`Transcription complete for user ${userId}: "${rawText.substring(0, 30)}..."`);

    // AI Refinement
    console.log(`Refining transcription for user ${userId}...`);
    const { cleanedText } = await refineTranscription(rawText);
    console.log(`Refinement complete: "${cleanedText.substring(0, 30)}..."`);

    // Clean up file
    fs.unlink(tempPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    return NextResponse.json({ rawText, text: cleanedText });
  } catch (err) {
    console.error('Transcription route error:', err);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
