import React, { useRef, useEffect, useState } from "react";

/**
 * Component Avatar3D - Phiên bản tối ưu hóa sử dụng video MP4 thay cho mô hình 3D.
 * Cung cấp trải nghiệm mượt mà, tải nhanh và đồng bộ trạng thái nói của AI.
 * 
 * @param {number} volume - Mức âm lượng của AI (từ 0 đến 1)
 * @param {boolean} isListening - Trạng thái ứng viên đang nói (đang thu âm)
 * @param {string} emotion - Cảm xúc hoặc trạng thái nói của AI ("happy" đại diện cho đang nói, "idle" đại diện cho im lặng)
 */
export function Avatar3D({ volume = 0, isListening = false, emotion = "idle" }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Xác định AI đang nói dựa trên emotion ("happy" từ InterviewSession) hoặc âm lượng volume > 0
  const isSpeaking = emotion === "happy" || volume > 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isSpeaking) {
      // Thiết lập phát lặp lại liên tục khi đang nói
      video.loop = true;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Video play interrupted or blocked by browser autoplays policy:", err);
          });
      }
    } else {
      // Khi AI dừng nói, tạm dừng video và lùi về giây thứ 0 (trạng thái khép miệng im lặng)
      video.pause();
      try {
        video.currentTime = 0;
      } catch (e) {
        // Tránh lỗi nếu metadata video chưa kịp load
      }
      setIsPlaying(false);
    }
  }, [isSpeaking]);

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center">
      {/* Grid hiệu ứng Sci-Fi mờ ở nền */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-5 pointer-events-none" />

      {/* Video X-Interviewer */}
      <video
        ref={videoRef}
        src="/videos/AI_speaking.mp4"
        playsInline
        muted
        className="w-full h-full object-contain transition-all duration-300"
      />

      {/* Đèn báo trạng thái (Ocean Blue) nhấp nháy nhẹ khi AI đang nói */}
      {isSpeaking && (
        <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-400/30 backdrop-blur-sm shadow z-10 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          <span className="text-[8px] font-bold text-sky-400 uppercase tracking-wider">AI Speaking</span>
        </div>
      )}

      {/* Viền neon trang trí nhẹ cho khung hình */}
      <div className="absolute inset-0 pointer-events-none border border-sky-500/10 rounded-2xl" />
    </div>
  );
}
