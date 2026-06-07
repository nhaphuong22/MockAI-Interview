import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Briefcase, Calendar, Mail, Phone, FileText, CheckCircle, Clock, Star, Edit, Save, Loader2, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../../../api/jobApi";
import { useUiStore } from "../../../store/useUiStore";

const STATUS_OPTIONS = [
  { value: "SUBMITTED", label: "Đã nộp", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "AI_REVIEWED", label: "AI Đã duyệt", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { value: "HR_REVIEWING", label: "HR Đang duyệt", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { value: "SHORTLISTED", label: "Vào vòng trong", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { value: "INTERVIEW_SCHEDULED", label: "Lịch phỏng vấn", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { value: "HIRED", label: "Đã tuyển", color: "text-green-700 bg-green-100 border-green-300" },
  { value: "REJECTED", label: "Từ chối", color: "text-red-600 bg-red-50 border-red-200" }
];

export function ApplicationDetailModal({ isOpen, onOpenChange, application }) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);

  const [status, setStatus] = useState("SUBMITTED");
  const [hrTag, setHrTag] = useState("");
  const [hrNotes, setHrNotes] = useState("");

  useEffect(() => {
    if (application) {
      setStatus(application.status || "SUBMITTED");
      setHrTag(application.hr_tag || "");
      setHrNotes(application.hr_notes || "");
    }
  }, [application]);

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

  const handleSave = () => {
    updateMutation.mutate({
      status,
      hr_tag: hrTag,
      hr_notes: hrNotes
    });
  };

  if (!application) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50 p-0 animate-in zoom-in-95 duration-200 focus:outline-none">
          
          {/* Header */}
          <div className="bg-sky-50 border-b border-sky-100 px-6 py-5 flex items-start justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm border border-sky-100 overflow-hidden">
                {application.candidate_avatar ? (
                  <img src={application.candidate_avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-sky-400" />
                )}
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-gray-900">{application.candidate_name}</Dialog.Title>
                <Dialog.Description className="text-sm text-sky-700 font-medium flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4" /> Ứng tuyển: {application.job_title}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-white/50">
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
                    <Mail className="w-4 h-4 text-gray-400" /> {application.candidate_email}
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {application.candidate_phone || "Chưa cập nhật"}
                  </div>
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
                    <span className="text-sm font-bold text-gray-800">Match Score</span>
                    <span className="text-lg font-black text-emerald-500">{application.match_score || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: AI Summary & Thao tác HR */}
            <div className="md:col-span-2 space-y-6">
              
              {/* AI Summary */}
              <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-indigo-500" /> Nhận xét từ AI (Summary)
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed bg-white/60 p-4 rounded-lg border border-indigo-50 min-h-[100px]">
                  {application.ai_summary ? application.ai_summary : <span className="text-gray-400 italic">AI chưa có nhận xét cho ứng viên này.</span>}
                </div>
              </div>

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
                      className="w-full border-2 border-gray-100 rounded-lg p-2.5 text-sm focus:border-sky-500 focus:ring-0 outline-none"
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
                    rows={4}
                    className="w-full border-2 border-gray-100 rounded-lg p-3 text-sm focus:border-sky-500 focus:ring-0 outline-none resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-end pt-2">
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
