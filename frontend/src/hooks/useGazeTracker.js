import { useState, useEffect, useRef } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * Custom React hook for tracking candidate gaze and head pose using MediaPipe Face Landmarker.
 * Detects gaze deviation and triggers warnings when candidate looks away from the screen.
 * 
 * @param {Object} options Configuration parameters
 * @param {boolean} options.isActive Whether tracking is currently active
 * @param {Function} options.onViolation Triggered when a new violation is registered (after cooldown)
 * @param {Function} options.onWarning Triggered when candidate enters/leaves violation warning state
 * @param {Function} options.onCameraError Triggered on webcam access errors or stream loss
 */
export function useGazeTracker({
  isActive = false,
  onViolation = () => {},
  onWarning = () => {},
  onCameraError = () => {}
}) {
  const [gazeViolations, setGazeViolations] = useState(0);
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(true);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const requestRef = useRef(null);
  
  // Timer for track duration of look-away
  const violationTimerRef = useRef(null);
  const violationStartTimestampRef = useRef(null);
  
  // Cooldown tracker (3 seconds) to prevent multiple violations registered in rapid succession
  const cooldownEndTimestampRef = useRef(0);

  // Save callbacks in refs to avoid triggering useEffects on reference changes
  const onViolationRef = useRef(onViolation);
  const onWarningRef = useRef(onWarning);
  const onCameraErrorRef = useRef(onCameraError);

  useEffect(() => {
    onViolationRef.current = onViolation;
    onWarningRef.current = onWarning;
    onCameraErrorRef.current = onCameraError;
  }, [onViolation, onWarning, onCameraError]);

  // Initialize MediaPipe model
  useEffect(() => {
    let active = true;

    async function initModel() {
      if (!isActive) return;
      try {
        setIsLoadingModel(true);
        console.log("Loading MediaPipe Fileset Resolver...");
        
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        
        console.log("Loading MediaPipe Face Landmarker task file...");
        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false
        });

        if (active) {
          landmarkerRef.current = landmarker;
          console.log("MediaPipe Face Landmarker model initialized successfully!");
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe Face Landmarker:", err);
      } finally {
        if (active) setIsLoadingModel(false);
      }
    }

    initModel();

    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [isActive]);

  // Start/Stop Webcam Stream
  useEffect(() => {
    async function startCamera() {
      if (!isActive) return;
      try {
        console.log("Accessing candidate camera...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 24 }
          },
          audio: false
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
        
        // Listen to camera end/abort events
        stream.getVideoTracks()[0].onended = () => {
          console.warn("Camera stream ended abruptly!");
          setIsCameraActive(false);
          onCameraErrorRef.current("Mất kết nối Camera. Vui lòng bật lại camera để tiếp tục!");
        };

      } catch (err) {
        console.error("Webcam access error:", err);
        setIsCameraActive(false);
        onCameraErrorRef.current("Không thể truy cập Camera. Vui lòng cấp quyền camera để phỏng vấn!");
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    };
  }, [isActive]);

  // Frame processing loop
  useEffect(() => {
    if (!isActive || !isCameraActive || !landmarkerRef.current) return;

    let lastVideoTime = -1;

    const processFrame = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && video.readyState >= 2 && landmarker) {
        const videoTime = video.currentTime;
        
        // Process only when frame updates to save CPU cycles and throttle to 10 FPS (100ms)
        const now = performance.now();
        if (videoTime !== lastVideoTime && now - (video.lastDetectTime || 0) >= 100) {
          lastVideoTime = videoTime;
          video.lastDetectTime = now;
          
          try {
            const results = landmarker.detectForVideo(video, now);
            
            if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
              setIsFaceDetected((prev) => prev === true ? prev : true);
              const landmarks = results.faceLandmarks[0];
              
              // 1. Analyze Head Pose (Xoay đầu)
              // Forehead (10), Chin (152), Left Cheek (234), Right Cheek (454), Nose Tip (1)
              const nose = landmarks[1];
              const forehead = landmarks[10];
              const chin = landmarks[152];
              const leftCheek = landmarks[234];
              const rightCheek = landmarks[454];

              if (nose && forehead && chin && leftCheek && rightCheek) {
                // Horizontal head pose (Yaw) - normalized ratio
                const horizontalWidth = rightCheek.x - leftCheek.x;
                const yawRatio = horizontalWidth > 0 
                  ? (nose.x - (leftCheek.x + rightCheek.x) / 2) / horizontalWidth 
                  : 0;

                // Vertical head pose (Pitch) - normalized ratio
                const verticalHeight = chin.y - forehead.y;
                const pitchRatio = verticalHeight > 0 
                  ? (nose.y - (forehead.y + chin.y) / 2) / verticalHeight 
                  : 0;

                // 2. Analyze Gaze Direction (Liếc mắt)
                // Left Eye: Outer Corner (33), Inner Corner (133), Iris Center (468)
                // Right Eye: Inner Corner (263), Outer Corner (362), Iris Center (473)
                const leftCornerL = landmarks[33];
                const rightCornerL = landmarks[133];
                const irisL = landmarks[468];

                const leftCornerR = landmarks[263];
                const rightCornerR = landmarks[362];
                const irisR = landmarks[473];

                let eyeDeviation = 0;
                if (leftCornerL && rightCornerL && irisL && leftCornerR && rightCornerR && irisR) {
                  const widthL = rightCornerL.x - leftCornerL.x;
                  const ratioL = widthL > 0 ? (irisL.x - leftCornerL.x) / widthL : 0.5;

                  const widthR = rightCornerR.x - leftCornerR.x;
                  const ratioR = widthR > 0 ? (irisR.x - leftCornerR.x) / widthR : 0.5;

                  // Average iris deviation from center (normal looks straight -> 0.5)
                  const devL = Math.abs(ratioL - 0.5);
                  const devR = Math.abs(ratioR - 0.5);
                  eyeDeviation = (devL + devR) / 2;
                }

                // Threshold boundaries check
                // Yaw limit: 18 deg -> approx 0.18 ratio
                // Pitch limit: 15 deg -> approx 0.12 ratio
                // Gaze deviation limit: approx 0.11 deviation from iris center
                const isLookingAway = 
                  Math.abs(yawRatio) > 0.18 || 
                  pitchRatio > 0.15 || // Look down threshold
                  pitchRatio < -0.11 || // Look up threshold
                  eyeDeviation > 0.125;

                if (isLookingAway) {
                  // Trigger warning start timer
                  if (!violationStartTimestampRef.current) {
                    violationStartTimestampRef.current = Date.now();
                  } else {
                    const elapsed = Date.now() - violationStartTimestampRef.current;
                    
                    // If looking away for continuous 1.5 seconds
                    if (elapsed >= 1500) {
                      if (!isWarningActive) {
                        setIsWarningActive(true);
                        onWarningRef.current(true);
                      }

                      // Check cooldown before incrementing violations
                      const now = Date.now();
                      if (now > cooldownEndTimestampRef.current) {
                        setGazeViolations((prev) => {
                          const updated = prev + 1;
                          onViolationRef.current(updated);
                          return updated;
                        });
                        // Cooldown 3 seconds
                        cooldownEndTimestampRef.current = now + 3000;
                      }
                    }
                  }
                } else {
                  // Candidate looks back straight: reset timers and warnings
                  if (violationStartTimestampRef.current) {
                    violationStartTimestampRef.current = null;
                  }
                  if (isWarningActive) {
                    setIsWarningActive(false);
                    onWarningRef.current(false);
                  }
                }
              }
            } else {
              // No face detected: can also count as look away warning if face disappears
              setIsFaceDetected((prev) => prev === false ? prev : false);
              
              if (!violationStartTimestampRef.current) {
                violationStartTimestampRef.current = Date.now();
              } else {
                const elapsed = Date.now() - violationStartTimestampRef.current;
                
                // If face not detected for continuous 1.5 seconds
                if (elapsed >= 1500) {
                  if (!isWarningActive) {
                    setIsWarningActive(true);
                    onWarningRef.current(true);
                  }

                  // Check cooldown before incrementing violations
                  const now = Date.now();
                  if (now > cooldownEndTimestampRef.current) {
                    setGazeViolations((prev) => {
                      const updated = prev + 1;
                      onViolationRef.current(updated);
                      return updated;
                    });
                    // Cooldown 3 seconds
                    cooldownEndTimestampRef.current = now + 3000;
                  }
                }
              }
            }
          } catch (err) {
            console.debug("Frame processing error ignored:", err);
          }
        }
      }

      requestRef.current = requestAnimationFrame(processFrame);
    };

    requestRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (violationTimerRef.current) {
        clearTimeout(violationTimerRef.current);
      }
    };
  }, [isActive, isCameraActive, isWarningActive]);

  const resetViolations = () => {
    setGazeViolations(0);
    setIsWarningActive(false);
    setIsFaceDetected(true);
    violationStartTimestampRef.current = null;
  };

  return {
    videoRef,
    gazeViolations,
    isWarningActive,
    isCameraActive,
    isLoadingModel,
    isFaceDetected,
    resetViolations
  };
}
