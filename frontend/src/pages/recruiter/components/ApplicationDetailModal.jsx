import * as Dialog from "@radix-ui/react-dialog";

import { X, User, Briefcase, Calendar, Mail, Phone, FileText, CheckCircle, Clock, Star, Edit, Save, Loader2, Tag, Globe, ExternalLink, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import { inviteAIInterviewApi, getHRInterviewTranscriptApi } from "../../../api/hrInterviewApi";
import { useUiStore } from "../../../store/useUiStore";
import MDEditor from '@uiw/react-md-editor';
import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import { MessageSquare, ChevronDown, CheckCircle2, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Đã nộp", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "AI_REVIEWED", label: "AI Đã duyệt", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { value: "HR_REVIEWING", label: "HR Đang duyệt", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "SHORTLISTED", label: "Vào vòng trong", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "AI_INTERVIEW_INVITED", label: "Đã mời PV AI", color: "text-orange-600 bg-orange-50 border-orange-200" },
  { value: "INTERVIEWED", label: "Đã PV AI", color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { value: "INTERVIEW_SCHEDULED", label: "Lịch phỏng vấn", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "HIRED", label: "Đã tuyển", color: "text-green-700 bg-green-100 border-green-300" },
  { value: "REJECTED", label: "Từ chối", color: "text-red-600 bg-red-50 border-red-200" }
];

export function ApplicationDetailModal({ isOpen, onOpenChange, application }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  const [status, setStatus] = useState(application?.status || "SUBMITTED");
  const [hrTag, setHrTag] = useState(application?.hr_tag || "");
  const [hrNotes, setHrNotes] = useState(application?.hr_notes || "");
  
  // Email state
  const [sendEmail, setSendEmail] = useState(false);
  const [emailContent, setEmailContent] = useState("");

  // Update email template when status changes
  useEffect(() => {
    if (status === "SHORTLISTED") {
      setEmailContent(`Chúng tôi rất ấn tượng với hồ sơ của bạn và xin thông báo bạn đã vượt qua vòng sơ loại.\n\nPhòng nhân sự sẽ sớm liên hệ với bạn để trao đổi về lịch phỏng vấn vòng tiếp theo.\n\nVui lòng kiểm tra email thường xuyên.`);
      setSendEmail(true);
    } else if (status === "REJECTED") {
      setEmailContent(`Cảm ơn bạn đã quan tâm ứng tuyển. Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với định hướng của công ty ở thời điểm hiện tại.\n\nChúng tôi sẽ lưu trữ hồ sơ của bạn và liên hệ lại khi có cơ hội phù hợp trong tương lai.\n\nChúc bạn thành công trên con đường sự nghiệp!`);
      setSendEmail(true);
    } else if (status === "INTERVIEW_SCHEDULED") {
      setEmailContent(`Chúng tôi xin trân trọng kính mời bạn tham gia buổi phỏng vấn trực tuyến.\n\nChi tiết về thời gian và link tham gia sẽ được cập nhật sớm trên hệ thống và gửi qua email cho bạn.\n\nVui lòng chuẩn bị kết nối mạng ổn định và trang phục lịch sự.`);
      setSendEmail(true);
    } else if (status === "HIRED") {
      setEmailContent(`Chúc mừng bạn đã xuất sắc vượt qua các vòng phỏng vấn và chính thức trở thành một phần của công ty chúng tôi!\n\nPhòng nhân sự sẽ gửi Thư Mời Nhận Việc (Offer Letter) với thông tin chi tiết qua email này trong thời gian sớm nhất.\n\nRất mong được chào đón bạn!`);
      setSendEmail(true);
    } else {
      setSendEmail(false);
      setEmailContent("");
    }
  }, [status]);

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
      showToast({ message: "Cập nhật thông tin ứng viên thành công!", type: "success" });
      onOpenChange(false);
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
      setStatus("AI_INTERVIEW_INVITED");
      showToast({ message: "Đã gửi lời mời phỏng vấn AI đến ứng viên!", type: "success" });
    },
    onError: (error) => {
      console.error("Lỗi khi mời phỏng vấn:", error);
      showToast({ message: "Không thể gửi lời mời phỏng vấn.", type: "error" });
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      status,
      hr_tag: hrTag,
      hr_notes: hrNotes,
      send_email: sendEmail,
      email_content: emailContent
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
      displayData.name = lines[0]; // Usually the first line is the name
      
      const emailMatch = application.cv_text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
      if (emailMatch && !emailMatch[0].endsWith('.')) {
        displayData.email = emailMatch[0];
      }
      
      // SĐT VN hợp lệ: bắt đầu bằng +84 hoặc 0, theo sau là đầu số 3,5,7,8,9 và 8 chữ số (cho phép khoảng trắng/dấu chấm/gạch ngang)
      const phoneMatch = application.cv_text.match(/(?:\+84|0)[\s.-]*[35789](?:[\s.-]*\d){8}\b/);
      if (phoneMatch) displayData.phone = phoneMatch[0].replace(/[\s.-]/g, '');
      
      const addressMatch = application.cv_text.match(/(?:Địa chỉ|Address|Location):\s*([^\n]+)/i);
      if (addressMatch) displayData.address = addressMatch[1].trim();
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 p-0 animate-in zoom-in-95 duration-200 focus:outline-none flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] px-6 py-5 flex items-start justify-between sticky top-0 z-10 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-inner border-2 border-white/20 overflow-hidden">
                {application.candidate_avatar ? (
                  <img src={application.candidate_avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-sky-500" />
                )}
              </div>
              <div>
                <Dialog.Title className="text-xl font-black text-white drop-shadow-sm">{displayData.name}</Dialog.Title>
                <Dialog.Description className="text-sm text-sky-100 font-medium flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4 opacity-80" /> Ứng tuyển: <span className="font-bold text-white">{application.job_title}</span>
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cột trái: Thông tin cá nhân & Điểm số */}
            <div className="space-y-6 md:col-span-1">
              {/* Thông tin liên hệ */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-500" /> Liên hệ
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" /> {displayData.email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {displayData.phone || "Chưa cập nhật"}
                  </div>
                  {displayData.address && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" /> {displayData.address}
                    </div>
                  )}
                  {application.portfolio_url && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a 
                        href={application.portfolio_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        Portfolio <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" /> Nộp ngày: {new Date(application.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
                {application.cv_file_url && (
                  <a 
                    href={application.cv_file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold rounded-lg transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4" /> Xem CV Gốc
                  </a>
                )}
              </div>

              {/* Điểm số */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Đánh giá AI
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-600">Điểm CV (Độ phù hợp)</span>
                      <span className="text-sky-600">{application.cv_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${application.cv_score || 0}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-600">Điểm Phỏng Vấn AI</span>
                      <span className="text-indigo-600">{application.interview_score || 0}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${application.interview_score || 0}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-800">Total Score</span>
                    <span className="text-lg font-black text-emerald-500">{application.total_score || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: AI Summary & Thao tác HR */}
            <div className="md:col-span-2 space-y-6">
              
              {/* AI Evaluation Tabs */}
              <Tabs.Root defaultValue="transcript" className="flex flex-col h-full bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <Tabs.List className="flex border-b border-gray-100 bg-gray-50/50">
                  <Tabs.Trigger 
                    value="summary" 
                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 data-[state=active]:text-sky-600 data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <Star className="w-4 h-4" /> Báo Cáo Tổng Quan
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="transcript" 
                    className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 data-[state=active]:text-fuchsia-600 data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-500 data-[state=active]:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={!application.interview_id}
                  >
                    <MessageSquare className="w-4 h-4" /> Chi Tiết Trả Lời (Q&A)
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="summary" className="p-0 outline-none flex-1 flex flex-col min-h-[300px]">
                  <div className="bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff] flex-1">
                    <div className="p-5 flex-1 h-full">
                      {application.ai_summary ? (
                        <div data-color-mode="light" className="text-sm">
                          <MDEditor.Markdown 
                            source={application.ai_summary} 
                            style={{ background: 'transparent', color: '#334155', fontSize: '14px', lineHeight: '1.6' }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <Star className="w-10 h-10 mb-2 opacity-20" />
                          <span className="italic">AI chưa có nhận xét cho ứng viên này.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="transcript" className="p-0 outline-none flex-1 flex flex-col min-h-[300px] bg-gray-50/30">
                  {isLoadingTranscript ? (
                    <div className="flex flex-col items-center justify-center py-20 text-fuchsia-500">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm font-medium">Đang tải lịch sử phỏng vấn...</span>
                    </div>
                  ) : transcriptData?.transcript?.length > 0 ? (
                    <Accordion.Root type="single" collapsible className="w-full">
                      {transcriptData.transcript.map((qa, i) => (
                        <Accordion.Item key={i} value={`item-${i}`} className="border-b border-gray-100 last:border-0">
                          <Accordion.Header>
                            <Accordion.Trigger className="flex items-start justify-between w-full p-4 text-left hover:bg-gray-50/50 transition-colors group">
                              <div className="flex items-start gap-3 flex-1 pr-4">
                                <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${qa.score >= 80 ? 'bg-emerald-100 text-emerald-700' : qa.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                  {i + 1}
                                </span>
                                <div>
                                  <div className="text-sm font-bold text-gray-800 line-clamp-2">{qa.question}</div>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                                    <span className={qa.score >= 80 ? 'text-emerald-600' : qa.score >= 50 ? 'text-amber-600' : 'text-red-600'}>
                                      Điểm: {qa.score}/100
                                    </span>
                                    {qa.gazeViolations > 0 && (
                                      <span className="text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Vi phạm: {qa.gazeViolations} lần
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronDown className="w-5 h-5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform mt-0.5" />
                            </Accordion.Trigger>
                          </Accordion.Header>
                          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                              <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5" /> Trả lời của ứng viên
                                </h4>
                                <div className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-200">
                                  {qa.candidateAnswer}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-indigo-500 uppercase mb-1.5 flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5" /> AI Phân tích & Nhận xét
                                </h4>
                                <div className="text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
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
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                      <span className="italic">Không tìm thấy dữ liệu trả lời chi tiết.</span>
                    </div>
                  )}
                </Tabs.Content>
              </Tabs.Root>

              {/* HR Actions */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                  <Edit className="w-4 h-4 text-sky-500" /> Thao tác của HR
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Trạng thái hồ sơ</label>
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-lg p-2.5 text-sm focus:border-sky-500 focus:ring-0 outline-none font-semibold text-gray-800"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Phân loại (Tag)</label>
                    <select 
                      value={hrTag} 
                      onChange={(e) => setHrTag(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-lg p-2.5 text-sm focus:border-sky-500 focus:ring-0 outline-none"
                    >
                      <option value="">-- Chưa phân loại --</option>
                      <option value="Tiềm năng">Tiềm năng</option>
                      <option value="Senior">Senior</option>
                      <option value="Junior">Junior</option>
                      <option value="Fresher">Fresher</option>
                      <option value="Đang cân nhắc">Đang cân nhắc</option>
                      <option value="Blacklist">Blacklist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Ghi chú nội bộ</label>
                  <textarea 
                    value={hrNotes} 
                    onChange={(e) => setHrNotes(e.target.value)}
                    placeholder="Ghi chú về ứng viên này (chỉ HR xem được)..."
                    rows={2}
                    className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm focus:border-sky-500 focus:ring-0 outline-none resize-none"
                  ></textarea>
                </div>


                {/* EMAIL TEMPLATE */}
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
                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 cursor-not-allowed">
                          [MockAI Interview] Kết quả hồ sơ ứng tuyển - {application.job_title}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung Email</label>
                        <textarea 
                          value={emailContent} 
                          onChange={(e) => setEmailContent(e.target.value)}
                          placeholder="Nhập lời nhắn gửi đến ứng viên..."
                          rows={4}
                          className="w-full border border-sky-200 rounded-lg p-3 text-sm focus:border-sky-500 focus:ring-0 outline-none resize-none bg-white"
                        ></textarea>
                        <p className="text-[10px] text-sky-600 mt-1 italic">*Hệ thống tự động thêm tên ứng viên và lời chào vào đầu thư.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => inviteMutation.mutate()}
                    disabled={inviteMutation.isPending || status === 'AI_INTERVIEW_INVITED' || status === 'INTERVIEWED'}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 hover:shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
                  >
                    {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
                    Mời Phỏng Vấn AI
                  </button>

                  <button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 bg-[#0ea5e9] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0284c7] hover:shadow-lg shadow-sky-100 transition-all disabled:opacity-50"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu Đánh Giá
                  </button>
                </div>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
