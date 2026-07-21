import { useState, useEffect, useRef } from "react";
import { X, Mic, Square, Play, Pause, RefreshCw, Send, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDailyQuestionApi, submitDailyAnswerApi } from "../../api/dailyChallengeApi";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { useUiStore } from "../../store/useUiStore";

const INDUSTRY_GROUPS = [
  {
    id: "it",
    name: "Công nghệ thông tin (IT)",
    tracks: [
      { id: "frontend", name: "Frontend Developer" },
      { id: "backend", name: "Backend Developer" },
      { id: "fullstack", name: "Fullstack Developer" },
      { id: "qa", name: "QA / QC Engineer" },
      { id: "data_science", name: "Data Scientist" }
    ]
  },
  {
    id: "business",
    name: "Kinh tế & Kinh doanh",
    tracks: [
      { id: "marketing", name: "Digital Marketing Specialist" },
      { id: "sales", name: "Business Development / Sales" },
      { id: "hr", name: "Quản trị Nhân sự (HR)" },
      { id: "finance", name: "Tài chính / Kế toán" },
      { id: "pm", name: "Product Manager (PM)" }
    ]
  },
  {
    id: "design",
    name: "Thiết kế & Sáng tạo",
    tracks: [
      { id: "design", name: "UI/UX Designer" },
      { id: "graphic", name: "Graphic Designer" }
    ]
  }
];

