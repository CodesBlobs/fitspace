import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/services/elevenlabs';
import { getUserIdFromRequest } from '@/lib/auth-util';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

export async function POST(req) {
  try {
    console.log(`Transcribing audio for user ${userId}...`);
    const text = await transcribeAudio(tempPath);
    console.log(`Transcription complete for user ${userId}: "${text.substring(0, 30)}..."`);

    // Clean up file
    fs.unlink(tempPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error('Transcription route error:', err);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
