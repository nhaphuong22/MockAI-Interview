import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to manage microphone permissions, device selection,
 * real-time volume level analyzing, and a 3-second recording test.
 */
export function useMicrophone() {
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
  const animationFrameRef = useRef(null);
  const streamForRecordingRef = useRef(null);

  // Stop all active audio tracks and release resources
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

  // Initialize Web Audio API Analyser for real-time visualizer
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
      
      // Stop existing streams first to prevent conflicts
      stopAllAudioTracks();

      // Check if bypass mic is requested for headless test/dev environments
      const hasBypass = typeof window !== 'undefined' && 
        (window.location.search.includes("bypassMic=true") || localStorage.getItem("bypassMic") === "true");

      if (hasBypass) {
        console.warn("Bypassing microphone access for testing/headless mode.");
        setPermissionGranted(true);
        setDevices([{ deviceId: "mock-mic", label: "Mock Microphone (Test Mode)", kind: "audioinput" }]);
        setSelectedDevice("mock-mic");
        return;
      }

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
  const handleDeviceChange = useCallback(async (deviceId) => {
    setSelectedDevice(deviceId);
    if (deviceId) {
      await requestPermission(deviceId);
    }
  }, [requestPermission]);

  // Start temporary 3-second recording to test audio playback quality
  const startTestRecording = useCallback(async () => {
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
  }, [selectedDevice]);

  const playTestAudio = useCallback((audioElement) => {
    if (audioElement && testAudioUrl) {
      audioElement.play();
      setIsPlayingTest(true);
    }
  }, [testAudioUrl]);

  const stopTestAudio = useCallback((audioElement) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlayingTest(false);
    }
  }, []);

  useEffect(() => {
    // Initial permission request
    const timer = setTimeout(() => {
      requestPermission();
    }, 0);

    return () => {
      clearTimeout(timer);
      stopAllAudioTracks();
    };
  }, [requestPermission, stopAllAudioTracks]);

  return {
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
    stopTestAudio,
    stopAllAudioTracks
  };
}
