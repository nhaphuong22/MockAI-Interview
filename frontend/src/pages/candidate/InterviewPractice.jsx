import { useState } from "react";
import { MicrophoneSetup } from "../../components/ai/MicrophoneSetup";
import { InterviewSelection } from "../../components/interview/InterviewSelection";
import { InterviewSession } from "../../components/interview/InterviewSession";
import { InterviewFeedback } from "../../components/interview/InterviewFeedback";
import { createVoiceSessionApi } from "../../api/voiceSession";

const mockQuestions = [
  "Hãy giới thiệu về bản thân bạn",
  "Tại sao bạn muốn làm việc ở vị trí này?",
  "Điểm mạnh và điểm yếu của bạn là gì?",
  "Kể về một dự án bạn tự hào nhất",
  "Bạn xử lý xung đột trong team như thế nào?",
];

const previousSessions = [
  {
    id: 1,
    date: "2026-05-10",
    position: "Senior Frontend Developer",
    score: 88,
    questions: 10,
    duration: "15 phút",
  },
  {
    id: 2,
    date: "2026-05-08",
    position: "Full Stack Developer",
    score: 82,
    questions: 10,
    duration: "14 phút",
  },
];

/**
 * InterviewPractice Page
 * Root container for candidate interview practice flows.
 * Manages mode state switching: select -> setup (if voice) -> practicing -> feedback.
 */
export function InterviewPractice() {
  const [mode, setMode] = useState("select"); // modes: select, setup, practicing, feedback
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewType, setInterviewType] = useState(null); // type: text or voice
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startInterview = (type) => {
    setInterviewType(type);
    if (type === "voice") {
      setMode("setup");
    } else {
      setMode("practicing");
    }
  };

  const handleProceedVoice = async () => {
    setIsSubmitting(true);
    try {
      // Register voice session with sample interview_id 1
      const response = await createVoiceSessionApi(1);
      console.log("Voice session registered successfully:", response.data);
      setMode("practicing");
    } catch (error) {
      console.error("Error registering voice session:", error);
      // Fallback so candidate can still practice even if API fails
      setMode("practicing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
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
  };

  // 1. Setup UI for microphone device tests
  if (mode === "setup") {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4 flex items-center justify-center">
        <MicrophoneSetup 
          onProceed={handleProceedVoice} 
          isSubmitting={isSubmitting} 
        />
      </div>
    );
  }

  // 2. Active practice session (either text input or voice recording)
  if (mode === "practicing") {
    return (
      <InterviewSession
        interviewType={interviewType}
        currentQuestion={currentQuestion}
        questions={mockQuestions}
        onNext={handleNextQuestion}
        onCancel={handleCancelInterview}
      />
    );
  }

  // 3. Post-interview feedback display
  if (mode === "feedback") {
    return (
      <InterviewFeedback 
        questions={mockQuestions} 
        onRetry={handleRetry} 
      />
    );
  }

  // 4. Initial landing view: Select mode and review history
  return (
    <InterviewSelection 
      onStartInterview={startInterview} 
      previousSessions={previousSessions} 
    />
  );
}
