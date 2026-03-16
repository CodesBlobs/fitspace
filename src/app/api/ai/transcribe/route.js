import { NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/services/elevenlabs';
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

    const text = await transcribeAudio(tempPath);

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
