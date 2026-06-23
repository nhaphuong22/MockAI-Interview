import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Briefcase, Calendar, Mail, Phone, FileText, CheckCircle2, Clock, Star, Edit, Save, Loader2, Tag, Globe, ExternalLink, MapPin, AlertTriangle, Award, MessageSquare, ChevronDown, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import { inviteAIInterviewApi, getHRInterviewTranscriptApi } from "../../../api/hrInterviewApi";
import { useUiStore } from "../../../store/useUiStore";
import MDEditor from '@uiw/react-md-editor';
import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";

// Chỉ dùng mảng này để map Label cho cái Badge hiển thị trên Header
const STATUS_LABELS = {
  "SUBMITTED": "Đã nộp",
  "AI_REVIEWED": "AI Đã duyệt",
  "HR_REVIEWING": "HR Đang duyệt",
  "SHORTLISTED": "Vào vòng trong",
  "AI_INTERVIEW_INVITED": "Đã mời PV AI",
  "INTERVIEWED": "Đã PV AI",
  "INTERVIEW_SCHEDULED": "Lịch phỏng vấn",
  "HIRED": "Đã tuyển",
  "REJECTED": "Từ chối"
};

const TAG_OPTIONS = ["Tiềm năng", "Senior", "Junior", "Fresher", "Đang cân nhắc", "Blacklist"];

