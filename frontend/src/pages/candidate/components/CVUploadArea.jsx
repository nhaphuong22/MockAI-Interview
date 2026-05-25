import React, { useCallback } from "react";
import { Upload, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";

export function CVUploadArea({ onUpload, isAnalyzing }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 5242880, // 5MB
    disabled: isAnalyzing
  });

  return (
    <div 
      {...getRootProps()} 
      className={`bg-white rounded-2xl p-12 shadow-sm border-2 border-dashed text-center cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-[#0ea5e9] bg-[#f0f9ff]/50' : 'border-gray-300 hover:border-[#38bdf8] hover:bg-gray-50/50'}
        ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-colors
        ${isDragActive ? 'bg-[#0ea5e9] text-white' : 'bg-[#f0f9ff] text-[#0ea5e9]'}
      `}>
        {acceptedFiles.length > 0 ? (
          <FileText className="w-10 h-10" />
        ) : (
          <Upload className="w-10 h-10" />
        )}
      </div>
      
      <h2 className="text-2xl mb-3 text-gray-800">
        {isDragActive ? 'Thả CV của bạn vào đây...' : 'Kéo thả hoặc Click để Upload CV'}
      </h2>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {acceptedFiles.length > 0 
          ? `File đã chọn: ${acceptedFiles[0].name}`
          : 'Hỗ trợ file PDF. Kích thước tối đa 5MB. AI sẽ phân tích và đưa ra đánh giá chi tiết.'}
      </p>

      <button
        type="button"
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
