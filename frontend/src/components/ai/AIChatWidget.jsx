import { MessageSquare, X, Send, Sparkles, User, Bot, Minimize2, Maximize2, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage } from "../../api/aiApi";

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content: "Xin chào! Tôi là **MockAI Assistant** 👋\n\nTôi có thể giúp bạn:\n• Chuẩn bị câu hỏi phỏng vấn\n• Tư vấn nghề nghiệp & lộ trình phát triển\n• Giải thích các tính năng của nền tảng\n\nBạn cần hỗ trợ gì hôm nay?",
  timestamp: new Date(),
};

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from current messages (exclude welcome message from history)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendChatMessage(text, history);
      const reply = res.data?.data?.reply || res.data?.reply || "Xin lỗi, tôi không nhận được phản hồi. Vui lòng thử lại.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau ít phút.",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClear = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            id="ai-chat-toggle-btn"
            aria-label="Mở trợ lý AI"
            className="relative w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-full shadow-2xl shadow-sky-200/50 flex items-center justify-center text-white hover:scale-110 transition-transform group"
          >
            <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "64px" : "520px",
            }}
            exit={{ opacity: 0, y: 80, scale: 0.92 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="w-[380px] bg-white dark:bg-[#0d1526] rounded-2xl shadow-2xl shadow-black/20 border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] p-4 flex items-center justify-between text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">MockAI Assistant</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                    Trực tuyến · AI by Groq
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Xóa cuộc trò chuyện"
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

            {/* Messages area */}
            {!isMinimized && (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#0d1526]/80"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[88%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          msg.role === "user"
                            ? "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-300"
                            : "bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white"
                        }`}>
                          {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                        </div>
                        {/* Bubble */}
                        <div className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-tr-none whitespace-pre-wrap"
                            : msg.isError
                              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-tl-none"
                              : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-100 dark:border-white/5 rounded-tl-none break-words"
                        }`}>
                          {msg.role === "user" ? (
                            msg.content
                          ) : (
                            <div className="space-y-2 [&>p]:mb-2 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h1]:font-bold [&>h1]:text-lg [&>h2]:font-bold [&>h2]:text-base [&>h3]:font-bold [&>h3]:text-[15px] [&>hr]:my-3 [&>hr]:border-gray-200 dark:[&>hr]:border-gray-700">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ node, ...props }) => <a {...props} className="text-[#0ea5e9] hover:underline" />,
                                  strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          <div className={`text-[10px] mt-1.5 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/5 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-[#0ea5e9] rounded-full animate-bounce [animation-delay:0ms]" />
                          <div className="w-2 h-2 bg-[#0ea5e9] rounded-full animate-bounce [animation-delay:180ms]" />
                          <div className="w-2 h-2 bg-[#0ea5e9] rounded-full animate-bounce [animation-delay:360ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input area */}
                <div className="p-3 bg-white dark:bg-[#0d1526] border-t border-gray-100 dark:border-white/5 flex-shrink-0">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập tin nhắn... (Enter để gửi)"
                      rows={1}
                      disabled={isLoading}
                      className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/30 focus:outline-none transition-all resize-none disabled:opacity-60 text-gray-800 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                      style={{ maxHeight: "100px", overflowY: "auto" }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-200/40 dark:shadow-none hover:scale-105 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-[10px] text-center text-gray-400 dark:text-slate-600">
                    Sức mạnh bởi{" "}
                    <span className="text-[#0ea5e9] font-semibold">MockAI Intelligence</span>
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
