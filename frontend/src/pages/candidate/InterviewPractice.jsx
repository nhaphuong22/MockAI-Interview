import { useState } from "react";
import { MicrophoneSetup } from "../../components/ai/MicrophoneSetup";
import { InterviewSelection } from "../../components/interview/InterviewSelection";
import { InterviewInfoInput } from "../../components/interview/InterviewInfoInput";
import { InterviewSession } from "../../components/interview/InterviewSession";
import { InterviewFeedback } from "../../components/interview/InterviewFeedback";
import { createVoiceSessionApi } from "../../api/voiceSession";
import { initInterviewApi } from "../../api/interviewApi";

const defaultQuestions = [
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
    questions: 5,
    duration: "15 phút",
  },
  {
    id: 2,
    date: "2026-05-08",
    position: "Full Stack Developer",
    score: 82,
    questions: 5,
    duration: "14 phút",
  },
];

/**
 * InterviewPractice Page
 * Root container for candidate interview practice flows.
 * Manages mode state switching: select -> info-input -> setup (if voice) -> practicing -> feedback.
 */
export function InterviewPractice() {
  const [mode, setMode] = useState("select"); // modes: select, info-input, setup, practicing, feedback
  const [interviewType, setInterviewType] = useState(null); // type: text or voice
  const [questions, setQuestions] = useState(defaultQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startInterview = (type) => {
    setInterviewType(type);
    setMode("info-input");
  };

  const handleProceedInfo = async (info) => {
    setIsSubmitting(true);
    try {
      // Call backend to initialize the interview and retrieve custom generated questions
      const response = await initInterviewApi({
        customPosition: info.position,
        customSkills: info.skills,
        experienceLevel: info.level,
        type: "PRACTICE"
      });

      const interviewData = response.data;
      setInterviewId(interviewData.id);

      if (interviewData.questions && interviewData.questions.length > 0) {
        const questionTexts = interviewData.questions.map(q => q.question_text);
        setQuestions(questionTexts);
      } else {
        setQuestions(defaultQuestions);
      }

      if (interviewType === "voice") {
        setMode("setup");
      } else {
        setMode("practicing");
      }
    } catch (error) {
      console.error("Error initializing interview:", error);
      // Fallback in case of API failure so the user can still practice
      setQuestions(defaultQuestions);
      if (interviewType === "voice") {
        setMode("setup");
      } else {
        setMode("practicing");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedVoice = async () => {
    setIsSubmitting(true);
    try {
      // Register voice session with the dynamically created interview ID
      const targetId = interviewId || 1;
      const response = await createVoiceSessionApi(targetId);
      console.log("Voice session registered successfully:", response.data);
      setMode("practicing");
    } catch (error) {
      console.error("Error registering voice session:", error);
      // Fallback
      setMode("practicing");
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
      />
    );
  }


  // 4. Post-interview feedback display
  if (mode === "feedback") {
    return (
      <InterviewFeedback 
        questions={questions} 
        onRetry={handleRetry} 
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

