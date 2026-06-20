import { useParams, Link } from "react-router-dom";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, DollarSign, Briefcase, Clock, Building, Users, Award, ChevronRight, Bookmark, Share2, Flag, Loader2, UploadCloud, FileCheck, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { jobApi } from "../../api/jobApi";
import { cvApi } from "../../api/cvApi";
import { applicationApi } from "../../api/applicationApi";
import { useUiStore } from "../../store/useUiStore";
import { useAuthStore } from "../../store/useAuthStore";
import { getProfileApi } from "../../api/auth";
import * as Dialog from "@radix-ui/react-dialog";

export function JobDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Gọi API lấy danh sách ID công việc đã lưu
  const { data: savedJobIds = [] } = useQuery({
    queryKey: ["savedJobIds"],
    queryFn: async () => {
      const res = await jobApi.getSavedJobs({ returnIdsOnly: true });
      return res.data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (jobId) => jobApi.toggleSavedJob(jobId),
    onSuccess: () => {
      // Refresh cache để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ["savedJobIds"] });
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
    }
  });

  const isBookmarked = savedJobIds.includes(Number(id));

  const toggleBookmark = () => {
    toggleMutation.mutate(id);
  };

  // States cho việc nộp đơn ứng tuyển
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [uploadedCvText, setUploadedCvText] = useState("");
  const [uploadedCvUrl, setUploadedCvUrl] = useState("");
  const [uploadedCvName, setUploadedCvName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stepper states cho thông tin cá nhân
  const [step, setStep] = useState(1);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const addToast = useUiStore((state) => state.addToast);

  // 1. Lấy thông tin profile ứng viên
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const data = await getProfileApi();
      return data?.data;
    },
    enabled: !!isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Pre-fill form khi modal mở
  useEffect(() => {
    if (isApplyModalOpen) {
      setStep(1);
      const profile = userProfile || user;
      setCandidateName(profile?.full_name || profile?.fullName || "");
      setCandidateEmail(profile?.email || "");
      setCandidatePhone(profile?.phone || "");
      setPortfolioUrl(profile?.portfolio_url || profile?.portfolioUrl || "");
    }
  }, [isApplyModalOpen, userProfile, user]);

  // 1. Gọi API lấy chi tiết Job thực tế
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["job-detail", id],
    queryFn: async () => {
      const res = await jobApi.getJobById(id);
      return res; // Axios interceptor đã bóc tách response.data
    },
    enabled: !!id
  });

  const job = response?.data;

  // Xử lý upload file CV PDF
  const handleCvChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
      addToast("Hệ thống chỉ hỗ trợ định dạng file CV là PDF.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast("Kích thước file CV vượt quá giới hạn 5MB.", "error");
      return;
    }

    try {
      setIsUploadingCv(true);
      const res = await cvApi.uploadCV(file);
      // Axios client trả về data trực tiếp
      console.log("[CV Upload] Phản hồi từ API upload CV:", res);
      
      // Viết phòng thủ hỗ trợ cả hai cấu trúc response (res.data hoặc res trực tiếp)
      const dataPayload = res?.data || res;
      console.log("[CV Upload] dataPayload xác định được:", dataPayload);

      if (dataPayload?.text) {
        setUploadedCvText(dataPayload.text);
        setUploadedCvUrl(dataPayload.fileUrl);
        setUploadedCvName(file.name);
        addToast("Đã tải và bóc tách nội dung CV thành công!", "success");
      } else {
        addToast("Không thể bóc tách CV này, vui lòng chọn file PDF khác.", "error");
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Đã xảy ra lỗi khi tải CV lên.", "error");
    } finally {
      setIsUploadingCv(false);
    }
  };

  const formatPortfolioUrl = (url) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleNextStep = () => {
    if (!candidateName.trim()) {
      addToast("Vui lòng nhập họ và tên.", "warning");
      return;
    }
    if (!candidateEmail.trim()) {
      addToast("Vui lòng nhập địa chỉ email.", "warning");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail.trim())) {
      addToast("Định dạng email không hợp lệ.", "warning");
      return;
    }
    if (!candidatePhone.trim()) {
      addToast("Vui lòng nhập số điện thoại.", "warning");
      return;
    }

    const formattedUrl = formatPortfolioUrl(portfolioUrl);
    setPortfolioUrl(formattedUrl);

    if (formattedUrl) {
      try {
        new URL(formattedUrl);
      } catch {
        addToast("Định dạng Portfolio URL không hợp lệ.", "warning");
        return;
      }
    }

    setStep(2);
  };

  // Xác nhận nộp đơn ứng tuyển
  const handleApplySubmit = async () => {
    if (!uploadedCvText) {
      addToast("Vui lòng tải lên CV của bạn trước khi nộp đơn.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("[Apply Submit] Gửi đơn ứng tuyển với cv_url:", uploadedCvUrl);
      await applicationApi.applyJob(id, {
        cv_text: uploadedCvText,
        cv_url: uploadedCvUrl,
        cover_letter: coverLetter,
        candidate_name: candidateName.trim(),
        candidate_email: candidateEmail.trim(),
        candidate_phone: candidatePhone.trim(),
        portfolio_url: portfolioUrl.trim() ? formatPortfolioUrl(portfolioUrl) : null
      });
      addToast("Nộp đơn ứng tuyển thành công! Nhà tuyển dụng đã nhận được hồ sơ của bạn.", "success");
      setIsApplyModalOpen(false);
      // Reset form
      setUploadedCvText("");
      setUploadedCvUrl("");
      setUploadedCvName("");
      setCoverLetter("");
      setCandidateName("");
      setCandidateEmail("");
      setCandidatePhone("");
      setPortfolioUrl("");
      setStep(1);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Nộp đơn ứng tuyển thất bại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Đang tải thông tin chi tiết công việc...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <p className="text-red-500 font-bold mb-4">Không tìm thấy thông tin tin tuyển dụng này!</p>
        <Link to="/jobs" className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm shadow-md">
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  // Định dạng hiển thị mức lương
  const formatSalary = (min, max, currency, visible) => {
    if (!visible) return "Thương lượng (Ẩn)";
    if (!min && !max) return "Thương lượng";
    
    const formatNumber = (num) => {
      if (!num) return "";
      if (num >= 1000000) return `${(num / 1000000).toFixed(0)} Triệu`;
      return num.toLocaleString("vi-VN");
    };

    if (min && max) return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    if (min) return `Từ ${formatNumber(min)} ${currency}`;
    return `Lên đến ${formatNumber(max)} ${currency}`;
  };

  const companyLogo = job.company_logo || job.company_name?.substring(0, 1).toUpperCase() || "J";

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/jobs" className="flex items-center gap-2 text-gray-600 hover:text-[#0ea5e9] transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Quay lại danh sách việc làm</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Thẻ Công Việc */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
                  {companyLogo}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center gap-2 text-lg text-gray-700 mb-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span>{job.company_name || "Công ty chưa xác minh"}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.company_address || "Việt Nam"}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#0ea5e9] font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{job.experience_level || "Không yêu cầu"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setIsApplyModalOpen(true)}
                  className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg transition-all cursor-pointer"
                >
                  Nộp Đơn Ngay
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleBookmark}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all text-sm cursor-pointer"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-[#0ea5e9] text-[#0ea5e9]" : ""}`} />
                  <span>{isBookmarked ? "Đã lưu" : "Lưu việc"}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all text-sm cursor-pointer">
                  <Share2 className="w-5 h-5" />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>

            {/* Mô tả Công Việc & Yêu Cầu */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô Tả Công Việc</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line mb-8">
                {job.description || "Chưa có mô tả chi tiết."}
              </div>

              {job.requirements && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu Cầu Chung (AI Context)</h2>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                    {job.requirements}
                  </div>
                </>
              )}
            </div>

            {/* Yêu cầu Chi Tiết Để AI Chấm Điểm */}
            {job.detailed_requirements && job.detailed_requirements.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Yêu Cầu Chi Tiết Để AI Chấm Điểm</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.detailed_requirements.map((req, idx) => (
                    <div
                      key={req.id || idx}
                      className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-sky-100 transition-colors"
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${req.is_mandatory ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-100 text-gray-600'}`} title={req.is_mandatory ? "Bắt buộc" : "Tùy chọn"}>
                        {req.is_mandatory ? '★' : '☆'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{req.requirement_text}</div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                          {req.is_mandatory ? 'Bắt buộc' : 'Tùy chọn'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cột Bên Phải */}
          <div className="space-y-6">
            {/* AI Match Score box */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-green-600 mb-2">90%</div>
                <div className="text-green-800 font-semibold">AI Match Score</div>
              </div>
              <p className="text-sm text-green-700 text-center font-medium">
                Hồ sơ của bạn phù hợp rất cao với vị trí này!
              </p>
            </div>

            {/* Thông Tin Tóm Tắt */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Thông Tin Công Việc</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Mức lương</div>
                  <div className="font-semibold text-[#0ea5e9]">
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Cấp độ kinh nghiệm</div>
                  <div className="font-semibold">{job.experience_level || "Không yêu cầu"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Chỉ tiêu tuyển dụng</div>
                  <div className="font-semibold">{job.vacancy_count || 1} người</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Hạn nộp hồ sơ</div>
                  <div className="font-semibold">
                    {job.deadline ? new Date(job.deadline).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </div>
                </div>
              </div>
            </div>

            {/* Về Công Ty */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Về Công Ty</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                  {companyLogo}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{job.company_name || "Công ty chưa xác minh"}</div>
                  <div className="text-xs text-gray-500">Doanh nghiệp tuyển dụng</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {job.company_description || "Nhà tuyển dụng chuyên nghiệp cung cấp môi trường làm việc năng động và chế độ đãi ngộ tốt."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* dialog nộp đơn ứng tuyển (Apply Job Modal) */}
      <Dialog.Root open={isApplyModalOpen} onOpenChange={(open) => {
        setIsApplyModalOpen(open);
        if (!open) setStep(1); // Reset step khi đóng modal
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 z-50 animate-in zoom-in-95 duration-300 outline-none border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-bold text-gray-900">
                Ứng Tuyển: {job.title}
              </Dialog.Title>
              <Dialog.Close className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 outline-none cursor-pointer">
                <XCircle className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {/* Stepper progress indicator */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
              <div 
                className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] -translate-y-1/2 z-0 transition-all duration-300"
                style={{ width: step === 1 ? "0%" : "100%" }}
              />

              {/* Step 1 Node */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === 1 
                    ? "bg-[#0ea5e9] text-white ring-4 ring-sky-100" 
                    : "bg-green-500 text-white"
                }`}>
                  {step === 1 ? "1" : "✓"}
                </div>
                <span className={`text-xs font-semibold mt-1.5 transition-colors duration-300 ${step === 1 ? "text-[#0ea5e9]" : "text-gray-500"}`}>
                  Thông tin cá nhân
                </span>
              </div>

              {/* Step 2 Node */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step === 2 
                    ? "bg-[#0ea5e9] text-white ring-4 ring-sky-100" 
                    : "bg-gray-100 text-gray-400"
                }`}>
                  2
                </div>
                <span className={`text-xs font-semibold mt-1.5 transition-colors duration-300 ${step === 2 ? "text-[#0ea5e9]" : "text-gray-400"}`}>
                  Hồ sơ & Thư giới thiệu
                </span>
              </div>
            </div>

            {step === 1 ? (
              /* BƯỚC 1: NHẬP THÔNG TIN CÁ NHÂN */
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Portfolio URL (Không bắt buộc)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    onBlur={() => setPortfolioUrl(formatPortfolioUrl(portfolioUrl))}
                    placeholder="github.com/my-profile"
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <Dialog.Close className="flex-1 py-3.5 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors text-center cursor-pointer text-sm">
                    Hủy
                  </Dialog.Close>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-sky-100 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>Tiếp tục</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* BƯỚC 2: TẢI CV & THƯ GIỚI THIỆU */
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Tải Lên CV Của Bạn (PDF) <span className="text-red-500">*</span>
                  </label>
                  
                  {uploadedCvName ? (
                    <div className="flex items-center justify-between bg-sky-50 border border-sky-100 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                          PDF
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800 line-clamp-1">{uploadedCvName}</div>
                          <div className="text-xs text-sky-600 font-semibold flex items-center gap-1 mt-0.5">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Đã bóc tách thành công</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setUploadedCvName("");
                          setUploadedCvText("");
                        }}
                        className="p-1 hover:bg-sky-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa CV"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-[#0ea5e9] rounded-2xl p-8 cursor-pointer transition-all bg-slate-50/50 hover:bg-sky-50/20 group">
                      {isUploadingCv ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mb-2" />
                          <span className="text-sm text-gray-500 font-semibold">Đang bóc tách CV...</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-[#0ea5e9] mb-2 transition-colors" />
                          <span className="text-sm font-bold text-gray-700 mb-1">Click để tải lên file CV</span>
                          <span className="text-xs text-gray-400 font-medium">Hỗ trợ định dạng PDF (Tối đa 5MB)</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleCvChange} 
                        className="hidden" 
                        disabled={isUploadingCv}
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                    Thư giới thiệu / Cover Letter (Không bắt buộc)
                  </label>
                  <textarea 
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Giới thiệu ngắn gọn lý do bạn phù hợp với vị trí này..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-50 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors text-center cursor-pointer text-sm"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleApplySubmit}
                    disabled={isSubmitting || isUploadingCv || !uploadedCvText}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-sky-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang nộp hồ sơ...</span>
                      </>
                    ) : (
                      <span>Nộp Đơn Ứng Tuyển</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
export default JobDetail;
