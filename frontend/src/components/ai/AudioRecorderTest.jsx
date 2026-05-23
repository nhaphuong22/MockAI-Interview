import { Mic, Play, Square, Check } from "lucide-react";

/**
 * AudioRecorderTest Component
 * Allows user to record a 3-second audio sample and play it back to check output quality
 */
export function AudioRecorderTest({
  isRecordingTest,
  isPlayingTest,
  testAudioUrl,
  onStartRecording,
  onPlayTest,
  onStopTest,
  onEndedPlay,
  audioRef
}) {
  return (
    <div className="bg-sky-50/40 rounded-2xl p-4 border border-sky-100/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-sky-950">Thử nghiệm Ghi âm & Nghe lại</span>
        {testAudioUrl && (
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Check className="w-3 h-3" /> Đã ghi xong
          </span>
        )}
      </div>
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onStartRecording}
          disabled={isRecordingTest || isPlayingTest}
          className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
            isRecordingTest
              ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
              : "bg-white border-gray-100 text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
          }`}
        >
          {isRecordingTest ? (
            <>
              <Square className="w-4 h-4 fill-rose-600" />
              <span>Đang ghi (3s)...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-[#0ea5e9]" />
              <span>Ghi âm thử 3 giây</span>
            </>
          )}
        </button>

        {testAudioUrl && (
          <button
            type="button"
            onClick={isPlayingTest ? onStopTest : onPlayTest}
            disabled={isRecordingTest}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
              isPlayingTest
                ? "bg-sky-100 border-sky-200 text-sky-700"
                : "bg-[#0ea5e9] border-[#0ea5e9] text-white hover:bg-[#0284c7] hover:shadow-md active:scale-[0.98]"
            }`}
          >
            {isPlayingTest ? (
              <>
                <Square className="w-4 h-4 fill-sky-700" />
                <span>Dừng nghe thử</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Nghe lại giọng nói</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {testAudioUrl && (
        <audio
          ref={audioRef}
          src={testAudioUrl}
          onEnded={onEndedPlay}
          className="hidden"
        />
      )}
    </div>
  );
}
