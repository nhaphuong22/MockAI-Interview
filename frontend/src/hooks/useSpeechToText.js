import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React hook for Speech-to-Text using Web Speech API (SpeechRecognition).
 */
export function useSpeechToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    // Kiểm tra browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng sử dụng Google Chrome hoặc Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'vi-VN'; // Ngôn ngữ tiếng Việt

    recognition.onresult = (event) => {
      let currentTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript + ' ';
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      setTranscript((prev) => prev + currentTranscript);
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Bạn cần cấp quyền truy cập Microphone để có thể trả lời phỏng vấn.');
      } else if (event.error !== 'aborted') {
        setError(`Lỗi nhận diện giọng nói: ${event.error}`);
      }
      setIsRecording(false);
      isRecordingRef.current = false;
    };

    recognition.onend = () => {
      // Auto restart if still recording
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.debug('Recognition already started');
        }
      } else {
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      recognitionRef.current.stop();
      setInterimTranscript('');
    } else {
      setError('');
      try {
        isRecordingRef.current = true;
        setIsRecording(true);
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isRecording,
    transcript,
    interimTranscript,
    error,
    toggleRecording,
    resetTranscript,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
}
