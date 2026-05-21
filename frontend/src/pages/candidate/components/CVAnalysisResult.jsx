import React from "react";
import { CheckCircle2, AlertTriangle, Download, Eye, FileText } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

export function CVAnalysisResult({ aiResults, onReupload }) {
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl mb-2">Điểm Tổng Quan</h2>
            <p className="opacity-90">CV của bạn được đánh giá</p>
          </div>
          <div className="text-center">
            <div className="text-6xl mb-2">{aiResults.overallScore}</div>
            <div className="text-xl opacity-90">/100</div>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span>Điểm Mạnh</span>
          </h3>
          <ul className="space-y-3">
            {aiResults.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-sky-600" />
            <span>Cần Cải Thiện</span>
          </h3>
          <ul className="space-y-3">
            {aiResults.improvements.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <div className="w-2 h-2 bg-sky-500 rounded-full mt-2 flex-shrink-0" />
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section-by-section breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl mb-6">Đánh Giá Chi Tiết Từng Mục</h3>
        <div className="space-y-6">
          {aiResults.sections.map((section, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{section.name}</span>
                <span className="text-[#0ea5e9] font-semibold">{section.score}%</span>
              </div>
              <Progress.Root className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                <Progress.Indicator
                  className={`h-full transition-all ${
                    section.score >= 85 ? "bg-green-500" : section.score >= 70 ? "bg-sky-500" : "bg-red-500"
                  }`}
                  style={{ width: `${section.score}%` }}
                />
              </Progress.Root>
              <p className="text-sm text-gray-600">{section.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          <span>Tải Báo Cáo PDF</span>
        </button>
        <button className="flex-1 py-3 border-2 border-[#0ea5e9] text-[#0ea5e9] rounded-xl hover:bg-[#f0f9ff] transition-all flex items-center justify-center gap-2">
          <Eye className="w-5 h-5" />
          <span>Xem CV Mẫu</span>
        </button>
        <button
          onClick={onReupload}
          className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          <span>Upload CV Khác</span>
        </button>
      </div>
    </div>
  );
}
