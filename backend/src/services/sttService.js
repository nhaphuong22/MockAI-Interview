import fs from 'fs';

/**
 * Perform Speech-To-Text translation on an audio file.
 * 
 * @param {string} filePath - Absolute path to the recorded audio file
 * @param {string} [clientTranscript] - Transcript already captured by client's Web Speech API (highly recommended fallback)
 * @returns {Promise<string>} Transcribed text
 */
export const transcribeAudio = async (filePath, clientTranscript = '') => {
  // 1. If the client has already performed speech-to-text natively and sent the draft, use it
  if (clientTranscript && clientTranscript.trim().length > 0) {
    return clientTranscript.trim();
  }

  // 2. Validate file existence
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Audio file not found or path is empty');
  }

  // 3. Try to use Groq Whisper API for high-precision real audio transcription
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== 'gsk_your_groq_api_key_here' && apiKey.trim().length > 0) {
    try {
      console.log('Sending audio file to Groq Whisper for true STT processing:', filePath);
      
      // Read audio file from disk into a buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      // Convert buffer to Web Blob to attach to standard multipart/form-data
      const audioBlob = new Blob([fileBuffer], { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'response-audio.webm');
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'vi'); // Strictly optimize for Vietnamese candidates
      formData.append('response_format', 'json');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.text && result.text.trim().length > 0) {
          console.log('Groq Whisper TRUE STT transcript extracted:', result.text);
          return result.text.trim();
        }
      } else {
        const errorText = await response.text();
        console.error('Groq Whisper API transcription returned error:', response.status, errorText);
      }
    } catch (err) {
      console.error('Error transcribing audio via Groq Whisper API:', err);
    }
  } else {
    console.warn('Groq API Key is not configured for STT Whisper.');
  }

  // 4. Zero-Mock: Throw real error if both browser client transcript draft and Whisper API failed
  throw new Error('Không thể nhận diện được giọng nói thành văn bản. Vui lòng kiểm tra cấu hình GROQ_API_KEY ở file .env của Backend hoặc nói rõ ràng hơn bằng Microphone.');
};