export function ApplicationDetailModal({ isOpen, onOpenChange, application }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  const [hrTag, setHrTag] = useState(application?.hr_tag || "");
  const [hrNotes, setHrNotes] = useState(application?.hr_notes || "");
  
  // Email state
  const [sendEmail, setSendEmail] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  // Update email template when status changes
  useEffect(() => {
    const currentStatus = application?.status;
    if (currentStatus === "SHORTLISTED") {
      setEmailContent(`Chúng tôi rất ấn tượng với hồ sơ của bạn và xin thông báo bạn đã vượt qua vòng sơ loại.\n\nPhòng nhân sự sẽ sớm liên hệ với bạn để trao đổi về lịch phỏng vấn vòng tiếp theo.\n\nVui lòng kiểm tra email thường xuyên.`);
      setSendEmail(true);
    } else if (currentStatus === "REJECTED") {
      setEmailContent(`Cảm ơn bạn đã quan tâm ứng tuyển. Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với định hướng của công ty ở thời điểm hiện tại.\n\nChúng tôi sẽ lưu trữ hồ sơ của bạn và liên hệ lại khi có cơ hội phù hợp trong tương lai.\n\nChúc bạn thành công trên con đường sự nghiệp!`);
      setSendEmail(true);
    } else if (currentStatus === "INTERVIEW_SCHEDULED") {
      setEmailContent(`Chúng tôi xin trân trọng kính mời bạn tham gia buổi phỏng vấn trực tuyến.\n\nChi tiết về thời gian và link tham gia sẽ được cập nhật sớm trên hệ thống và gửi qua email cho bạn.\n\nVui lòng chuẩn bị kết nối mạng ổn định và trang phục lịch sự.`);
      setSendEmail(true);
    } else if (currentStatus === "HIRED") {
      setEmailContent(`Chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và chính thức trở thành một phần của công ty chúng tôi!\n\nPhòng nhân sự sẽ gửi Thư Mời Nhận Việc (Offer Letter) với thông tin chi tiết qua email này trong thời gian sớm nhất.\n\nRất mong được chào đón bạn!`);
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
    enabled: !!application?.interview_id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => jobApi.updateJobApplication(application.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-applications"]);
      showToast({ message: "Cập nhật hồ sơ thành công!", type: "success" });
    },
    onError: (error) => {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      showToast({ message: "Không thể cập nhật hồ sơ.", type: "error" });
    }
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteAIInterviewApi(application.id),
    onSuccess: () => {
      queryClient.invalidateQueries(["manage-applications"]);
      showToast({ message: "Đã gửi lời mời phỏng vấn AI đến ứng viên!", type: "success" });
    },
    onError: (error) => {
      console.error("Lỗi khi mời phỏng vấn:", error);
      showToast({ message: "Không thể gửi lời mời phỏng vấn.", type: "error" });
    }
  });

  const handleSaveNotes = () => {
    updateMutation.mutate({
      status: application.status, // Giữ nguyên status cũ
      hr_tag: hrTag,
      hr_notes: hrNotes,
      send_email: sendEmail,
      email_content: emailContent
    });
  };

  const handleAction = (newStatus) => {
    updateMutation.mutate({
      status: newStatus,
      hr_tag: hrTag,
      hr_notes: hrNotes
    }, {
      onSuccess: () => {
        if(newStatus === 'REJECTED' || newStatus === 'HIRED') {
          onOpenChange(false); // Đóng modal khi đã chốt hạ
        }
      }
    });
  };

  if (!application) return null;

  let displayData = {
    name: application.candidate_name || "",
    email: application.candidate_email || "",
    phone: application.candidate_phone || "",
    address: null
  };

  if (application.cv_text) {
    const lines = application.cv_text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-sky-950/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-[1536px] h-[95vh] bg-white rounded-2xl shadow-2xl z-50 p-0 animate-in zoom-in-95 duration-200 focus:outline-none flex flex-col overflow-hidden">
          
          {/* Header */}
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
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    {currentStatusLabel}
                  </span>
                </div>
                <Dialog.Description className="text-sm text-sky-100 font-medium flex items-center gap-2 mt-0.5">
                  <Briefcase className="w-4 h-4 opacity-80" /> Ứng tuyển: <span className="font-bold text-white">{application.job_title}</span>
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Main Body Split Pane (3 Columns) */}
          <div className="flex flex-1 overflow-hidden bg-gray-50/50">
            
            {/* COL 1: CV (Left) - 45% */}
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

            {/* COL 2: AI Report & Q&A (Middle) - 30% */}
            <div className="w-[30%] border-r border-gray-200 flex flex-col h-full bg-white relative">
              <Tabs.Root defaultValue="summary" className="flex flex-col h-full overflow-hidden">
                <Tabs.List className="flex px-4 pt-2 border-b border-gray-200 bg-gray-50/80 gap-2 flex-shrink-0">
                  <Tabs.Trigger 
                    value="summary" 
                    className="px-5 py-3 text-sm font-bold text-gray-500 data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-all flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" /> Báo Cáo AI
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="transcript" 
                    disabled={!application.interview_id}
                    className="px-5 py-3 text-sm font-bold text-gray-500 data-[state=active]:text-fuchsia-600 data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Chi Tiết Q&A
                  </Tabs.Trigger>
                </Tabs.List>

                {/* Tab Báo Cáo AI */}
                <Tabs.Content value="summary" className="flex-1 p-0 outline-none overflow-y-auto">
                  <div className="bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] min-h-full p-5">
                    {application.aiFeedback ? (
                      <div className="space-y-6">
                        
                        {/* Knock-out Status */}
                        <div className={`p-4 rounded-xl border ${application.aiFeedback.knockout_status === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                          <h4 className={`text-sm font-bold flex items-center gap-2 ${application.aiFeedback.knockout_status === 'REJECTED' ? 'text-red-700' : 'text-emerald-700'}`}>
                            {application.aiFeedback.knockout_status === 'REJECTED' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            Vòng Sơ Khảo (Knock-out Check)
                          </h4>
                          <p className="text-sm mt-2 font-medium text-gray-700">
                            {application.aiFeedback.knockout_reason || (application.aiFeedback.knockout_status === 'REJECTED' ? 'Không đạt yêu cầu bắt buộc.' : 'Đạt các yêu cầu bắt buộc của công việc.')}
                          </p>
                        </div>

                        {/* Positive & Negative Notes */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-3 uppercase">
                              <Award className="w-4 h-4" /> Điểm Cộng (Positive Notes)
                            </h4>
                            {application.aiFeedback.positive_notes?.length > 0 ? (
                              <ul className="space-y-2">
                                {application.aiFeedback.positive_notes.map((sig, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">•</span> {sig}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Không có điểm cộng nổi bật</span>
                            )}
                          </div>
                          
                          <div className="bg-orange-50/50 border border-orange-200 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-orange-700 flex items-center gap-2 mb-3 uppercase">
                              <AlertTriangle className="w-4 h-4" /> Điểm Trừ (Negative Notes)
                            </h4>
                            {application.aiFeedback.negative_notes?.length > 0 ? (
                              <ul className="space-y-2">
                                {application.aiFeedback.negative_notes.map((flag, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                    <span className="text-orange-500 mt-0.5">•</span> {flag}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Không phát hiện điểm trừ</span>
                            )}
                          </div>
                        </div>

                        {/* Interview Notes */}
                        {application.aiFeedback.interview_notes && (
                          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-sky-700 flex items-center gap-2 mb-2 uppercase">
                              <MessageSquare className="w-4 h-4" /> Lưu ý Phỏng Vấn (HR Notes)
                            </h4>
                            <p className="text-sm text-sky-900 leading-relaxed">
                              {application.aiFeedback.interview_notes}
                            </p>
                          </div>
                        )}

                        {/* Skills Matching */}
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-emerald-600 mb-2">Kỹ năng đáp ứng</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.aiFeedback.matched_skills?.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold">{s}</span>
                              ))}
                              {(!application.aiFeedback.matched_skills || application.aiFeedback.matched_skills.length === 0) && (
                                <span className="text-xs text-gray-400 italic">Không có</span>
                              )}
                            </div>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-500 mb-2">Kỹ năng còn thiếu</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.aiFeedback.missing_skills?.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{s}</span>
                              ))}
                              {(!application.aiFeedback.missing_skills || application.aiFeedback.missing_skills.length === 0) && (
                                <span className="text-xs text-gray-400 italic">Không có</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Evaluation Summary */}
                        <div className="bg-white border border-sky-100 rounded-xl p-5 shadow-sm">
                          <h4 className="text-sm font-bold text-sky-700 mb-3 uppercase flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Nhận xét tổng quan
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {application.aiFeedback.evaluation_summary}
                          </p>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                        <Star className="w-12 h-12 mb-3 opacity-20" />
                        <span className="italic">AI chưa có nhận xét cho ứng viên này.</span>
                      </div>
                    )}
                  </div>
                </Tabs.Content>

                {/* Tab Transcript */}
                <Tabs.Content value="transcript" className="flex-1 p-0 outline-none overflow-y-auto bg-gray-50/30">
                  {isLoadingTranscript ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-fuchsia-500">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm font-medium">Đang tải lịch sử phỏng vấn...</span>
                    </div>
                  ) : transcriptData?.transcript?.length > 0 ? (
                    <Accordion.Root type="single" collapsible className="w-full">
                      {transcriptData.transcript.map((qa, i) => (
                        <Accordion.Item key={i} value={`item-${i}`} className="border-b border-gray-100 last:border-0 bg-white">
                          <Accordion.Header>
                            <Accordion.Trigger className="flex items-start justify-between w-full p-5 text-left hover:bg-gray-50/50 transition-colors group">
                              <div className="flex items-start gap-4 flex-1 pr-4">
                                <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${qa.score >= 80 ? 'bg-emerald-100 text-emerald-700' : qa.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {i + 1}
                                </span>
                                <div>
                                  <div className="text-sm font-bold text-gray-800 line-clamp-2">{qa.question}</div>
                                  <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
                                    <span className={qa.score >= 80 ? 'text-emerald-600' : qa.score >= 50 ? 'text-amber-600' : 'text-red-600'}>
                                      Điểm: {qa.score}/100
                                    </span>
                                    {qa.gazeViolations > 0 && (
                                      <span className="text-red-500 flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5" /> Vi phạm: {qa.gazeViolations} lần
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform mt-1" />
                            </Accordion.Trigger>
                          </Accordion.Header>
                          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                            <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-5">
                              <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5" /> Trả lời của ứng viên
                                </h4>
                                <div className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-200">
                                  {qa.candidateAnswer}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-indigo-500 uppercase mb-2 flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5" /> AI Phân tích & Nhận xét
                                </h4>
                                <div className="text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                  <MDEditor.Markdown 
                                    source={qa.feedback} 
                                    style={{ background: 'transparent', color: '#334155', fontSize: '13px' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Accordion.Content>
                        </Accordion.Item>
                      ))}
                    </Accordion.Root>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                      <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                      <span className="italic">Không tìm thấy dữ liệu trả lời chi tiết.</span>
                    </div>
                  )}
                </Tabs.Content>
              </Tabs.Root>
            </div>

            {/* COL 3: HR Panel (Right) - 25% */}
            <div className="w-[25%] flex flex-col h-full bg-white overflow-y-auto p-5 space-y-5">
              
              {/* Thông Tin & Liên Hệ */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-500" /> Thông tin liên hệ
                  </h3>
                  <span className="text-xs font-medium text-gray-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {new Date(application.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{displayData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" /> {displayData.phone || "Chưa cập nhật"}
                  </div>
                  {displayData.address && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" /> <span className="line-clamp-2">{displayData.address}</span>
                    </div>
                  )}
                  {application.portfolio_url && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={application.portfolio_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[#0ea5e9] hover:text-[#0284c7] hover:underline inline-flex items-center gap-1 font-bold truncate"
                      >
                        Portfolio <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Điểm số */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Đánh giá năng lực
                </h3>
                
                <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-600">Điểm CV (Độ phù hợp)</span>
                      <span className="text-sky-600">{application.cv_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${application.cv_score || 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-600">Điểm Phỏng Vấn AI</span>
                      <span className="text-indigo-600">{application.interview_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${application.interview_score || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">Điểm Tổng (Total)</span>
                    <span className="text-lg font-black text-emerald-500">{application.total_score || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Thao tác HR */}
              <div className="border-t border-gray-100 pt-5 space-y-5 flex-1 flex flex-col">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#0ea5e9]" /> Ghi chú & Phân loại
                </h3>

                {/* Tag Chips */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2.5 uppercase">Phân Loại (Tag)</label>
                  <div className="flex flex-wrap gap-2">
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
                    {TAG_OPTIONS.map(tag => (
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

                {/* Notes Textarea */}
                <div className="flex flex-col">
                  <label className="block text-xs font-bold text-gray-500 mb-2.5 uppercase">Ghi chú nội bộ</label>
                  <textarea 
                    value={hrNotes} 
                    onChange={(e) => setHrNotes(e.target.value)}
                    placeholder="Ghi chú về ứng viên này..."
                    rows={3}
                    className="w-full border-2 border-gray-100 rounded-xl p-3 text-[13px] text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 outline-none resize-none transition-all bg-gray-50 focus:bg-white"
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                   <button 
                      onClick={handleSaveNotes}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg transition-colors"
                   >
                     <Save className="w-4 h-4" /> Lưu Ghi Chú & Tag
                   </button>
                </div>

                {/* EMAIL TEMPLATE */}
                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 mt-2">
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
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 cursor-not-allowed">
                          [MockAI] Kết quả hồ sơ - {application.job_title}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung Email</label>
                        <textarea 
                          value={emailContent} 
                          onChange={(e) => setEmailContent(e.target.value)}
                          placeholder="Nhập lời nhắn gửi đến ứng viên..."
                          rows={4}
                          className="w-full border border-sky-200 rounded-lg p-3 text-sm focus:border-[#0ea5e9] focus:ring-0 outline-none resize-none bg-white"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons / Decisions */}
                <div className="pt-5 flex-1 flex flex-col justify-end space-y-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase text-center">Đưa Ra Quyết Định</label>
                  
                  {/* Quyết định cấp 1 */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleAction('SHORTLISTED')}
                        disabled={updateMutation.isPending || application.status === 'SHORTLISTED' || application.status === 'HIRED' || application.status === 'REJECTED'}
                        className="flex justify-center items-center gap-2 flex-1 bg-emerald-500 text-white px-3 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Vòng Trong
                      </button>
                      
                      <button 
                        onClick={() => handleAction('REJECTED')}
                        disabled={updateMutation.isPending || application.status === 'REJECTED'}
                        className="flex justify-center items-center gap-2 flex-1 bg-rose-500 text-white px-3 py-3 rounded-xl font-bold text-sm hover:bg-rose-600 hover:shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Từ Chối
                      </button>
                    </div>
                    
                    {/* Mời phỏng vấn AI chỉ hiện khi status phù hợp */}
                    {(application.status === 'SHORTLISTED' || application.status === 'HR_REVIEWING' || application.status === 'AI_INTERVIEW_INVITED' || application.status === 'INTERVIEWED') && (
                      <button 
                        onClick={() => inviteMutation.mutate()}
                        disabled={inviteMutation.isPending || application.status === 'AI_INTERVIEW_INVITED' || application.status === 'INTERVIEWED'}
                        className="flex justify-center items-center gap-2 w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 hover:shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                        {application.status === 'AI_INTERVIEW_INVITED' ? "Đã Gửi Mời Phỏng Vấn AI" : application.status === 'INTERVIEWED' ? "Đã Hoàn Thành PV" : "Mời Phỏng Vấn AI"}
                      </button>
                    )}

                    {/* Quyết định cấp cuối: Hired */}
                    <button 
                      onClick={() => handleAction('HIRED')}
                      disabled={updateMutation.isPending || application.status === 'HIRED' || application.status === 'REJECTED'}
                      className="flex justify-center items-center gap-2 w-full bg-white border-2 border-green-500 text-green-600 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-green-50 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <Award className="w-4 h-4" /> Đánh Dấu Trúng Tuyển
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
