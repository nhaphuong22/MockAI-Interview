import { MessageSquare, X, Send, Sparkles, User, Bot, Minimize2, Maximize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI của MockAI. Tôi có thể giúp gì cho bạn hôm nay?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Giả lập AI phản hồi
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Cảm ơn bạn đã quan tâm. Đây là một phản hồi giả lập từ trợ lý AI. Hiện tại tính năng chatbot đang được phát triển để kết nối trực tiếp với mô hình AI cao cấp.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform group"
          >
            <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "64px" : "500px",
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">MockAI Assistant</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Trực tuyến
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          msg.role === "user" ? "bg-white text-gray-400" : "bg-[#0ea5e9] text-white"
                        }`}>
                          {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.role === "user" 
                            ? "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-tr-none" 
                            : "bg-white text-gray-700 border border-gray-100 rounded-tl-none"
                        }`}>
                          {msg.content}
                          <div className={`text-[10px] mt-1 opacity-60 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all pr-12"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="absolute right-1 top-1 bottom-1 px-3 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7] transition-colors disabled:opacity-50 disabled:hover:bg-[#0ea5e9]"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-[10px] text-center text-gray-400">
                    Sức mạnh bởi <span className="text-[#0ea5e9] font-bold">MockAI Intelligence</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
