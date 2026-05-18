import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Camera, Mic, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as Progress from "@radix-ui/react-progress";
import confetti from "canvas-confetti";

interface AIGatekeeperInterviewProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  companyLogo: string;
  companyName: string;
  minScore: number;
}

const interviewQuestions = [
  {
    id: 1,
    question: "Hãy giới thiệu bản thân và kinh nghiệm làm việc của bạn",
    category: "Giới thiệu",
    timeLimit: 180,
  },
  {
    id: 2,
    question: "Tại sao bạn muốn ứng tuyển vào vị trí này?",
    category: "Động lực",
    timeLimit: 120,
  },
  {
    id: 3,
    question: "Kể về một dự án bạn tự hào nhất và vai trò của bạn",
    category: "Kỹ thuật",
    timeLimit: 180,
  },
  {
    id: 4,
    question: "Bạn xử lý tình huống áp lực deadline như thế nào?",
    category: "Hành vi",
    timeLimit: 120,
  },
  {
    id: 5,
    question: "Điểm mạnh của bạn là gì và bạn đã áp dụng nó ra sao?",
    category: "Kỹ năng",
    timeLimit: 120,
  },
];

export function AIGatekeeperInterview({
  isOpen,
  onClose,
  jobTitle,
  companyLogo,
  companyName,
  minScore,
}: AIGatekeeperInterviewProps) {
  const [stage, setStage] = useState<"intro" | "interview" | "result">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(interviewQuestions[0].timeLimit);
  const [finalScore, setFinalScore] = useState(0);

  const startInterview = () => {
    setStage("interview");
  };

  const submitAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(interviewQuestions[currentQuestion + 1].timeLimit);
    } else {
      const score = Math.floor(Math.random() * 30) + 70;
      setFinalScore(score);
      setStage("result");
      if (score >= minScore) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#E8580C", "#ff7a3d", "#FFD700"],
        });
      }
    }
  };

  const progress = ((currentQuestion + 1) / interviewQuestions.length) * 100;
  const currentQ = interviewQuestions[currentQuestion];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
          <AnimatePresence mode="wait">
            {stage === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <Dialog.Title className="text-3xl mb-6 text-center">
                  Công Ty Này Yêu Cầu Phỏng Vấn AI
                </Dialog.Title>

                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-2xl flex items-center justify-center text-3xl">
                    {companyLogo}
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{jobTitle}</div>
                    <div className="text-gray-600">{companyName}</div>
                  </div>
                </div>

                <div className="bg-orange-50 border-2 border-[#E8580C] rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold mb-4 text-lg">Thông Tin Phỏng Vấn</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#E8580C] rounded-full"></div>
                      <span>Số câu hỏi: <strong>{interviewQuestions.length} câu</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#E8580C] rounded-full"></div>
                      <span>Thời gian: <strong>~15 phút</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#E8580C] rounded-full"></div>
                      <span>Điểm tối thiểu: <strong>{minScore}%</strong></span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold mb-4">Yêu Cầu Kỹ Thuật</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Camera className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm">Camera (khuyến nghị)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mic className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm">Microphone (khuyến nghị)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={startInterview}
                    className="flex-1 py-4 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl text-lg hover:shadow-xl transition-all"
                  >
                    Bắt Đầu Phỏng Vấn
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl text-lg hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all"
                  >
                    Để Sau
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "interview" && (
              <motion.div
                key="interview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[90vh] flex flex-col"
              >
                <div className="bg-gray-800 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#E8580C] rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{companyName}</div>
                      <div className="text-sm text-gray-400">{jobTitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className={timeLeft < 30 ? "text-red-400" : ""}>{timeLeft}s</span>
                    </div>
                    <span>Câu {currentQuestion + 1}/{interviewQuestions.length}</span>
                  </div>
                </div>

                <Progress.Root className="h-1 bg-gray-700">
                  <Progress.Indicator
                    className="h-full bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </Progress.Root>

                <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
                  <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-2xl p-8 mb-6">
                      <div className="text-sm text-[#E8580C] mb-3">
                        Câu Hỏi {currentQuestion + 1}
                      </div>
                      <h2 className="text-3xl mb-4">{currentQ.question}</h2>
                      <div className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {currentQ.category}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6">
                      <textarea
                        placeholder="Nhập câu trả lời của bạn..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none resize-none"
                        rows={6}
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                          <span className="text-[#E8580C] font-semibold">Gợi ý:</span> Trả lời rõ ràng, cụ thể và liên quan đến câu hỏi
                        </div>
                        <button
                          onClick={() => submitAnswer("Sample answer")}
                          className="px-8 py-2 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          {currentQuestion < interviewQuestions.length - 1 ? "Tiếp Theo" : "Hoàn Thành"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {stage === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                {finalScore >= minScore ? (
                  <>
                    <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>
                    <h2 className="text-4xl mb-4">CHÚC MỪNG!</h2>
                    <p className="text-xl text-gray-600 mb-8">
                      Bạn đã đạt ngưỡng điểm. Đơn của bạn đã được gửi!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-16 h-16 text-[#E8580C]" />
                    </div>
                    <h2 className="text-4xl mb-4">Rất Tiếc</h2>
                    <p className="text-xl text-gray-600 mb-8">
                      Bạn chưa đạt ngưỡng điểm tối thiểu ({minScore}%). Thử lại sau 7 ngày.
                    </p>
                  </>
                )}

                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                  <div className="text-6xl mb-2 text-[#E8580C]">{finalScore}</div>
                  <div className="text-gray-600">Điểm của bạn / 100</div>
                </div>

                <div className="flex gap-4">
                  {finalScore >= minScore ? (
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Xem Đơn Ứng Tuyển
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        Luyện Thêm Với AI
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#E8580C] hover:bg-[#FFF3ED] transition-all"
                      >
                        Tìm Việc Khác
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
