import { useState } from "react";
import { MicrophoneSetup } from "../../components/ai/MicrophoneSetup";
import { InterviewSelection } from "../../components/interview/InterviewSelection";
import { InterviewInfoInput } from "../../components/interview/InterviewInfoInput";
import { InterviewSession } from "../../components/interview/InterviewSession";
import { InterviewFeedback } from "../../components/interview/InterviewFeedback";
import { createVoiceSessionApi } from "../../api/voiceSession";
import { initInterviewApi } from "../../api/interviewApi";

const previousSessions = [];

/**
 * InterviewPractice Page
 * Root container for candidate interview practice flows.
 * Manages mode state switching: select -> info-input -> setup (if voice) -> practicing -> feedback.
 */
export function InterviewPractice() {
  const [mode, setMode] = useState("select"); // modes: select, info-input, setup, practicing, feedback
  const [interviewType, setInterviewType] = useState(null); // type: text or voice
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [assessment, setAssessment] = useState(null); // stores Cloudinary JSON assessment data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiVoice, setAiVoice] = useState("vi-VN-female");

  const startInterview = (type) => {
    setInterviewType(type);
    setMode("info-input");
  };

  const handleProceedInfo = async (info) => {
    setIsSubmitting(true);
    if (info.aiVoice) {
      setAiVoice(info.aiVoice);
    }
    try {
      // Call backend to initialize the interview and retrieve custom generated questions
      const response = await initInterviewApi({
        customPosition: info.position,
        customSkills: info.skills,
        experienceLevel: info.level,
        cvId: info.cvId, // Truyền cvId động nếu có
        cvText: info.cvText, // Truyền trực tiếp CV text bóc tách từ sessionStorage
        type: "PRACTICE"
      });

      const interviewData = response.data;
      setInterviewId(interviewData.id);

      if (interviewData.questions && interviewData.questions.length > 0) {
        setQuestions(interviewData.questions);
      } else {
        throw new Error("Không nhận được danh sách câu hỏi hợp lệ từ AI.");
      }

      if (interviewType === "voice") {
        setMode("setup");
      } else {
        setMode("practicing");
      }
    } catch (error) {
      console.error("Error initializing interview:", error);
      alert(`Khởi tạo buổi phỏng vấn thất bại: ${error.message || "Lỗi hệ thống hoặc chưa cấu hình API Key Groq"}. Vui lòng thử lại.`);
      setMode("select");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedVoice = async () => {
    setIsSubmitting(true);
    try {
      if (!interviewId) {
        throw new Error("Không tìm thấy thông tin phiên phỏng vấn để tạo Voice Session.");
      }
      // Register voice session with the dynamically created interview ID
      const response = await createVoiceSessionApi(interviewId);
      console.log("Voice session registered successfully:", response.data);
      
      // Store the voice session ID in state to track later
      if (response && response.success && response.data) {
        setVoiceSessionId(response.data.id);
      } else if (response && response.data) {
        setVoiceSessionId(response.data.id);
      } else {
        throw new Error("Dữ liệu Voice Session trả về không hợp lệ.");
      }
      
      setMode("practicing");
    } catch (error) {
      console.error("Error registering voice session:", error);
      alert(`Không thể đăng ký phiên thoại Voice Session: ${error.message || "Lỗi hệ thống"}`);
      setMode("select");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setMode("feedback");
    }
  };

  const handleCancelInterview = () => {
    setMode("feedback");
  };

  const handleRetry = () => {
    setMode("select");
    setCurrentQuestion(0);
    setInterviewId(null);
    setVoiceSessionId(null);
    setAssessment(null);
  };

  // 1. Info Input Configuration Form
  if (mode === "info-input") {
    return (
      <div className="dark:bg-[#0a0f1c] bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center transition-colors duration-500">
        <InterviewInfoInput
          onProceed={handleProceedInfo}
          onBack={() => setMode("select")}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // 2. Setup UI for microphone device tests
  if (mode === "setup") {
    return (
      <div className="dark:bg-[#0a0f1c] bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center transition-colors duration-500">
        <MicrophoneSetup 
          onProceed={handleProceedVoice} 
          isSubmitting={isSubmitting} 
        />
      </div>
    );
  }

  // 3. Active practice session (either text input or voice recording)
  if (mode === "practicing") {
    return (
      <InterviewSession
        key={currentQuestion}
        interviewType={interviewType}
        currentQuestion={currentQuestion}
        questions={questions}
        onNext={handleNextQuestion}
        onCancel={handleCancelInterview}
        voiceSessionId={voiceSessionId}
        aiVoice={aiVoice}
        onFinish={(resultData) => {
          setAssessment(resultData);
          setMode("feedback");
        }}
      />
    );
  }

  // 4. Post-interview feedback display
  if (mode === "feedback") {
    return (
      <InterviewFeedback 
        questions={questions} 
        onRetry={handleRetry} 
        assessment={assessment}
        voiceSessionId={voiceSessionId}
      />
    );
  }

  // 5. Initial landing view: Select mode and review history
  return (
    <InterviewSelection 
      onStartInterview={startInterview} 
      previousSessions={previousSessions} 
    />
  );
}
