import { Eye, Calendar, Sparkles, Bot } from "lucide-react";
import { Link } from "react-router-dom";

export function ApplicationCard({ app, statusConfig, onViewAtsReport }) {
  const config = statusConfig[app.status] || {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-700",
    icon: Calendar
  };
  const StatusIcon = config.icon;

  return (
    <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/30 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50 dark:hover:border-[#0ea5e9]/50 hover:border-sky-100 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex items-start gap-6 flex-1">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-sky-100 dark:shadow-sky-900/30 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            {app.logo}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold dark:text-white text-gray-900 mb-1 group-hover:text-[#0ea5e9] dark:group-hover:text-[#38bdf8] transition-colors">
              {app.title}
            </h3>
            <p className="text-lg dark:text-slate-400 text-gray-500 font-medium mb-4">{app.company}</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 dark:bg-slate-800 bg-gray-50 rounded-full text-xs font-bold dark:text-slate-400 text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Nộp ngày: {new Date(app.appliedDate).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className={`px-4 py-1 rounded-full flex items-center gap-2 text-xs font-bold ${config.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{config.label.toUpperCase()}</span>
              </div>
            </div>
            {app.aiScore !== null && app.aiScore !== undefined && (
              <button
                onClick={() => onViewAtsReport && onViewAtsReport(app.id)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:from-[#0284c7] hover:to-[#0ea5e9] text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse fill-yellow-300" />
                <span>Xem Phân Tích ATS ({app.aiScore} điểm)</span>
              </button>
            )}
            
            {app.rawStatus === 'ai_interview_invited' && (
              <Link to={`/hr-interview/prep/${app.id}`}>
                <button className="mt-4 ml-0 sm:ml-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border-none">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Vào phỏng vấn AI →</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold dark:text-slate-200 text-gray-900 uppercase tracking-widest">Tiến trình hồ sơ</h4>
              <button 
                onClick={() => onViewAtsReport && onViewAtsReport(app.id)}
                className="text-xs font-bold text-[#0ea5e9] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Chi tiết
              </button>
            </div>
            <div className="space-y-6">
              {app.timeline.map((step, index) => (
                <div key={index} className="relative flex items-center gap-4">
                  <div className={`z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    step.completed ? "bg-[#0ea5e9] border-[#0ea5e9]" : "dark:bg-[#0f172a] bg-white dark:border-slate-700 border-gray-200"
                  }`}>
                    {step.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  {index < app.timeline.length - 1 && (
                    <div className={`absolute left-2 top-4 w-px h-6 ${
                      step.completed ? "bg-[#0ea5e9]" : "dark:bg-slate-700 bg-gray-100"
                    }`} />
                  )}
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-xs font-bold ${step.completed ? "dark:text-white text-gray-900" : "dark:text-slate-500 text-gray-400"}`}>
                      {step.step}
                    </span>
                    {step.score && (
                      <button 
                        onClick={() => onViewAtsReport && onViewAtsReport(app.id)}
                        className="text-[10px] font-bold dark:bg-green-900/20 bg-green-50 dark:text-green-400 text-green-600 px-2 py-0.5 rounded-lg border dark:border-green-800/30 border-green-100 cursor-pointer hover:bg-green-100 hover:scale-105 active:scale-95 transition-all"
                        title="Click để xem báo cáo ATS chi tiết"
                      >
                        AI: {step.score}%
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
