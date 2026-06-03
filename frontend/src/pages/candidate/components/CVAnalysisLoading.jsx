import React from "react";
import { Sparkles, Scan, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export function CVAnalysisLoading() {
  return (
    <div className="relative bg-white/80 backdrop-blur-3xl rounded-[3rem] p-16 shadow-2xl border border-sky-100 overflow-hidden text-center max-w-2xl mx-auto">
      {/* Background glowing orbs */}
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute -top-32 -left-32 w-64 h-64 bg-sky-400 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, -180, -360] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none" 
      />

      {/* Main scanning icon */}
      <div className="relative w-32 h-32 mx-auto mb-10">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-[3px] border-dashed border-sky-200"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-[2px] border-dashed border-blue-200"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.5)] flex items-center justify-center transform rotate-12"
          >
            <BrainCircuit className="w-10 h-10 text-white -rotate-12" />
          </motion.div>
        </div>

        {/* Scanning laser line */}
        <motion.div 
          animate={{ y: [0, 128, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20"
        />
      </div>

      <h2 className="relative z-10 text-3xl mb-4 font-bold tracking-tight text-gray-800 flex items-center justify-center gap-3">
        AI Đang Phân Tích CV
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="inline-flex gap-1"
        >
          <span>.</span><span>.</span><span>.</span>
        </motion.span>
      </h2>
      
      <p className="relative z-10 text-gray-500 mb-10 text-lg">
        Quá trình này sử dụng mô hình học sâu (Deep Learning) để bóc tách và đối chiếu kỹ năng của bạn với thị trường.
      </p>

      {/* Modern Progress Bar */}
      <div className="relative z-10 max-w-md mx-auto">
        <div className="flex justify-between text-sm mb-3 font-semibold text-gray-600">
          <span className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-[#0ea5e9] animate-pulse" /> Đang xử lý
          </span>
          <span className="text-[#0ea5e9]">90%</span>
        </div>
        <div className="h-3 bg-gray-100/80 backdrop-blur-sm rounded-full overflow-hidden shadow-inner p-0.5 border border-white/50">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "90%" }}
            transition={{ duration: 5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#0ea5e9] via-[#38bdf8] to-cyan-400 rounded-full relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
