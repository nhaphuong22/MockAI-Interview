import { Star, Clock, AlertTriangle, CheckCircle2, MessageSquare, Award, FileText } from "lucide-react";

export function CVAssessmentTab({ application, aiRecommendation, TONE }) {
  if (!application) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff]">
      <div className="p-5 space-y-4">

        {/* AI Verdict Banner */}
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

        {/* Phase 2 waiting hint */}
        {["SHORTLISTED", "AI_INTERVIEW_INVITED"].includes(application.status) && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#0ea5e9]" />
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

        {/* CV AI Report */}
        {application.aiFeedback ? (
          <div className="space-y-4">
            {/* Knockout */}
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

            {/* Interview hint */}
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

            {/* Positive / Negative */}
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
  );
}
