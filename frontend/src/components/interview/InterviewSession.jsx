import { useState, useRef, useEffect } from "react";
import { Sparkles, Clock, Mic, MicOff, Loader2, CheckCircle2, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { AudioVisualizer } from "../ai/AudioVisualizer";
import { AiWaveform } from "../ai/AiWaveform";
import { selectVoice, configureVoiceStyle, initVoices } from "../../utils/voiceEngine";
import { 
  transcribeAudioApi, 
  completeVoiceSessionApi, 
  assessVoiceSessionApi 
} from "../../api/voiceSession";
import { submitAnswerApi } from "../../api/interviewApi";
import { axiosClient } from "../../api/axiosClient";
import { useGazeTracker } from "../../hooks/useGazeTracker";
import { Avatar3D } from "../ai/Avatar3D";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * InterviewSession Component
 * Manages active interview UI - either text entry or voice recording.
 * Integrates browser Web Speech API (transcription) and calls backend to save recordings.
 * Equips AI voice speech (Text-to-Speech), premium vocal wave and packaging JSON results to Cloudinary.
 */
export function InterviewSession({ 
  interviewType, 
  currentQuestion, 
  questions, 
  onNext, 
  onCancel,
  voiceSessionId,
  aiVoice = "vi-VN-female",
  onFinish
}) {
  const { user } = useAuthStore();
  const userDisplayName = user?.full_name || user?.fullName || user?.name || "Ứng viên";

  const isTextMode = interviewType === "text";
  const questionObj = questions[currentQuestion];
  const questionText = typeof questionObj === "string" ? questionObj : (questionObj?.question_text || "");
  const questionId = typeof questionObj === "string" ? null : (questionObj?.id || null);

  // Text mode state
  const [textAnswer, setTextAnswer] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiVolume, setAiVolume] = useState(0);
  const [isFinalizing, setIsFinalizing] = useState(false); // Cloudinary and assessment packaging state
  const [audioLevel, setAudioLevel] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAiVoiceEnabled, setIsAiVoiceEnabled] = useState(true);

  // Audio Context & Media Recorder Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chunksRef = useRef([]);

  // Timer state
  const [seconds, setSeconds] = useState(0);

  // Gaze tracking state
  const [gazeWarning, setGazeWarning] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");
  const [accumulatedGazeViolations, setAccumulatedGazeViolations] = useState(0);

  const {
    videoRef,
    gazeViolations,
    isWarningActive,
    isCameraActive,
    isLoadingModel,
    isFaceDetected,
    resetViolations
  } = useGazeTracker({
    isActive: interviewType === "voice" && !isFinalizing,
    onViolation: (count) => {
      setAccumulatedGazeViolations(count);
    },
    onWarning: (active) => {
      setGazeWarning(active);
    },
    onCameraError: (msg) => {
      setCameraErrorMessage(msg);
    }
  });

  const stopAudioEngine = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const speakQuestionFallback = (text, force = false) => {
    if (!isAiVoiceEnabled && !force) {
      setIsAiSpeaking(false);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isEnglish = aiVoice.startsWith("en-US");
      const isMale = aiVoice.includes("-male");
      utterance.lang = isEnglish ? "en-US" : "vi-VN";
      configureVoiceStyle(utterance, isMale);
      const matchingVoice = selectVoice(aiVoice);
      if (matchingVoice) utterance.voice = matchingVoice;
      
      let fallbackInterval;

      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setIsRecording(false);
        setHasRecorded(false);

        // Giả lập âm lượng miệng nhấp nháy khi nói
        fallbackInterval = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            setAiVolume(0.15 + Math.random() * 0.75);
          } else {
            setAiVolume(0);
            clearInterval(fallbackInterval);
          }
        }, 80);
      };
      
      utterance.onend = () => {
        setIsAiSpeaking(false);
        setAiVolume(0);
        if (fallbackInterval) clearInterval(fallbackInterval);
      };
      
      utterance.onerror = (err) => {
        console.error("SpeechSynthesis error:", err);
        setIsAiSpeaking(false);
        setAiVolume(0);
        if (fallbackInterval) clearInterval(fallbackInterval);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Speech Synthesis not supported natively in this browser.");
    }
  };
 
  // Text-To-Speech function using backend ElevenLabs API (or Google Translate TTS fallback)
  const speakQuestion = async (text, force = false) => {
    // 1. Cancel any active vocal sound first
    if (window.activeTtsAudio) {
      try {
        window.activeTtsAudio.pause();
        window.activeTtsAudio = null;
      } catch (err) {
        console.debug("Audio pause ignored:", err);
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAiVolume(0);
 
    if (!isAiVoiceEnabled && !force) {
      setIsAiSpeaking(false);
      return;
    }

    try {
      setIsAiSpeaking(true);
      setIsRecording(false);
      setHasRecorded(false);

      // Call API using axiosClient to get binary blob
      const response = await axiosClient.post("/voice-sessions/tts", { 
        text: text, 
        lang: aiVoice 
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      window.activeTtsAudio = audio;

      // Web Audio AnalyserNode setup for R3F Lipsync
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 64;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let animationId;

      const checkVolume = () => {
        if (audio.paused || audio.ended) {
          setAiVolume(0);
          return;
        }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const vol = Math.min(average / 90, 1.0); // normalize and scale volume
        setAiVolume(vol);
        animationId = requestAnimationFrame(checkVolume);
      };

      audio.onplay = () => {
        audioCtx.resume();
        checkVolume();
      };
      
      audio.onended = () => {
        setIsAiSpeaking(false);
        setAiVolume(0);
        cancelAnimationFrame(animationId);
        audioCtx.close();
        URL.revokeObjectURL(audioUrl);
        window.activeTtsAudio = null;
      };
      
      audio.onerror = (err) => {
        console.error("TTS audio playback error, falling back:", err);
        setAiVolume(0);
        cancelAnimationFrame(animationId);
        audioCtx.close();
        URL.revokeObjectURL(audioUrl);
        window.activeTtsAudio = null;
        speakQuestionFallback(text, force);
      };

      await audio.play();
    } catch (error) {
      console.warn("Backend TTS failed, falling back to local speech synthesis:", error);
      speakQuestionFallback(text, force);
    }
  };
 
  const toggleAiVoice = () => {
    const nextState = !isAiVoiceEnabled;
    setIsAiVoiceEnabled(nextState);
    if (!nextState) {
      // Stop active voices immediately
      if (window.activeTtsAudio) {
        try {
          window.activeTtsAudio.pause();
          window.activeTtsAudio = null;
        } catch (err) {
          console.debug("Mute pause ignored:", err);
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsAiSpeaking(false);
    } else {
      // Re-trigger current question speaking if turned back on
      if (interviewType === "voice" && questionText && !isRecording && !isTranscribing && !hasRecorded) {
        speakQuestion(questionText, true);
      }
    }
  };

  // Initialize voice list using shared engine
  useEffect(() => {
    return initVoices();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      stopAudioEngine();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (window.activeTtsAudio) {
        try {
          window.activeTtsAudio.pause();
          window.activeTtsAudio = null;
        } catch (err) {
          console.debug("Audio pause ignored:", err);
        }
      }
    };
  }, []);

  // AI Speech Text-to-Speech triggers whenever a new question is rendered
  useEffect(() => {
    if (interviewType === "voice" && questionText) {
      // Small timeout to give DOM time to settle and render
      const timer = setTimeout(() => {
        speakQuestion(questionText);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, questionText, interviewType]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      setFinalAnswer("");
 
      // 1. Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
 
      // 2. Initialize volume analyzer
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
 
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
 
      const drawVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Scale to 0-100 percentage
        const level = Math.min(Math.round((avg / 128) * 100), 100);
        setAudioLevel(level);
        animationFrameRef.current = requestAnimationFrame(drawVolume);
      };
      drawVolume();
 
      // 3. Initialize Media Recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
 
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsTranscribing(true);
 
        try {
          // Send audio to backend with empty client transcript to enforce backend Groq Whisper processing
          const response = await transcribeAudioApi(audioBlob, "");
          if (response && response.success) {
            setFinalAnswer(response.data.text);
            setCurrentAudioUrl(response.data.audioUrl || "");
          } else {
            setFinalAnswer("Không nhận diện được âm thanh.");
          }
        } catch (err) {
          console.error("Transcription API error:", err);
          setFinalAnswer("Lỗi nhận diện âm thanh. Vui lòng ghi âm lại hoặc tự nhập câu trả lời vào ô này.");
        } finally {
          setIsTranscribing(false);
          setHasRecorded(true);
        }
      };
 
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
 
    } catch (err) {
      console.error("Start recording failed:", err);
      alert("Không thể truy cập Microphone. Vui lòng kiểm tra lại quyền.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    stopAudioEngine();
  };

  // Triggers evaluation logic, calls backend API, packages results, and transitions to feedback
  const handleFinalizeInterview = async () => {
    setIsFinalizing(true);
    stopAudioEngine();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (window.activeTtsAudio) {
      try {
        window.activeTtsAudio.pause();
        window.activeTtsAudio = null;
      } catch (err) {
        console.debug("Audio pause ignored:", err);
      }
    }

    const targetSessionId = voiceSessionId || 1;

    try {
      // 1. Call Complete voice session API
      await completeVoiceSessionApi(targetSessionId, seconds);
      console.log("Voice session finalized with duration:", seconds);

      // 2. Call Assessment API to package result JSON & upload to Cloudinary
      const response = await assessVoiceSessionApi(targetSessionId);
      console.log("Assessment completed. Cloudinary Result:", response.data);

      // 3. Callback onFinish to parent page
      if (onFinish && response && response.success) {
        onFinish(response.data);
      } else if (onFinish && response) {
        onFinish(response);
      } else {
        // Fallback safety
        onFinish(null);
      }

    } catch (error) {
      console.error("Error finalizing voice session interview:", error);
      alert(`Phân tích kết quả phỏng vấn thất bại: ${error.message || "Lỗi kết nối API hoặc Groq API Key chưa được thiết lập"}. Không thể tạo báo cáo phỏng vấn!`);
      if (onFinish) {
        onFinish(null);
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  const handleSaveAndNext = async () => {
    const answerToSave = isTextMode ? textAnswer : finalAnswer;
    
    if (questionId && answerToSave && answerToSave.trim().length > 0) {
      setIsSavingAnswer(true);
      try {
        console.log(`Submitting answer for question ID ${questionId} to backend...`);
        // Gửi kèm số lần vi phạm ánh mắt lên backend
        await submitAnswerApi(questionId, answerToSave.trim(), currentAudioUrl, accumulatedGazeViolations);
      } catch (err) {
        console.error("Failed to submit and grade answer:", err);
      } finally {
        setIsSavingAnswer(false);
      }
    }

    // Reset violations count for next question
    if (interviewType === "voice") {
      resetViolations();
      setAccumulatedGazeViolations(0);
    }

    // If it's the final question, trigger evaluation and Cloudinary upload
    if (currentQuestion >= questions.length - 1) {
      if (interviewType === "voice") {
        handleFinalizeInterview();
      } else {
        onNext();
      }
    } else {
      // Reset state variables for next question
      setTextAnswer("");
      setFinalAnswer("");
      setCurrentAudioUrl("");
      setHasRecorded(false);
      onNext();
    }
  };

  const handleCancelBtn = () => {
    if (interviewType === "voice") {
      handleFinalizeInterview();
    } else {
      onCancel();
    }
  };

  // Finalizing assessment packaging screen
  if (isFinalizing) {
    return (
      <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-md w-full bg-slate-800/80 border border-sky-500/10 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md">
          <Loader2 className="w-16 h-16 text-[#0ea5e9] animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white leading-tight">AI Đang Phân Tích & Chấm Điểm</h2>
          <p className="text-sm text-slate-300">
            Hệ thống đang thu thập câu hỏi, câu trả lời, tiến hành tổng hợp kết quả phỏng vấn AI thành tệp tin JSON an toàn.
          </p>
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-sky-500/5 text-xs text-sky-400 font-semibold animate-pulse">
            Đang tải kết quả lên kho lưu trữ đám mây Cloudinary...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      {/* Header bar */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#0ea5e9] rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">AI Interview Coach</div>
            <div className="text-sm text-gray-400">
              {isTextMode ? "Đang phỏng vấn văn bản" : "Đang phỏng vấn giọng nói"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {interviewType === "voice" && (
            <button
              onClick={toggleAiVoice}
              className={`px-3 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1.5 text-sm font-semibold ${
                isAiVoiceEnabled
                  ? "bg-slate-700/50 hover:bg-slate-700 text-sky-400 border-sky-500/20"
                  : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20"
              }`}
              title={isAiVoiceEnabled ? "Tắt giọng đọc của AI" : "Bật giọng đọc của AI"}
            >
              {isAiVoiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <span className="hidden sm:inline">Giọng AI: Bật</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Giọng AI: Tắt</span>
                </>
              )}
            </button>
          )}
          <div className="flex items-center gap-2 text-white bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600/50 text-sm">
            <Clock className="w-4 h-4 text-[#0ea5e9]" />
            <span>{formatTime(seconds)}</span>
          </div>
          <div className="text-white font-medium text-sm">Câu {currentQuestion + 1}/{questions.length}</div>
          <div className="h-8 w-px bg-gray-700" />
          <button
            onClick={handleCancelBtn}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all text-sm font-semibold hover:shadow-lg hover:shadow-rose-500/10"
          >
            Kết Thúc
          </button>
        </div>
      </div>

      {/* Main question area - Bố cục căn giữa cho text, hoặc 2 cột cho voice */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-950 flex flex-col justify-between">
        {isTextMode ? (
          /* ================= TEXT MODE (Căn giữa đơn giản) ================= */
          <div className="max-w-2xl mx-auto py-12 w-full flex-1 flex flex-col justify-center">
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 mb-6 text-center border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />
              <div className="text-xs font-bold text-[#0ea5e9] tracking-widest uppercase mb-2">Câu Hỏi {currentQuestion + 1}</div>
              <h2 className="text-xl md:text-2xl mb-4 font-bold text-white leading-snug">{questionText}</h2>
              <div className="inline-flex px-3 py-1.5 bg-sky-950/50 text-[#38bdf8] rounded-full text-xs font-semibold border border-sky-900/50">
                Câu hỏi phỏng vấn AI
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl">
              <textarea
                placeholder="Nhập câu trả lời của bạn vào đây..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none resize-none text-white transition-all placeholder-gray-500"
                rows={6}
                autoFocus
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-400">
                  <span className="text-[#38bdf8] font-bold">Gợi ý:</span> Sử dụng phương pháp STAR để cấu trúc câu trả lời của bạn.
                </div>
                <button
                  onClick={handleSaveAndNext}
                  disabled={isSavingAnswer || !textAnswer.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg hover:shadow-sky-500/20 transition-all font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSavingAnswer && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{currentQuestion < questions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= VOICE MODE (Giao diện 2 cột Premium PiP) ================= */
          <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-6 items-stretch my-auto min-h-[480px]">
            
            {/* Cột trái: Camera của Candidate chiếm 2/3 */}
            <div className="flex-1 lg:flex-[2] relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between">
              
              {/* Warning Banner nhấp nháy đỏ */}
              {gazeWarning && (
                <div className="absolute top-4 left-4 right-4 bg-red-600/90 text-white font-bold px-4 py-3 rounded-2xl text-center text-sm shadow-xl backdrop-blur-md animate-pulse border border-red-500 z-30">
                  {isFaceDetected ? (
                    `⚠️ Cảnh báo: Vui lòng tập trung nhìn vào màn hình! (Số lần vi phạm: ${accumulatedGazeViolations})`
                  ) : (
                    `⚠️ Cảnh báo: Không phát hiện khuôn mặt ứng viên! (Số lần vi phạm: ${accumulatedGazeViolations})`
                  )}
                </div>
              )}

              {/* Loader Loading Model AI */}
              {isLoadingModel && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-4 z-40">
                  <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-3" />
                  <p className="text-sm font-bold text-white">Đang tải mô hình AI giám sát...</p>
                  <p className="text-xs text-slate-400">Vui lòng cấp quyền camera và đợi trong giây lát</p>
                </div>
              )}

              {/* Pause Overlay khi mất kết nối Camera */}
              {!isCameraActive && !isLoadingModel && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 z-40">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                    <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                  </div>
                  <p className="text-lg font-bold text-rose-500 mb-2">Đã tạm dừng phỏng vấn!</p>
                  <p className="text-sm text-slate-300 max-w-md">
                    {cameraErrorMessage || "Vui lòng giữ camera luôn kết nối và cấp quyền camera cho trình duyệt để tiếp tục buổi phỏng vấn."}
                  </p>
                </div>
              )}

              {/* Webcam Video Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-3xl transform -scale-x-100 bg-slate-950"
              />

              {/* Floating Name Badge */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-slate-900/80 text-white text-xs font-semibold rounded-full border border-slate-700/50 backdrop-blur-sm z-20">
                {userDisplayName} (Webcam HD)
              </div>

              {/* Khung nhỏ Picture-in-Picture cho Avatar 3D phỏng vấn */}
              <div className="absolute bottom-4 right-4 w-48 h-36 rounded-2xl overflow-hidden border border-sky-500/30 shadow-2xl bg-slate-950 z-20">
                <Avatar3D volume={aiVolume} isListening={isRecording} emotion={isAiSpeaking ? "happy" : "idle"} />
                <div className="absolute bottom-1.5 left-2 text-[9px] font-bold text-sky-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-sky-500/20 shadow z-30">
                  X Interviewer
                </div>
              </div>
            </div>

            {/* Cột phải: Chatbot Log & Tiến Trình chiếm 1/3 */}
            <div className="flex-1 lg:flex-[1] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 flex flex-col justify-between space-y-6">
              
              {/* Tiêu đề & Thông báo */}
              <div>
                <div className="text-xs font-bold text-[#0ea5e9] tracking-wider uppercase mb-1">Tiến trình phỏng vấn</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                  <div 
                    className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] h-full transition-all duration-300"
                    style={{ width: `${Math.round(((currentQuestion + 1) / questions.length) * 100)}%` }}
                  />
                </div>
                <div className="p-3 bg-sky-950/30 border border-sky-900/30 rounded-xl text-[10px] text-sky-400 leading-normal">
                  💡 *Lưu ý:* Để kết quả phân tích đạt chất lượng tốt nhất, vui lòng luôn nhìn thẳng vào camera và trả lời tự nhiên.
                </div>
              </div>

              {/* Câu hỏi chatbot box */}
              <div className="flex-grow flex flex-col justify-center">
                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-inner space-y-3 relative overflow-hidden">
                  <div className="text-[10px] font-bold text-sky-400 tracking-wider uppercase">Câu hỏi {currentQuestion + 1}</div>
                  <h3 className="text-sm font-bold text-white leading-relaxed">{questionText}</h3>
                </div>
              </div>

              {/* Logic điều khiển Microphone & Trả lời */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-4">
                
                {/* Case 0: AI is speaking */}
                {isAiSpeaking && (
                  <div className="py-4">
                    <AiWaveform />
                    <p className="text-[10px] text-center text-sky-400 animate-pulse mt-2">Trợ lý AI đang đọc câu hỏi...</p>
                  </div>
                )}

                {/* Case 1: Idle state (ready to record) */}
                {!isAiSpeaking && !isRecording && !isTranscribing && !hasRecorded && (
                  <div className="text-center py-4 space-y-3">
                    <button
                      onClick={startRecording}
                      disabled={!isCameraActive}
                      className="w-16 h-16 mx-auto bg-sky-950 hover:bg-sky-900/60 border border-sky-800/50 rounded-full flex items-center justify-center text-[#38bdf8] hover:scale-105 transition-all shadow-lg shadow-sky-950/50 group disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Mic className="w-7 h-7 group-hover:scale-115 transition-transform" />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white">Nhấp để bắt đầu trả lời</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Hệ thống sẽ ghi âm câu trả lời của bạn</p>
                    </div>
                  </div>
                )}

                {/* Case 2: Recording state */}
                {!isAiSpeaking && isRecording && (
                  <div className="space-y-4">
                    <div className="text-center py-2 space-y-2">
                      <button
                        onClick={stopRecording}
                        className="w-16 h-16 mx-auto bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-full flex items-center justify-center text-rose-400 hover:scale-105 transition-all animate-pulse shadow-lg relative"
                      >
                        <MicOff className="w-7 h-7" />
                        <span className="absolute inset-0 rounded-full border-4 border-rose-500/20 animate-ping" />
                      </button>
                      <div>
                        <p className="text-xs font-bold text-rose-400">AI Đang Lắng Nghe...</p>
                        <p className="text-[10px] text-gray-400">Hãy trình bày câu trả lời. Bấm nút dừng khi xong.</p>
                      </div>
                    </div>

                    <div className="max-w-xs mx-auto">
                      <AudioVisualizer audioLevel={audioLevel} />
                    </div>
                  </div>
                )}

                {/* Case 3: Transcribing */}
                {!isAiSpeaking && isTranscribing && (
                  <div className="text-center py-6 space-y-3">
                    <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-white">AI đang phân tích câu trả lời...</p>
                      <p className="text-[10px] text-gray-400">Dịch thuật giọng nói thành văn bản (STT)</p>
                    </div>
                  </div>
                )}

                {/* Case 4: Recorded completed */}
                {!isAiSpeaking && hasRecorded && !isTranscribing && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Nội dung đã dịch (Có thể chỉnh sửa)
                      </label>
                      <textarea
                        value={finalAnswer}
                        onChange={(e) => setFinalAnswer(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:border-[#0ea5e9] focus:outline-none text-white transition-all text-xs leading-relaxed"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <button
                        onClick={startRecording}
                        className="px-4 py-2 border border-slate-800 hover:border-sky-500/40 text-gray-400 hover:text-[#38bdf8] hover:bg-sky-950/20 rounded-xl transition-all text-xs font-semibold"
                      >
                        Ghi âm lại
                      </button>
                      <button
                        onClick={handleSaveAndNext}
                        disabled={isSavingAnswer || !finalAnswer.trim()}
                        className="flex-1 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isSavingAnswer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{currentQuestion < questions.length - 1 ? "Lưu & Tiếp Tục" : "Hoàn Thành"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}
      </div>

      {/* Progress tracker footbar */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  index < currentQuestion
                    ? "bg-green-500"
                    : index === currentQuestion
                    ? "bg-[#0ea5e9] shadow-lg shadow-sky-500/20"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
