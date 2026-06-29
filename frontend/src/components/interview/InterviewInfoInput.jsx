import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Briefcase, FileCheck, X, Building2, FileText } from "lucide-react";
import { CVUploadArea } from "../../pages/candidate/components/CVUploadArea";
import { cvApi } from "../../api/cvApi";

const popularPositions = [
  "React Developer",
  "Node.js Backend Developer",
  "Full Stack Developer",
  "QA Automation Engineer",
  "Business Analyst",
  "UI/UX Designer"
];

export function InterviewInfoInput({ onProceed, onBack, isSubmitting = false }) {
  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [level, setLevel] = useState("JUNIOR");
  const [cvId, setCvId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [aiVoice, setAiVoice] = useState("vi-VN-female");

  const handleSelectPopularPosition = (pos) => {
    setPosition(pos);
  };

  const handleResetCV = () => {
    setUploadSuccess(false);
    setCvId(null);
    setFileName("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    sessionStorage.removeItem("temp_cv_text");
  };

  const handleUploadCV = async (file) => {
    setIsAnalyzing(true);
    setUploadSuccess(false);
    setFileName(file.name);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const blobUrl = URL.createObjectURL(file);
    setPreviewUrl(blobUrl);

    try {
      const response = await cvApi.uploadCV(file);
      console.log("CV uploaded and parsed successfully:", response);

      const extractedText = response.data?.text || response.text || "";
      sessionStorage.setItem("temp_cv_text", extractedText);

      const targetCvId = response.data?.id || response.id || null;
      setCvId(targetCvId);
      setUploadSuccess(true);

      const parsedData = response.data || response;
      if (parsedData.position || parsedData.cv_evaluations) {
        const suggestedPos = parsedData.position || (parsedData.cv_skills && parsedData.cv_skills.length > 0 ? "Software Engineer" : "");
        if (suggestedPos) setPosition(suggestedPos);
      }
    } catch (err) {
      console.error("Failed to upload and analyze CV:", err);
      alert("Hệ thống gặp lỗi nhẹ khi phân tích CV. Vui lòng tự bổ sung thông tin vị trí của bạn ở form phía dưới.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!position.trim()) return;

    const jd = jobDescription.trim();
    const techMatches = jd.match(/\b(?:React(?:\.js|JS)?|Vue(?:\.js)?|Angular|Node\.js|TypeScript|JavaScript|Python|Java|SQL|MongoDB|GraphQL|Jest|Docker|AWS|Git|HTML|CSS|Tailwind|Next\.js)\b/gi);
    const skillSummary = techMatches
      ? [...new Set(techMatches)].slice(0, 5).join(', ')
      : position.trim();

    onProceed({
      position: position.trim(),
      companyName: companyName.trim(),
      jobDescription: jd,
      skills: skillSummary,
      level,
      cvId: cvId,
      cvText: sessionStorage.getItem("temp_cv_text") || "",
      aiVoice
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto dark:bg-[#0f172a]/95 bg-white/95 backdrop-blur-md border dark:border-white/10 border-gray-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Dynamic ocean blue gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 dark:bg-[#1e293b] bg-sky-50 rounded-2xl flex items-center justify-center border dark:border-white/5 border-sky-100 text-[#0ea5e9]">
          <Sparkles className="w-8 h-8 animate-pulse text-[#0ea5e9]" />
        </div>
        <h2 className="text-2xl font-bold dark:text-white text-gray-800">Cấu Hình Luyện Tập</h2>
        <p className="text-sm dark:text-slate-400 text-gray-500 mt-1">
          Kéo thả CV hoặc điền các thông tin để AI chuẩn bị bộ câu hỏi cá nhân hóa cho bạn
        </p>
      </div>

      <div className="mb-8">
        {!uploadSuccess ? (
          <CVUploadArea
            onUpload={handleUploadCV}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <div className="relative group dark:bg-[#0a0f1c]/60 bg-white/60 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl border dark:border-white/10 border-gray-200 overflow-hidden flex flex-col animate-scaleIn">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/5 via-transparent to-[#38bdf8]/5 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 dark:bg-emerald-500/10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold dark:text-slate-200 text-gray-800 block truncate max-w-[240px]">
                    {fileName}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold block">Tải lên thành công • Bộ nhớ tạm cục bộ</span>
                </div>
              </div>
              <span className="text-[9px] bg-sky-50 dark:bg-sky-500/10 text-[#0ea5e9] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                Practice Draft
              </span>
            </div>

            <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white relative z-10 shadow-inner">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="CV Practice Preview"
              />
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200/50 dark:border-white/5 relative z-10">
              <p className="text-[10px] text-gray-400 font-semibold italic">CV này chỉ dùng để sinh câu hỏi và sẽ không lưu trên Server</p>
              <button
                type="button"
                onClick={handleResetCV}
                className="px-4 py-2 dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-100 hover:bg-[#fef2f2] text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-xl text-xs font-bold border dark:border-white/5 border-gray-200 flex items-center gap-1.5 transition-all duration-200 hover:scale-[1.02]"
              >
                <X className="w-4 h-4 shrink-0" />
                <span>Tải lại CV khác</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Job Position Input */}
        <div>
          <label className="block text-sm font-semibold dark:text-slate-300 text-gray-700 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#0ea5e9]" />
            Vị trí muốn luyện tập <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Ví dụ: Frontend Developer, Business Analyst..."
            className="w-full px-4 py-3 border dark:border-white/10 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 focus:outline-none dark:text-white dark:bg-[#1e293b] text-gray-700 transition-all"
          />

          {/* Quick Suggestions */}
          <div className="mt-3">
            <span className="text-xs font-medium dark:text-slate-500 text-gray-400 block mb-1.5">Gợi ý phổ biến:</span>
            <div className="flex flex-wrap gap-2">
              {popularPositions.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handleSelectPopularPosition(pos)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    position === pos
                      ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm"
                      : "dark:bg-[#1e293b] dark:text-slate-300 dark:border-white/10 dark:hover:border-[#0ea5e9] dark:hover:bg-[#0ea5e9]/10 bg-white text-gray-600 border-gray-200 hover:border-[#0ea5e9] hover:bg-sky-50/50"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Company Name Input */}
        <div>
          <label className="block text-sm font-semibold dark:text-slate-300 text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0ea5e9]" />
            Tên công ty (tuỳ chọn)
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ví dụ: FPT Software, VNG Corporation, Tiki..."
            className="w-full px-4 py-3 border dark:border-white/10 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 focus:outline-none dark:text-white dark:bg-[#1e293b] text-gray-700 transition-all"
          />
          <p className="mt-1.5 text-xs text-gray-400 italic">AI sẽ cá nhân hóa câu hỏi theo văn hóa và sản phẩm của công ty này.</p>
        </div>

        {/* 3. Job Description Textarea */}
        <div>
          <label className="block text-sm font-semibold dark:text-slate-300 text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0ea5e9]" />
            Mô tả công việc / Yêu cầu kỹ năng (tuỳ chọn)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Dán mô tả công việc (JD) từ bài đăng tuyển dụng vào đây. Ví dụ: Yêu cầu 2 năm kinh nghiệm React, thành thạo RESTful API, làm việc nhóm Agile..."
            rows={5}
            className="w-full px-4 py-3 border dark:border-white/10 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 focus:outline-none dark:text-white dark:bg-[#1e293b] text-gray-700 transition-all resize-none text-sm leading-relaxed"
          />
          <p className="mt-1.5 text-xs text-gray-400 italic">AI sẽ generate câu hỏi phỏng vấn dựa chính xác trên mô tả công việc này.</p>
        </div>

        {/* 4. Level Select */}
        <div>
          <label className="block text-sm font-semibold dark:text-slate-300 text-gray-700 mb-2">
            Cấp bậc kinh nghiệm
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-3 border dark:border-white/10 dark:text-white dark:bg-[#1e293b] border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none text-gray-700 bg-white transition-all"
          >
            <option value="INTERN">Intern (Thực tập sinh)</option>
            <option value="JUNIOR">Junior (Dưới 2 năm kinh nghiệm)</option>
            <option value="MID">Middle (2 - 5 năm kinh nghiệm)</option>
            <option value="SENIOR">Senior (Trên 5 năm kinh nghiệm)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border-2 dark:border-white/10 dark:hover:bg-white/10 dark:text-slate-300 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl font-semibold transition-all hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay Lại
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !position.trim()}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:shadow-lg hover:shadow-sky-100 text-white font-bold rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:from-sky-300 disabled:to-sky-400 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>Tiếp Tục</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />
    </div>
  );
}
