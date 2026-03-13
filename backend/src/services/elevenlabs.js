const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');

const apiKey = process.env.ELEVENLABS_API_KEY;
const isConfigured = !!apiKey;

const client = isConfigured ? new ElevenLabsClient({ apiKey }) : null;

/**
 * Transcribe audio using ElevenLabs Scribe v2
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(filePath) {
  if (!isConfigured) {
    console.warn('ElevenLabs API Key not found. Returning mock transcription.');
    return 'Mock transcription: I ate a bowl of oats with blueberries and a coffee.';
  }

  try {
    const audioStream = fs.createReadStream(filePath);
    const result = await client.speechToText.convert({
      file: audioStream,
      model_id: 'scribe_v2',
      tag_audio_events: false,
    });

    return result.text;
  } catch (err) {
    console.error('ElevenLabs Transcription Error:', err);
    throw new Error('Failed to transcribe audio');
  }
}

module.exports = { transcribeAudio, isConfigured };
