import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cvApi } from "../../api/cvApi";
import { CVUploadArea } from "./components/CVUploadArea";
import { CVAnalysisLoading } from "./components/CVAnalysisLoading";
import { CVAnalysisResult } from "./components/CVAnalysisResult";
import { useUiStore } from "../../store/useUiStore";

export function CVReview() {
  const showToast = useUiStore((state) => state.showToast);
  const [hasCV, setHasCV] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [cvText, setCvText] = useState("");
  const [aiResults, setAiResults] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const isGibberish = (text) => {
    if (!text) return false;
    const trimmed = text.trim();
    // 1. Chuỗi dài hơn 12 ký tự nhưng không có khoảng trắng
    if (trimmed.length > 12 && !trimmed.includes(' ')) return true;
    // 2. Chuỗi có 4 ký tự giống nhau liên tiếp (ví dụ: aaaa, dddd)
    if (/(.)\1{3,}/.test(trimmed)) return true;
    // 3. Chuỗi lặp lại cụm ký tự (ví dụ: dwdwdwdw, asdasdasd)
    if (/(..+)\1{2,}/.test(trimmed)) return true;
    // 4. Chứa quá nhiều phụ âm liên tiếp (ví dụ: bcdfgh)
    const noTones = trimmed.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (/[bcdfghjklmnpqrstvwxz]{6,}/.test(noTones)) return true;
    
    return false;
  };

  const scoreMutation = useMutation({
    mutationFn: (data) => cvApi.scoreCV(data.cvText, data.jobTitle, data.jobDescription, data.fileUrl),
    onSuccess: (res) => {
      // res from interceptor is { message, data }
      setAiResults(res.data);
      setShowResults(true);
    },
    onError: (error) => {
      console.error('Lỗi khi chấm điểm CV:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Chấm điểm CV thất bại!';
      if (error.response?.status === 413) {
        errorMessage = 'File CV của bạn chứa dung lượng văn bản quá lớn, vui lòng rút gọn lại để hệ thống xử lý tốt nhất.';
      }
      showToast({ message: errorMessage, type: 'error' });
      setHasCV(false);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => cvApi.uploadCV(file),
    onSuccess: (res) => {
      // res is from axios interceptor which already returns response.data
      const text = res.data?.text || '';
      const fileUrl = res.data?.fileUrl || '';
      console.log('CV Text Extracted:', text.substring(0, 100) + '...');
      setCvText(text);
      setHasCV(true);
      
      // Auto trigger scoreCV with job description
      scoreMutation.mutate({ cvText: text, jobTitle, jobDescription, fileUrl });
    },
    onError: (error) => {
      console.error('Lỗi khi tải CV:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Tải lên CV thất bại!';
      showToast({ message: errorMessage, type: 'error' });
    }
  });

  const handleUpload = (file) => {
    if (jobTitle && isGibberish(jobTitle)) {
      showToast({ message: "Vị trí ứng tuyển có vẻ không hợp lệ (chuỗi vô nghĩa). Vui lòng nhập lại!", type: 'error' });
      return;
    }
    if (jobDescription && isGibberish(jobDescription)) {
      showToast({ message: "Mô tả công việc có vẻ không hợp lệ (chuỗi vô nghĩa). Vui lòng nhập lại!", type: 'error' });
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleReupload = () => {
    setHasCV(false);
    setShowResults(false);
    setAiResults(null);
    setCvText("");
    uploadMutation.reset();
    scoreMutation.reset();
  };

  const isAnalyzing = uploadMutation.isPending || scoreMutation.isPending;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight dark:text-white text-gray-900">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]">Chấm Điểm CV</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed dark:text-slate-400 text-gray-500">
            Upload CV của bạn để nhận phân tích chi tiết, đánh giá điểm mạnh, điểm yếu và gợi ý cải thiện tổng quan từ AI để tăng tỷ lệ trúng tuyển.
          </p>
        </div>

        {!hasCV && !isAnalyzing && (
          <div className="space-y-8">
            <div className="bg-white/60 dark:bg-[#0a0f1c]/60 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 shadow-2xl border border-gray-200 dark:border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-3">
                  <span className="bg-[#0ea5e9]/10 text-[#0ea5e9] p-2 rounded-xl"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                  Thông tin vị trí ứng tuyển (Tuỳ chọn)
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mb-8">
                  Cung cấp vị trí ứng tuyển và JD để AI đánh giá mức độ phù hợp của CV với công việc chính xác nhất. Nếu bỏ trống, AI sẽ đánh giá chất lượng CV tổng quan.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Vị trí ứng tuyển (Job Title)</label>
                    <input 
                      type="text" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="VD: Frontend Developer, Product Manager..." 
                      className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Mô tả công việc (Job Description)</label>
                    <textarea 
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Dán nội dung mô tả công việc (JD) vào đây..." 
                      rows={5}
                      className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all resize-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <CVUploadArea onUpload={handleUpload} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {isAnalyzing && (
          <CVAnalysisLoading />
        )}

        {showResults && !isAnalyzing && aiResults && (
          <CVAnalysisResult aiResults={aiResults} onReupload={handleReupload} />
        )}
      </div>
    </div>
  );
}
export default CVReview;
