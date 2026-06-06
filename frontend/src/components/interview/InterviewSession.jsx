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
      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setIsRecording(false);
        setHasRecorded(false);
      };
      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      utterance.onerror = (err) => {
        console.error("SpeechSynthesis error:", err);
        setIsAiSpeaking(false);
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
      
      audio.onended = () => {
        setIsAiSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        window.activeTtsAudio = null;
      };
      
      audio.onerror = (err) => {
        console.error("TTS audio playback error, falling back:", err);
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
        await submitAnswerApi(questionId, answerToSave.trim(), currentAudioUrl);
      } catch (err) {
        console.error("Failed to submit and grade answer:", err);
      } finally {
        setIsSavingAnswer(false);
      }
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

      {/* Main question area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-3xl p-8 mb-6 text-center shadow-2xl relative overflow-hidden border border-gray-100">
            {/* Decorative colored strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />
            <div className="text-xs font-bold text-[#0ea5e9] tracking-widest uppercase mb-2">Câu Hỏi {currentQuestion + 1}</div>
            <h2 className="text-2xl md:text-3xl mb-4 font-bold text-gray-800 leading-snug">{questionText}</h2>
            <div className="inline-flex px-3 py-1.5 bg-sky-50 text-[#0ea5e9] rounded-full text-xs font-semibold border border-sky-100/50">
              Câu hỏi phỏng vấn AI
            </div>
          </div>

          {isTextMode ? (
            /* ================= TEXT MODE ================= */
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <textarea
                placeholder="Nhập câu trả lời của bạn vào đây..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none resize-none text-gray-700 transition-all"
                rows={6}
                autoFocus
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />

              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500">
                  <span className="text-[#0ea5e9] font-bold">Gợi ý:</span> Sử dụng phương pháp STAR để cấu trúc câu trả lời của bạn.
                </div>
                <button
                  onClick={handleSaveAndNext}
                  disabled={isSavingAnswer || !textAnswer.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg hover:shadow-sky-100 transition-all font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSavingAnswer && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{currentQuestion < questions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành"}</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= VOICE MODE ================= */
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
              
              {/* Case 0: AI is actively speaking TTS question */}
              {isAiSpeaking && (
                <div className="py-6 space-y-4">
                  <AiWaveform />
                </div>
              )}

              {/* Case 1: Idle state (ready to record) */}
              {!isAiSpeaking && !isRecording && !isTranscribing && !hasRecorded && (
                <div className="text-center py-6">
                  <button
                    onClick={startRecording}
                    className="w-24 h-24 mx-auto mb-4 bg-sky-50 hover:bg-[#f0f9ff] border border-sky-100 rounded-full flex items-center justify-center text-[#0ea5e9] hover:scale-105 transition-all shadow-md group"
                  >
                    <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="text-lg font-bold text-gray-800">Nhấn để bắt đầu trả lời</p>
                  <p className="text-sm text-gray-500 mt-1">AI đã đọc xong. Sẵn sàng ghi âm giọng nói của bạn</p>
                </div>
              )}

              {/* Case 2: Recording state */}
              {!isAiSpeaking && isRecording && (
                <div className="space-y-6">
                  <div className="text-center py-4">
                    <button
                      onClick={stopRecording}
                      className="w-24 h-24 mx-auto mb-4 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-600 hover:scale-105 transition-all animate-pulse shadow-md relative"
                    >
                      <MicOff className="w-10 h-10" />
                      {/* Ocean blue waves around recording button */}
                      <span className="absolute inset-0 rounded-full border-4 border-[#0ea5e9]/20 animate-ping" />
                    </button>
                    <p className="text-lg font-bold text-gray-800">Hệ thống đang ghi âm...</p>
                    <p className="text-sm text-gray-500 mt-1">Nhấp nút ở trên để hoàn thành câu trả lời</p>
                  </div>

                  {/* Realtime voice visualizer */}
                  <div className="max-w-md mx-auto">
                    <AudioVisualizer audioLevel={audioLevel} />
                  </div>

                  {/* Recording instructions */}
                  <div className="p-4 bg-sky-50/50 border border-sky-100/50 rounded-2xl text-center">
                    <span className="text-xs font-bold text-[#0ea5e9] uppercase block mb-1 animate-pulse">AI Đang Lắng Nghe:</span>
                    <p className="text-xs text-gray-500 italic">
                      Hãy trình bày câu trả lời của bạn qua microphone. Khi trả lời xong, bấm nút kết thúc để AI dịch chuẩn xác câu hỏi (hỗ trợ song ngữ Anh - Việt).
                    </p>
                  </div>
                </div>
              )}

              {/* Case 3: Transcribing (loading state) */}
              {!isAiSpeaking && isTranscribing && (
                <div className="text-center py-10 space-y-4">
                  <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin mx-auto" />
                  <p className="text-lg font-bold text-gray-800">AI đang phân tích câu trả lời...</p>
                  <p className="text-sm text-gray-500">Chuyển âm thanh thành văn bản qua Speech-to-Text</p>
                </div>
              )}

              {/* Case 4: Answer transcribing completed */}
              {!isAiSpeaking && hasRecorded && !isTranscribing && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">Ghi âm thành công!</h4>
                      <p className="text-xs text-emerald-700/80">AI đã chuyển đổi giọng thoại của bạn thành văn bản bên dưới.</p>
                    </div>
                  </div>

                  {/* Editable transcription result */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Nội dung câu trả lời của bạn
                    </label>
                    <textarea
                      value={finalAnswer}
                      onChange={(e) => setFinalAnswer(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#0ea5e9] focus:outline-none text-gray-700 transition-all text-sm leading-relaxed"
                      rows={5}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between items-center gap-4">
                    <button
                      onClick={startRecording}
                      className="px-5 py-2.5 border-2 border-gray-200 hover:border-[#0ea5e9] text-gray-600 hover:text-[#0ea5e9] hover:bg-sky-50/20 rounded-xl transition-all text-sm font-semibold"
                    >
                      Ghi âm lại
                    </button>
                    <button
                      onClick={handleSaveAndNext}
                      disabled={isSavingAnswer || !finalAnswer.trim()}
                      className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSavingAnswer && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{currentQuestion < questions.length - 1 ? "Lưu & Tiếp Tục" : "Hoàn Thành"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
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
