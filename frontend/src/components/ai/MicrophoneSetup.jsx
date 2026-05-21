import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, 
  Settings, 
  Play, 
  Square, 
  Volume2, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Loader2 
} from "lucide-react";

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
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRecordingTest, setIsRecordingTest] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const testChunksRef = useRef([]);
  const testAudioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamForRecordingRef = useRef(null);

  // Request microphone permissions and list devices
  // Stop all active tracks to release device
  const stopAllAudioTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (streamForRecordingRef.current) {
      streamForRecordingRef.current.getTracks().forEach(track => track.stop());
      streamForRecordingRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  // Initialize Audio Context & Analyser for real-time visualizer
  const initAudioVisualizer = useCallback((stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // Scale to 0-100 percentage range with high sensitivity for voice
        const percentage = Math.min(Math.round((average / 128) * 100), 100);
        setAudioLevel(percentage);
        
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();

    } catch (e) {
      console.error("Failed to initialize audio context for visualizer", e);
    }
  }, []);

  // Request microphone permissions and list devices
  const requestPermission = useCallback(async (deviceId = "") => {
    try {
      setErrorMessage("");
      
      // Stop existing streams first
      stopAllAudioTracks();

      const constraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPermissionGranted(true);

      // Initialize Web Audio API for visualizer
      initAudioVisualizer(stream);

      // Get available audio devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = allDevices.filter(device => device.kind === "audioinput");
      setDevices(audioInputDevices);

      // Set initially selected device
      if (audioInputDevices.length > 0) {
        const currentTrack = stream.getAudioTracks()[0];
        const activeDeviceId = currentTrack.getSettings().deviceId;
        
        // Find if current settings device matches any enumerated device ID
        const match = audioInputDevices.find(d => d.deviceId === activeDeviceId || d.label === currentTrack.label);
        setSelectedDevice(match ? match.deviceId : audioInputDevices[0].deviceId);
      }

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setPermissionGranted(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Quyền truy cập Microphone bị từ chối. Hãy cấp quyền cho trình duyệt trong cài đặt.");
      } else {
        setErrorMessage("Không tìm thấy thiết bị Microphone hoạt động. Hãy kiểm tra lại kết nối.");
      }
    }
  }, [stopAllAudioTracks, initAudioVisualizer]);

  // Switch microphone device when user selects from dropdown
  const handleDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setSelectedDevice(deviceId);
    if (deviceId) {
      await requestPermission(deviceId);
    }
  };

  // Start temporary 3-second recording to test audio playback quality
  const startTestRecording = async () => {
    try {
      setTestAudioUrl(null);
      testChunksRef.current = [];
      
      const constraints = {
        audio: selectedDevice ? { deviceId: { exact: selectedDevice } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamForRecordingRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          testChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(testChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setTestAudioUrl(audioUrl);
        setIsRecordingTest(false);
        
        // Cleanup recording stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingTest(true);

      // Auto-stop recording after 3 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 3000);

    } catch (err) {
      console.error("Error recording test audio:", err);
      setIsRecordingTest(false);
    }
  };

  const playTestAudio = () => {
    if (testAudioRef.current && testAudioUrl) {
      testAudioRef.current.play();
      setIsPlayingTest(true);
    }
  };

  const stopTestAudio = () => {
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      testAudioRef.current.currentTime = 0;
      setIsPlayingTest(false);
    }
  };

  useEffect(() => {
    // Initial permission request - using setTimeout to avoid calling setState synchronously in effect
    const timer = setTimeout(() => {
      requestPermission();
    }, 0);

    return () => {
      clearTimeout(timer);
      stopAllAudioTracks();
      stopTestAudio();
    };
  }, [requestPermission, stopAllAudioTracks]);

  return (
    <div className="max-w-xl w-full mx-auto bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />

      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 text-[#0ea5e9]">
          <Settings className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Kiểm Tra Thiết Bị</h2>
        <p className="text-sm text-gray-500 mt-1">Đảm bảo giọng nói của bạn rõ ràng trước khi vào phỏng vấn</p>
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
          <p className="text-gray-600 mb-4">Vui lòng cấp quyền truy cập microphone để hệ thống ghi âm câu trả lời phỏng vấn.</p>
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
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Chọn thiết bị Microphone</label>
            <div className="relative">
              <select
                value={selectedDevice}
                onChange={handleDeviceChange}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 text-sm focus:border-[#0ea5e9] focus:outline-none appearance-none cursor-pointer transition-colors"
              >
                {devices.length === 0 ? (
                  <option value="">Đang tải thiết bị...</option>
                ) : (
                  devices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Mic className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Real-time Audio Level Meter (Ocean Blue style visualizer) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Âm lượng đầu vào (Mic Level)</label>
              <span className="text-xs font-medium text-gray-500">{audioLevel > 5 ? "Mic tốt" : "Hãy nói thử"}</span>
            </div>
            
            <div className="h-10 bg-gray-50 rounded-xl flex items-center px-4 gap-1.5 border border-gray-100">
              <Volume2 className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
              <div className="flex-1 flex items-end justify-between h-6 gap-0.5">
                {Array.from({ length: 30 }).map((_, index) => {
                  // Active state calculation based on audio level
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
                        // Add organic layout for active mic visualizer (using stable pseudo-random factor to avoid Math.random purity error)
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

          {/* Record & Playback Test Section */}
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
                onClick={startTestRecording}
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
                  onClick={isPlayingTest ? stopTestAudio : playTestAudio}
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
                ref={testAudioRef}
                src={testAudioUrl}
                onEnded={() => setIsPlayingTest(false)}
                className="hidden"
              />
            )}
          </div>

          {/* Action Button to start real interview */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => requestPermission(selectedDevice)}
              className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl border border-gray-150 transition-colors"
              title="Làm mới mic"
              disabled={isSubmitting}
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
