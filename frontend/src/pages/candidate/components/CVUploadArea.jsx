import React, { useCallback, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

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

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    if (isAnalyzing || isDragActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      {...getRootProps()} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isAnalyzing || isDragActive ? 0 : rotateX,
        rotateY: isAnalyzing || isDragActive ? 0 : rotateY,
        transformPerspective: 1000
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative group dark:bg-[#0a0f1c]/60 bg-white/60 backdrop-blur-3xl rounded-[3rem] p-12 sm:p-16 shadow-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-500 overflow-hidden
        ${isDragActive ? 'border-[#0ea5e9] dark:bg-[#0ea5e9]/10 bg-[#f0f9ff]/90 shadow-[#0ea5e9]/40 scale-[1.02]' : 'dark:border-white/10 border-gray-200 hover:border-[#38bdf8] hover:bg-white/80 dark:hover:bg-[#0a0f1c]/90 shadow-gray-200/50 hover:shadow-sky-500/20'}
        ${isAnalyzing ? 'opacity-70 cursor-not-allowed dark:border-white/5 border-gray-200 scale-95' : ''}
      `}
    >
      {/* Decorative gradient blur in background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-[#0ea5e9]/20 via-transparent to-[#38bdf8]/10 blur-3xl z-0 rounded-3xl pointer-events-none transition-opacity duration-700 ${isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <input {...getInputProps()} />
      
      <motion.div 
        animate={{ 
          y: isDragActive ? -15 : 0, 
          scale: isDragActive ? 1.1 : 1,
          rotateZ: isDragActive ? [0, -5, 5, 0] : 0
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 15,
          rotateZ: { duration: 0.5, repeat: isDragActive ? Infinity : 0 }
        }}
        className={`relative w-28 h-28 mx-auto mb-8 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl z-10
        ${isDragActive ? 'bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white shadow-[#0ea5e9]/40' : 'bg-gradient-to-br from-gray-50 to-sky-50 dark:from-[#0ea5e9]/10 dark:to-[#38bdf8]/5 text-[#0ea5e9] group-hover:bg-[#f0f9ff] dark:group-hover:bg-[#0ea5e9]/20 group-hover:shadow-[#0ea5e9]/20'}
      `}>
        {/* Glow behind icon */}
        <div className={`absolute inset-0 bg-[#0ea5e9] rounded-3xl blur-xl opacity-0 transition-opacity duration-500 ${isDragActive ? 'opacity-50' : 'group-hover:opacity-30'}`} />
        
        {acceptedFiles.length > 0 ? (
          <FileText className="relative z-10 w-14 h-14" />
        ) : (
          <Upload className="relative z-10 w-14 h-14" />
        )}
      </motion.div>
      
      <h2 className="relative z-10 text-3xl mb-4 dark:text-white text-gray-800 font-extrabold tracking-tight drop-shadow-sm">
        {isDragActive ? 'Thả CV của bạn vào đây ngay! 🚀' : 'Kéo thả hoặc Click để Upload CV'}
      </h2>
      
      <p className="relative z-10 dark:text-slate-400 text-gray-500 mb-10 max-w-lg mx-auto text-base leading-relaxed">
        {acceptedFiles.length > 0 
          ? <span className="font-semibold text-[#0ea5e9] dark:bg-sky-500/10 bg-sky-50 px-4 py-2 rounded-full shadow-sm">File đã chọn: {acceptedFiles[0].name}</span>
          : 'Hỗ trợ định dạng PDF. Kích thước tối đa 5MB. Trí tuệ nhân tạo sẽ quét và phân tích điểm mạnh, điểm yếu trong CV của bạn với độ chính xác cao.'}
      </p>

      <motion.button
        type="button"
        disabled={isAnalyzing}
        whileHover={!isAnalyzing ? { scale: 1.05, boxShadow: "0px 15px 30px rgba(14, 165, 233, 0.3)" } : {}}
        whileTap={!isAnalyzing ? { scale: 0.95 } : {}}
        className="relative z-10 px-10 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 overflow-hidden group/btn"
      >
        {/* Shine effect on button */}
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 hidden group-hover/btn:block" 
        />
        
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-3 relative z-10">
            <svg className="animate-spin -ml-1 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang phân tích dữ liệu...
          </span>
        ) : (
          <span className="relative z-10">Chọn File từ máy tính</span>
        )}
      </motion.button>

      <p className="relative z-10 text-sm text-gray-400 mt-8 flex items-center justify-center gap-2 font-medium">
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        Dữ liệu của bạn được mã hóa và bảo mật tuyệt đối
      </p>
    </motion.div>
  );
}
