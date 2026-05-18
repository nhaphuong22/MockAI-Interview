import { useState } from "react";
import { 
  Cpu, 
  Settings2, 
  HelpCircle, 
  Save, 
  RefreshCw, 
  FileText, 
  Search, 
  MessageSquare,
  Sparkles,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { mockAISettings } from "./mockAdminData";

export function AISettings() {
  const [model, setModel] = useState(mockAISettings.model);
  const [temperature, setTemperature] = useState(mockAISettings.temperature);
  const [maxTokens, setMaxTokens] = useState(mockAISettings.maxTokens);
  
  // Prompts state
  const [promptCV, setPromptCV] = useState(mockAISettings.promptCV);
  const [promptReview, setPromptReview] = useState(mockAISettings.promptReview);
  const [promptInterview, setPromptInterview] = useState(mockAISettings.promptInterview);

  // Active Prompt Category Tab
  const [activePromptTab, setActivePromptTab] = useState("parser");
  
  // Loading & Success states
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1200);
  };

  const handleResetDefaults = () => {
    setModel(mockAISettings.model);
    setTemperature(mockAISettings.temperature);
    setMaxTokens(mockAISettings.maxTokens);
    setPromptCV(mockAISettings.promptCV);
    setPromptReview(mockAISettings.promptReview);
    setPromptInterview(mockAISettings.promptInterview);
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cấu Hình AI</h1>
            <p className="text-sm text-slate-500 mt-1">Quản lý tham số mô hình LLM, tinh chỉnh System Prompts cho các dịch vụ AI.</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={handleResetDefaults}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Khôi Phục Mặc Định
            </button>
            <button 
              onClick={handleSaveConfig}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-sm text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 min-w-[120px] justify-center outline-none"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Đã Lưu!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu Cấu Hình
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Parameters Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <Settings2 className="w-4.5 h-4.5 text-[#0ea5e9]" />
                Tham Số Mô Hình
              </h3>

              {/* Model Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  Mô Hình LLM Chủ Đạo
                  <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" title="Mô hình chính phục vụ dịch vụ phỏng vấn và CV" />
                </label>
                <select 
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0ea5e9]"
                >
                  <option value="gpt-4o">OpenAI GPT-4o (Độ chính xác cao)</option>
                  <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                  <option value="llama-3-70b">Meta Llama-3-70B (Mô hình Local)</option>
                  <option value="gemini-1-5-pro">Google Gemini 1.5 Pro</option>
                </select>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Nhiệt Độ Sáng Tạo (Temp)</span>
                  <span className="text-[#0ea5e9] font-mono text-xs">{temperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.5" 
                  step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0ea5e9]"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold mt-1">
                  <span>Logic & Chính xác</span>
                  <span>Sáng tạo & Tự nhiên</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tokens Phản Hồi Tối Đa</label>
                <input 
                  type="number" 
                  min="256" 
                  max="4096" 
                  step="128"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0ea5e9]"
                />
              </div>
            </div>
            
            {/* Quick status */}
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100/50 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#0ea5e9] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-sky-950">Gợi Ý Vận Hành AI</h4>
                <p className="text-[10px] text-sky-800 leading-relaxed mt-1 font-medium">
                  Với tính năng phỏng vấn giọng nói realtime, mức Temperature khuyến nghị là <strong>0.7 - 0.9</strong> để câu trả lời mang phong cách tự nhiên, đối thoại tốt nhất với ứng viên.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Prompt Manager */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[460px]">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3 mb-6">
                <Cpu className="w-4.5 h-4.5 text-[#0ea5e9]" />
                Quản Lý System Prompts
              </h3>

              {/* Prompt category tabs */}
              <div className="flex border-b border-slate-100 mb-6 text-xs font-bold text-slate-400 gap-4">
                <button 
                  onClick={() => setActivePromptTab("parser")}
                  className={`pb-2 relative ${activePromptTab === "parser" ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
                >
                  AI CV Parser
                  {activePromptTab === "parser" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />}
                </button>
                <button 
                  onClick={() => setActivePromptTab("reviewer")}
                  className={`pb-2 relative ${activePromptTab === "reviewer" ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
                >
                  AI CV Reviewer
                  {activePromptTab === "reviewer" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />}
                </button>
                <button 
                  onClick={() => setActivePromptTab("interview")}
                  className={`pb-2 relative ${activePromptTab === "interview" ? "text-[#0ea5e9]" : "hover:text-slate-600"}`}
                >
                  AI Voice Interviewer
                  {activePromptTab === "interview" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0ea5e9]" />}
                </button>
              </div>

              {/* Prompt Editor Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  Chỉ định System Prompt
                  <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" title="Lời nhắc nền định hình hành vi và dữ liệu đầu ra của mô hình" />
                </label>
                
                {activePromptTab === "parser" && (
                  <textarea 
                    rows="10"
                    value={promptCV}
                    onChange={(e) => setPromptCV(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#0ea5e9] focus:bg-white text-slate-700 leading-relaxed font-mono"
                  />
                )}

                {activePromptTab === "reviewer" && (
                  <textarea 
                    rows="10"
                    value={promptReview}
                    onChange={(e) => setPromptReview(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#0ea5e9] focus:bg-white text-slate-700 leading-relaxed font-mono"
                  />
                )}

                {activePromptTab === "interview" && (
                  <textarea 
                    rows="10"
                    value={promptInterview}
                    onChange={(e) => setPromptInterview(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#0ea5e9] focus:bg-white text-slate-700 leading-relaxed font-mono"
                  />
                )}
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 font-semibold mt-4">
              * Mọi chỉnh sửa ở System Prompt cần được lưu cấu hình để chính thức áp dụng lên các phiên phỏng vấn mới.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
