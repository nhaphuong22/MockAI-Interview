import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Camera, Mic, CheckCircle2, XCircle, Clock, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Progress from "@radix-ui/react-progress";
import confetti from "canvas-confetti";

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
];

export function AIGatekeeperInterview({
  isOpen,
  onClose,
  jobTitle,
  companyLogo,
  companyName,
  minScore = 70,
}) {
  const [stage, setStage] = useState("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(interviewQuestions[0].timeLimit);
  const [finalScore, setFinalScore] = useState(0);

  const startInterview = () => {
    setStage("interview");
  };

  const submitAnswer = (answer) => {
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
          colors: ["#0ea5e9", "#38bdf8", "#FFD700"],
        });
      }
    }
  };

  const progress = ((currentQuestion + 1) / interviewQuestions.length) * 100;
  const currentQ = interviewQuestions[currentQuestion];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden outline-none">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] z-10"></div>
          
          <AnimatePresence mode="wait">
            {stage === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-10"
              >
                <div className="flex items-center gap-2 text-[#0ea5e9] font-bold text-sm mb-6 bg-sky-50 w-fit px-4 py-2 rounded-full border border-sky-100">
                  <Sparkles className="w-4 h-4" />
                  <span>AI GATEKEEPER INTERVIEW</span>
                </div>

                <Dialog.Title className="text-4xl font-bold mb-6 text-gray-900">
                  Phỏng Vấn Sơ Loại Với AI
                </Dialog.Title>

                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8 rounded-r-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-bold text-orange-700 text-sm">TÍNH NĂNG ĐANG PHÁT TRIỂN</div>
                    <div className="text-orange-600 text-xs mt-1">
                      Phiên bản thử nghiệm (Beta). Kết quả phỏng vấn hiện đang được mô phỏng để minh họa luồng công việc.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-gray-100">
                    {companyLogo}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{jobTitle}</div>
                    <div className="text-lg text-gray-600 font-medium">{companyName}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Số câu hỏi</div>
                    <div className="text-xl font-bold text-gray-900">{interviewQuestions.length} Câu</div>
                  </div>
                  <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Điểm yêu cầu</div>
                    <div className="text-xl font-bold text-[#0ea5e9]">{minScore}%</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={startInterview}
                    className="flex-1 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl text-lg font-bold hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Bắt Đầu Phỏng Vấn
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl text-lg font-bold hover:bg-gray-50 transition-all"
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
                className="h-[80vh] flex flex-col"
              >
                <div className="bg-gray-900 px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#0ea5e9]" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{companyName}</div>
                      <div className="text-xs text-gray-400 font-medium">{jobTitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-white">
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Thời gian còn lại</div>
                      <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 30 ? "text-red-400 animate-pulse" : "text-[#0ea5e9]"}`}>
                        <Clock className="w-5 h-5" />
                        <span>{timeLeft}s</span>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-white/10"></div>
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Tiến trình</div>
                      <div className="text-xl font-bold font-mono">
                        {currentQuestion + 1}<span className="text-gray-600">/{interviewQuestions.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-2 bg-gray-800">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex-1 flex items-center justify-center p-12 bg-gray-950">
                  <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-3xl p-10 mb-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Sparkles className="w-24 h-24" />
                      </div>
                      <div className="text-sm font-bold text-[#0ea5e9] mb-4 uppercase tracking-widest">
                        Câu Hỏi {currentQuestion + 1}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                        {currentQ.question}
                      </h2>
                      <div className="inline-flex px-4 py-1.5 bg-sky-50 text-[#0ea5e9] rounded-full text-xs font-bold border border-sky-100">
                        {currentQ.category}
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                      <textarea
                        placeholder="Nhập câu trả lời của bạn tại đây..."
                        className="w-full bg-transparent border-none text-white text-lg placeholder:text-gray-600 focus:ring-0 resize-none min-h-[150px]"
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                          </div>
                          AI đang lắng nghe...
                        </div>
                        <button
                          onClick={() => submitAnswer("Sample response")}
                          className="px-10 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all"
                        >
                          {currentQuestion < interviewQuestions.length - 1 ? "Câu Tiếp Theo" : "Hoàn Thành Phỏng Vấn"}
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
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center"
              >
                {finalScore >= minScore ? (
                  <>
                    <div className="w-28 h-28 mx-auto mb-8 bg-green-50 rounded-3xl flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">CHÚC MỪNG!</h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                      Bạn đã hoàn thành xuất sắc vòng phỏng vấn sơ loại. Hồ sơ của bạn đã được chuyển tới nhà tuyển dụng.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-28 h-28 mx-auto mb-8 bg-sky-50 rounded-3xl flex items-center justify-center shadow-inner">
                      <XCircle className="w-16 h-16 text-[#0ea5e9]" />
                    </div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">KẾT QUẢ</h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-md mx-auto">
                      Bạn chưa đạt ngưỡng điểm yêu cầu ({minScore}%). Đừng bỏ cuộc, hãy tiếp tục luyện tập và thử lại sau!
                    </p>
                  </>
                )}

                <div className="bg-gray-50 rounded-3xl p-10 mb-10 border border-gray-100 shadow-inner relative overflow-hidden">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">AI Assessment Score</div>
                  <div className="text-7xl font-black text-gray-900 mb-2">{finalScore}<span className="text-2xl text-gray-300 font-bold">/100</span></div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div key={s} className={`w-2 h-2 rounded-full ${s <= Math.round(finalScore/20) ? 'bg-[#0ea5e9]' : 'bg-gray-200'}`}></div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    {finalScore >= minScore ? "Quay lại Trang Việc Làm" : "Luyện Tập Với AI"}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Dialog.Close asChild>
            <button className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all outline-none">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