export function DailyChallengeModal({ isOpen, onClose, onSuccess }) {
  const { showToast } = useUiStore();
  const [selectedIndustry, setSelectedIndustry] = useState("it");
  const [selectedTrack, setSelectedTrack] = useState("frontend");
  const [phase, setPhase] = useState("prepare"); // prepare, recording, review, grading, result
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);

  const canvasRef = useRef(null);
  const previewAudioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    audioUrl,
    permissionGranted,
    error: recorderError,
    requestPermission,
    startRecording,
    stopRecording,
    clearRecording,
    stream
  } = useAudioRecorder();

  // Fetch daily question based on selected track
  const { data: questionData, isLoading: isQuestionLoading, refetch: refetchQuestion } = useQuery({
    queryKey: ["dailyQuestion", selectedTrack],
    queryFn: async () => {
      try {
        const response = await getDailyQuestionApi(selectedTrack);
        return response.data || response;
      } catch (err) {
        console.warn("Daily question API fallback.");
        const fallbacks = {
          frontend: {
            id: 1,
            question_text: "Restful API là gì? Hãy cho tôi biết về 1 số Http method và khi nào thì dùng nó?",
            sample_answer: "RESTful API là chuẩn thiết kế API sử dụng HTTP methods: GET, POST, PUT, PATCH, DELETE."
          },
          backend: {
            id: 2,
            question_text: "Hãy giải thích về cơ chế connection pooling trong PostgreSQL và tại sao nó quan trọng?",
            sample_answer: "Connection pooling giữ các kết nối database mở sẵn và dùng lại chúng, giảm thiểu độ trễ."
          },
          fullstack: {
            id: 3,
            question_text: "So sánh Server-Side Rendering (SSR) và Client-Side Rendering (CSR) về SEO và trải nghiệm người dùng?",
            sample_answer: "SSR render HTML ở server tốt cho SEO. CSR render ở client mượt mà sau khi load xong."
          },
          design: {
            id: 4,
            question_text: "Quy tắc 60-30-10 trong phối màu UI/UX thiết kế là gì?",
            sample_answer: "Quy tắc phối màu gồm: 60% màu chủ đạo, 30% màu phụ, và 10% màu nhấn."
          },
          qa: {
            id: 5,
            question_text: "Phân biệt Regression Testing và Sanity Testing?",
            sample_answer: "Regression testing kiểm thử toàn bộ hệ thống sau thay đổi. Sanity testing kiểm tra nhanh tính năng vừa cập nhật."
          },
          pm: {
            id: 6,
            question_text: "Khái niệm MVP (Minimum Viable Product) là gì và làm thế nào để xác định phạm vi của MVP?",
            sample_answer: "MVP là phiên bản sản phẩm tối giản nhất chứa đủ tính năng cốt lõi để thu thập phản hồi người dùng."
          },
          data_science: {
            id: 7,
            question_text: "Phân biệt Overfitting và Underfitting trong mô hình học máy?",
            sample_answer: "Overfitting là mô hình quá khớp dữ liệu train. Underfitting là mô hình quá đơn giản."
          },
          marketing: {
            id: 8,
            question_text: "Các chỉ số KPIs quan trọng nhất trong một chiến dịch Performance Marketing là gì?",
            sample_answer: "Các chỉ số cốt lõi gồm CTR (Click-Through Rate), CPC (Cost Per Click), CPA (Cost Per Acquisition), và ROAS (Return On Ad Spend)."
          },
          sales: {
            id: 9,
            question_text: "Hãy nêu quy trình 7 bước xử lý từ chối (Objection Handling) trong B2B Sales?",
            sample_answer: "Lắng nghe chân thành, đồng cảm, làm rõ nguyên nhân từ chối, đưa ra giải pháp chứng minh giá trị, và chốt cam kết thử nghiệm."
          },
          hr: {
            id: 10,
            question_text: "Sự khác biệt giữa mô hình OKRs và KPIs trong đánh giá hiệu suất nhân sự là gì?",
            sample_answer: "KPIs tập trung vào duy trì mục tiêu và chỉ số hiệu suất đo lường định kỳ. OKRs tập trung vào mục tiêu đột phá truyền cảm hứng."
          },
          finance: {
            id: 11,
            question_text: "Khái niệm EBITDA là gì và tại sao chỉ số này quan trọng trong định giá doanh nghiệp?",
            sample_answer: "EBITDA là lợi nhuận trước thuế, lãi vay và hao phí. Chỉ số này phản ánh năng lực tạo tiền thuần từ hoạt động kinh doanh cốt lõi."
          },
          graphic: {
            id: 12,
            question_text: "Khác biệt cơ bản giữa định dạng hình ảnh Vector và Raster là gì?",
            sample_answer: "Vector dựa trên công thức toán học nên không bị vỡ nét khi phóng to. Raster dựa trên lưới điểm ảnh (pixels) nên dễ bị mờ khi thay đổi kích thước."
          }
        };
        return fallbacks[selectedTrack] || { id: 99, question_text: `Thử thách phỏng vấn cho chuyên ngành ${selectedTrack}` };
      }
    },
    enabled: isOpen
  });

  // Industry selection handler
  const handleIndustryChange = (e) => {
    const industryId = e.target.value;
    setSelectedIndustry(industryId);
    const group = INDUSTRY_GROUPS.find((g) => g.id === industryId);
    if (group && group.tracks.length > 0) {
      setSelectedTrack(group.tracks[0].id);
    }
    setPhase("prepare");
    clearRecording();
  };

  // Track selection handler
  const handleTrackChange = (e) => {
    setSelectedTrack(e.target.value);
    setPhase("prepare");
    clearRecording();
  };

  // Start recording action
  const handleStartRecord = async () => {
    const hasPerm = await requestPermission();
    if (!hasPerm) return;

    await startRecording();
    setPhase("recording");
    setTimeLeft(60);
  };

  // Stop recording action
  const handleStopRecord = () => {
    stopRecording();
    setPhase("review");
  };

  // Timer countdown hook for recording phase
  useEffect(() => {
    let timer = null;
    if (phase === "recording" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleStopRecord();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase, timeLeft]);

  // Waveform visualization effect using Canvas
  useEffect(() => {
    if (phase === "recording" && stream && canvasRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const draw = () => {
        if (phase !== "recording") return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = "rgba(10, 15, 28, 0.2)"; // Semi-transparent overlay for trailing effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i] / 1.5;

          // Gradient color: Ocean Blue palette
          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
          gradient.addColorStop(0, "#38bdf8");
          gradient.addColorStop(1, "#0ea5e9");

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }
      };

      draw();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    };
  }, [phase, stream]);

  // Audio preview playback toggle
  const togglePreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handlePreviewEnded = () => {
    setIsPlayingPreview(false);
  };

  // Submit recorded answer for grading
  const handleSubmit = async () => {
    if (!audioBlob) {
      showToast({ message: "Không tìm thấy file ghi âm!", type: "error" });
      return;
    }

    setPhase("grading");

    const formData = new FormData();
    formData.append("audio", audioBlob, "answer.webm");
    formData.append("questionId", questionData?.id || 1);
    formData.append("track", selectedTrack);

    try {
      const response = await submitDailyAnswerApi(formData);
      const resData = response.data || response;
      setGradingResult(resData);
      setPhase("result");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Daily grading submission API failed:", err);
      showToast({
        message: err.response?.data?.message || "Gửi câu trả lời thất bại! Vui lòng thử lại.",
        type: "error"
      });
      setPhase("review");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative overflow-hidden w-full max-w-2xl dark:bg-[#0a0f1c] bg-white border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-2xl transition-all duration-300">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-[#0ea5e9]">
              <Mic className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black dark:text-white text-slate-800">
              Thử Thách Phỏng Vấn Nhanh
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl dark:bg-slate-800/50 bg-slate-100 dark:text-slate-400 text-slate-500 hover:text-slate-700 dark:hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6">
          
          {/* Phase 1: Prepare & Track Selection */}
          {(phase === "prepare" || phase === "recording" || phase === "review") && (
            <div className="space-y-6">
              
              {/* Dropdown Industry & Track Selector */}
              {phase === "prepare" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select Khối Ngành */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Chọn khối ngành
                    </label>
                    <select
                      value={selectedIndustry}
                      onChange={handleIndustryChange}
                      className="w-full px-4 py-3 rounded-2xl dark:bg-slate-900 bg-slate-50 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-sm focus:outline-none focus:border-[#0ea5e9] cursor-pointer"
                    >
                      {INDUSTRY_GROUPS.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Chuyên Ngành */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      Chọn chuyên ngành phỏng vấn
                    </label>
                    <select
                      value={selectedTrack}
                      onChange={handleTrackChange}
                      className="w-full px-4 py-3 rounded-2xl dark:bg-slate-900 bg-slate-50 border border-slate-200/50 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-sm focus:outline-none focus:border-[#0ea5e9] cursor-pointer"
                    >
                      {INDUSTRY_GROUPS.find((g) => g.id === selectedIndustry)?.tracks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Question display */}
              <div className="p-5 rounded-2xl dark:bg-[#0f172a] bg-slate-50/50 border border-slate-100 dark:border-slate-800/40 relative">
                <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 text-[9px] font-extrabold uppercase bg-sky-500/10 text-[#0ea5e9] rounded-full border border-sky-500/20">
                  Câu hỏi chuyên ngành
                </span>
                {isQuestionLoading ? (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-[#0ea5e9] animate-spin" />
                    <span className="text-xs text-slate-400">Đang tải câu hỏi AI...</span>
                  </div>
                ) : (
                  <p className="text-base font-bold dark:text-white text-slate-800 leading-relaxed pt-1">
                    "{questionData?.question_text}"
                  </p>
                )}
              </div>

              {/* Timer & Waveform during recording */}
              {phase === "recording" && (
                <div className="flex flex-col items-center gap-4">
                  {/* Circular Timer indicator */}
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-slate-800">
                    {/* Shrinking overlay timer indicator (visual indicator) */}
                    <div 
                      className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                        timeLeft <= 10 ? "border-red-500 scale-105 animate-pulse" : "border-[#0ea5e9]"
                      }`}
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${timeLeft >= 45 ? "100% 0%, 100% 100%, 0% 100%, 0% 0%" : timeLeft >= 30 ? "100% 0%, 100% 100%, 0% 100%" : timeLeft >= 15 ? "100% 0%, 100% 100%" : "100% 0%"} )`
                      }}
                    />
                    <span className={`text-2xl font-black ${timeLeft <= 10 ? "text-red-500" : "dark:text-white text-slate-800"}`}>
                      {timeLeft}s
                    </span>
                  </div>

                  {/* Audio Waveform Canvas */}
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={80}
                    className="w-full h-20 rounded-2xl bg-[#0a0f1c] border border-slate-800"
                  />
                </div>
              )}

              {/* Preview Audio during review */}
              {phase === "review" && audioUrl && (
                <div className="flex flex-col items-center gap-4 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/20">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Kiểm tra câu trả lời trước khi nộp
                  </h4>
                  <audio
                    ref={previewAudioRef}
                    src={audioUrl}
                    onEnded={handlePreviewEnded}
                    className="hidden"
                  />
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePreview}
                      className="p-4 rounded-full bg-[#0ea5e9] text-white hover:bg-[#0284c7] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-sky-500/10 cursor-pointer"
                    >
                      {isPlayingPreview ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
                    </button>
                    <button
                      onClick={() => {
                        clearRecording();
                        setPhase("prepare");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-xs font-bold">Thu âm lại</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error messages if any */}
              {recorderError && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{recorderError}</span>
                </div>
              )}

              {/* Action Buttons for Prepare/Recording/Review */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                {phase === "prepare" && (
                  <button
                    onClick={handleStartRecord}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:from-[#0284c7] hover:to-[#0ea5e9] text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-sky-500/10 active:scale-95 transition-all cursor-pointer group"
                  >
                    <Mic className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    <span>Ghi Âm Trả Lời</span>
                  </button>
                )}

                {phase === "recording" && (
                  <button
                    onClick={handleStopRecord}
                    className="flex items-center gap-2 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-red-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Dừng & Kiểm Tra</span>
                  </button>
                )}

                {phase === "review" && (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:from-[#0284c7] hover:to-[#0ea5e9] text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-sky-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp Cho AI Đánh Giá</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Phase 2: Grading state */}
          {phase === "grading" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              
              {/* Premium Gradation Loading Animation */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-sky-500/10 border-t-[#0ea5e9] animate-spin" />
                <div className="absolute inset-4 rounded-full border-4 border-sky-400/5 border-t-[#38bdf8] animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
                <div className="w-12 h-12 rounded-full bg-sky-500/10 dark:bg-sky-500/20 flex items-center justify-center text-[#0ea5e9]">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black dark:text-white text-slate-800">
                  AI Đang Chấm Điểm Thử Thách
                </h3>
                <p className="text-sm text-slate-400 font-semibold max-w-sm">
                  Đang phân tích độ sâu câu trả lời, sự mạch lạc và từ vựng chuyên môn của bạn...
                </p>
              </div>
            </div>
          )}

          {/* Phase 3: Results display */}
          {phase === "result" && gradingResult && (
            <div className="space-y-6">
              
              {/* Score Display Card */}
              <div className="p-6 rounded-3xl dark:bg-slate-900 bg-slate-50 border border-slate-200/50 dark:border-slate-800/60 flex flex-col sm:flex-row items-center gap-6 justify-center">
                <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-8 border-green-500/10 dark:border-green-500/20 shadow-inner">
                  <div className="absolute inset-0 rounded-full border-8 border-t-green-500" />
                  <span className="text-3xl font-black text-green-500">
                    {gradingResult.score}
                  </span>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-green-500 font-extrabold text-sm">
                    <CheckCircle className="w-4 h-4 fill-green-500/10" />
                    <span>Hoàn Thành Xuất Sắc!</span>
                  </div>
                  <h3 className="text-lg font-black dark:text-white text-slate-800">
                    Thử Thách Đã Được Chấm Điểm
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Streak và Điểm Bảng xếp hạng của bạn đã được cập nhật.
                  </p>
                </div>
              </div>

              {/* Feedback Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Nhận xét chi tiết từ AI Coach
                  </h4>
                  <div className="p-4 rounded-2xl dark:bg-slate-900 bg-slate-50 border border-slate-200/30 dark:border-slate-800/40">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                      {gradingResult.feedback}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                    <span>Gợi ý trả lời tối ưu (Sample Answer)</span>
                  </h5>
                  <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10">
                    <p className="text-sm text-[#0ea5e9] dark:text-[#38bdf8] leading-relaxed font-semibold italic">
                      "{gradingResult.sample_answer}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Result Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:from-[#0284c7] hover:to-[#0ea5e9] text-white rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-sky-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  Đóng & Nhận Streak
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// Sparkles helper component
function Sparkles({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}
