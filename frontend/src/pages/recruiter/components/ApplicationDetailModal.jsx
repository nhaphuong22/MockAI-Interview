import * as Dialog from "@radix-ui/react-dialog";
import {
  X, User, Briefcase, Calendar, Mail, Phone, FileText,
  CheckCircle2, Star, Edit, Save, Loader2, Globe,
  ExternalLink, MapPin, AlertTriangle, Award, MessageSquare,
  ChevronDown, Download, TrendingUp, Clock, BarChart2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import { inviteAIInterviewApi, getHRInterviewTranscriptApi } from "../../../api/hrInterviewApi";
import { useUiStore } from "../../../store/useUiStore";
import MDEditor from "@uiw/react-md-editor";
import * as Accordion from "@radix-ui/react-accordion";

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

const TAG_OPTIONS = ["Tiềm năng", "Senior", "Junior", "Fresher", "Đang cân nhắc", "Blacklist"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive which phase (1/2/3) from application status.
 * Phase 1 = CV screening, Phase 2 = PV invited/waiting, Phase 3 = PV result
 */
function derivePhase(status) {
  if (["INTERVIEWED", "HIRED", "REJECTED"].includes(status)) return 3;
  if (["SHORTLISTED", "AI_INTERVIEW_INVITED"].includes(status)) return 2;
  return 1;
}

/**
 * Derive AI recommendation badge from aiFeedback (no new backend field needed).
 * Uses knockout_status + semantic_score (= cv_score from AI).
 */
function deriveAIRecommendation(aiFeedback) {
  if (!aiFeedback) return null;
  const { knockout_status, semantic_score } = aiFeedback;
  if (knockout_status === "REJECTED") {
    return { label: "Không đạt vòng loại", tone: "red" };
  }
  if ((semantic_score ?? 0) >= 70) {
    return { label: "Nên Shortlist", tone: "green" };
  }
  if ((semantic_score ?? 0) >= 50) {
    return { label: "Cân nhắc thêm", tone: "yellow" };
  }
  return { label: "Không phù hợp", tone: "red" };
}

/**
 * Compute weighted final score: CV 40% + Interview 60%
 * Returns null if interview_score is not yet available.
 */
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

// Tone → Tailwind class map
const TONE = {
  green:  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", score: "text-emerald-600", bar: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   score: "text-amber-600",   bar: "bg-amber-500" },
  red:    { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     score: "text-red-600",     bar: "bg-red-500" },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ApplicationDetailModal({ isOpen, onOpenChange, application }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  const [hrTag, setHrTag] = useState(application?.hr_tag || "");
  const [hrNotes, setHrNotes] = useState(application?.hr_notes || "");
  const [sendEmail, setSendEmail] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  // Auto-fill email template when status changes
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

  // Fetch transcript when interview_id exists
  const { data: transcriptData, isLoading: isLoadingTranscript } = useQuery({
    queryKey: ["hr-interview-transcript", application?.interview_id],
    queryFn: async () => {
      if (!application?.interview_id) return null;
      const res = await getHRInterviewTranscriptApi(application.interview_id);
      return res.data;
    },
    enabled: !!application?.interview_id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => jobApi.updateJobApplication(application.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-applications"]);
      showToast({ message: "Cập nhật hồ sơ thành công!", type: "success" });
    },
    onError: () => {
      showToast({ message: "Không thể cập nhật hồ sơ.", type: "error" });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteAIInterviewApi(application.id),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-applications"]);
      showToast({ message: "Đã gửi lời mời phỏng vấn AI đến ứng viên!", type: "success" });
    },
    onError: () => {
      showToast({ message: "Không thể gửi lời mời phỏng vấn.", type: "error" });
    },
  });

  const handleSaveNotes = () => {
    updateMutation.mutate({
      status: application.status,
      hr_tag: hrTag,
      hr_notes: hrNotes,
      send_email: sendEmail,
      email_content: emailContent,
    });
  };

  const handleAction = (newStatus) => {
    updateMutation.mutate(
      { status: newStatus, hr_tag: hrTag, hr_notes: hrNotes },
      {
        onSuccess: () => {
          if (newStatus === "REJECTED" || newStatus === "HIRED") {
            onOpenChange(false);
          }
        },
      }
    );
  };

  if (!application) return null;

  // ── Derive display info ────────────────────────────────────────────────────
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
      const emailMatch = application.cv_text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) displayData.email = emailMatch[0];
      const phoneMatch = application.cv_text.match(/(?:\+84|0)(?:\s?\d){9,10}/);
      if (phoneMatch) displayData.phone = phoneMatch[0];
      const addressMatch = application.cv_text.match(/(?:Địa chỉ|Address|Location):\s*([^\n]+)/i);
      if (addressMatch) displayData.address = addressMatch[1]?.trim();
    }
  }

  const currentStatusLabel = STATUS_LABELS[application.status || "SUBMITTED"] || "Chưa rõ";
  const currentPhase = derivePhase(application.status);
  const aiRecommendation = deriveAIRecommendation(application.aiFeedback);
  const finalScore = computeFinalScore(application.cv_score, application.interview_score);
  const finalLabel = finalScoreLabel(finalScore);

  const PHASES = [
    { step: 1, label: "Sàng lọc CV" },
    { step: 2, label: "Mời PV AI" },
    { step: 3, label: "Kết quả PV" },
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-sky-950/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-[1536px] h-[95vh] bg-white rounded-2xl shadow-2xl z-50 p-0 animate-in zoom-in-95 duration-200 focus:outline-none flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] px-6 py-4 flex items-center justify-between shadow-md z-20 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner border-2 border-white/20 overflow-hidden">
                {application.candidate_avatar ? (
                  <img src={application.candidate_avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-sky-500" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <Dialog.Title className="text-xl font-black text-white drop-shadow-sm">{displayData.name}</Dialog.Title>
                  <span className="px-3 py-1 text-xs font-bold bg-white/20 text-white rounded-full border border-white/30 backdrop-blur-sm shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {currentStatusLabel}
                  </span>
                </div>
                <Dialog.Description className="text-sm text-sky-100 font-medium flex items-center gap-2 mt-0.5">
                  <Briefcase className="w-4 h-4 opacity-80" /> Ứng tuyển:{" "}
                  <span className="font-bold text-white">{application.job_title}</span>
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* ── Body: 3 Columns ── */}
          <div className="flex flex-1 overflow-hidden bg-gray-50/50">

            {/* COL 1: CV (45%) */}
            <div className="w-[45%] border-r border-gray-200 flex flex-col h-full bg-gray-100 relative overflow-hidden">
              <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0 shadow-sm z-10">
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
            </div>

            {/* COL 2: AI Intelligence Panel (30%) */}
            <div className="w-[30%] border-r border-gray-200 flex flex-col h-full bg-white relative overflow-hidden">

              {/* Phase Progress Stepper */}
              <div className="px-4 pt-3 pb-2 border-b border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-center">
                  {PHASES.map((item, idx) => (
                    <div key={item.step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          currentPhase > item.step
                            ? "bg-[#0ea5e9] text-white"
                            : currentPhase === item.step
                            ? "bg-[#0ea5e9] text-white ring-4 ring-sky-100"
                            : "bg-gray-100 text-gray-400"
                        }`}>
                          {currentPhase > item.step
                            ? <CheckCircle2 className="w-4 h-4" />
                            : item.step}
                        </div>
                        <span className={`text-[10px] font-bold mt-1 whitespace-nowrap ${
                          currentPhase === item.step ? "text-[#0ea5e9]" : "text-gray-400"
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      {idx < PHASES.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                          currentPhase > item.step ? "bg-[#0ea5e9]" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff]">
                <div className="p-5 space-y-4">

                  {/* ── AI Verdict Banner (Phase 1 focus) ── */}
                  {application.aiFeedback && aiRecommendation && (
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${TONE[aiRecommendation.tone].bg} ${TONE[aiRecommendation.tone].border}`}>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">🤖 AI Đề Xuất</p>
                        <p className={`text-base font-black mt-0.5 ${TONE[aiRecommendation.tone].text}`}>
                          {aiRecommendation.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Điểm phù hợp</p>
                        <p className={`text-2xl font-black ${TONE[aiRecommendation.tone].score}`}>
                          {application.aiFeedback.semantic_score ?? application.cv_score ?? 0}
                          <span className="text-sm font-bold text-gray-400">/100</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Phase 2: Waiting State ── */}
                  {currentPhase === 2 && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-[#0ea5e9]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-sky-800">
                            {application.status === "AI_INTERVIEW_INVITED"
                              ? "✉️ Đã gửi lời mời phỏng vấn AI"
                              : "✅ Ứng viên đã vào vòng trong"}
                          </h4>
                          <p className="text-xs text-sky-600 mt-1 leading-relaxed">
                            {application.status === "AI_INTERVIEW_INVITED"
                              ? "Ứng viên chưa hoàn thành phỏng vấn. Hệ thống sẽ tự động cập nhật khi hoàn tất."
                              : "Bấm \"Mời Phỏng Vấn AI\" bên phải để gửi link phỏng vấn cho ứng viên."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Phase 3: Interview Result Bar Chart ── */}
                  {currentPhase === 3 && application.interview_score != null && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <h4 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[#0ea5e9]" /> Kết Quả Phỏng Vấn AI
                      </h4>
                      {/* Overall PV Score */}
                      <div className="flex items-center justify-between mb-3 px-3 py-2 bg-sky-50 rounded-lg">
                        <span className="text-sm font-bold text-gray-600">Điểm tổng phỏng vấn</span>
                        <span className={`text-2xl font-black ${
                          application.interview_score >= 70 ? "text-emerald-600"
                          : application.interview_score >= 50 ? "text-amber-600"
                          : "text-red-600"
                        }`}>
                          {application.interview_score}<span className="text-sm font-bold text-gray-400">/100</span>
                        </span>
                      </div>

                      {/* Per-question bar chart */}
                      {isLoadingTranscript ? (
                        <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Đang tải chi tiết...
                        </div>
                      ) : transcriptData?.transcript?.length > 0 ? (
                        <div className="space-y-2.5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase">Điểm từng câu hỏi</p>
                          {transcriptData.transcript.map((qa, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600 truncate max-w-[72%]">
                                  Câu {qa.index}: {qa.question?.slice(0, 38)}{qa.question?.length > 38 ? "…" : ""}
                                </span>
                                <span className={`font-bold flex-shrink-0 ${
                                  qa.score >= 70 ? "text-emerald-600"
                                  : qa.score >= 50 ? "text-amber-600"
                                  : "text-red-600"
                                }`}>{qa.score}/100</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${
                                    qa.score >= 70 ? "bg-emerald-500"
                                    : qa.score >= 50 ? "bg-amber-500"
                                    : "bg-red-500"
                                  }`}
                                  style={{ width: `${qa.score}%` }}
                                />
                              </div>
                              {qa.gazeViolations > 0 && (
                                <p className="text-[10px] text-red-500 font-semibold mt-0.5 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Vi phạm: {qa.gazeViolations} lần
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Accordion chi tiết Q&A */}
                      {transcriptData?.transcript?.length > 0 && (
                        <Accordion.Root type="single" collapsible className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
                          <Accordion.Item value="qa">
                            <Accordion.Header>
                              <Accordion.Trigger className="flex items-center justify-between w-full px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors group">
                                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-[#0ea5e9]" /> Xem chi tiết Q&A</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                              </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                              <div className="divide-y divide-gray-100">
                                {transcriptData.transcript.map((qa, i) => (
                                  <div key={i} className="p-4 bg-white space-y-3">
                                    <div className="flex items-start gap-2">
                                      <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                                        qa.score >= 70 ? "bg-emerald-100 text-emerald-700"
                                        : qa.score >= 50 ? "bg-amber-100 text-amber-700"
                                        : "bg-red-100 text-red-700"
                                      }`}>{i + 1}</span>
                                      <p className="text-sm font-bold text-gray-800 leading-snug">{qa.question}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Trả lời của ứng viên</p>
                                      <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                                        {qa.candidateAnswer}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-[#0ea5e9] uppercase mb-1 flex items-center gap-1">
                                        <Star className="w-3 h-3" /> AI Phân tích
                                      </p>
                                      <div className="text-xs text-gray-700 bg-sky-50/50 p-3 rounded-lg border border-sky-100 leading-relaxed">
                                        <MDEditor.Markdown
                                          source={qa.feedback}
                                          style={{ background: "transparent", color: "#334155", fontSize: "12px" }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                        </Accordion.Root>
                      )}
                    </div>
                  )}

                  {/* ── CV AI Report (always visible) ── */}
                  {application.aiFeedback ? (
                    <div className="space-y-4">
                      {/* Knockout Status */}
                      <div className={`p-4 rounded-xl border ${
                        application.aiFeedback.knockout_status === "REJECTED"
                          ? "bg-red-50 border-red-200"
                          : "bg-emerald-50 border-emerald-200"
                      }`}>
                        <h4 className={`text-xs font-bold flex items-center gap-2 uppercase ${
                          application.aiFeedback.knockout_status === "REJECTED" ? "text-red-700" : "text-emerald-700"
                        }`}>
                          {application.aiFeedback.knockout_status === "REJECTED"
                            ? <AlertTriangle className="w-4 h-4" />
                            : <CheckCircle2 className="w-4 h-4" />}
                          Vòng Sơ Khảo (Knock-out Check)
                        </h4>
                        <p className="text-sm mt-2 font-medium text-gray-700">
                          {application.aiFeedback.knockout_reason || (
                            application.aiFeedback.knockout_status === "REJECTED"
                              ? "Không đạt yêu cầu bắt buộc."
                              : "Đạt các yêu cầu bắt buộc của công việc."
                          )}
                        </p>
                      </div>

                      {/* Interview Hint */}
                      {application.aiFeedback.interview_notes && (
                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-[#0ea5e9] flex items-center gap-2 mb-2 uppercase">
                            <MessageSquare className="w-3.5 h-3.5" /> Lưu ý Phỏng Vấn (AI Hint)
                          </h4>
                          <p className="text-sm text-sky-900 leading-relaxed">{application.aiFeedback.interview_notes}</p>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <h4 className="text-xs font-bold text-emerald-600 mb-2 uppercase">✅ Kỹ năng khớp</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {application.aiFeedback.matched_skills?.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-100">{s}</span>
                            ))}
                            {(!application.aiFeedback.matched_skills || application.aiFeedback.matched_skills.length === 0) && (
                              <span className="text-xs text-gray-400 italic">Không có</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">⚠️ Kỹ năng còn thiếu</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {application.aiFeedback.missing_skills?.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{s}</span>
                            ))}
                            {(!application.aiFeedback.missing_skills || application.aiFeedback.missing_skills.length === 0) && (
                              <span className="text-xs text-gray-400 italic">Không có</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Positive / Negative Notes */}
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-amber-700 flex items-center gap-2 mb-3 uppercase">
                            <Award className="w-4 h-4" /> Điểm Cộng
                          </h4>
                          {application.aiFeedback.positive_notes?.length > 0 ? (
                            <ul className="space-y-1.5">
                              {application.aiFeedback.positive_notes.map((sig, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-amber-500 mt-0.5">•</span> {sig}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Không có điểm cộng nổi bật</span>
                          )}
                        </div>
                        <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-orange-700 flex items-center gap-2 mb-3 uppercase">
                            <AlertTriangle className="w-4 h-4" /> Điểm Trừ
                          </h4>
                          {application.aiFeedback.negative_notes?.length > 0 ? (
                            <ul className="space-y-1.5">
                              {application.aiFeedback.negative_notes.map((flag, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-orange-500 mt-0.5">•</span> {flag}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Không phát hiện điểm trừ</span>
                          )}
                        </div>
                      </div>

                      {/* Evaluation Summary */}
                      <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-sm">
                        <h4 className="text-xs font-bold text-[#0ea5e9] mb-3 uppercase flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Nhận xét tổng quan
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{application.aiFeedback.evaluation_summary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <Star className="w-12 h-12 mb-3 opacity-20" />
                      <span className="italic text-sm">AI chưa có nhận xét cho ứng viên này.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COL 3: HR Decision Panel (25%) */}
            <div className="w-[25%] flex flex-col h-full bg-white overflow-y-auto">
              <div className="p-4 space-y-4">

                {/* ── ⚡ QUYẾT ĐỊNH NHANH (Decision First) ── */}
                <div className="bg-gradient-to-br from-slate-50 to-sky-50/60 rounded-xl p-4 border border-sky-100">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#0ea5e9]" /> Quyết Định Nhanh
                  </h3>

                  {/* AI recommendation badge */}
                  {aiRecommendation && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3 ${
                      TONE[aiRecommendation.tone].bg
                    } ${TONE[aiRecommendation.tone].text} border ${TONE[aiRecommendation.tone].border}`}>
                      🤖 AI đề xuất: {aiRecommendation.label}
                    </div>
                  )}

                  {/* Pass/Reject */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleAction("SHORTLISTED")}
                      disabled={updateMutation.isPending || ["SHORTLISTED", "HIRED", "REJECTED"].includes(application.status)}
                      className="flex justify-center items-center gap-1.5 flex-1 bg-emerald-500 text-white px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-40"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Vòng Trong
                    </button>
                    <button
                      onClick={() => handleAction("REJECTED")}
                      disabled={updateMutation.isPending || application.status === "REJECTED"}
                      className="flex justify-center items-center gap-1.5 flex-1 bg-rose-500 text-white px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 hover:shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98] disabled:opacity-40"
                    >
                      <X className="w-4 h-4" /> Từ Chối
                    </button>
                  </div>

                  {/* Invite AI Interview (Phase 2+) */}
                  {["SHORTLISTED", "HR_REVIEWING", "AI_INTERVIEW_INVITED", "INTERVIEWED"].includes(application.status) && (
                    <button
                      onClick={() => inviteMutation.mutate()}
                      disabled={inviteMutation.isPending || ["AI_INTERVIEW_INVITED", "INTERVIEWED"].includes(application.status)}
                      className="flex justify-center items-center gap-2 w-full bg-[#0ea5e9] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0284c7] hover:shadow-lg shadow-sky-500/30 transition-all active:scale-[0.98] disabled:opacity-40 mb-2"
                    >
                      {inviteMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <MessageSquare className="w-4 h-4" />}
                      {application.status === "AI_INTERVIEW_INVITED"
                        ? "Đã Gửi Mời PV AI"
                        : application.status === "INTERVIEWED"
                        ? "Đã Hoàn Thành PV"
                        : "🎙 Mời Phỏng Vấn AI"}
                    </button>
                  )}

                  {/* Hire (Phase 3 only) */}
                  <button
                    onClick={() => handleAction("HIRED")}
                    disabled={updateMutation.isPending || application.status === "HIRED" || application.status === "REJECTED" || !application.interview_id}
                    className="flex justify-center items-center gap-2 w-full bg-white border-2 border-green-500 text-green-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-green-50 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-40"
                    title={!application.interview_id ? "Cần hoàn thành phỏng vấn AI trước" : ""}
                  >
                    <Award className="w-4 h-4" /> Đánh Dấu Trúng Tuyển
                  </button>
                </div>

                {/* ── Thông tin liên hệ ── */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-500" /> Thông tin liên hệ
                    </h3>
                    <span className="text-xs font-medium text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {new Date(application.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate text-xs">{displayData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs">{displayData.phone || "Chưa cập nhật"}</span>
                    </div>
                    {displayData.address && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs line-clamp-2">{displayData.address}</span>
                      </div>
                    )}
                    {application.portfolio_url && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a
                          href={application.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0ea5e9] hover:text-[#0284c7] hover:underline inline-flex items-center gap-1 font-bold truncate text-xs"
                        >
                          Portfolio <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Điểm số tổng hợp ── */}
                <div className="space-y-3 pt-1">
                  <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" /> Điểm số
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    {/* CV Score */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-600">CV Match (40%)</span>
                        <span className="text-[#0ea5e9]">{application.cv_score || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0ea5e9] h-2 rounded-full" style={{ width: `${application.cv_score || 0}%` }} />
                      </div>
                    </div>
                    {/* Interview Score */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-gray-600">Phỏng vấn AI (60%)</span>
                        <span className="text-sky-600">{application.interview_score || 0}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-sky-400 h-2 rounded-full" style={{ width: `${application.interview_score || 0}%` }} />
                      </div>
                    </div>
                    {/* Final Score */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800">Điểm Tổng Hợp</span>
                        {finalScore != null ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${TONE[finalLabel.tone].score}`}>
                              {finalScore}%
                            </span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TONE[finalLabel.tone].bg} ${TONE[finalLabel.tone].text}`}>
                              {finalLabel.text}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có PV</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Ghi chú & Tag ── */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Edit className="w-4 h-4 text-[#0ea5e9]" /> Ghi chú & Phân loại
                  </h3>

                  {/* Tag chips */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Phân Loại (Tag)</label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setHrTag("")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          hrTag === ""
                            ? "bg-gray-800 text-white border-gray-800"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Bỏ Tag
                      </button>
                      {TAG_OPTIONS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setHrTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            hrTag === tag
                              ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm shadow-sky-500/20"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes textarea */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Ghi chú nội bộ</label>
                    <textarea
                      value={hrNotes}
                      onChange={(e) => setHrNotes(e.target.value)}
                      placeholder="Ghi chú về ứng viên này..."
                      rows={3}
                      className="w-full border-2 border-gray-100 rounded-xl p-3 text-[13px] text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 outline-none resize-none transition-all bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> Lưu Ghi Chú & Tag
                    </button>
                  </div>
                </div>

                {/* ── Email template ── */}
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="w-4 h-4 text-[#0ea5e9] border-gray-300 rounded focus:ring-[#0ea5e9]"
                      />
                      <span className="text-xs font-bold text-sky-900">Gửi email thông báo cho ứng viên</span>
                    </label>
                  </div>
                  {sendEmail && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề (Mặc định)</label>
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 cursor-not-allowed">
                          [MockAI] Kết quả hồ sơ — {application.job_title}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung Email</label>
                        <textarea
                          value={emailContent}
                          onChange={(e) => setEmailContent(e.target.value)}
                          placeholder="Nhập lời nhắn gửi đến ứng viên..."
                          rows={4}
                          className="w-full border border-sky-200 rounded-lg p-3 text-xs focus:border-[#0ea5e9] focus:ring-0 outline-none resize-none bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
