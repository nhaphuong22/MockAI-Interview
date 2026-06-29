import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MicrophoneSetup } from "../../components/ai/MicrophoneSetup";
import { InterviewSelection } from "../../components/interview/InterviewSelection";
import { InterviewInfoInput } from "../../components/interview/InterviewInfoInput";
import { InterviewSession } from "../../components/interview/InterviewSession";
import { InterviewFeedback } from "../../components/interview/InterviewFeedback";
import { createVoiceSessionApi } from "../../api/voiceSession";
import { initInterviewApi, getInterviewHistoryApi } from "../../api/interviewApi";
import { useUiStore } from "../../store/useUiStore";

/**
 * InterviewPractice Page
 * Root container for candidate interview practice flows.
 * Manages mode state switching: select -> info-input -> setup (if voice) -> practicing -> feedback.
 */
export function InterviewPractice() {
  const [mode, setMode] = useState("select"); // modes: select, info-input, setup, practicing, feedback
  const [interviewType, setInterviewType] = useState("voice"); // type is always voice now
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [voiceSessionId, setVoiceSessionId] = useState(null);
  const [assessment, setAssessment] = useState(null); // stores Cloudinary JSON assessment data
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiVoice, setAiVoice] = useState("vi-VN-female");
  const [historySessions, setHistorySessions] = useState([]);
  const location = useLocation();
  const [hasProcessedState, setHasProcessedState] = useState(false);

  const loadHistory = async () => {
    try {
      const response = await getInterviewHistoryApi();
      if (response && response.data) {
        setHistorySessions(response.data);
      } else if (response) {
        setHistorySessions(response);
      }
    } catch (error) {
      console.error("Error loading interview history:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, []);

  useEffect(() => {
    if (location.state?.viewSessionId && historySessions.length > 0 && !hasProcessedState) {
      const session = historySessions.find(s => s.id === Number(location.state.viewSessionId));
      if (session) {
        setAssessment(session);
        if (session.qa_details && session.qa_details.length > 0) {
          setQuestions(session.qa_details.map((q, idx) => ({
            id: q.question_id || idx,
            question_text: q.question,
            expected_answer: ""
          })));
        }
        setVoiceSessionId(session.id);
        setMode("feedback");
        setHasProcessedState(true);
      }
    }
  }, [location.state, historySessions, hasProcessedState]);

  useEffect(() => {
    if (location.state?.autoStartSkill && !hasProcessedState) {
      const autoStart = async () => {
        setIsSubmitting(true);
        try {
          console.log(`[Practice] Tự động khởi tạo phỏng vấn thử cho kỹ năng: ${location.state.autoStartSkill}`);
          
          const formattedQuestions = location.state.skillQuestions?.map(q => ({
            question_text: q.question_text || q.question || "",
            expected_answer: q.expected_answer || ""
          })) || [];

          const response = await initInterviewApi({
            customPosition: `Luyện tập kỹ năng ${location.state.autoStartSkill}`,
            customSkills: [location.state.autoStartSkill],
            experienceLevel: "JUNIOR",
            cvId: null,
            cvText: "",
            type: "PRACTICE",
            questions: formattedQuestions
          });
          const interviewData = response.data;
          setInterviewId(interviewData.id);

          if (interviewData.questions && interviewData.questions.length > 0) {
            setQuestions(interviewData.questions);
          } else {
            throw new Error("Không nhận được danh sách câu hỏi hợp lệ từ AI.");
          }

          setMode("setup");
          setHasProcessedState(true);
        } catch (error) {
          console.error("Error auto-initializing interview:", error);
          alert(`Tự động khởi tạo phỏng vấn thất bại: ${error.message || "Chưa cấu hình API Key Groq"}`);
          setMode("select");
        } finally {
          setIsSubmitting(false);
        }
      };

      autoStart();
    }
  }, [location.state, hasProcessedState]);

  const { setHideNavbar } = useUiStore();

  useEffect(() => {
    // Hide navbar only during setup and practicing modes
    if (mode === "setup" || mode === "practicing") {
      setHideNavbar(true);
    } else {
      setHideNavbar(false);
    }

    // Restore navbar on unmount
    return () => {
      setHideNavbar(false);
    };
  }, [mode, setHideNavbar]);

  const startInterview = () => {
    setInterviewType("voice");
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
        companyName: info.companyName || "",
        jobDescription: info.jobDescription || "",
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

      setMode("setup");
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

  const handleNextQuestion = (newQuestions) => {
    const activeQuestions = newQuestions || questions;
    if (newQuestions) {
      setQuestions(newQuestions);
    }
    if (currentQuestion < activeQuestions.length - 1) {
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
    loadHistory(); // Tải lại lịch sử ngay sau khi hoàn thành hoặc bắt đầu lại
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
      previousSessions={historySessions} 
      onViewDetail={(session) => {
        setAssessment(session);
        // Map các câu hỏi đã trả lời để hiển thị lại
        if (session.qa_details && session.qa_details.length > 0) {
          setQuestions(session.qa_details.map((q, idx) => ({
            id: q.question_id || idx,
            question_text: q.question,
            expected_answer: ""
          })));
        }
        setVoiceSessionId(session.id);
        setMode("feedback");
      }}
    />
  );
}
