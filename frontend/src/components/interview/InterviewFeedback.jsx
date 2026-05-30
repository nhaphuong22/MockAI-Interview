import { useState } from "react";
import { 
  CheckCircle2, 
  BookOpen, 
  Copy, 
  ExternalLink, 
  RotateCcw, 
  Map, 
  Award, 
  ClipboardCheck, 
  Download,
  AlertCircle
} from "lucide-react";

/**
 * InterviewFeedback Component
 * Renders a premium, state-of-the-art evaluation report.
 * Features a hand-crafted vector Radar Chart (SVG), dynamic multi-phase Roadmap, 
 * detailed question-by-question analysis, and direct Cloudinary JSON download/copy links.
 */
export function InterviewFeedback({ questions, onRetry, assessment, voiceSessionId }) {
  const [copied, setCopied] = useState(false);

  // If no assessment data is present (API error or skipped), render premium ocean-blue styled error container instead of mockups
  if (!assessment) {
    return (
      <div className="dark:bg-[#0a0f1c] bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center transition-colors duration-500">
        <div className="max-w-md w-full bg-white dark:bg-[#1e293b] border border-rose-500/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">Lỗi Đánh Giá Phỏng Vấn</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Không tìm thấy hoặc không thể tải dữ liệu đánh giá thực tế từ AI. Vui lòng kiểm tra lại cấu hình GROQ_API_KEY ở file .env của Backend hoặc thử lại buổi luyện tập mới.
          </p>
          <button
            onClick={onRetry}
            className="w-full py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Quay Lại Màn Hình Luyện Tập</span>
          </button>
        </div>
      </div>
    );
  }

  const data = assessment;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Helper to generate coordinates for Radar Chart (5 vertices)
  const cx = 160;
  const cy = 160;
  const maxR = 100;
  
  const skillKeys = [
    { key: "technical_depth", label: "Kỹ năng cứng" },
    { key: "communication", label: "Giao tiếp" },
    { key: "problem_solving", label: "Giải quyết v/đ" },
    { key: "confidence", label: "Độ tự tin" },
    { key: "star_structure", label: "Cấu trúc STAR" }
  ];

  const getCoordinates = (index, valueRatio) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const r = maxR * valueRatio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  // 1. Generate background grid coordinates (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map(level => {
    return skillKeys.map((_, idx) => {
      const { x, y } = getCoordinates(idx, level);
      return `${x},${y}`;
    }).join(" ");
  });

  // 2. Generate candidates score polygon coordinates
  const candidatePoints = skillKeys.map((item, idx) => {
    const score = data.radar_skills[item.key] || 80;
    const { x, y } = getCoordinates(idx, score / 100);
    return `${x},${y}`;
  }).join(" ");

  // 3. Generate dots and labels coordinates
  const labelPositions = skillKeys.map((item, idx) => {
    // Extend radius slightly for text labels
    const { x, y } = getCoordinates(idx, 1.25);
    return {
      x,
      y,
      label: item.label,
      score: data.radar_skills[item.key] || 80
    };
  });

  const handleCopyLink = () => {
    if (data.cloudinary_url) {
      navigator.clipboard.writeText(data.cloudinary_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="dark:bg-[#0a0f1c] bg-gray-50 min-h-screen py-12 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header section */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Award className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Báo Cáo Đánh Giá Phỏng Vấn AI
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            Hồ sơ năng lực giọng nói và phản xạ chuyên môn của bạn đã được kiểm định chuyên sâu qua AI.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 text-center shadow-xl border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all group hover:scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />
            <div className="text-5xl font-extrabold text-[#0ea5e9] mb-1 group-hover:scale-105 transition-transform">{data.overall_score}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Điểm Tổng Quát</div>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 text-center shadow-xl border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all group hover:scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="text-5xl font-extrabold text-gray-800 dark:text-white mb-1 group-hover:scale-105 transition-transform">
              {data.qa_details ? data.qa_details.length : questions.length}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tổng Câu Trả Lời</div>
          </div>
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 text-center shadow-xl border border-gray-100 dark:border-slate-800 relative overflow-hidden transition-all group hover:scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="text-5xl font-extrabold text-gray-800 dark:text-white mb-1 group-hover:scale-105 transition-transform">
              {formatTime(data.duration_seconds)}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thời Lượng Hội Thoại</div>
          </div>
        </div>

        {/* Analytics Section: Radar Chart and AI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Handcrafted Vector Radar Chart */}
          <div className="md:col-span-5 bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col justify-center items-center">
            <h3 className="text-sm font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-6">
              Biểu Đồ Radar Năng Lực
            </h3>
            
            <div className="relative w-[320px] h-[320px]">
              <svg width="320" height="320" viewBox="0 0 320 320" className="overflow-visible">
                {/* Background grid polygons */}
                {gridPolygons.map((points, idx) => (
                  <polygon
                    key={idx}
                    points={points}
                    fill="none"
                    stroke="rgba(14, 165, 233, 0.12)"
                    strokeWidth="1"
                  />
                ))}

                {/* Vertical Axis lines */}
                {skillKeys.map((_, idx) => {
                  const { x, y } = getCoordinates(idx, 1.0);
                  return (
                    <line
                      key={idx}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="rgba(14, 165, 233, 0.15)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  );
                })}

                {/* Candidate score polygon */}
                <polygon
                  points={candidatePoints}
                  fill="rgba(14, 165, 233, 0.22)"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Candidate score dots */}
                {skillKeys.map((item, idx) => {
                  const score = data.radar_skills[item.key] || 80;
                  const { x, y } = getCoordinates(idx, score / 100);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#38bdf8"
                      stroke="#white"
                      strokeWidth="1.5"
                      className="shadow-md"
                    />
                  );
                })}

                {/* Outer Labels */}
                {labelPositions.map((pos, idx) => {
                  // Slight label alignments based on text coordinates
                  const textAnchor = pos.x > cx ? "start" : pos.x < cx ? "end" : "middle";
                  const alignmentBaseline = pos.y > cy ? "hanging" : pos.y < cy ? "baseline" : "middle";
                  
                  return (
                    <g key={idx}>
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor={textAnchor}
                        alignmentBaseline={alignmentBaseline}
                        className="text-[11px] font-bold fill-gray-600 dark:fill-slate-300"
                      >
                        {pos.label}
                      </text>
                      <text
                        x={pos.x}
                        y={pos.y + (pos.y > cy ? 12 : -12)}
                        textAnchor={textAnchor}
                        alignmentBaseline={alignmentBaseline}
                        className="text-[10px] font-extrabold fill-[#0ea5e9]"
                      >
                        {pos.score}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* AI Comprehensive Overview */}
          <div className="md:col-span-7 bg-white dark:bg-[#1e293b] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex px-3 py-1.5 bg-sky-50 dark:bg-sky-500/10 text-[#0ea5e9] dark:text-[#38bdf8] rounded-full text-xs font-bold border border-sky-100/50 dark:border-sky-500/20">
                Nhận xét tổng quan từ AI Coach
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Tổng hợp Đánh Giá Năng Lực Giọng Nói
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                {data.feedback_summary}
              </p>
            </div>

            {/* Cloudinary JSON Actions */}
            {data.cloudinary_url && (
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800/80 space-y-3">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Lưu trữ kết quả đám mây (Cloudinary JSON)
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full flex-1 flex items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    {data.cloudinary_url}
                  </div>
                  <div className="w-full sm:w-auto flex gap-2 shrink-0">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? "Đã sao chép!" : "Sao chép link"}</span>
                    </button>
                    <a
                      href={data.cloudinary_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#0ea5e9]/10 hover:bg-[#0ea5e9]/20 text-[#0ea5e9] dark:text-[#38bdf8] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Xem file JSON</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap Roadmap section (Ocean Blue Roadmap) */}
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-50 dark:bg-sky-500/10 rounded-lg flex items-center justify-center">
              <Map className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lộ Trình Luyện Tập Gợi Ý (10 Ngày)</h2>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Personalized AI Roadmap</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {data.learning_path.map((item, index) => (
              <div 
                key={index} 
                className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/80 relative space-y-4 hover:shadow-lg hover:shadow-sky-500/5 transition-all group"
              >
                {/* Visual Connector Line between steps */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-sky-400 to-sky-200 dark:from-sky-500 dark:to-slate-800 z-10" />
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-sky-50 dark:bg-sky-500/10 text-[#0ea5e9] dark:text-[#38bdf8] rounded-full border border-sky-100/50 dark:border-sky-500/15">
                    CHẶNG {index + 1}
                  </span>
                  <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#0ea5e9] transition-colors" />
                </div>
                
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-[#0ea5e9] transition-colors">
                    {item.topic}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">
                    {item.phase}
                  </p>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                  {item.action}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Question-by-Question list */}
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800/80">
            <div className="w-8 h-8 bg-sky-50 dark:bg-sky-500/10 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Chi Tiết Từng Câu Hỏi</h2>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Question Breakdown Analysis</p>
            </div>
          </div>

          <div className="space-y-6">
            {data.qa_details.map((qa, index) => (
              <div 
                key={index} 
                className="border-b border-gray-100 dark:border-slate-800/85 pb-6 last:border-0 last:pb-0 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 dark:text-white text-base leading-snug">
                      Câu {index + 1}: {qa.question}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      Bản dịch Speech-to-Text câu trả lời của bạn
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold shrink-0 border border-emerald-100/50 dark:border-emerald-500/15">
                    {qa.score}%
                  </div>
                </div>

                {/* Candidate reply draft */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  "{qa.answer}"
                </div>

                {/* AI Review feedback text */}
                <div className="p-4 bg-sky-50/20 dark:bg-sky-500/5 rounded-2xl border border-sky-500/5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2">
                  <div>
                    <span className="font-bold text-[#0ea5e9]">Đánh giá AI:</span> {qa.feedback}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={onRetry}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-extrabold rounded-2xl hover:shadow-lg hover:shadow-sky-500/10 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện Tập Lại</span>
          </button>
          
          {data.cloudinary_url && (
            <a
              href={data.cloudinary_url}
              download={`mockai-result-${voiceSessionId || 'session'}.json`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 border-2 border-[#0ea5e9] text-[#0ea5e9] font-extrabold rounded-2xl hover:bg-[#f0f9ff] dark:hover:bg-sky-500/5 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Tải Báo Cáo JSON</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
