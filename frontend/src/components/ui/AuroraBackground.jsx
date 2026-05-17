import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function AuroraBackground({ children, className }) {
  return (
    <div className={cn("relative w-full min-h-screen overflow-hidden bg-white", className)}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Lớp hạt nhiễu (noise) nhẹ */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-0" />
        
        {/* Blob 1: Ocean Blue */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: ["0%", "15%", "-10%", "0%"],
            y: ["0%", "10%", "-15%", "0%"],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-[#0ea5e9]/20 blur-[100px] sm:blur-[120px] mix-blend-multiply"
        />
        
        {/* Blob 2: Sky Blue */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: ["0%", "-15%", "15%", "0%"],
            y: ["0%", "-10%", "15%", "0%"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[10%] -right-[15%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-[#38bdf8]/25 blur-[100px] sm:blur-[120px] mix-blend-multiply"
        />
        
        {/* Blob 3: Light Cyan/Teal */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1.2, 1],
            x: ["0%", "10%", "-15%", "0%"],
            y: ["0%", "15%", "-10%", "0%"],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] left-[20%] w-[65vw] h-[50vw] max-w-[900px] max-h-[700px] rounded-[100%] bg-[#7dd3fc]/30 blur-[100px] sm:blur-[120px] mix-blend-multiply"
        />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
