import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getHRInterviewResultApi } from '../../api/hrInterviewApi';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HRInterviewResult = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const { data: resultData, isLoading, isError } = useQuery({
    queryKey: ['hrInterviewResult', interviewId],
    queryFn: () => getHRInterviewResultApi(interviewId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (isError || !resultData?.data) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl font-medium text-slate-800 dark:text-slate-200">Không tìm thấy kết quả phỏng vấn.</p>
        <button onClick={() => navigate('/applications')} className="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">
          Về danh sách ứng tuyển
        </button>
      </div>
    );
  }

  const { jobTitle, companyName, answeredQuestions, totalQuestions } = resultData.data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-10 text-center">
        
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
            <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Hoàn tất Phỏng vấn!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Bạn đã trả lời thành công <span className="font-bold text-sky-600 dark:text-sky-400">{answeredQuestions}/{totalQuestions}</span> câu hỏi cho vị trí <span className="font-semibold text-slate-800 dark:text-slate-200">{jobTitle}</span> tại <span className="font-semibold text-slate-800 dark:text-slate-200">{companyName}</span>.
          </p>

          <div className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-6 mb-10 border border-sky-100 dark:border-sky-800/50">
            <p className="text-sky-800 dark:text-sky-300 font-medium">
              Kết quả phỏng vấn và các vi phạm (nếu có) đã được gửi đến Nhà tuyển dụng. Vui lòng chờ phản hồi qua email hoặc kiểm tra lại sau.
            </p>
          </div>

          <button
            onClick={() => navigate('/applications')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white text-lg font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            Quay về Theo dõi Ứng tuyển
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HRInterviewResult;
