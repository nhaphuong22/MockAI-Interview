import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, DollarSign, Briefcase, Clock, Building, Users, Award, ChevronRight, Bookmark, Share2, Flag, Loader2, UploadCloud, FileCheck, XCircle, Layers, ChevronDown } from "lucide-react";
import { useState } from "react";
import { jobApi } from "../../api/jobApi";
import { cvApi } from "../../api/cvApi";
import { applicationApi } from "../../api/applicationApi";
import { useUiStore } from "../../store/useUiStore";
import * as Dialog from "@radix-ui/react-dialog";

export function JobDetail() {
  const { id } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // States cho việc nộp đơn ứng tuyển
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [activePositionIndex, setActivePositionIndex] = useState(0);
  
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [uploadedCvText, setUploadedCvText] = useState("");
  const [uploadedCvUrl, setUploadedCvUrl] = useState("");
  const [uploadedCvName, setUploadedCvName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useUiStore((state) => state.addToast);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["job-detail", id],
    queryFn: async () => {
      const res = await jobApi.getJobById(id);
      return res; 
    },
    enabled: !!id
  });

  const jobPost = response?.data;

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
      
      const dataPayload = res?.data || res;

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

  const handleApplySubmit = async () => {
    if (!uploadedCvText) {
      addToast("Vui lòng tải lên CV của bạn trước khi nộp đơn.", "warning");
      return;
    }

    if (!selectedPosition) {
      addToast("Vui lòng chọn một vị trí để ứng tuyển.", "warning");
      return;
    }

    try {
      setIsSubmitting(true);
      // Nộp đơn vào id của position (vị trí cụ thể) thay vì campaign (job_post)
      await applicationApi.applyJob(selectedPosition.id, {
        cv_text: uploadedCvText,
        cv_url: uploadedCvUrl,
        cover_letter: coverLetter
      });
      addToast("Nộp đơn ứng tuyển thành công! Nhà tuyển dụng đã nhận được hồ sơ của bạn.", "success");
      setIsApplyModalOpen(false);
      
      setUploadedCvText("");
      setUploadedCvUrl("");
      setUploadedCvName("");
      setCoverLetter("");
      setSelectedPosition(null);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Nộp đơn ứng tuyển thất bại.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openApplyModal = (position) => {
    setSelectedPosition(position);
    setIsApplyModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Đang tải thông tin chiến dịch...</p>
      </div>
    );
  }

  if (isError || !jobPost) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
        <p className="text-red-500 font-bold mb-4">Không tìm thấy thông tin chiến dịch tuyển dụng này!</p>
        <Link to="/jobs" className="px-4 py-2 bg-[#0ea5e9] text-white rounded-xl font-bold text-sm shadow-md">
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

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

  const companyLogo = jobPost.company_logo || jobPost.company_name?.substring(0, 1).toUpperCase() || "J";

  return (
    <div className="bg-slate-50/50 min-h-screen relative pb-16">
      
      {/* Immersive Hero Header */}
      <div className="relative bg-[#0a0f1c] pt-12 pb-24 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back button */}
          <div className="mb-8">
            <Link to="/jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
              <ChevronRight className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
              <span className="font-medium text-sm">Quay lại danh sách việc làm</span>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-4xl font-extrabold text-sky-600 shrink-0 shadow-[0_0_40px_rgba(14,165,233,0.3)] border border-white/10">
              {companyLogo}
            </div>
            
            {/* Title & Info */}
            <div className="flex-1 w-full">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">{jobPost.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-sky-400" />
                  <span className="text-white font-bold">{jobPost.company_name || "Công ty chưa xác minh"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span>{jobPost.company_address || "Việt Nam"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-slate-400" />
                  <span>{jobPost.positions?.length || 0} vị trí đang mở</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3 rounded-xl transition-all font-bold shadow-sm backdrop-blur-md border ${
                  isBookmarked 
                    ? "bg-sky-500/20 border-sky-500/50 text-sky-400 hover:bg-sky-500/30" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-sky-400" : ""}`} />
                <span>{isBookmarked ? "Đã lưu" : "Lưu"}</span>
              </button>
              <button className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-white font-bold shadow-sm backdrop-blur-md">
                <Share2 className="w-5 h-5" />
                <span>Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Mô tả Chiến Dịch */}
            {jobPost.description && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative">
                <h2 className="text-2xl font-extrabold text-slate-800 mb-5">Chi Tiết Chiến Dịch</h2>
                <div className="prose max-w-none text-slate-600 leading-relaxed whitespace-pre-line mb-4">
                  {jobPost.description}
                </div>
              </div>
            )}

            {/* Các Vị Trí (Positions) */}
            <div className="flex items-center justify-between mb-6 px-2 mt-8">
              <h2 className="text-2xl font-extrabold text-slate-800">Các Vị Trí Tuyển Dụng</h2>
              <div className="text-sm font-semibold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
                {jobPost.positions?.length || 0} Vị trí
              </div>
            </div>
            
            <div className="space-y-4">
              {jobPost.positions?.map((pos, index) => {
                const isActive = activePositionIndex === index;
                return (
                <div key={pos.id || index} className={`bg-white rounded-3xl border transition-all overflow-hidden ${isActive ? 'border-sky-300 shadow-[0_8px_30px_rgba(14,165,233,0.12)]' : 'border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-sky-200'}`}>
                  
                  {/* Header: Title, Badges, and Apply CTA */}
                  <div 
                    onClick={() => setActivePositionIndex(isActive ? -1 : index)}
                    className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 cursor-pointer group hover:bg-sky-50/30 transition-colors"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-sky-600 transition-colors">{pos.title}</h3>
                        <div className={`p-1.5 rounded-full bg-slate-100 text-slate-500 transition-transform duration-300 sm:hidden ${isActive ? 'rotate-180 bg-sky-100 text-sky-600' : ''}`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2.5 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-sky-700 bg-sky-100/50 px-3 py-1 rounded-full text-sm font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(pos.salary_min, pos.salary_max, pos.salary_currency, pos.is_salary_visible)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          <Award className="w-4 h-4 text-slate-400" />
                          {pos.experience_level || "Không yêu cầu"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium border border-emerald-100">
                          <Users className="w-4 h-4" />
                          {pos.vacancy_count} chỉ tiêu
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openApplyModal(pos);
                        }}
                        className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                      >
                        Ứng Tuyển Ngay
                      </button>
                      <div className={`hidden sm:flex p-2 rounded-full transition-all duration-300 ${isActive ? 'rotate-180 bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400 group-hover:text-sky-500 group-hover:bg-sky-50'}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Body: Requirements and AI */}
                  <div className={`transition-all duration-500 ease-in-out origin-top ${isActive ? 'opacity-100 max-h-[2000px] p-6 sm:p-8' : 'opacity-0 max-h-0 overflow-hidden py-0 px-6 sm:px-8 border-none'}`}>
                    {pos.requirements && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Yêu Cầu Công Việc</h4>
                        <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                          {pos.requirements}
                        </div>
                      </div>
                    )}

                    {pos.detailed_requirements && pos.detailed_requirements.length > 0 && (
                      <div className="bg-gradient-to-br from-sky-50/50 to-white border border-sky-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-sm">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">Tiêu Chí Đánh Giá AI</h4>
                            <p className="text-xs text-slate-500">Hệ thống sẽ scan CV của bạn dựa trên các tiêu chí này</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {pos.detailed_requirements.map((req, idx) => (
                            <div key={req.id || idx} className="flex items-start gap-3 bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm hover:border-sky-200 transition-colors">
                              <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${req.is_mandatory ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`} title={req.is_mandatory ? "Bắt buộc" : "Tùy chọn"}>
                                {req.is_mandatory ? '★' : '☆'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-700 leading-snug">{req.requirement_text}</div>
                                <div className={`text-[10px] mt-1 uppercase font-bold tracking-wider ${req.is_mandatory ? 'text-rose-500' : 'text-slate-400'}`}>
                                  {req.is_mandatory ? 'Bắt buộc' : 'Tùy chọn / Ưu tiên'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              })}

              {(!jobPost.positions || jobPost.positions.length === 0) && (
                <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <p className="text-gray-500">Chưa có vị trí tuyển dụng nào cho chiến dịch này.</p>
                </div>
              )}
            </div>

          </div>

          {/* Cột Bên Phải */}
          <div className="space-y-6">
            
            {/* AI Info */}
            <div className="bg-gradient-to-br from-[#0a0f1c] to-slate-900 rounded-3xl p-6 border border-indigo-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
              
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Award className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="text-indigo-300 font-bold text-[10px] tracking-widest uppercase mb-1">Powered by AI</div>
                  <div className="text-white font-extrabold text-base leading-tight">ATS Thông Minh</div>
                </div>
              </div>
              <p className="text-indigo-100/70 text-sm font-medium leading-relaxed relative z-10">
                Chiến dịch sử dụng trí tuệ nhân tạo để quét và chấm điểm CV tự động. Hãy đảm bảo file PDF của bạn chứa đầy đủ từ khóa chuyên môn để đạt điểm số cao nhất.
              </p>
            </div>

            {/* Thông Tin Chung */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
              <h3 className="font-extrabold text-slate-800 mb-5 text-lg">Tổng Quan Chiến Dịch</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Số lượng vị trí</div>
                  <div className="font-semibold text-gray-800">{jobPost.positions?.length || 0} vị trí</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Hạn nộp hồ sơ</div>
                  <div className="font-semibold text-gray-800">
                    {jobPost.deadline ? new Date(jobPost.deadline).toLocaleDateString("vi-VN") : "Không giới hạn"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Trạng thái</div>
                  <div className="font-semibold">
                    {jobPost.status === 'OPEN' ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-100">Đang nhận hồ sơ</span>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-xs font-bold border border-rose-100">Đã đóng</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Về Công Ty */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
              <h3 className="font-extrabold text-slate-800 mb-5 text-lg">Về Công Ty</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm shrink-0">
                  {companyLogo}
                </div>
                <div>
                  <div className="font-extrabold text-slate-800 text-base leading-tight line-clamp-2">{jobPost.company_name || "Công ty chưa xác minh"}</div>
                  <div className="text-xs text-slate-500 mt-1 font-medium">Doanh nghiệp tuyển dụng</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {jobPost.company_description || "Nhà tuyển dụng chuyên nghiệp cung cấp môi trường làm việc năng động và chế độ đãi ngộ tốt."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog nộp đơn ứng tuyển */}
      <Dialog.Root open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 z-50 animate-in zoom-in-95 duration-300 outline-none max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-bold text-gray-900">
                Ứng Tuyển Vị Trí
              </Dialog.Title>
              <Dialog.Close className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 outline-none cursor-pointer">
                <XCircle className="w-6 h-6" />
              </Dialog.Close>
            </div>

            {selectedPosition && (
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 mb-6">
                <h4 className="font-bold text-sky-800 text-lg mb-1">{selectedPosition.title}</h4>
                <p className="text-sm text-sky-600 font-medium">{jobPost.company_name}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Vùng tải CV */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Tải Lên CV Của Bạn (PDF) <span className="text-red-500">*</span>
                </label>
                
                {uploadedCvName ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
                        PDF
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800 line-clamp-1">{uploadedCvName}</div>
                        <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
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
                      className="p-2 hover:bg-emerald-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
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

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Thư giới thiệu / Cover Letter (Không bắt buộc)
                </label>
                <textarea 
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Giới thiệu ngắn gọn lý do bạn phù hợp với vị trí này..."
                  className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm focus:border-[#0ea5e9] focus:ring-0 outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Nút thao tác */}
              <div className="flex gap-4 pt-4">
                <Dialog.Close className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors text-center cursor-pointer">
                  Hủy
                </Dialog.Close>
                <button
                  onClick={handleApplySubmit}
                  disabled={isSubmitting || isUploadingCv || !uploadedCvText}
                  className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>Nộp Đơn Ứng Tuyển</span>
                  )}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
export default JobDetail;
