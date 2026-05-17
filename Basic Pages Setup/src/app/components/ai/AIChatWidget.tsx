import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const quickReplies = [
  "Tìm việc IT",
  "Hướng dẫn tạo CV",
  "Cách nộp đơn",
  "Luyện phỏng vấn",
];

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Xin chào! Mình là AI tư vấn của JobBridge. Mình có thể giúp gì cho bạn?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: `Cảm ơn bạn đã hỏi về "${messageText}". Để giúp bạn tốt hơn, bạn có thể cung cấp thêm thông tin không?`,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#E8580C]" />
                </div>
                <div>
                  <div className="text-white font-semibold">JobBridge AI</div>
                  <div className="text-xs text-white/90 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#E8580C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-[#E8580C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-[#E8580C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSend(reply)}
                      className="px-3 py-1.5 bg-white border-2 border-gray-200 rounded-full text-sm hover:border-[#E8580C] hover:bg-[#FFF3ED] hover:text-[#E8580C] transition-all"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-[#E8580C]/50 transition-all"
      >
        <div className="absolute inset-0 rounded-full bg-[#E8580C] animate-ping opacity-20"></div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
      </motion.button>
    </>
  );
}
