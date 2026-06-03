import { AudioLines } from "lucide-react";

/**
 * AiWaveform Component
 * Renders an advanced, organic Ocean Blue wave simulating AI active voice speech.
 * Utilizes sleek dark-mode glassmorphism and dynamic micro-animations.
 */
export function AiWaveform() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-sky-500/10 shadow-xl shadow-sky-500/5 text-center">
      <div className="flex justify-center items-center gap-1.5 mb-3">
        <AudioLines className="w-4 h-4 text-[#38bdf8] animate-bounce" />
        <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">
          AI Coach Đang Trò Chuyện...
        </span>
      </div>
      
      {/* Symmetrical undulating multi-bar wave mimicking vocal cords */}
      <div className="h-16 flex items-center justify-center gap-1.5 px-4 bg-slate-900/50 rounded-xl border border-slate-700/30 overflow-hidden">
        {Array.from({ length: 24 }).map((_, index) => {
          // Generate customized animation delay and height multipliers for a natural vocal ripple effect
          const delay = `${(index * 0.08).toFixed(2)}s`;
          const baseHeight = 20 + ((index * 7) % 50); // heights range dynamically
          
          return (
            <div
              key={index}
              className="w-1.5 rounded-full bg-gradient-to-t from-[#0ea5e9] to-[#38bdf8] animate-voice-ripple"
              style={{
                height: `${baseHeight}%`,
                animationDelay: delay,
                animationDuration: '0.8s',
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out'
              }}
            />
          );
        })}
      </div>
      
      {/* Tailwind Custom Keyframes inserted as inline CSS to assure styles function flawlessly */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes voice-ripple {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(2.2);
            opacity: 0.85;
          }
        }
        .animate-voice-ripple {
          animation-name: voice-ripple;
        }
      `}} />
      
      <p className="text-xs text-slate-400 mt-3 font-medium">
        Vui lòng lắng nghe câu hỏi từ Trợ lý ảo AI
      </p>
    </div>
  );
}
