import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGazeTracker } from '../../hooks/useGazeTracker';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { submitAnswerApi } from '../../api/interviewApi';
import { finishHRInterviewApi } from '../../api/hrInterviewApi';
import { Clock, Send, EyeOff, Loader2, AlertTriangle, Mic, MicOff } from 'lucide-react';

const TIME_PER_QUESTION = 300; // 5 phút

const HRInterviewRoom = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const questions = state?.questions || [];
  const jobTitle = state?.jobTitle || 'Vị trí phỏng vấn';
  const companyName = state?.companyName || '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isTabViolation, setIsTabViolation] = useState(false);
  const gazeViolationsRef = useRef(0);
  const tabViolationsRef = useRef(0);

  const { isRecording, transcript, interimTranscript, error: speechError, toggleRecording, resetTranscript } = useSpeechToText();

  const currentQuestion = questions[currentIndex];

  // Khởi tạo Gaze Tracker (không hiển thị UI warning nội bộ hook, xử lý ở trang)
  const { videoRef, isWarningActive } = useGazeTracker({
    isActive: true,
    onViolation: () => {
      gazeViolationsRef.current += 1;
    },
    onWarning: (active) => {
      // isWarningActive state is handled by the hook and exported
    },
    onCameraError: () => {
      console.error("Lỗi camera!");
    }
  });

  // Chặn user nếu nhảy trực tiếp vào URL mà không qua Prep
  useEffect(() => {
    if (!state || !state.questions) {
      navigate('/applications');
    }
  }, [state, navigate]);

  // Anti-cheat: Chống chuyển tab / rời màn hình
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    const handleViolation = () => {
      if (!isTabViolation && !isSubmitting) {
        tabViolationsRef.current += 1;
        setIsTabViolation(true);
        // Tự động tắt vi phạm sau 3 giây để cảnh cáo
        setTimeout(() => {
          setIsTabViolation(false);
        }, 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isTabViolation, isSubmitting]);

  // Request Fullscreen
  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.warn(`Lỗi full màn hình: ${err.message}`);
        });
      }
    };
    
    enterFullscreen();

    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn(`Lỗi thoát full màn hình: ${err.message}`);
        });
      }
    };
  }, []);

  const handleSubmitAnswer = async () => {
    if (isSubmitting || isFinishing) return;
    setIsSubmitting(true);

    try {
      // Dừng thu âm nếu đang thu
      if (isRecording) {
        toggleRecording();
      }
      
      const finalAnswer = transcript.trim() || 'Không có câu trả lời.';
      const totalViolations = gazeViolationsRef.current + tabViolationsRef.current;
      
      await submitAnswerApi(currentQuestion.id, finalAnswer, null, totalViolations);
      
      // Reset state cho câu tiếp theo
      resetTranscript();
      gazeViolationsRef.current = 0;
      setTimeLeft(TIME_PER_QUESTION);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsSubmitting(false);
      } else {
        // Hết câu hỏi -> GỌi API tạo báo cáo AI tổng hợp
        setIsSubmitting(false);
        setIsFinishing(true);
        await finishHRInterviewApi(interviewId, tabViolationsRef.current);
        navigate(`/hr-interview/result/${interviewId}`);
      }
    } catch (error) {
      console.error("Lỗi khi nộp câu trả lời", error);
      
      // Reset state cho câu tiếp theo để tránh gộp chữ
      resetTranscript();
      gazeViolationsRef.current = 0;
      setTimeLeft(TIME_PER_QUESTION);

      // Giả sử vẫn cho đi tiếp nếu lỗi (tuỳ nghiệp vụ, ở đây tạm cho đi tiếp)
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setIsFinishing(true);
        try {
          await finishHRInterviewApi(interviewId, tabViolationsRef.current);
        } catch (e) {
          console.error("Lỗi finish interview", e);
        }
        navigate(`/hr-interview/result/${interviewId}`);
      }
    }
  };

  // Hẹn giờ
  useEffect(() => {
    if (!currentQuestion || isSubmitting || isFinishing) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isSubmitting, isFinishing, currentQuestion, handleSubmitAnswer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentQuestion) return null;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Cảnh báo Gaze Tracker */}
      {isWarningActive && !isTabViolation && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-red-500/20 flex flex-col items-center justify-center border-8 border-red-500 animate-pulse">
          <EyeOff className="w-24 h-24 text-red-600 mb-4" />
          <h2 className="text-4xl font-bold text-red-600 drop-shadow-md">NHÌN VÀO MÀN HÌNH</h2>
          <p className="text-xl text-red-600 drop-shadow-md font-semibold mt-2">Vi phạm này đã được ghi lại!</p>
        </div>
      )}

      {/* Loading khi tổng hợp báo cáo */}
      {isFinishing && (
        <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="w-16 h-16 text-sky-500 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Đang nộp bài...</h2>
          <p className="text-slate-600 dark:text-slate-400">Hệ thống đang tổng hợp báo cáo AI. Quá trình này có thể mất vài giây.</p>
        </div>
      )}

      {/* Cảnh báo Chuyển Tab */}
      {isTabViolation && !isFinishing && (
        <div className="fixed top-6 right-6 z-50 bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 max-w-sm border-2 border-red-400 animate-pulse pointer-events-none">
          <AlertTriangle className="w-8 h-8 shrink-0 text-white" />
          <div>
            <h3 className="font-bold text-lg leading-none mb-1">CẢNH BÁO VI PHẠM</h3>
            <p className="text-sm text-red-100">Bạn vừa rời khỏi màn hình. Việc này đã được ghi nhận.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 py-4 px-6 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {jobTitle}
          </h1>
          {companyName && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{companyName}</p>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sky-600 dark:text-sky-400 font-semibold text-lg bg-sky-50 dark:bg-sky-900/30 px-4 py-1.5 rounded-full border border-sky-100 dark:border-sky-800">
            Câu {currentIndex + 1} / {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-lg ${
            timeLeft < 60 
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
              : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
          }`}>
            <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'animate-pulse' : ''}`} />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Left Column: Question & Input */}
        <div className="flex-1 p-6 lg:p-10 flex flex-col max-w-4xl mx-auto w-full">
          {/* Question Box */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 shrink-0">
            <h2 className="text-2xl lg:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
          </div>

          {/* Answer Input */}
          <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden">
            {speechError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4 border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {speechError}
              </div>
            )}
            
            <div className="flex-1 overflow-y-scroll mb-20 text-lg text-slate-700 dark:text-slate-300 leading-relaxed space-y-2 pr-2">
              {!transcript && !interimTranscript && !isRecording && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic">
                  <MicOff className="w-16 h-16 mb-4 opacity-50" />
                  <p>Nhấn vào nút Micro bên dưới để bắt đầu trả lời bằng giọng nói...</p>
                </div>
              )}
              {transcript && <span>{transcript}</span>}
              {interimTranscript && <span className="text-sky-500 font-medium opacity-80"> {interimTranscript}</span>}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent dark:from-slate-800 dark:via-slate-800 flex items-center justify-between gap-4">
              <div className="flex-1 flex justify-center">
                <button
                  onClick={toggleRecording}
                  disabled={isSubmitting || isFinishing}
                  className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-xl ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white hover:scale-105'
                  } disabled:opacity-50 disabled:hover:scale-100`}
                  title={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                >
                  {isRecording ? (
                    <>
                      <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"></span>
                      <Mic className="w-8 h-8 relative z-10" />
                    </>
                  ) : (
                    <Mic className="w-8 h-8 relative z-10" />
                  )}
                </button>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Tự động nộp khi hết giờ
                </span>
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || isFinishing || (!transcript.trim() && !interimTranscript.trim())}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg"
                >
                  {isSubmitting || isFinishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {currentIndex === questions.length - 1 ? 'Hoàn Thành' : 'Câu Tiếp Theo'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right floating element: Camera */}
        <div className="absolute bottom-6 left-6 w-48 lg:w-64 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-700 z-20">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md">
            <div className={`w-2 h-2 rounded-full ${isWarningActive ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="text-white text-xs font-medium">Proctoring</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HRInterviewRoom;
