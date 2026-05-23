import { Volume2 } from "lucide-react";

/**
 * AudioVisualizer Component
 * Renders an organic 30-bar visualizer showing microphone input volume level
 */
export function AudioVisualizer({ audioLevel }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Âm lượng đầu vào (Mic Level)
        </label>
        <span className="text-xs font-medium text-gray-500">
          {audioLevel > 5 ? "Mic tốt" : "Hãy nói thử"}
        </span>
      </div>
      
      <div className="h-10 bg-gray-50 rounded-xl flex items-center px-4 gap-1.5 border border-gray-100">
        <Volume2 className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
        <div className="flex-1 flex items-end justify-between h-6 gap-0.5">
          {Array.from({ length: 30 }).map((_, index) => {
            const isActive = audioLevel > (index / 30) * 100;
            return (
              <div
                key={index}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  isActive 
                    ? "bg-gradient-to-t from-[#0ea5e9] to-[#38bdf8]" 
                    : "bg-gray-200"
                }`}
                style={{
                  height: isActive 
                    ? `${Math.max(15, Math.min(100, (audioLevel * (0.5 + ((index * 93) % 50) / 100))))}%` 
                    : "15%"
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
