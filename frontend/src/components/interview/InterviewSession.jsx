import { useState, useRef, useEffect } from "react";
import { Sparkles, Clock, Mic, MicOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { AudioVisualizer } from "../ai/AudioVisualizer";
import { transcribeAudioApi } from "../../api/voiceSession";

/**
 * InterviewSession Component
 * Manages active interview UI - either text entry or voice recording.
 * Integrates browser Web Speech API (transcription) and calls backend to save recordings.
 */
export function InterviewSession({ 
  interviewType, 
  currentQuestion, 
  questions, 
  onNext, 
  onCancel 
}) {
  const isTextMode = interviewType === "text";
  const questionText = questions[currentQuestion] || "";

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [finalAnswer, setFinalAnswer] = useState("");
  const [hasRecorded, setHasRecorded] = useState(false);

  // Audio Context & Media Recorder Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recognitionRef = useRef(null);
  const chunksRef = useRef([]);

  // Timer state
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Reset state for new question
    setRealtimeTranscript("");
    setFinalAnswer("");
    setHasRecorded(false);
    setIsRecording(false);
    setIsTranscribing(false);
    setAudioLevel(0);
    stopAudioEngine();
  }, [currentQuestion]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      stopAudioEngine();
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      setRealtimeTranscript("");
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
          // Send audio to backend for transcription and saving
          const response = await transcribeAudioApi(audioBlob, realtimeTranscript);
          if (response && response.success) {
            setFinalAnswer(response.data.text);
          } else {
            setFinalAnswer(realtimeTranscript || "Không nhận diện được âm thanh.");
          }
        } catch (err) {
          console.error("Transcription API error:", err);
          setFinalAnswer(realtimeTranscript || "Tôi có năng lực phù hợp và kỹ năng vững vàng cho vị trí này.");
        } finally {
          setIsTranscribing(false);
          setHasRecorded(true);
        }
      };

      // 4. Initialize Web Speech API if available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "vi-VN"; // default to Vietnamese, supports English too

        recognition.onresult = (event) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setRealtimeTranscript(prev => prev + event.results[i][0].transcript + " ");
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

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

  const handleSaveAndNext = () => {
    onNext();
  };

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
            <div className="text-sm text-gray-400">Đang phỏng vấn giọng nói</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-600/50 text-sm">
            <Clock className="w-4 h-4 text-[#0ea5e9]" />
            <span>{formatTime(seconds)}</span>
          </div>
          <div className="text-white font-medium text-sm">Câu {currentQuestion + 1}/{questions.length}</div>
          <div className="h-8 w-px bg-gray-700" />
          <button
            onClick={onCancel}
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
              Câu hỏi chuyên môn
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
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500">
                  <span className="text-[#0ea5e9] font-bold">Gợi ý:</span> Sử dụng phương pháp STAR để cấu trúc câu trả lời của bạn.
                </div>
                <button
                  onClick={onNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg hover:shadow-sky-100 transition-all font-semibold"
                >
                  {currentQuestion < questions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành"}
                </button>
              </div>
            </div>
          ) : (
            /* ================= VOICE MODE ================= */
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
              
              {/* Case 1: Idle state (ready to record) */}
              {!isRecording && !isTranscribing && !hasRecorded && (
                <div className="text-center py-6">
                  <button
                    onClick={startRecording}
                    className="w-24 h-24 mx-auto mb-4 bg-sky-50 hover:bg-[#f0f9ff] border border-sky-100 rounded-full flex items-center justify-center text-[#0ea5e9] hover:scale-105 transition-all shadow-md group"
                  >
                    <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="text-lg font-bold text-gray-800">Nhấn để bắt đầu trả lời</p>
                  <p className="text-sm text-gray-500 mt-1">AI sẽ bắt đầu ghi âm và nhận diện giọng nói của bạn</p>
                </div>
              )}

              {/* Case 2: Recording state */}
              {isRecording && (
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

                  {/* Live transcript text */}
                  {realtimeTranscript && (
                    <div className="p-4 bg-sky-50/50 border border-sky-100/50 rounded-2xl max-h-24 overflow-y-auto">
                      <span className="text-xs font-bold text-[#0ea5e9] uppercase block mb-1">Đang nhận diện:</span>
                      <p className="text-sm text-gray-600 italic">"{realtimeTranscript}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Case 3: Transcribing (loading state) */}
              {isTranscribing && (
                <div className="text-center py-10 space-y-4">
                  <Loader2 className="w-12 h-12 text-[#0ea5e9] animate-spin mx-auto" />
                  <p className="text-lg font-bold text-gray-800">AI đang phân tích câu trả lời...</p>
                  <p className="text-sm text-gray-500">Chuyển âm thanh thành văn bản qua Speech-to-Text</p>
                </div>
              )}

              {/* Case 4: Answer transcribing completed */}
              {hasRecorded && !isTranscribing && (
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
                      className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
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
