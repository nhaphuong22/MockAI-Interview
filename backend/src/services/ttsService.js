import fs from 'fs';
import path from 'path';

/**
 * Generate Text-To-Speech audio buffer using Google Translate TTS API.
 * This acts as a reliable fallback service for the platform.
 * 
 * @param {string} text - The input text to convert to speech
 * @param {string} [lang] - Language code ('vi-VN' or 'en-US')
 * @returns {Promise<Buffer>} Audio buffer in MP3 format
 */
export const generateTTS = async (text, lang = 'vi-VN') => {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text is empty');
  }

  // Determine the target language code for ElevenLabs
  const isEnglish = lang.toLowerCase().includes('en');
  const elevenLanguageCode = isEnglish ? 'en' : 'vi';

  const elevenApiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
  if (elevenApiKey && elevenApiKey.trim().length > 0 && elevenApiKey !== 'your_elevenlabs_key_here') {
    try {
      console.log(`Generating TTS using ElevenLabs | Voice: ${voiceId} | Language: ${elevenLanguageCode}`);
      const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      
      const response = await fetch(elevenUrl, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenApiKey.trim(),
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_turbo_v2_5',
          language_code: elevenLanguageCode,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        console.log('ElevenLabs audio successfully generated.');
        return Buffer.from(arrayBuffer);
      } else {
        const errorText = await response.text();
        console.warn('ElevenLabs API returned an error:', response.status, errorText);
      }
    } catch (elevenError) {
      console.error('ElevenLabs TTS error, falling back to Google TTS:', elevenError);
    }
  }

  // Normalize language code for Google Translate TTS
  let googleLang = 'vi';
  if (lang.toLowerCase().includes('en')) {
    googleLang = 'en';
  }

  try {
    console.log('Generating TTS using Google Translate TTS...');
    const trimmedText = text.trim();
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodeURIComponent(trimmedText)}`;

    // Use Node.js native global fetch (available in modern Node versions)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS request failed with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error('TTS service error, falling back to silent audio:', error);
    
    // Fallback: Return a tiny valid silent MP3 buffer to prevent server/client crashes
    // This is a 1-second silent MP3 base64 representation
    const silentMp3Base64 = 'SUQzBAAAAAAAF1RTU0UAAAANAAADTGFtZTMuOTkuNVIAAAAAAAAAAAAAAAAAbnVsbA==';
    return Buffer.from(silentMp3Base64, 'base64');
  }
};
