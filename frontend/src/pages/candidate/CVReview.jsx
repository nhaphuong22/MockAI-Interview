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
      const errorMessage = error.response?.data?.message || error.message || 'Chấm điểm CV thất bại!';
      alert(errorMessage);
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">AI Chấm Điểm CV</h1>
          <p className="text-gray-600">
            Upload CV của bạn để nhận phân tích chi tiết và gợi ý cải thiện tổng quan từ AI
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
