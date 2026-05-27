import { useRef } from "react";
import { 
  Mic, 
  Settings, 
  RefreshCw, 
  AlertCircle, 
  Loader2 
} from "lucide-react";
import { useMicrophone } from "../../hooks/useMicrophone";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { AudioVisualizer } from "./AudioVisualizer";
import { AudioRecorderTest } from "./AudioRecorderTest";

/**
 * MicrophoneSetup Component
 * Allows candidates to select, authorize, and test their microphone before beginning the interview.
 * Uses Ocean Blue theme: primary (#0ea5e9) and secondary (#38bdf8).
 * 
 * @param {object} props
 * @param {function} props.onProceed - Callback function when candidate completes setup and is ready to start
 * @param {boolean} props.isSubmitting - Loading state from parent when calling API to register voice session
 */
export function MicrophoneSetup({ onProceed, isSubmitting = false }) {
  const {
    devices,
    selectedDevice,
    permissionGranted,
    errorMessage,
    isRecordingTest,
    testAudioUrl,
    isPlayingTest,
    audioLevel,
    setIsPlayingTest,
    requestPermission,
    handleDeviceChange,
    startTestRecording,
    playTestAudio,
    stopTestAudio
  } = useMicrophone();

  const testAudioRef = useRef(null);

  const handlePlayTest = () => {
    playTestAudio(testAudioRef.current);
  };

  const handleStopTest = () => {
    stopTestAudio(testAudioRef.current);
  };

  return (
    <div className="max-w-xl w-full mx-auto dark:bg-[#0f172a]/95 bg-white/95 backdrop-blur-md border dark:border-white/10 border-gray-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />

      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 dark:bg-[#1e293b] dark:border-white/5 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 text-[#0ea5e9]">
          <Settings className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h2 className="text-2xl font-bold dark:text-white text-gray-800">Kiểm Tra Thiết Bị</h2>
        <p className="text-sm dark:text-slate-400 text-gray-500 mt-1">Đảm bảo giọng nói của bạn rõ ràng trước khi vào phỏng vấn</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Lỗi cấu hình: </span>
            {errorMessage}
            <button 
              onClick={() => requestPermission(selectedDevice)}
              className="block mt-2 underline font-medium hover:text-rose-800 transition-colors"
            >
              Thử lại ngay
            </button>
          </div>
        </div>
      )}

      {!permissionGranted && !errorMessage && (
        <div className="text-center py-6">
          <p className="dark:text-slate-400 text-gray-600 mb-4">Vui lòng cấp quyền truy cập microphone để hệ thống ghi âm câu trả lời phỏng vấn.</p>
          <button
            onClick={() => requestPermission()}
            className="px-6 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-semibold rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] flex items-center gap-2 mx-auto"
          >
            <Mic className="w-5 h-5" />
            Cho phép truy cập Microphone
          </button>
        </div>
      )}

      {permissionGranted && (
        <div className="space-y-6">
          {/* Device Selection Dropdown */}
          <MicrophoneSelector 
            devices={devices} 
            selectedDevice={selectedDevice} 
            onChange={handleDeviceChange}
            disabled={isRecordingTest || isPlayingTest || isSubmitting}
          />

          {/* Real-time Audio Level Meter */}
          <AudioVisualizer audioLevel={audioLevel} />

          {/* Record & Playback Test Section */}
          <AudioRecorderTest 
            isRecordingTest={isRecordingTest}
            isPlayingTest={isPlayingTest}
            testAudioUrl={testAudioUrl}
            onStartRecording={startTestRecording}
            onPlayTest={handlePlayTest}
            onStopTest={handleStopTest}
            onEndedPlay={() => setIsPlayingTest(false)}
            audioRef={testAudioRef}
          />

          {/* Action Button to start real interview */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => requestPermission(selectedDevice)}
              className="p-3 dark:bg-[#1e293b] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl border border-gray-200 transition-colors"
              title="Làm mới mic"
              disabled={isSubmitting || isRecordingTest || isPlayingTest}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onProceed}
              disabled={isSubmitting || isRecordingTest}
              className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl hover:shadow-lg transition-all hover:scale-[1.01] disabled:from-sky-300 disabled:to-sky-400 disabled:pointer-events-none disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đăng ký Voice Session...</span>
                </>
              ) : (
                <span>Tôi đã sẵn sàng & Bắt đầu phỏng vấn</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
