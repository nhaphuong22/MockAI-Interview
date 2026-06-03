import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { cvApi } from "../../api/cvApi";
import { CVUploadArea } from "./components/CVUploadArea";
import { CVAnalysisLoading } from "./components/CVAnalysisLoading";
import { CVAnalysisResult } from "./components/CVAnalysisResult";

export function CVReview() {
  const [hasCV, setHasCV] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [cvText, setCvText] = useState("");
  const [aiResults, setAiResults] = useState(null);

  const scoreMutation = useMutation({
    mutationFn: (data) => cvApi.scoreCV(data.cvText, data.jobDescription),
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
      alert(errorMessage);
      setHasCV(false);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => cvApi.uploadCV(file),
    onSuccess: (res) => {
      // res is from axios interceptor which already returns response.data
      const text = res.data?.text || '';
      console.log('CV Text Extracted:', text.substring(0, 100) + '...');
      setCvText(text);
      setHasCV(true);
      
      // Auto trigger scoreCV without job description (Đánh giá tổng quan)
      scoreMutation.mutate({ cvText: text, jobDescription: "" });
    },
    onError: (error) => {
      console.error('Lỗi khi tải CV:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Tải lên CV thất bại!';
      alert(errorMessage);
    }
  });

  const handleUpload = (file) => {
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
          <CVUploadArea onUpload={handleUpload} isAnalyzing={isAnalyzing} />
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
