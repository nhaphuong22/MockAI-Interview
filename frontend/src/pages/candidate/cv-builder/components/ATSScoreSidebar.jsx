import React, { useEffect, useState } from 'react';
import useCvBuilderStore from '../../../../store/useCvBuilderStore';
import { useScoreCVBuilder } from '../../../../hooks/useCVQueries';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const ATSScoreSidebar = () => {
  const { projectDraft } = useCvBuilderStore();
  const scoreMutation = useScoreCVBuilder();
  
  // Lấy dữ liệu để chấm (loại bỏ những state không cần thiết)
  const cvContent = projectDraft?.components;
  
  // Debounce 3 giây sau khi ngừng gõ mới gọi API
  const debouncedContent = useDebounce(cvContent, 3000);

  const [scoreData, setScoreData] = useState({
    score: 0,
    suggestions: [],
    status: 'idle', // idle, loading, success, error
  });

  useEffect(() => {
    if (!debouncedContent || debouncedContent.length === 0) return;

    const fetchScore = async () => {
      setScoreData(prev => ({ ...prev, status: 'loading' }));
      try {
        // Gọi API chấm điểm (mock kết quả nếu API chưa sãn sàng ở BE)
        // const result = await scoreMutation.mutateAsync(debouncedContent);
        
        // Mock response for now
        setTimeout(() => {
          setScoreData({
            score: Math.floor(Math.random() * 30) + 60, // 60-90
            suggestions: [
              { id: 1, text: "Nên thêm từ khóa liên quan đến kỹ năng lập trình (ví dụ: JavaScript, React) vào phần Mô tả.", type: 'warning' },
              { id: 2, text: "Khối Kinh nghiệm làm việc thiếu dữ liệu cụ thể (số liệu, thành tích).", type: 'warning' },
              { id: 3, text: "Thông tin cá nhân đã đầy đủ.", type: 'success' }
            ],
            status: 'success'
          });
        }, 1500);

      } catch (error) {
        setScoreData(prev => ({ ...prev, status: 'error' }));
      }
    };

    fetchScore();
  }, [debouncedContent]); // Chỉ chạy khi debouncedContent thay đổi (nghĩa là đã ngừng gõ 3s)

  return (
    <div className="h-64 border-t border-slate-200 bg-slate-50 flex flex-col">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <h3 className="font-semibold text-slate-800">ATS Score</h3>
        {scoreData.status === 'loading' && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0ea5e9]">
            <Loader2 size={14} className="animate-spin" />
            Đang chấm điểm...
          </div>
        )}
        {scoreData.status === 'success' && (
          <div className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={14} /> Updated
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Điểm số */}
        <div className="flex items-center gap-4 bg-white p-3 rounded border border-slate-200 shadow-sm">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 border-4 border-[#0ea5e9]/20">
            <span className="text-xl font-bold text-[#0ea5e9]">{scoreData.score}</span>
            {scoreData.status === 'loading' && (
               <div className="absolute inset-0 rounded-full border-4 border-[#0ea5e9] border-t-transparent animate-spin"></div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Điểm ATS dự kiến</p>
            <p className="text-xs text-slate-500">Tiếp tục chỉnh sửa để cải thiện điểm số</p>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Gợi ý từ AI</h4>
          {scoreData.suggestions.length > 0 ? (
            scoreData.suggestions.map(sug => (
              <div key={sug.id} className={`p-2.5 rounded border text-xs flex gap-2 ${
                sug.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                <div className="mt-0.5">
                  {sug.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                </div>
                <p className="leading-relaxed">{sug.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center p-4 bg-white rounded border border-slate-200 text-xs text-slate-400 flex flex-col items-center gap-2">
              <Info size={16} />
              Gợi ý sẽ xuất hiện sau khi bạn thay đổi nội dung CV.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
