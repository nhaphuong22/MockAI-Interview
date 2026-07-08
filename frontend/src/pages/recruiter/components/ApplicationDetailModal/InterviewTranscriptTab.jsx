import { Loader2, AlertTriangle, Sparkles, Clock, TrendingUp, XCircle, Mic, Star } from "lucide-react";
import { MiniAudioPlayer } from "./MiniAudioPlayer";

export function InterviewTranscriptTab({
  application,
  transcriptData,
  isLoadingTranscript,
  highlightsData,
  isLoadingHighlights,
  computedInterviewScore,
  finalLabel,
  TONE,
  handleTimestampClick
}) {
  if (!application) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-[#f8fafc] to-[#f0f9ff]">
      <div className="p-5 space-y-4">

        {/* Overall score banner */}
        {computedInterviewScore != null && (
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
            computedInterviewScore >= 70 ? "bg-emerald-50 border-emerald-200"
            : computedInterviewScore >= 50 ? "bg-amber-50 border-amber-200"
            : "bg-red-50 border-red-200"
          }`}>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">🎙 Điểm Phỏng Vấn</p>
              <p className={`text-2xl font-black mt-0.5 ${
                computedInterviewScore >= 70 ? "text-emerald-700"
                : computedInterviewScore >= 50 ? "text-amber-700"
                : "text-red-700"
              }`}>
                {computedInterviewScore}
                <span className="text-sm font-bold text-gray-400">/100</span>
              </p>
            </div>
            {finalLabel && (
              <div className={`px-3 py-2 rounded-xl text-center ${TONE[finalLabel.tone].bg} border ${TONE[finalLabel.tone].border}`}>
                <p className="text-[10px] font-bold text-gray-500 mb-0.5">Tổng hợp</p>
                <p className={`text-sm font-black ${TONE[finalLabel.tone].text}`}>{finalLabel.text}</p>
              </div>
            )}
          </div>
        )}

        {/* Per-question bar chart */}
        {isLoadingTranscript ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        ) : transcriptData?.transcript?.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-3">Điểm từng câu hỏi</p>
            <div className="space-y-3">
              {transcriptData.transcript.map((qa, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 truncate max-w-[72%]">
                      Câu {qa.index}: {qa.question?.slice(0, 40)}{qa.question?.length > 40 ? "…" : ""}
                    </span>
                    <span className={`font-bold flex-shrink-0 ${
                      qa.score >= 70 ? "text-emerald-600"
                      : qa.score >= 50 ? "text-amber-600"
                      : "text-red-600"
                    }`}>{qa.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        qa.score >= 70 ? "bg-emerald-500"
                        : qa.score >= 50 ? "bg-amber-500"
                        : "bg-red-500"
                      }`}
                      style={{ width: `${qa.score}%` }}
                    />
                  </div>
                  {qa.gazeViolations > 0 && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Vi phạm: {qa.gazeViolations} lần
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* --- AI HIGHLIGHTS COMPONENT --- */}
        {isLoadingHighlights ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-[#0ea5e9]" /> Đang tải highlights AI...
          </div>
        ) : highlightsData ? (
          <div className="space-y-4">
            {/* Banner Cảnh Báo Gian Lận */}
            {(highlightsData.isFlagged || application.status === "SUSPENDED") && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm shadow-red-100 animate-pulse">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-red-800 uppercase tracking-wide">⚠️ Cảnh Báo Gian Lận (AI Audit)</h4>
                    <p className="text-xs text-red-700 mt-1 font-semibold leading-relaxed">
                      Ứng viên vi phạm quy chế phỏng vấn quá giới hạn hoặc cuộc phỏng vấn đã bị đình chỉ. HR vui lòng kiểm tra kỹ transcript và mốc thời gian vi phạm dưới đây.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card Tóm tắt 1 phút */}
            <div className="bg-sky-50/50 border border-sky-100/70 rounded-xl p-4 shadow-sm backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200/10 rounded-full blur-xl pointer-events-none" />
              <h4 className="text-xs font-black text-sky-800 uppercase flex items-center gap-2 mb-2 tracking-wider">
                <Sparkles className="w-4 h-4 text-[#0ea5e9]" /> Tóm tắt nổi bật (1 phút)
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {highlightsData.highlightSummary}
              </p>
            </div>

            {/* Timeline mốc thời gian nổi bật */}
            {highlightsData.timestampsData?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-xs font-black text-gray-800 uppercase mb-3 tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-500" /> Mốc thời gian nổi bật
                </h4>
                <div className="relative border-l border-gray-200 ml-3 pl-6 space-y-4">
                  {highlightsData.timestampsData.map((item, idx) => {
                    const ts = item.timestamp || 0;
                    let typeColor = "text-sky-600 bg-sky-50 border-sky-100";
                    let typeLabel = "Điểm sáng";
                    let IconComponent = Clock;
                    
                    if (item.type === "STRENGTH") {
                      typeColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
                      typeLabel = "Điểm mạnh";
                      IconComponent = TrendingUp;
                    } else if (item.type === "WEAKNESS") {
                      typeColor = "text-orange-700 bg-orange-50 border-orange-100";
                      typeLabel = "Điểm yếu";
                      IconComponent = AlertTriangle;
                    } else if (item.type === "HESITATION") {
                      typeColor = "text-amber-700 bg-amber-50 border-amber-100";
                      typeLabel = "Ngập ngừng";
                      IconComponent = Clock;
                    } else if (item.type === "VIOLATION") {
                      typeColor = "text-red-700 bg-red-50 border-red-100";
                      typeLabel = "Vi phạm";
                      IconComponent = XCircle;
                    }

                    const questionIndex = Math.min(transcriptData?.transcript?.length || 0, Math.floor(ts / 30) + 1);
                    const targetQA = questionIndex > 0 ? transcriptData?.transcript?.[questionIndex - 1] : null;
                    const audioUrl = targetQA?.audioUrl;

                    return (
                      <div key={idx} className="relative group transition-all duration-300 hover:scale-[1.02] hover:translate-x-1">
                        {/* Timeline icon node */}
                        <div className={`absolute -left-[34px] top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                          item.type === "VIOLATION" ? "bg-red-100 text-red-600 animate-pulse"
                          : item.type === "STRENGTH" ? "bg-emerald-100 text-emerald-600"
                          : item.type === "WEAKNESS" ? "bg-orange-100 text-orange-600"
                          : "bg-amber-100 text-amber-600"
                        }`}>
                          <IconComponent className="w-3 h-3" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTimestampClick(ts)}
                              className="px-2 py-0.5 rounded bg-sky-100 hover:bg-[#0ea5e9] text-[#0ea5e9] hover:text-white font-black text-[10px] tracking-wide border border-sky-200 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                              title="Click để cuộn tới câu hỏi"
                            >
                              <Mic className="w-2.5 h-2.5" /> {Math.floor(ts / 60)}:{(ts % 60).toString().padStart(2, '0')}
                            </button>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${typeColor}`}>
                              {typeLabel}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 group-hover:text-[#0ea5e9] transition-colors leading-normal">
                            {item.label}
                          </p>
                          {isLoadingTranscript ? (
                            <div className="text-[10px] text-slate-400 font-semibold italic mt-1 flex items-center gap-1.5 select-none">
                              <Loader2 className="w-3 h-3 animate-spin text-[#0ea5e9]" /> Đang kiểm tra ghi âm...
                            </div>
                          ) : audioUrl ? (
                            <MiniAudioPlayer 
                              audioUrl={audioUrl} 
                              start={ts % 30} 
                              duration={item.duration || 30} 
                            />
                          ) : (
                            <div className="text-[10px] text-slate-400 font-semibold italic mt-1 flex items-center gap-1 select-none">
                              <AlertTriangle className="w-3.5 h-3.5 text-slate-300" /> Không có ghi âm cho mốc này
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* AI Overall Summary */}
        {application.aiFeedback?.evaluation_summary && (
          <div className="bg-white border border-sky-100 rounded-xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-[#0ea5e9] mb-3 uppercase flex items-center gap-2">
              <Star className="w-4 h-4" /> Nhận xét tổng quan AI
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{application.aiFeedback.evaluation_summary}</p>
          </div>
        )}

        {/* Prompt to switch to COL1 for detail */}
        {transcriptData?.transcript?.length > 0 && (
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-center">
            <p className="text-xs text-sky-600 font-semibold">
              💡 Xem chi tiết từng câu trả lời ở cột bên trái
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
