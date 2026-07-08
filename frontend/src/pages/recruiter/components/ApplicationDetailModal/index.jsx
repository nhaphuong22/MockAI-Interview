import * as Dialog from "@radix-ui/react-dialog";
import {
  X, User, Briefcase, FileText, Star, Loader2,
  ExternalLink, AlertTriangle, MessageSquare,
  Download, BarChart2, Mic
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import { jobApi } from "../../../../api/jobApi";
import { inviteAIInterviewApi, getHRInterviewTranscriptApi, getHRInterviewHighlightsApi } from "../../../../api/hrInterviewApi";
import { useUiStore } from "../../../../store/useUiStore";

import { CVAssessmentTab } from "./CVAssessmentTab";
import { InterviewTranscriptTab } from "./InterviewTranscriptTab";
import { DecisionPanel } from "./DecisionPanel";

// ─── Status label map ─────────────────────────────────────────────────────────
const STATUS_LABELS = {
  SUBMITTED:            "Đã nộp",
  AI_REVIEWED:          "AI Đã duyệt",
  HR_REVIEWING:         "HR Đang duyệt",
  SHORTLISTED:          "Vào vòng trong",
  AI_INTERVIEW_INVITED: "Đã mời PV AI",
  INTERVIEWED:          "Đã PV AI",
  INTERVIEW_SCHEDULED:  "Lịch phỏng vấn",
  HIRED:                "Đã tuyển",
  REJECTED:             "Từ chối",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function deriveAIRecommendation(aiFeedback) {
  if (!aiFeedback) return null;
  const { knockout_status, semantic_score } = aiFeedback;
  if (knockout_status === "REJECTED") return { label: "Không đạt vòng loại", tone: "red" };
  if ((semantic_score ?? 0) >= 70) return { label: "Nên Shortlist", tone: "green" };
  if ((semantic_score ?? 0) >= 50) return { label: "Cân nhắc thêm", tone: "yellow" };
  return { label: "Không phù hợp", tone: "red" };
}

function computeFinalScore(cvScore, interviewScore) {
  if (interviewScore == null || interviewScore === 0) return null;
  return Math.round((cvScore ?? 0) * 0.4 + interviewScore * 0.6);
}

function finalScoreLabel(score) {
  if (score == null) return null;
  if (score >= 70) return { text: "🟢 Nên tuyển", tone: "green" };
  if (score >= 50) return { text: "🟡 Cân nhắc", tone: "yellow" };
  return { text: "🔴 Không phù hợp", tone: "red" };
}

const TONE = {
  green:  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", score: "text-emerald-600", bar: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   score: "text-amber-600",   bar: "bg-amber-500" },
  red:    { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     score: "text-red-600",     bar: "bg-red-500" },
};

export function ApplicationDetailModal({ isOpen, onOpenChange, application }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  const [hrNotes, setHrNotes] = useState(application?.hr_notes || "");
  const [sendEmail, setSendEmail] = useState(false);
  const [emailContent, setEmailContent] = useState("");
  // "cv" = CV PDF + AI CV Assessment | "pv" = Q&A Transcript + Interview Summary
  const [viewMode, setViewMode] = useState("cv");

  useEffect(() => {
    const s = application?.status;
    if (s === "SHORTLISTED") {
      setEmailContent("Chúng tôi rất ấn tượng với hồ sơ của bạn và xin thông báo bạn đã vượt qua vòng sơ loại.\n\nPhòng nhân sự sẽ sớm liên hệ với bạn để trao đổi về lịch phỏng vấn vòng tiếp theo.\n\nVui lòng kiểm tra email thường xuyên.");
      setSendEmail(true);
    } else if (s === "REJECTED") {
      setEmailContent("Cảm ơn bạn đã quan tâm ứng tuyển. Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với định hướng của công ty ở thời điểm hiện tại.\n\nChúng tôi sẽ lưu trữ hồ sơ của bạn và liên hệ lại khi có cơ hội phù hợp trong tương lai.\n\nChúc bạn thành công trên con đường sự nghiệp!");
      setSendEmail(true);
    } else if (s === "HIRED") {
      setEmailContent("Chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và chính thức trở thành một phần của công ty chúng tôi!\n\nPhòng nhân sự sẽ gửi Thư Mời Nhận Việc (Offer Letter) với thông tin chi tiết qua email này trong thời gian sớm nhất.\n\nRất mong được chào đón bạn!");
      setSendEmail(true);
    } else {
      setSendEmail(false);
      setEmailContent("");
    }
  }, [application?.status]);

  const { data: transcriptData, isLoading: isLoadingTranscript } = useQuery({
    queryKey: ["hr-interview-transcript", application?.interview_id],
    queryFn: async () => {
      if (!application?.interview_id) return null;
      const res = await getHRInterviewTranscriptApi(application.interview_id);
      return res.data;
    },
  });

  const { data: highlightsData, isLoading: isLoadingHighlights } = useQuery({
    queryKey: ["hr-interview-highlights", application?.interview_id],
    queryFn: async () => {
      if (!application?.interview_id) return null;
      try {
        const res = await getHRInterviewHighlightsApi(application.interview_id);
        return res.data;
      } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!application?.interview_id && viewMode === "pv",
  });

  const handleTimestampClick = (timestamp) => {
    if (!transcriptData?.transcript) return;
    const questionIndex = Math.min(transcriptData.transcript.length, Math.floor(timestamp / 30) + 1);
    const element = document.getElementById(`qa-question-${questionIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-sky-100", "ring-2", "ring-[#0ea5e9]", "shadow-md", "animate-pulse");
      setTimeout(() => {
        element.classList.remove("bg-sky-100", "ring-2", "ring-[#0ea5e9]", "shadow-md", "animate-pulse");
      }, 2000);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data) => jobApi.updateJobApplication(application.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-applications"] });
      queryClient.invalidateQueries({ queryKey: ["all-hr-applications"] });
      queryClient.invalidateQueries({ queryKey: ["shortlist-all"] });
      showToast({ message: "Cập nhật hồ sơ thành công!", type: "success" });
    },
    onError: () => {
      showToast({ message: "Không thể cập nhật hồ sơ.", type: "error" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteAIInterviewApi(application.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manage-applications"] });
      queryClient.invalidateQueries({ queryKey: ["all-hr-applications"] });
      showToast({ message: "Đã gửi lời mời phỏng vấn AI đến ứng viên!", type: "success" });
    },
    onError: () => {
      showToast({ message: "Không thể gửi lời mời phỏng vấn.", type: "error" });
    },
  });

  const handleSaveNotes = () => {
    updateMutation.mutate({
      status: application.status,
      hr_notes: hrNotes,
      send_email: sendEmail,
      email_content: emailContent,
    });
  };

  const handleAction = (newStatus) => {
    updateMutation.mutate(
      { status: newStatus, hr_notes: hrNotes },
      {
        onSuccess: () => {
          if (newStatus === "REJECTED" || newStatus === "HIRED") onOpenChange(false);
        },
      }
    );
  };

  if (!application) return null;

  // ── Derive display data ───────────────────────────────────────────────────
  let displayData = {
    name: application.candidate_name || "",
    email: application.candidate_email || "",
    phone: application.candidate_phone || "",
    address: null,
  };
  if (application.cv_text) {
    const lines = application.cv_text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length > 0) {
      displayData.name = lines[0];
      const emailMatch = application.cv_text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
      if (emailMatch && !emailMatch[0].endsWith('.')) {
        displayData.email = emailMatch[0];
      }
      
      const phoneMatch = application.cv_text.match(/(?:\+84|0)[\s.-]*[35789](?:[\s.-]*\d){8}\b/);
      if (phoneMatch) displayData.phone = phoneMatch[0].replace(/[\s.-]/g, '');
      const addressMatch = application.cv_text.match(/(?:Địa chỉ|Address|Location):\s*([^\n]+)/i);
      if (addressMatch) displayData.address = addressMatch[1]?.trim();
    }
  }

  const currentStatusLabel = STATUS_LABELS[application.status || "SUBMITTED"] || "Chưa rõ";
  const aiRecommendation = deriveAIRecommendation(application.aiFeedback);

  const computedInterviewScore = application.interview_score ?? 
    (transcriptData?.transcript?.length > 0 
      ? Math.round(transcriptData.transcript.reduce((sum, qa) => sum + (qa.score || 0), 0) / transcriptData.transcript.length) 
      : null);

  const finalScore = computeFinalScore(application.cv_score, computedInterviewScore);
  const finalLabel = finalScoreLabel(finalScore);
  const hasInterview = !!application.interview_id;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-sky-950/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-[1536px] h-[95vh] bg-white rounded-2xl shadow-2xl z-50 p-0 animate-in zoom-in-95 duration-200 focus:outline-none flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] px-6 py-4 flex items-center justify-between shadow-md z-20 flex-shrink-0 gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner border-2 border-white/20 overflow-hidden flex-shrink-0">
                {application.candidate_avatar
                  ? <img src={application.candidate_avatar} alt="Avatar" className="w-full h-full object-cover" />
                  : <User className="w-6 h-6 text-sky-500" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <Dialog.Title className="text-xl font-black text-white drop-shadow-sm truncate">{displayData.name}</Dialog.Title>
                  <span className="px-3 py-1 text-xs font-bold bg-white/20 text-white rounded-full border border-white/30 flex items-center gap-1.5 uppercase tracking-wider shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {currentStatusLabel}
                  </span>
                </div>
                <Dialog.Description className="text-sm text-sky-100 font-medium flex items-center gap-2 mt-0.5">
                  <Briefcase className="w-4 h-4 opacity-80 flex-shrink-0" />
                  Ứng tuyển: <span className="font-bold text-white truncate">{application.job_title}</span>
                </Dialog.Description>
              </div>
            </div>

            {hasInterview && (
              <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-xl p-1 border border-white/20 flex-shrink-0">
                <button
                  onClick={() => setViewMode("cv")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === "cv"
                      ? "bg-white text-[#0ea5e9] shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  CV &amp; Đánh giá
                </button>
                <button
                  onClick={() => setViewMode("pv")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    viewMode === "pv"
                      ? "bg-white text-[#0ea5e9] shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  Kết quả PV AI
                  {computedInterviewScore != null && (
                    <span className={`ml-1 text-xs font-black px-2 py-0.5 rounded-full ${
                      viewMode === "pv" ? "bg-[#0ea5e9]/10 text-[#0ea5e9]" : "bg-white/25 text-white"
                    }`}>
                      {computedInterviewScore}/100
                    </span>
                  )}
                </button>
              </div>
            )}

            <Dialog.Close className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 flex-shrink-0">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* BODY: 3 COLUMNS */}
          <div className="flex flex-1 overflow-hidden bg-gray-50/50">

            {/* COL 1 (45%): CV PDF / Q&A Transcript */}
            <div className="w-[45%] border-r border-gray-200 flex flex-col h-full relative overflow-hidden bg-gray-100">
              {viewMode === "cv" ? (
                <>
                  <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0ea5e9]" /> Hồ Sơ Gốc (CV)
                    </h3>
                    {application.cv_file_url && (
                      <div className="flex gap-2">
                        <a href={application.cv_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#0ea5e9] hover:bg-sky-50 rounded-lg transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Mở tab mới
                        </a>
                        <a href={application.cv_file_url} download className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0ea5e9] bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
                          <Download className="w-3.5 h-3.5" /> Tải CV
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full h-full p-2 lg:p-4 overflow-hidden">
                    {application.cv_file_url ? (
                      <iframe
                        src={`${application.cv_file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full rounded-lg shadow-sm border border-gray-200 bg-white"
                        title="CV Document"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-white rounded-lg shadow-sm border border-gray-200">
                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                        <span className="font-medium text-gray-500">Ứng viên không đính kèm CV gốc</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 shadow-sm">
                    <Mic className="w-4 h-4 text-[#0ea5e9]" />
                    <h3 className="text-sm font-bold text-gray-700">Chi tiết Q&amp;A Phỏng Vấn AI</h3>
                    {transcriptData?.transcript?.length > 0 && (
                      <span className="ml-auto text-xs font-bold text-gray-400">
                        {transcriptData.transcript.length} câu hỏi
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto bg-white">
                    {isLoadingTranscript ? (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9] mb-3" />
                        <span className="text-sm">Đang tải lịch sử phỏng vấn...</span>
                      </div>
                    ) : transcriptData?.transcript?.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {transcriptData.transcript.map((qa, i) => (
                          <div key={i} id={`qa-question-${qa.index || (i + 1)}`} className="p-5 hover:bg-gray-50/60 transition-colors rounded-xl">
                            <div className="flex items-start gap-3 mb-3">
                              <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                                qa.score >= 70 ? "bg-emerald-100 text-emerald-700"
                                : qa.score >= 50 ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                              }`}>{i + 1}</span>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800 leading-snug">{qa.question}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className={`text-xs font-bold ${
                                    qa.score >= 70 ? "text-emerald-600"
                                    : qa.score >= 50 ? "text-amber-600"
                                    : "text-red-600"
                                  }`}>Điểm: {qa.score}/100</span>
                                  {qa.gazeViolations > 0 && (
                                    <span className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Vi phạm: {qa.gazeViolations}
                                    </span>
                                  )}
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        qa.score >= 70 ? "bg-emerald-500"
                                        : qa.score >= 50 ? "bg-amber-500"
                                        : "bg-red-500"
                                      }`}
                                      style={{ width: `${qa.score}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-10 space-y-2">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Trả lời của ứng viên</p>
                                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                                  {qa.candidateAnswer}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-[#0ea5e9] uppercase mb-1 flex items-center gap-1">
                                  <Star className="w-3 h-3" /> AI Nhận xét
                                </p>
                                <div className="text-sm text-gray-700 bg-sky-50/60 p-3 rounded-xl border border-sky-100 leading-relaxed">
                                  <MDEditor.Markdown
                                    source={qa.feedback}
                                    style={{ background: "transparent", color: "#334155", fontSize: "12px" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                        <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                        <span className="italic text-sm">Không tìm thấy dữ liệu trả lời chi tiết.</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* COL 2 (30%): AI CV Assessment / Interview Summary */}
            <div className="w-[30%] border-r border-gray-200 flex flex-col h-full bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  {viewMode === "cv" ? (
                    <>
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Đánh giá CV bởi AI
                    </>
                  ) : (
                    <>
                      <BarChart2 className="w-3.5 h-3.5 text-[#0ea5e9]" /> Tổng kết Phỏng Vấn AI
                    </>
                  )}
                </p>
              </div>

              {viewMode === "cv" ? (
                <CVAssessmentTab 
                  application={application} 
                  aiRecommendation={aiRecommendation} 
                  TONE={TONE} 
                />
              ) : (
                <InterviewTranscriptTab 
                  application={application} 
                  transcriptData={transcriptData} 
                  isLoadingTranscript={isLoadingTranscript} 
                  highlightsData={highlightsData} 
                  isLoadingHighlights={isLoadingHighlights} 
                  computedInterviewScore={computedInterviewScore} 
                  finalLabel={finalLabel} 
                  TONE={TONE} 
                  handleTimestampClick={handleTimestampClick} 
                />
              )}
            </div>

            {/* COL 3 (25%): HR Decision Panel */}
            <DecisionPanel 
              application={application} 
              aiRecommendation={aiRecommendation} 
              updateMutation={updateMutation} 
              inviteMutation={inviteMutation} 
              hrNotes={hrNotes} 
              setHrNotes={setHrNotes} 
              sendEmail={sendEmail} 
              setSendEmail={setSendEmail} 
              emailContent={emailContent} 
              setEmailContent={setEmailContent} 
              handleAction={handleAction} 
              handleSaveNotes={handleSaveNotes} 
              displayData={displayData} 
              computedInterviewScore={computedInterviewScore} 
              finalScore={finalScore} 
              finalLabel={finalLabel} 
              TONE={TONE} 
            />

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
