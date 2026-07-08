import { useState, useEffect, useRef } from "react";
import { Loader2, Play, Pause } from "lucide-react";
import { getAudioSliceUrl } from "../../../../api/hrInterviewApi";

export function MiniAudioPlayer({ audioUrl, start, duration }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const sliceUrl = getAudioSliceUrl(audioUrl, start, duration);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play().then(() => {
        setIsLoading(false);
        setIsPlaying(true);
      }).catch(err => {
        console.error("Play audio failed:", err);
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      audio.currentTime = start;
      setIsLoading(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const relativeTime = Math.max(0, current - start);
      const pct = Math.min(100, (relativeTime / duration) * 100);
      setProgress(pct);
      setCurrentTime(relativeTime);

      if (current >= start + duration) {
        audio.pause();
        audio.currentTime = start;
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    // Set src directly to sync with sliceUrl updates
    if (audio.src !== sliceUrl) {
      audio.src = sliceUrl;
      audio.load();
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, [sliceUrl, start, duration]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-sky-50/80 border border-sky-100/70 rounded-xl p-2 mt-2 w-full max-w-[280px] shadow-sm backdrop-blur-sm select-none">
      <audio ref={audioRef} preload="none" />
      
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="w-7 h-7 rounded-full bg-[#0ea5e9] hover:bg-[#0284c7] active:scale-95 text-white flex items-center justify-center shadow transition-all duration-200 disabled:opacity-50 cursor-pointer shrink-0"
        title={isPlaying ? "Tạm dừng" : "Nghe thử khoảnh khắc"}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-white text-white" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-white text-white translate-x-[1px]" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mb-0.5">
          <span className="text-[#0ea5e9] font-mono">{formatTime(currentTime)}</span>
          <span className="font-mono">{formatTime(duration)}</span>
        </div>
        <div 
          className="w-full bg-slate-200/80 rounded-full h-1 overflow-hidden cursor-pointer relative"
          onClick={(e) => {
            if (!audioRef.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const pct = clickX / rect.width;
            const targetTime = start + (pct * duration);
            audioRef.current.currentTime = targetTime;
            setProgress(pct * 100);
            setCurrentTime(pct * duration);
          }}
        >
          <div 
            className="bg-[#0ea5e9] h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isPlaying && (
        <div className="flex items-end gap-[1.5px] h-2.5 w-3.5 shrink-0 pr-0.5">
          <span className="w-[1.5px] bg-[#0ea5e9] rounded-full animate-pulse h-2.5" />
          <span className="w-[1.5px] bg-[#38bdf8] rounded-full animate-pulse h-1.5" />
          <span className="w-[1.5px] bg-[#0ea5e9] rounded-full animate-pulse h-3" />
        </div>
      )}
    </div>
  );
}
