import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { initHRInterviewApi } from '../../api/hrInterviewApi';
import { applicationApi } from '../../api/applicationApi';
import { Loader2, ShieldAlert, Video, Mic, CheckCircle } from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';

const HRInterviewPrep = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const { showToast } = useUiStore();

  // Lấy chi tiết application để hiện tên job, công ty
  const { data: applicationsData, isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationApi.getApplications,
  });

  const appDetail = (Array.isArray(applicationsData?.data) ? applicationsData.data : [])?.find(
    (app) => app.id === Number(applicationId)
  );

  useEffect(() => {
    // Xin quyền webcam/mic
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamActive(true);
      })
      .catch((err) => {
        console.error('Không thể truy cập camera/mic:', err);
      });

    return () => {
      // Cleanup stream khi rời trang
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const initMutation = useMutation({
    mutationFn: () => initHRInterviewApi(applicationId),
    onSuccess: (data) => {
      const interviewData = data.data; // { id, questions, jobTitle, companyName }
      navigate(`/hr-interview/room/${interviewData.id}`, {
        state: {
          questions: interviewData.questions,
          jobTitle: interviewData.jobTitle,
          companyName: interviewData.companyName,
          interviewId: interviewData.id
        },
        replace: true
      });
    },
    onError: (error) => {
      showToast({ message: error.response?.data?.error || 'Có lỗi xảy ra khi bắt đầu phỏng vấn.', type: 'error' });
    }
  });

  if (isLoadingApps) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!appDetail) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
        <p className="text-xl font-medium text-slate-800 dark:text-slate-200">Không tìm thấy đơn ứng tuyển.</p>
        <button onClick={() => navigate('/applications')} className="mt-4 px-6 py-2 bg-sky-500 text-white rounded-lg">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Chuẩn bị Phỏng Vấn HR Ảo
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Vị trí: <span className="font-semibold text-sky-600 dark:text-sky-400">{appDetail.jobTitle}</span>
            {appDetail.companyName && ` tại ${appDetail.companyName}`}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-700">
          {/* Cột trái: Camera Preview */}
          <div className="w-full md:w-1/2 p-8 bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {!streamActive && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-sm bg-black/80">
                  Đang khởi động Camera...
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-6">
              <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                <Video className={`w-5 h-5 mr-2 ${streamActive ? 'text-green-500' : 'text-slate-400'}`} />
                Camera
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300">
                <Mic className={`w-5 h-5 mr-2 ${streamActive ? 'text-green-500' : 'text-slate-400'}`} />
                Microphone
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl text-xs text-amber-800 dark:text-amber-200 leading-relaxed text-left w-full shadow-sm">
              <strong className="block mb-1 text-sm">⚠️ Cách chuyển đổi sang Mic Tai nghe:</strong>
              Hệ thống Phỏng vấn AI sử dụng <b>Mic mặc định của trình duyệt</b>. Nếu bạn cắm tai nghe nhưng AI không nghe thấy, hãy nhấp vào biểu tượng 🎥 <b>(Camera/Mic)</b> ở góc phải thanh địa chỉ trình duyệt, chọn <b>"Quản lý" (Manage)</b> và đổi Microphone mặc định sang tai nghe của bạn, sau đó tải lại trang này.
            </div>
          </div>

          {/* Cột phải: Quy chế */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Quy chế nghiêm ngặt</h2>
              </div>
              
              <ul className="space-y-4">
                {[
                  'Bật camera và microphone trong suốt quá trình.',
                  'Không rời mắt khỏi màn hình (AI Gaze Tracking được bật).',
                  'Có 5 phút cho mỗi câu hỏi, hết giờ tự động chuyển.',
                  'Không thể quay lại câu hỏi cũ. Bạn có thể chủ động chuyển sang câu tiếp theo.',
                  'Hệ thống sẽ lưu mọi câu trả lời và số lần vi phạm gửi cho HR.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-sky-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10">
              <button
                onClick={() => initMutation.mutate()}
                disabled={!streamActive || initMutation.isPending}
                className="w-full py-4 px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-sky-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {initMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang chuẩn bị...</>
                ) : (
                  'Tôi Đã Sẵn Sàng — Bắt Đầu Phỏng Vấn'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRInterviewPrep;
