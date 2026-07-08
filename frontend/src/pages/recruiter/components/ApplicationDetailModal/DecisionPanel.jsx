import { TrendingUp, Award, X, Loader2, MessageSquare, User, Calendar, Mail, Phone, MapPin, Globe, ExternalLink, Star, Edit, Save } from "lucide-react";

export function DecisionPanel({
  application,
  aiRecommendation,
  updateMutation,
  inviteMutation,
  hrNotes,
  setHrNotes,
  sendEmail,
  setSendEmail,
  emailContent,
  setEmailContent,
  handleAction,
  handleSaveNotes,
  displayData,
  computedInterviewScore,
  finalScore,
  finalLabel,
  TONE
}) {
  if (!application) return null;

  return (
    <div className="w-[25%] flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-4 space-y-4">

        {/* ⚡ QUYẾT ĐỊNH NHANH */}
        <div className="bg-gradient-to-br from-slate-50 to-sky-50/60 rounded-xl p-4 border border-sky-100">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0ea5e9]" /> Quyết Định Nhanh
          </h3>

          {aiRecommendation && (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3 ${
              TONE[aiRecommendation.tone].bg
            } ${TONE[aiRecommendation.tone].text} border ${TONE[aiRecommendation.tone].border}`}>
              🤖 AI đề xuất: {aiRecommendation.label}
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleAction("HIRED")}
              disabled={updateMutation.isPending || application.status === "HIRED"}
              className="flex justify-center items-center gap-1.5 flex-1 bg-green-500 text-white px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 hover:shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              <Award className="w-4 h-4" /> Trúng Tuyển
            </button>

            <button
              onClick={() => handleAction("REJECTED")}
              disabled={updateMutation.isPending || (application.status === "REJECTED" && (application.reviewed_by || application.reviewedBy))}
              className="flex justify-center items-center gap-1.5 flex-1 bg-rose-500 text-white px-3 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 hover:shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98] disabled:opacity-40"
            >
              <X className="w-4 h-4" /> Từ Chối
            </button>
          </div>

          {/* Tùy chọn Premium chỉ hiện trong giai đoạn duyệt CV hoặc đang chờ ứng viên PV, hoặc khi đơn bị AI reject nhưng HR chưa phê duyệt chính thức */}
          {((!["REJECTED", "HIRED", "INTERVIEWED"].includes(application.status)) || 
           (application.status === "REJECTED" && !application.reviewed_by && !application.reviewedBy)) && (
            <>
              <div className="relative flex items-center py-2 mb-1">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-2 text-[10px] uppercase font-bold text-[#0ea5e9]">✨ Tùy chọn Phỏng vấn AI (Premium)</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                onClick={() => inviteMutation.mutate()}
                disabled={inviteMutation.isPending || application.status === "AI_INTERVIEW_INVITED"}
                className="flex justify-center items-center gap-2 w-full bg-[#0ea5e9] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0284c7] hover:shadow-lg shadow-sky-500/30 transition-all active:scale-[0.98] disabled:opacity-40 mb-2"
              >
                {inviteMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <MessageSquare className="w-4 h-4" />}
                {application.status === "AI_INTERVIEW_INVITED"
                  ? "Đã Gửi Mời PV AI"
                  : "🎙 Mời Phỏng Vấn AI"}
              </button>
            </>
          )}
        </div>

        {/* Thông tin liên hệ */}
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
          <div className="space-y-2">
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

        {/* Điểm số tổng hợp */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" /> Điểm số
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-600">CV Match (40%)</span>
                <span className="text-[#0ea5e9]">{application.cv_score || 0}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#0ea5e9] h-2 rounded-full" style={{ width: `${application.cv_score || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-600">Phỏng vấn AI (60%)</span>
                <span className="text-sky-600">
                  {computedInterviewScore != null ? `${computedInterviewScore}/100` : "Chưa có"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-400 h-2 rounded-full" style={{ width: `${computedInterviewScore || 0}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Điểm Tổng Hợp</span>
                {finalScore != null ? (
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-black ${TONE[finalLabel.tone].score}`}>{finalScore}%</span>
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

        {/* Ghi chú */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Edit className="w-4 h-4 text-[#0ea5e9]" /> Ghi chú nội bộ
          </h3>
          <div>
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
              <Save className="w-4 h-4" /> Lưu Ghi Chú
            </button>
          </div>
        </div>

        {/* Email */}
        <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-[#0ea5e9] border-gray-300 rounded"
              />
              <span className="text-xs font-bold text-sky-900">Gửi email thông báo cho ứng viên</span>
            </label>
          </div>
          {sendEmail && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề</label>
                <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500">
                  [MockAI] Kết quả hồ sơ — {application.job_title}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung</label>
                <textarea
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Nhập lời nhắn gửi đến ứng viên..."
                  rows={4}
                  className="w-full border border-sky-200 rounded-lg p-3 text-xs focus:border-[#0ea5e9] outline-none resize-none bg-white"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
