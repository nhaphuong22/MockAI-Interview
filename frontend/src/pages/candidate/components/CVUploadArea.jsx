import React from "react";
import { Upload } from "lucide-react";

export function CVUploadArea({ onUpload, isAnalyzing }) {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm border-2 border-dashed border-gray-300 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-[#f0f9ff] rounded-2xl flex items-center justify-center">
        <Upload className="w-10 h-10 text-[#0ea5e9]" />
      </div>
      <h2 className="text-2xl mb-3">Upload CV của bạn</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Hỗ trợ file PDF, DOC, DOCX. Kích thước tối đa 5MB.
        AI sẽ phân tích và đưa ra đánh giá chi tiết.
      </p>
      <button
        onClick={onUpload}
        disabled={isAnalyzing}
        className="px-8 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isAnalyzing ? "Đang phân tích..." : "Chọn File CV"}
      </button>
      <p className="text-sm text-gray-500 mt-4">
        Thông tin CV của bạn được bảo mật tuyệt đối
      </p>
    </div>
  );
}
