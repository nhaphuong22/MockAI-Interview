import React from "react";
import { Eye, Calendar } from "lucide-react";

export function ApplicationCard({ app, statusConfig }) {
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
          </div>
        </div>

        <div className="flex-1 lg:max-w-md">
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold dark:text-slate-200 text-gray-900 uppercase tracking-widest">Tiến trình hồ sơ</h4>
              <button className="text-xs font-bold text-[#0ea5e9] hover:underline flex items-center gap-1">
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
                      <span className="text-[10px] font-bold dark:bg-green-900/20 bg-green-50 dark:text-green-400 text-green-600 px-2 py-0.5 rounded-lg border dark:border-green-800/30 border-green-100">
                        AI: {step.score}%
                      </span>
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
