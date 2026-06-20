import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationApi } from '../../../api/applicationApi';
import { FileText, Loader2, Download, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

export default function AtsReportDashboard({ appId = null }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['my-applications-ats'],
    queryFn: async () => {
      const res = await applicationApi.getApplications();
      return res.data || res;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Đang tải báo cáo đánh giá ATS...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Có lỗi xảy ra khi tải dữ liệu báo cáo ATS. Vui lòng thử lại sau!
      </div>
    );
  }

  // Lọc ra các đơn ứng tuyển có thông tin đánh giá AI
  const evaluatedApps = (applications || []).filter(app => app.aiFeedback);

  if (evaluatedApps.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold dark:text-slate-200 text-slate-800 mb-1">Chưa có báo cáo đánh giá ATS</h3>
        <p className="text-sm dark:text-slate-400 text-slate-500 max-w-md">
          Hãy nộp đơn ứng tuyển vào một tin tuyển dụng bất kỳ. Hệ thống sẽ tự động bóc tách CV và trả về báo cáo ATS chi tiết tại đây.
        </p>
      </div>
    );
  }

  // Chọn báo cáo phù hợp (theo appId hoặc báo cáo mới nhất)
  const latestApp = appId 
    ? evaluatedApps.find(app => Number(app.id) === Number(appId))
    : evaluatedApps[0];

  if (!latestApp) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold dark:text-slate-200 text-slate-800 mb-1">Không tìm thấy báo cáo ATS</h3>
        <p className="text-sm dark:text-slate-400 text-slate-500 max-w-md">
          Hồ sơ ứng tuyển này chưa có dữ liệu chấm điểm từ trí tuệ nhân tạo AI.
        </p>
      </div>
    );
  }

  const evaluation = latestApp.aiFeedback;
  const overallScore = latestApp.aiScore || evaluation.overallScore || 0;

  // Tính toán màu sắc dựa trên điểm số
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-[#0ea5e9]';
    return 'text-amber-500';
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b dark:border-white/10 border-gray-100 pb-4">
        <div>
          <h3 className="text-lg font-bold dark:text-white text-gray-900">Báo cáo ATS CV Chi Tiết</h3>
          <p className="text-xs dark:text-slate-400 text-gray-500">
            Ứng tuyển vị trí <span className="font-semibold text-[#0ea5e9]">{latestApp.jobTitle}</span> tại <span className="font-semibold">{latestApp.companyName}</span>
          </p>
        </div>
        {latestApp.pdfReportUrl && (
          <a
            href={latestApp.pdfReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:shadow-lg transition-all duration-300 rounded-xl cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải Báo Cáo PDF</span>
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Đánh giá hồ sơ tổng quan */}
        <div className="dark:bg-[#0f172a]/50 bg-slate-50/50 border dark:border-white/5 border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Đánh Giá Hồ Sơ</h4>
          
          <div className="w-24 h-24 bg-[#0ea5e9]/10 rounded-full flex items-center justify-center mb-6 text-[#0ea5e9] border border-sky-100/50 dark:border-sky-500/20 shadow-inner">
            <Sparkles className="w-12 h-12 text-[#0ea5e9] animate-pulse" />
          </div>

          <div className="text-xs text-slate-500 font-medium max-w-[200px]">
            {overallScore >= 80 ? (
              <p className="text-emerald-500 font-bold text-sm mb-1">HỒ SƠ TỐT</p>
            ) : overallScore >= 60 ? (
              <p className="text-sky-500 font-bold text-sm mb-1">HỒ SƠ KHÁ</p>
            ) : (
              <p className="text-amber-500 font-bold text-sm mb-1">CẦN CẢI THIỆN</p>
            )}
            
            {overallScore >= 80 ? (
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2">CV tuyệt vời! Hồ sơ của bạn cực kỳ tương thích với JD này.</p>
            ) : overallScore >= 60 ? (
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2">Hồ sơ khá tốt, tuy nhiên hãy cải thiện các từ khóa để tối ưu ATS hơn.</p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-2">Độ tương thích chưa cao. Hãy đọc kỹ phần Khuyến nghị để sửa lại CV.</p>
            )}
          </div>
        </div>

        {/* Nội dung chi tiết các tab */}
        <div className="md:col-span-2 space-y-4">
          {/* Sub-Tabs selector */}
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeSubTab === 'overview' ? 'bg-white dark:bg-[#0f172a] text-[#0ea5e9] shadow-sm' : 'text-slate-500 hover:text-[#0ea5e9]'}`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveSubTab('strengths')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeSubTab === 'strengths' ? 'bg-white dark:bg-[#0f172a] text-[#0ea5e9] shadow-sm' : 'text-slate-500 hover:text-[#0ea5e9]'}`}
            >
              Điểm mạnh & yếu
            </button>
            <button
              onClick={() => setActiveSubTab('improvements')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeSubTab === 'improvements' ? 'bg-white dark:bg-[#0f172a] text-[#0ea5e9] shadow-sm' : 'text-slate-500 hover:text-[#0ea5e9]'}`}
            >
              Khuyến nghị AI
            </button>
          </div>

          {/* Sub-Tab content */}
          <div className="min-h-[220px]">
            {activeSubTab === 'overview' && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chi Tiết Các Phần Đánh Giá</h5>
                <div className="space-y-3">
                  {(evaluation.sections || []).map((sec, idx) => (
                    <div key={idx} className="bg-slate-50/50 dark:bg-[#0f172a]/20 border dark:border-white/5 border-gray-100 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{sec.name}</span>
                        <span className={`text-xs font-bold ${getScoreColor(sec.score)}`}>
                          {sec.score >= 80 ? "Tốt" : sec.score >= 60 ? "Khá" : "Cần cải thiện"}
                        </span>
                      </div>
                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${sec.score >= 80 ? 'bg-emerald-500' : sec.score >= 60 ? 'bg-[#0ea5e9]' : 'bg-amber-500'}`}
                          style={{ width: `${sec.score}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{sec.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === 'strengths' && (
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-2xl">
                  <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Điểm Mạnh (Strengths)</span>
                  </h5>
                  <ul className="space-y-2">
                    {(evaluation.strengths || []).map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses / Improvements list */}
                <div className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-500/10 p-4 rounded-2xl">
                  <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Điểm Cần Khắc Phục</span>
                  </h5>
                  <ul className="space-y-2">
                    {(evaluation.improvements || []).slice(0, 3).map((i, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeSubTab === 'improvements' && (
              <div className="bg-slate-50/30 dark:bg-[#0f172a]/20 border dark:border-white/5 border-gray-100 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-sky-500">
                  <Sparkles className="w-5 h-5" />
                  <h5 className="text-xs font-bold uppercase tracking-wider">Khuyến Nghị Từ Trí Tuệ Nhân Tạo AI</h5>
                </div>
                <div className="space-y-3">
                  {(evaluation.improvements || []).map((i, idx) => (
                    <div key={idx} className="flex gap-3 items-start text-xs text-slate-700 dark:text-slate-300">
                      <div className="bg-sky-50 dark:bg-sky-950/40 text-[#0ea5e9] w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px]">
                        {idx + 1}
                      </div>
                      <p className="leading-relaxed pt-0.5">{i}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
