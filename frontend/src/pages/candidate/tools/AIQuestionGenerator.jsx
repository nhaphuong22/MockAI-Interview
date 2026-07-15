import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { toolApi } from "../../../api/toolApi";
import { 
  Briefcase, Code, Sparkles, Loader2, ArrowRight, 
  Mic, Star, Info, BookOpen, Search, Copy, Check, 
  FileText, Compass, ExternalLink, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { 
  CURATED_CATEGORIES, 
  CURATED_QUESTIONS, 
  INTERVIEW_GUIDES 
} from "./interviewQuestionsData";

const LEVEL_OPTIONS = [
  { value: "INTERN", label: "Thực tập sinh (Intern)" },
  { value: "JUNIOR", label: "Nhân viên mới (Junior)" },
  { value: "MID", label: "Nhân viên có kinh nghiệm (Mid-level)" },
  { value: "SENIOR", label: "Chuyên viên cao cấp (Senior)" },
  { value: "LEAD", label: "Trưởng nhóm / Quản lý (Team Lead/Manager)" }
];

export default function AIQuestionGenerator() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("common"); // category id or "ai_custom"
  
  // Search query
  const [searchQuery, setSearchQuery] = useState("");
  
  // Guide Modal State
  const [activeGuide, setActiveGuide] = useState(null);
  const [copiedText, setCopiedText] = useState(false);

  // AI Generator States
  const [position, setPosition] = useState("");
  const [skills, setSkills] = useState("");
  const [level, setLevel] = useState("JUNIOR");
  const [aiQuestions, setAiQuestions] = useState([]);

  const generateMutation = useMutation({
    mutationFn: (data) => toolApi.generateQuestions(data),
    onSuccess: (res) => {
      if (res?.success) {
        // Map response to standard structure
        const formatted = res.data.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          purpose: q.purpose || "Đánh giá năng lực chuyên môn và tư duy xử lý của ứng viên đối với yêu cầu công việc.",
          tips: q.suggestedAnswer || q.tips || "Hãy nêu các ý chính và liên hệ thực tế dự án bạn đã từng làm.",
          sampleAnswer: q.sampleAnswer || ""
        }));
        setAiQuestions(formatted);
      }
    }
  });

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!position.trim()) return;

    generateMutation.mutate({
      position,
      skills,
      experienceLevel: level
    });
  };



  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    const questions = activeCategory === "ai_custom" ? aiQuestions : (CURATED_QUESTIONS[activeCategory] || []);
    if (!searchQuery.trim()) return questions;

    const query = searchQuery.toLowerCase().trim();
    return questions.filter(
      (q) => 
        q.question.toLowerCase().includes(query) || 
        (q.purpose && q.purpose.toLowerCase().includes(query)) ||
        (q.tips && q.tips.toLowerCase().includes(query))
    );
  }, [activeCategory, aiQuestions, searchQuery]);

  return (
    <div className="space-y-8">
      {/* HERO SECTION / BANNER CLONE TOPCV IN OCEAN BLUE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0ea5e9] via-[#0284c7] to-[#0369a1] text-white p-6 lg:p-10 shadow-2xl shadow-sky-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.3),transparent_45%)]" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
            <Sparkles size={14} className="text-[#38bdf8] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider">Cập nhật liên tục từ các HR Leader</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              BỘ CÂU HỎI PHỎNG VẤN XIN VIỆC CHUẨN
            </h2>
            <p className="text-xs lg:text-sm text-sky-100 font-medium max-w-xl leading-relaxed">
              Tổng hợp câu hỏi phỏng vấn kinh điển, mục đích hỏi của nhà tuyển dụng và gợi ý trả lời xuất sắc giúp bạn chinh phục mọi buổi phỏng vấn.
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="flex flex-col md:flex-row gap-3 max-w-2xl bg-white/10 backdrop-blur-lg p-2 rounded-2xl border border-white/20">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl">
              <Search className="text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm từ khóa câu hỏi, nội dung gợi ý..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-800 dark:text-white placeholder-slate-400"
              />
            </div>
            
            {/* Quick action to switch to AI Generator */}
            <button
              onClick={() => {
                setActiveCategory("ai_custom");
                setSearchQuery("");
              }}
              className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-slate-900 hover:text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} />
              Trợ lý AI tạo câu hỏi riêng
            </button>
          </div>

          {/* CATEGORY TAGS */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            {CURATED_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-white text-[#0284c7] border-white shadow-lg"
                      : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                  }`}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMN LEFT: SEAMLESS QUESTION LISTS */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeCategory !== "ai_custom" ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 lg:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
              
              {/* ARTICLE HEADER */}
              <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  Cẩm nang phỏng vấn tuyển dụng: {CURATED_CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold items-center">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} className="text-[#0ea5e9]" /> MockAI Editor
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Cập nhật mới nhất</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-0.5 rounded-full font-black text-[10px]">
                    {filteredQuestions.length} câu hỏi thực tế
                  </span>
                </div>
              </div>

              {/* TABLE OF CONTENTS (MỤC LỤC BÀI VIẾT) */}
              {filteredQuestions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={14} className="text-[#0ea5e9]" /> Mục lục câu hỏi nhanh
                  </h4>
                  <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {filteredQuestions.map((q) => (
                      <li key={q.id} className="truncate">
                        <a 
                          href={`#question-${q.id}`}
                          className="hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors flex items-start gap-1.5"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`question-${q.id}`)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <span className="text-[#0ea5e9] font-black">{q.id}.</span>
                          <span className="truncate">{q.question}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* ARTICLE CONTENT (LIỀN MẠCH) */}
              {filteredQuestions.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredQuestions.map((q, idx) => (
                    <div 
                      key={q.id} 
                      id={`question-${q.id}`}
                      className={`py-8 space-y-4.5 scroll-mt-6 ${idx === 0 ? "pt-2" : ""}`}
                    >
                        {/* Heading Question */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <h4 className="text-sm lg:text-base font-black text-slate-900 dark:text-white leading-relaxed flex items-start gap-2.5">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] font-black text-xs font-mono">
                              {q.id}
                            </span>
                            <span>{q.question}</span>
                          </h4>
                        </div>

                      {/* Details - Writing flow */}
                      <div className="pl-8 space-y-4">
                        
                        {/* Purpose */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-[#0ea5e9] uppercase tracking-wider flex items-center gap-1">
                            <Info size={11} /> Mục đích hỏi của nhà tuyển dụng:
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                            {q.purpose || "Đánh giá năng lực chuyên môn và tư duy xử lý của ứng viên đối với vị trí."}
                          </p>
                        </div>

                        {/* Tips & Gợi ý trả lời */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">
                            <FileText size={11} /> Hướng dẫn & gợi ý trả lời:
                          </span>
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium prose dark:prose-invert max-w-none">
                            <MDEditor.Markdown
                              source={q.tips}
                              style={{ background: "transparent", color: "inherit", fontSize: "12px", padding: 0 }}
                            />
                          </div>
                        </div>

                        {/* Sample Answer */}
                        {q.sampleAnswer && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                              <Award size={11} /> Câu trả lời mẫu xuất sắc:
                            </span>
                            <div className="relative group bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border-l-4 border-emerald-500 text-slate-700 dark:text-slate-300 shadow-inner">
                              <button
                                onClick={() => handleCopy(q.sampleAnswer)}
                                className="absolute top-2.5 right-2.5 p-1.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100 border border-slate-200 dark:border-white/5"
                                title="Copy câu trả lời mẫu"
                              >
                                {copiedText ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                              </button>
                              <p className="italic text-xs leading-relaxed font-medium pr-8 whitespace-pre-line">
                                "{q.sampleAnswer}"
                              </p>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 shadow-sm">
                  <Compass className="w-14 h-14 opacity-25 mb-4 animate-pulse text-sky-500" />
                  <span className="font-extrabold text-xs">Không tìm thấy câu hỏi phù hợp với từ khóa tìm kiếm.</span>
                </div>
              )}

            </div>
          ) : (
            /* AI CUSTOM GENERATOR VIEW */
            <div className="space-y-6 animate-in fade-in duration-300">
              <form onSubmit={handleAiSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="space-y-2 md:col-span-4">
                  <label className="text-xs font-black text-slate-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Briefcase size={14} className="text-[#0ea5e9]" />
                    Vị trí công việc
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: NodeJS Engineer..."
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-[#0ea5e9] outline-none text-xs font-bold text-slate-800 dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <label className="text-xs font-black text-slate-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Code size={14} className="text-[#0ea5e9]" />
                    Kỹ năng chính
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Express, SQL..."
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-[#0ea5e9] outline-none text-xs font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-3">
                  <label className="text-xs font-black text-slate-700 dark:text-gray-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Star size={14} className="text-[#0ea5e9]" />
                    Cấp bậc
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-[#0ea5e9] outline-none text-xs font-bold text-slate-700 dark:text-white appearance-none"
                  >
                    {LEVEL_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={generateMutation.isPending}
                    className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-2.5 rounded-xl font-black text-xs transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/10"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Tạo câu hỏi <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {aiQuestions.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 lg:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
                  
                  {/* AI Generated Header */}
                  <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-white/10">
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      Bộ câu hỏi AI sinh cho vị trí: <span className="text-[#0ea5e9]">{position}</span>
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold items-center">
                      <span className="flex items-center gap-1">
                        <Sparkles size={13} className="text-amber-500" /> AI Generated Assistant
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span>Được cá nhân hóa theo kỹ năng</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-black text-[10px]">
                        {aiQuestions.length} câu hỏi
                      </span>
                    </div>
                  </div>

                  {/* TABLE OF CONTENTS FOR AI QUESTIONS */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#0ea5e9]" /> Mục lục câu hỏi
                    </h4>
                    <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {aiQuestions.map((q) => (
                        <li key={q.id} className="truncate">
                          <a 
                            href={`#ai-question-${q.id}`}
                            className="hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors flex items-start gap-1.5"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(`ai-question-${q.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            <span className="text-[#0ea5e9] font-black">{q.id}.</span>
                            <span className="truncate">{q.question}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* LIỀN MẠCH CONTENT */}
                  <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {aiQuestions.map((q, idx) => (
                      <div 
                        key={q.id}
                        id={`ai-question-${q.id}`}
                        className={`py-8 space-y-4.5 scroll-mt-6 ${idx === 0 ? "pt-2" : ""}`}
                      >
                        {/* Heading */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <h4 className="text-sm lg:text-base font-black text-slate-900 dark:text-white leading-relaxed flex items-start gap-2.5">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 font-black text-xs font-mono">
                              {q.id}
                            </span>
                            <span>{q.question}</span>
                          </h4>
                        </div>

                        {/* Details */}
                        <div className="pl-8 space-y-4">
                          
                          {/* Purpose */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">
                              <Info size={11} /> Mục đích hỏi của nhà tuyển dụng:
                            </span>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                              {q.purpose}
                            </p>
                          </div>

                          {/* Tips */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-1">
                              <FileText size={11} /> Hướng dẫn & mẹo trả lời của AI:
                            </span>
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium prose dark:prose-invert max-w-none">
                              <MDEditor.Markdown
                                source={q.tips}
                                style={{ background: "transparent", color: "inherit", fontSize: "12px", padding: 0 }}
                              />
                            </div>
                          </div>

                          {/* Sample Answer */}
                          {q.sampleAnswer && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                                <Award size={11} /> Câu trả lời mẫu xuất sắc:
                              </span>
                              <div className="relative group bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border-l-4 border-emerald-500 text-slate-700 dark:text-slate-300 shadow-inner">
                                <button
                                  onClick={() => handleCopy(q.sampleAnswer)}
                                  className="absolute top-2.5 right-2.5 p-1.5 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100 border border-slate-200 dark:border-white/5"
                                  title="Copy câu trả lời mẫu"
                                >
                                  {copiedText ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                                <p className="italic text-xs leading-relaxed font-medium pr-8 whitespace-pre-line">
                                  "{q.sampleAnswer}"
                                </p>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 shadow-sm">
                  <Sparkles className="w-14 h-14 opacity-25 mb-4 animate-pulse text-amber-500" />
                  <span className="font-extrabold text-xs">Vui lòng điền thông tin vị trí công việc phía trên để AI thiết kế bộ câu hỏi riêng biệt.</span>
            </div>
          )}
        </div>
      )}
    </div>

        {/* COLUMN RIGHT: SIDEBAR (AI Trigger Banner & Interview Guides) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* BANNER AI PROMPT INTEGRATED */}
          {activeCategory !== "ai_custom" && (
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white p-5 rounded-2xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-[#0ea5e9]/10 text-[#38bdf8] rounded-xl border border-[#0ea5e9]/20">
                  <Sparkles size={18} />
                </div>
                <span className="text-[9px] font-black tracking-widest text-[#38bdf8] bg-sky-500/10 px-2 py-0.5 rounded-full uppercase">Premium</span>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Bạn ứng tuyển vị trí khác?</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                  Tận dụng trí tuệ nhân tạo (AI) để tự động thiết kế một bộ câu hỏi phỏng vấn chuẩn xác theo đúng CV và mô tả công việc (JD) của riêng bạn.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveCategory("ai_custom");
                  setSearchQuery("");
                }}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-sky-500/10 hover:shadow-lg cursor-pointer"
              >
                Tự thiết kế câu hỏi với AI <ArrowRight size={12} />
              </button>
            </div>
          )}

          {/* INTERVIEW GUIDES (HÀNH TRANG PHỎNG VẤN) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-white/5">
              <BookOpen size={16} className="text-[#0ea5e9]" />
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wider">Hành trang phỏng vấn</h4>
            </div>

            <div className="space-y-3.5">
              {INTERVIEW_GUIDES.map((guide, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveGuide(guide)}
                  className="group p-3.5 bg-slate-50 hover:bg-[#0ea5e9]/5 dark:bg-slate-950 dark:hover:bg-sky-950/10 rounded-xl border border-slate-100 hover:border-[#0ea5e9]/30 dark:border-white/5 cursor-pointer transition-all duration-300 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-[#0ea5e9] transition-colors leading-relaxed">
                      {guide.title}
                    </h5>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-[#0ea5e9] transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    {guide.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM ADVERTISEMENT BANNER */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-500/20 dark:border-emerald-500/10 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <Mic size={14} className="animate-pulse" /> Luyện tập thực chiến
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              Trải nghiệm phỏng vấn thoại trực tiếp với **Robot Virtual Agent 3D** thời gian thực, có nhận xét, đánh giá và chấm điểm ngay lập tức.
            </p>
            <button
              onClick={() => navigate("/interview-practice")}
              className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Vào phòng phỏng vấn ngay <ArrowRight size={10} />
            </button>
          </div>

        </div>

      </div>

      {/* DETAIL GUIDE MODAL */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#0ea5e9] uppercase tracking-wider">Cẩm nang tuyển dụng</span>
                <h4 className="text-sm lg:text-base font-black text-slate-800 dark:text-white leading-relaxed">
                  {activeGuide.title}
                </h4>
              </div>
              <button 
                onClick={() => setActiveGuide(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                <MDEditor.Markdown
                  source={activeGuide.content}
                  style={{ background: "transparent", color: "inherit", fontSize: "12px" }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <button
                onClick={() => handleCopy(activeGuide.content)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check size={12} className="text-emerald-500" /> Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Sao chép nội dung
                  </>
                )}
              </button>
              
              <button
                onClick={() => setActiveGuide(null)}
                className="px-4 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
