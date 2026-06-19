import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGazeTracker } from '../../hooks/useGazeTracker';
import { submitAnswerApi } from '../../api/interviewApi';
import { finishHRInterviewApi } from '../../api/hrInterviewApi';
import { transcribeAudioApi } from '../../api/voiceSession';
import { axiosClient } from '../../api/axiosClient';
import { selectVoice, configureVoiceStyle, initVoices } from "../../utils/voiceEngine";
import { Avatar3D } from "../../components/ai/Avatar3D";
import { AudioVisualizer } from "../../components/ai/AudioVisualizer";
import { AiWaveform } from "../../components/ai/AiWaveform";
import { useAuthStore } from "../../store/useAuthStore";
import { Clock, Send, EyeOff, Loader2, AlertTriangle, Mic, MicOff, Volume2, VolumeX, Maximize } from 'lucide-react';

const TIME_PER_QUESTION = 300; // 5 phút

const HRInterviewRoom = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const { user } = useAuthStore();

  const questions = state?.questions || [];
  const jobTitle = state?.jobTitle || 'Vị trí phỏng vấn';
  const companyName = state?.companyName || '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  
  // Anti-cheat state
  const [isTabViolation, setIsTabViolation] = useState(false);
  const tabViolationsRef = useRef(0);
  const [accumulatedGazeViolations, setAccumulatedGazeViolations] = useState(0);
  const [gazeWarning, setGazeWarning] = useState(false);

  // Audio & Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [aiVolume, setAiVolume] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [currentAudioUrl, setCurrentAudioUrl] = useState("");
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAiVoiceEnabled, setIsAiVoiceEnabled] = useState(true);
  const [aiVoice] = useState("vi-VN-female"); // Mặc định giọng nữ

  // Audio Context & Media Recorder Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const chunksRef = useRef([]);

  const currentQuestion = questions[currentIndex];
  const questionText = currentQuestion?.question_text || "";

  // 1. Chặn user nếu không có data
  useEffect(() => {
    if (!state || !state.questions) {
      navigate('/applications');
    }
  }, [state, navigate]);

  // 2. Gaze Tracker (Anti-cheat)
  const {
    videoRef,
    isWarningActive,
    isCameraActive,
    isLoadingModel,
    isFaceDetected,
    resetViolations
  } = useGazeTracker({
    isActive: !isFinishing && !isSubmitting,
    onViolation: (count) => {
      setAccumulatedGazeViolations(count);
    },
    onWarning: (active) => {
      setGazeWarning(active);
    },
    onCameraError: () => {
      console.error("Lỗi camera GazeTracker!");
    }
  });

  // 3. Tab Violation (Anti-cheat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };
    const handleBlur = () => {
      handleViolation();
    };
    const handleViolation = () => {
      if (!isTabViolation && !isSubmitting && !isFinishing) {
        tabViolationsRef.current += 1;
        setIsTabViolation(true);
        setTimeout(() => setIsTabViolation(false), 3000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isTabViolation, isSubmitting, isFinishing]);

  // 4. Fullscreen
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.warn(err));
      }
    };
    enterFullscreen();
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn(err));
      }
    };
  }, []);

  // 5. Timer (Đã chuyển xuống dưới)

  // 6. Voice Audio Setup
  useEffect(() => {
    initVoices();
    return () => {
      stopAudioEngine();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (window.activeTtsAudio) {
        try { window.activeTtsAudio.pause(); window.activeTtsAudio = null; } catch (err) { /* ignore */ }
      }
    };
  }, []);

  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => {
        speakQuestion(questionText);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, questionText]);

  function stopAudioEngine() {
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

  function speakQuestionFallback(text, force = false) {
    if (!isAiVoiceEnabled && !force) {
      setIsAiSpeaking(false);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = aiVoice.startsWith("en-US") ? "en-US" : "vi-VN";
      configureVoiceStyle(utterance, aiVoice.includes("-male"));
      const matchingVoice = selectVoice(aiVoice);
      if (matchingVoice) utterance.voice = matchingVoice;
      
      let fallbackInterval;
      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setIsRecording(false);
        setHasRecorded(false);
        fallbackInterval = setInterval(() => {
          if (window.speechSynthesis.speaking) setAiVolume(0.15 + Math.random() * 0.75);
          else { setAiVolume(0); clearInterval(fallbackInterval); }
        }, 80);
      };
      utterance.onend = () => { setIsAiSpeaking(false); setAiVolume(0); clearInterval(fallbackInterval); };
      utterance.onerror = () => { setIsAiSpeaking(false); setAiVolume(0); clearInterval(fallbackInterval); };
      window.speechSynthesis.speak(utterance);
    }
  };

  async function speakQuestion(text, force = false) {
    if (window.activeTtsAudio) {
      try { window.activeTtsAudio.pause(); window.activeTtsAudio = null; } catch (err) { /* ignore */ }
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setAiVolume(0);
 
    if (!isAiVoiceEnabled && !force) {
      setIsAiSpeaking(false);
      return;
    }

    try {
      setIsAiSpeaking(true);
      setIsRecording(false);
      setHasRecorded(false);

      const response = await axiosClient.post("/voice-sessions/tts", { text, lang: aiVoice }, { responseType: 'blob' });
      const blob = new Blob([response], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      window.activeTtsAudio = audio;

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
        if (audio.paused || audio.ended) { setAiVolume(0); return; }
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const average = sum / dataArray.length;
        setAiVolume(Math.min(average / 90, 1.0));
        animationId = requestAnimationFrame(checkVolume);
      };

      audio.onplay = () => { audioCtx.resume(); checkVolume(); };
      audio.onended = () => { setIsAiSpeaking(false); setAiVolume(0); cancelAnimationFrame(animationId); audioCtx.close(); };
      audio.onerror = () => { setIsAiSpeaking(false); setAiVolume(0); cancelAnimationFrame(animationId); audioCtx.close(); speakQuestionFallback(text, force); };

      await audio.play();
    } catch (error) {
      speakQuestionFallback(text, force);
    }
  };

  async function startRecording() {
    try {
      if (isAiSpeaking) {
        if (window.activeTtsAudio) window.activeTtsAudio.pause();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setIsAiSpeaking(false);
        setAiVolume(0);
      }

      chunksRef.current = [];
      setFinalAnswer("");
 
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
 
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
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(Math.round((avg / 128) * 100), 100));
        animationFrameRef.current = requestAnimationFrame(drawVolume);
      };
      drawVolume();
 
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
 
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsTranscribing(true);
        try {
          const response = await transcribeAudioApi(audioBlob, "");
          if (response && response.success) {
            setFinalAnswer(response.data.text);
            setCurrentAudioUrl(response.data.audioUrl || "");
          } else {
            setFinalAnswer("Không nhận diện được âm thanh.");
          }
        } catch (err) {
          setFinalAnswer("Lỗi nhận diện âm thanh. Vui lòng ghi âm lại hoặc tự nhập câu trả lời vào ô này.");
        } finally {
          setIsTranscribing(false);
          setHasRecorded(true);
        }
      };
 
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Không thể truy cập Microphone. Vui lòng kiểm tra lại quyền.");
    }
  };

  function stopRecording() {
    setIsRecording(false);
    stopAudioEngine();
  };

  async function handleSubmitAnswer() {
    if (isSubmitting || isFinishing) return;
    setIsSubmitting(true);
    stopAudioEngine();

    const answerToSave = finalAnswer.trim() || 'Không có câu trả lời.';
    const totalViolations = accumulatedGazeViolations + tabViolationsRef.current;

    try {
      await submitAnswerApi(currentQuestion.id, answerToSave, currentAudioUrl, totalViolations);
      
      resetViolations();
      setAccumulatedGazeViolations(0);
      setTimeLeft(TIME_PER_QUESTION);
      setFinalAnswer("");
      setCurrentAudioUrl("");
      setHasRecorded(false);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setIsFinishing(true);
        try { await finishHRInterviewApi(interviewId, totalViolations); } catch (e) { /* ignore cleanup error */ }
        navigate(`/hr-interview/result/${interviewId}`);
      }
    } catch (error) {
      console.error("Lỗi khi nộp câu trả lời", error);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setIsFinishing(true);
        try { await finishHRInterviewApi(interviewId, totalViolations); } catch (e) { /* ignore cleanup error */ }
        navigate(`/hr-interview/result/${interviewId}`);
      }
    }
  };

  // 5. Timer (Đã chuyển từ trên xuống để gọi handleSubmitAnswer)
  useEffect(() => {
    if (!currentQuestion || isSubmitting || isFinishing || isAiSpeaking) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, isSubmitting, isFinishing, isAiSpeaking, currentQuestion, finalAnswer, currentAudioUrl, accumulatedGazeViolations]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden font-sans">
      
      {/* Cảnh báo Gaze Tracker Toàn màn hình */}
      {(gazeWarning || isWarningActive) && !isTabViolation && (
        <div className="absolute inset-0 z-[200] pointer-events-none bg-red-500/20 flex flex-col items-center justify-center border-8 border-red-500 animate-pulse backdrop-blur-sm">
          <EyeOff className="w-24 h-24 text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
          <h2 className="text-4xl md:text-5xl font-black text-red-500 drop-shadow-md tracking-wider">NHÌN VÀO MÀN HÌNH</h2>
          <p className="text-xl text-white drop-shadow-md font-semibold mt-4 bg-red-600/80 px-6 py-2 rounded-full">
            Vi phạm này đã được ghi lại! ({accumulatedGazeViolations} lần)
          </p>
        </div>
      )}

      {/* Cảnh báo Chuyển Tab */}
      {isTabViolation && !isFinishing && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[200] bg-red-600 text-white p-4 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center gap-4 max-w-md border-2 border-red-400 animate-pulse pointer-events-none">
          <AlertTriangle className="w-10 h-10 shrink-0" />
          <div>
            <h3 className="font-bold text-lg leading-none mb-1">CẢNH BÁO RỜI MÀN HÌNH</h3>
            <p className="text-sm text-red-100">Hành động chuyển tab hoặc thu nhỏ trình duyệt đã bị hệ thống ghi nhận.</p>
          </div>
        </div>
      )}

      {/* Màn hình Loading khi nộp bài */}
      {isFinishing && (
        <div className="absolute inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center">
          <Loader2 className="w-20 h-20 text-sky-500 animate-spin mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Đang tổng hợp báo cáo...</h2>
          <p className="text-slate-400 max-w-md text-center">Hệ thống AI đang chấm điểm, đánh giá mức độ vi phạm và phân tích câu trả lời của bạn. Quá trình này có thể mất vài giây.</p>
        </div>
      )}

      {/* Main Video Call Area (Center) */}
      <div className="relative flex-1 flex items-center justify-center w-full h-full">
        {/* 3D Avatar Background (Speaker View) */}
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">
          <div className="w-full h-full max-w-[1200px] max-h-[800px] relative">
            <Avatar3D volume={aiVolume} isListening={isRecording} emotion={isAiSpeaking ? "happy" : "idle"} />
            
            {/* Tên người phỏng vấn */}
            <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-white font-medium">AI HR Interviewer</span>
            </div>
          </div>
        </div>

        {/* Cột Phụ Đề (Subtitles) nổi ở dưới cùng, đè lên Avatar */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center px-6 pointer-events-none z-40">
          <div className="max-w-3xl w-full flex flex-col gap-4">
            {/* Câu hỏi của AI */}
            <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl text-center transform transition-all">
              <div className="text-sky-400 text-xs font-bold uppercase tracking-widest mb-2">
                Câu hỏi {currentIndex + 1}/{questions.length}
              </div>
              <p className="text-white text-lg md:text-xl font-medium leading-relaxed drop-shadow-md">
                {questionText}
              </p>
              {isAiSpeaking && (
                <div className="mt-3 flex justify-center">
                  <AiWaveform />
                </div>
              )}
            </div>

            {/* Khung hiển thị câu trả lời của Candidate */}
            {(isRecording || isTranscribing || hasRecorded) && (
              <div className="bg-sky-900/60 backdrop-blur-md border border-sky-400/30 rounded-2xl p-5 shadow-2xl pointer-events-auto transition-all">
                {isRecording && (
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-rose-400 text-xs font-bold uppercase flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Đang ghi âm câu trả lời...
                    </span>
                    <AudioVisualizer audioLevel={audioLevel} />
                  </div>
                )}
                {isTranscribing && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                    <span className="text-sky-300 text-sm">Đang dịch giọng nói (STT)...</span>
                  </div>
                )}
                {hasRecorded && !isTranscribing && (
                  <div className="w-full">
                    <span className="text-green-400 text-xs font-bold uppercase mb-2 block">Nội dung câu trả lời (Có thể chỉnh sửa):</span>
                    <textarea
                      value={finalAnswer}
                      onChange={(e) => setFinalAnswer(e.target.value)}
                      className="w-full bg-black/40 border border-sky-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-sky-400 resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Camera của Ứng viên (Picture-in-Picture) */}
        <div className="absolute top-6 right-6 w-48 md:w-64 aspect-video bg-black rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-2 border-slate-700/80 z-50 group transition-transform hover:scale-105">
          {isLoadingModel && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1.5">
            <span className="truncate max-w-[100px]">{user?.full_name || "Ứng viên"}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isFaceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-20 bg-[#111827] border-t border-gray-800 flex items-center justify-between px-6 z-50 shrink-0">
        
        {/* Left: Info */}
        <div className="flex items-center gap-4 w-1/3">
          <div className="hidden md:block">
            <h3 className="text-white font-medium truncate">{jobTitle}</h3>
            {companyName && <p className="text-gray-400 text-xs truncate">{companyName}</p>}
          </div>
          <div className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-700">
            <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`} />
            <span className={`text-sm font-mono font-bold ${timeLeft < 60 ? 'text-rose-500' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center justify-center gap-4 w-1/3">
          <button
            onClick={() => setIsAiVoiceEnabled(!isAiVoiceEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isAiVoiceEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'
            }`}
            title={isAiVoiceEnabled ? "Tắt tiếng AI" : "Bật tiếng AI"}
          >
            {isAiVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isSubmitting || isTranscribing}
              className="w-14 h-14 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              title="Bắt đầu nói"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-14 h-14 bg-white hover:bg-gray-200 text-rose-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all animate-pulse"
              title="Dừng ghi âm"
            >
              <MicOff className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(()=>{});
              } else {
                document.documentElement.requestFullscreen().catch(()=>{});
              }
            }}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all"
            title="Toàn màn hình"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3 w-1/3">
          <button
            onClick={handleSubmitAnswer}
            disabled={isSubmitting || isFinishing || (!finalAnswer.trim() && !isRecording && !isTranscribing)}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {currentIndex === questions.length - 1 ? 'Nộp Bài' : 'Tiếp Theo'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default HRInterviewRoom;
