import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Bot, Briefcase, Building2, ArrowLeft, AlertCircle } from "lucide-react";
import { MicrophoneSetup } from "../../components/ai/MicrophoneSetup";
import { InterviewSession } from "../../components/interview/InterviewSession";
import { InterviewFeedback } from "../../components/interview/InterviewFeedback";
import { createVoiceSessionApi } from "../../api/voiceSession";
import { initInterviewApi } from "../../api/interviewApi";
import { useUiStore } from "../../store/useUiStore";
import { jobApi } from "../../api/jobApi";
import axiosClient from "../../api/axiosClient";

/**
 * AiJobInterview Page
 * Real job interview flow triggered when candidate applies for a job.
 * Reuses existing InterviewSession + InterviewFeedback components.
 * mode flow: briefing -> setup -> practicing -> feedback
 */
export function AiJobInterview() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setHideNavbar } = useUiStore();

  // State passed from JobDetailView via navigate state
  const jobTitle = location.state?.jobTitle || "Vị trí đang tuyển";
  const jobCompany = location.state?.jobCompany || "Công ty";
  const applicationId = location.state?.applicationId;

  const [mode, setMode] = useState("briefing"); // briefing | setup | practicing | feedback
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch job detail to get requirements for context
  const { data: jobData } = useQuery({
    queryKey: ["job-detail-interview", jobId],
    queryFn: () => jobApi.getJobById(jobId),
    enabled: !!jobId,
  });

  const job = jobData?.data;

  // Hide navbar when in active interview
  useEffect(() => {
    if (mode === "setup" || mode === "practicing") {
      setHideNavbar(true);
    } else {
      setHideNavbar(false);
    }
    return () => setHideNavbar(false);
  }, [mode, setHideNavbar]);

  // Initialize interview session - generate questions based on job
  const handleStartInterview = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await initInterviewApi({
        customPosition: job?.title || jobTitle,
        customSkills: job?.requirements || "",
        experienceLevel: job?.experience_level || "MID",
        type: "REAL",
        jobId: Number(jobId),
        applicationId: applicationId,
      });

      const interviewData = response.data;
      setInterviewId(interviewData.id);

      if (interviewData.questions && interviewData.questions.length > 0) {
        setQuestions(interviewData.questions);
        setMode("setup");
      } else {
        throw new Error("Không nhận được câu hỏi từ AI.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Khởi tạo phỏng vấn thất bại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register voice session
  const handleProceedVoice = async () => {
    setIsSubmitting(true);
    try {
      const response = await createVoiceSessionApi(interviewId);
      const sessionId = response?.data?.id || response?.id;
      if (!sessionId) throw new Error("Không thể tạo phiên giọng nói.");
      setVoiceSessionId(sessionId);
      setMode("practicing");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Lỗi khởi tạo phiên giọng nói.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setMode("feedback");
    }
  };

  const handleFinish = (resultData) => {
    setAssessment(resultData);
    setMode("feedback");
  };

  const handleRetry = () => {
    navigate(`/jobs`);
  };

  // --- SETUP SCREEN ---
  if (mode === "setup") {
    return (
      <div className="dark:bg-[#0a0f1c] bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center">
        <MicrophoneSetup
          onProceed={handleProceedVoice}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // --- ACTIVE INTERVIEW ---
  if (mode === "practicing") {
    return (
      <InterviewSession
        key={currentQuestion}
        interviewType="voice"
        currentQuestion={currentQuestion}
        questions={questions}
        onNext={handleNextQuestion}
        onCancel={() => handleFinish(null)}
        voiceSessionId={voiceSessionId}
        aiVoice="vi-VN-female"
        onFinish={handleFinish}
      />
    );
  }

  // --- FEEDBACK SCREEN ---
  if (mode === "feedback") {
    return (
      <InterviewFeedback
        questions={questions}
        onRetry={handleRetry}
        assessment={assessment}
        voiceSessionId={voiceSessionId}
      />
    );
  }

  // --- BRIEFING SCREEN (default) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/20 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Header gradient */}
          <div className="bg-gradient-to-r from-violet-500 to-violet-700 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-10 -mt-10 blur-2xl" />
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">Phỏng Vấn AI</h1>
              <p className="text-violet-200 text-sm font-medium">Buổi phỏng vấn thực tế cho vị trí bạn đã ứng tuyển</p>
            </div>
          </div>

          {/* Job info */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-black text-xl shrink-0">
                {jobCompany?.[0]?.toUpperCase() || "C"}
              </div>
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-sky-500" />
                  {jobTitle}
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {jobCompany}
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="p-6 space-y-3">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quy trình phỏng vấn</p>
            {[
              { step: "01", title: "Kiểm tra microphone", desc: "Đảm bảo âm thanh hoạt động tốt", color: "text-sky-500" },
              { step: "02", title: "AI đặt câu hỏi", desc: `${questions.length || "5–8"} câu hỏi dựa trên JD vị trí`, color: "text-violet-500" },
              { step: "03", title: "Bạn trả lời bằng giọng nói", desc: "AI sẽ ghi âm và chuyển thành text", color: "text-emerald-500" },
              { step: "04", title: "AI chấm điểm & tạo báo cáo", desc: "Kết quả gửi về HR ngay sau khi xong", color: "text-amber-500" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className={`text-xs font-black ${item.color} w-8 shrink-0 mt-0.5`}>{item.step}</span>
                <div>
                  <div className="text-sm font-bold text-slate-700">{item.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Lỗi khởi tạo phỏng vấn</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="p-6 pt-0">
            <button
              onClick={handleStartInterview}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-violet-700 text-white font-black rounded-2xl text-lg hover:shadow-xl hover:shadow-violet-200 transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI đang chuẩn bị câu hỏi...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  Bắt đầu phỏng vấn ngay
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 font-medium">
              Kết quả sẽ được gửi tự động về HR sau khi hoàn thành
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiJobInterview;
