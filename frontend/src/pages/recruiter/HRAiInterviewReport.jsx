import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, FileText, Star, Brain, MessageSquare,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Zap, TrendingUp, AlertCircle, Award, Loader2
} from "lucide-react";

// --- Radar Chart (SVG-based, không cần thư viện ngoài) ---
function RadarChart({ data, size = 200 }) {
  const labels = {
    technical_depth: "Kỹ thuật",
    communication: "Giao tiếp",
    problem_solving: "Giải quyết vấn đề",
    confidence: "Tự tin",
    star_structure: "Cấu trúc STAR",
  };
  const keys = Object.keys(labels);
  const n = keys.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;

  const angleStep = (Math.PI * 2) / n;

  const getPoint = (index, value) => {
    const angle = index * angleStep - Math.PI / 2;
    const scaled = (value / 100) * r;
    return {
      x: cx + scaled * Math.cos(angle),
      y: cy + scaled * Math.sin(angle),
    };
  };

  const getLabelPoint = (index) => {
    const angle = index * angleStep - Math.PI / 2;
    return {
      x: cx + (r + 18) * Math.cos(angle),
      y: cy + (r + 18) * Math.sin(angle),
    };
  };

  // Grid circles
  const gridLevels = [20, 40, 60, 80, 100];
  const gridCircles = gridLevels.map((level) => {
    const points = keys.map((_, i) => {
      const pt = getPoint(i, level);
      return `${pt.x},${pt.y}`;
    });
    return points.join(" ");
  });

  // Data polygon
  const dataPoints = keys.map((key, i) => {
    const value = data?.[key] || 0;
    const pt = getPoint(i, value);
    return `${pt.x},${pt.y}`;
  });

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grid lines */}
      {gridCircles.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {keys.map((_, i) => {
        const pt = getPoint(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={dataPoints.join(" ")}
        fill="rgba(14,165,233,0.15)"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
      {/* Data points */}
      {keys.map((key, i) => {
        const value = data?.[key] || 0;
        const pt = getPoint(i, value);
        return (
          <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#0ea5e9" />
        );
      })}
      {/* Labels */}
      {keys.map((key, i) => {
        const pt = getLabelPoint(i);
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#64748b"
            fontWeight="600"
          >
            {labels[key]}
          </text>
        );
      })}
    </svg>
  );
}

// --- Score Ring ---
function ScoreRing({ score, label, color = "#0ea5e9", size = 80 }) {
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="6"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-slate-800">{score}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-500">{label}</span>
    </div>
  );
}

// --- Q&A Accordion Item ---
function QAItem({ qa, index }) {
  const [open, setOpen] = useState(false);
  const scoreColor =
    qa.score >= 80
      ? "text-emerald-600 bg-emerald-50"
      : qa.score >= 60
      ? "text-sky-600 bg-sky-50"
      : "text-red-600 bg-red-50";

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <p className="text-sm font-semibold text-slate-800 truncate">
            {qa.question}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${scoreColor}`}>
            {qa.score}/100
          </span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 bg-slate-50/50">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Câu trả lời của ứng viên
                </p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {qa.answer || "Không có câu trả lời"}
                </p>
              </div>
              {qa.feedback && (
                <div className="flex gap-2 p-3 bg-white rounded-xl border border-slate-100">
                  <MessageSquare className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {qa.feedback}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Component ---
export function HRAiInterviewReport({ application, onAccept, onReject, isUpdating }) {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data structure — sẽ thay bằng API call thực tế
  const assessment = application?.assessment || null;
  const cvScore = application?.cv_match_score ?? application?.cv_score ?? null;
  const interviewScore = application?.interview_score ?? assessment?.overall_score ?? null;
  const radarSkills = assessment?.radar_skills || null;
  const qaDetails = assessment?.qa_details || [];
  const feedbackSummary = assessment?.feedback_summary || "";
  const aiTrack = application?.ai_track;

  const RECOMMENDATION_CONFIG = {
    STRONG_YES: { label: "Rất khuyến nghị tuyển", color: "text-emerald-700 bg-emerald-100 border-emerald-200", icon: CheckCircle },
    YES: { label: "Khuyến nghị tuyển", color: "text-sky-700 bg-sky-100 border-sky-200", icon: CheckCircle },
    MAYBE: { label: "Cần xem xét thêm", color: "text-amber-700 bg-amber-100 border-amber-200", icon: AlertCircle },
    NO: { label: "Không khuyến nghị", color: "text-red-700 bg-red-100 border-red-200", icon: XCircle },
  };

  const recommendation = assessment?.recommendation || null;
  const recConfig = recommendation ? RECOMMENDATION_CONFIG[recommendation] : null;
  const RecIcon = recConfig?.icon;

  const TRACK_BADGES = {
    FAST_TRACK: { label: "⚡ Fast Track", color: "text-violet-700 bg-violet-100" },
    STANDARD: { label: "📋 Standard", color: "text-sky-700 bg-sky-100" },
    AUTO_REJECTED: { label: "❌ Từ chối tự động", color: "text-red-700 bg-red-100" },
  };

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: TrendingUp },
    { id: "interview", label: "Phỏng vấn", icon: Brain },
    { id: "qa", label: `Q&A (${qaDetails.length})`, icon: MessageSquare },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-sky-50/50 border-b border-slate-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-black text-xl shrink-0">
              {application?.candidate_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {application?.candidate_name || "Ứng viên"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {application?.candidate_email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {aiTrack && TRACK_BADGES[aiTrack] && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TRACK_BADGES[aiTrack].color}`}>
                    {TRACK_BADGES[aiTrack].label}
                  </span>
                )}
                {recConfig && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${recConfig.color} flex items-center gap-1`}>
                    <RecIcon className="w-3 h-3" />
                    {recConfig.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Score Rings */}
          <div className="flex items-center gap-4 shrink-0">
            {cvScore !== null && (
              <ScoreRing score={cvScore} label="CV Score" color="#0ea5e9" />
            )}
            {interviewScore !== null && (
              <ScoreRing score={interviewScore} label="PV Score" color="#8b5cf6" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 mr-6 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Tab: Tổng quan */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Radar Chart */}
              {radarSkills ? (
                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4 text-sky-500" />
                    Đánh giá năng lực 5 chiều
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <RadarChart data={radarSkills} size={220} />
                    <div className="flex-1 space-y-2">
                      {Object.entries(radarSkills).map(([key, val]) => {
                        const labelMap = {
                          technical_depth: "Kỹ năng kỹ thuật",
                          communication: "Giao tiếp",
                          problem_solving: "Giải quyết vấn đề",
                          confidence: "Độ tự tin",
                          star_structure: "Cấu trúc STAR",
                        };
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-500 w-36 shrink-0">
                              {labelMap[key] || key}
                            </span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full transition-all duration-700"
                                style={{ width: `${val}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700 w-8 text-right">
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Chưa có dữ liệu radar skills
                </div>
              )}

              {/* CV Screening Info */}
              {application?.ai_filter_reason && (
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-500" />
                    Kết quả lọc CV tự động
                  </h3>
                  {(() => {
                    try {
                      const reason = typeof application.ai_filter_reason === "string"
                        ? JSON.parse(application.ai_filter_reason)
                        : application.ai_filter_reason;
                      return (
                        <div className="space-y-3 text-sm">
                          {reason.matched_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs font-bold text-emerald-600 mr-1">✅ Khớp:</span>
                              {reason.matched_skills.map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {reason.missing_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              <span className="text-xs font-bold text-red-500 mr-1">❌ Thiếu:</span>
                              {reason.missing_skills.map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {reason.summary && (
                            <p className="text-slate-600 text-xs leading-relaxed mt-2 bg-white p-3 rounded-xl border border-sky-100">
                              {reason.summary}
                            </p>
                          )}
                        </div>
                      );
                    } catch {
                      return <p className="text-slate-500 text-xs">{application.ai_filter_reason}</p>;
                    }
                  })()}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Phỏng vấn */}
          {activeTab === "interview" && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {feedbackSummary ? (
                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-violet-500" />
                    Nhận xét tổng quan từ AI
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {feedbackSummary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm space-y-2">
                  <Brain className="w-10 h-10 mx-auto opacity-30" />
                  <p>Ứng viên chưa hoàn thành phỏng vấn AI</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Q&A */}
          {activeTab === "qa" && (
            <motion.div
              key="qa"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {qaDetails.length > 0 ? (
                qaDetails.map((qa, i) => (
                  <QAItem key={i} qa={qa} index={i} />
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm space-y-2">
                  <MessageSquare className="w-10 h-10 mx-auto opacity-30" />
                  <p>Chưa có dữ liệu Q&A từ buổi phỏng vấn</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-100 p-5 flex items-center gap-3 bg-slate-50/50">
        <button
          type="button"
          onClick={onReject}
          disabled={isUpdating}
          className="flex-1 py-3 border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Từ chối
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={isUpdating}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Chấp nhận ứng viên
        </button>
      </div>
    </div>
  );
}

export default HRAiInterviewReport;
