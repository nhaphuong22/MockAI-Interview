import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2, Calendar, DollarSign, Users, Award, ChevronRight, FileText, CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobApi } from "../../api/jobApi";
import axiosClient from "../../api/axiosClient";


export function PostJob() {
  const navigate = useNavigate();
  

  // 1. Quản lý State cho các trường thông tin cơ bản

  // Verification State
  const [verificationStatus, setVerificationStatus] = useState('UNVERIFIED');

  const { data: verifyData, isLoading: verifyLoading } = useQuery({
    queryKey: ['companyVerification'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/status');
      return res.data;
    }
  });

  useEffect(() => {
    if (verifyData) {
      setVerificationStatus(verifyData.verificationStatus || 'UNVERIFIED');
    }
  }, [verifyData]);


  const [formData, setFormData] = useState({
    title: "",
    description: "",
    experienceLevel: "JUNIOR",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "VND",
    isSalaryVisible: true,
    vacancyCount: 1,
    deadline: ""
  });


  // 2. Quản lý State cho danh sách yêu cầu chi tiết (động)


  const [detailedRequirements, setDetailedRequirements] = useState([
    { requirement_text: "", is_mandatory: true }
  ]);


  // Handler cập nhật form cơ bản

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };


  // Handler thêm dòng yêu cầu chi tiết


  const handleAddRequirement = () => {
    setDetailedRequirements((prev) => [
      ...prev,
      { requirement_text: "", is_mandatory: true }
    ]);
  };


  // Handler xóa dòng yêu cầu chi tiết


  const handleRemoveRequirement = (index) => {
    if (detailedRequirements.length === 1) return;
    setDetailedRequirements((prev) => prev.filter((_, i) => i !== index));
  };


  // Handler cập nhật giá trị yêu cầu chi tiết


  const handleRequirementChange = (index, field, value) => {
    setDetailedRequirements((prev) => {
      const newList = [...prev];
      newList[index] = {
        ...newList[index],
        [field]: value
      };
      return newList;
    });
  };




  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const mutation = useMutation({
    mutationFn: (data) => jobApi.createJob(data),
    onSuccess: () => {
      showToast("Đăng tin tuyển dụng thành công!", "success");
      setTimeout(() => {
        navigate("/hr/dashboard/manage-jobs");
      }, 1500);
    },
    onError: (error) => {
      console.error("Lỗi khi đăng tin tuyển dụng:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Đã xảy ra lỗi khi kết nối hệ thống.";
      showToast(errorMessage, "error");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề công việc.", "error");
      return;
    }

    const cleanedDetailedReqs = detailedRequirements
      .filter((req) => req.requirement_text.trim() !== "")
      .map((req) => ({
        requirement_text: req.requirement_text.trim(),
        is_mandatory: !!req.is_mandatory
      }));

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      experience_level: formData.experienceLevel,
      salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
      salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
      salary_currency: formData.salaryCurrency,
      is_salary_visible: !!formData.isSalaryVisible,
      vacancy_count: parseInt(formData.vacancyCount) || 1,
      deadline: formData.deadline || null,
      detailed_requirements: cleanedDetailedReqs
    };

    mutation.mutate(payload);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }

    }
  };



  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }

  };

  if (verifyLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (verificationStatus !== 'APPROVED') {
    const isPending = verificationStatus === 'PENDING';
    const isSuspended = verificationStatus === 'SUSPENDED' || verificationStatus === 'REJECTED';
    
    return (
      <div className="bg-slate-50 min-h-screen py-16 px-4 flex items-center justify-center font-inter">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-lg text-center"
        >
          {isPending ? (
            <Clock className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-pulse" />
          ) : (
            <AlertCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
          )}
          <h2 className="text-2xl font-black text-slate-800 mb-3">
            {isPending ? "Đang chờ phê duyệt doanh nghiệp" : "Doanh nghiệp chưa được xác minh"}
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            {isPending 
              ? "Tài khoản của bạn đang liên kết với công ty đang chờ duyệt. Vui lòng liên hệ Admin để được phê duyệt trước khi đăng tin tuyển dụng."
              : isSuspended 
                ? `Yêu cầu xác thực doanh nghiệp bị từ chối hoặc tạm khóa${verifyData?.rejectReason ? `: "${verifyData.rejectReason}"` : ""}. Vui lòng truy cập trang Cài đặt & Xác minh để nộp lại giấy tờ.`
                : "Để đăng tin tuyển dụng, tài khoản của bạn cần phải được liên kết với một doanh nghiệp đã được xác thực trên hệ thống."
            }
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/hr/dashboard/company-setup')}
              className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
            >
              Cài đặt & Xác minh doanh nghiệp
            </button>
            <button 
              onClick={() => navigate('/hr/dashboard')}
              className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Quay lại Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }


  return (


    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-inter relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg border backdrop-blur-md ${
              toast.type === "success" 
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-800" 
                : "bg-rose-50/90 border-rose-200 text-rose-800"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-rose-500 font-bold text-sm">!</span>
              </div>
            )}
            <p className="font-bold text-sm">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="p-4 bg-sky-100/80 rounded-2xl text-sky-500 shadow-sm border border-sky-100">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Đăng Tin Tuyển Dụng</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Tạo cơ hội nghề nghiệp mới và thiết lập tiêu chí đánh giá AI</p>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-sky-500/5 blur-3xl pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            
            {/* Section 1: Thông tin chung */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Thông tin cơ bản</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 group">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tiêu đề công việc <span className="text-rose-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}

                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                    placeholder="VD: Senior Frontend Developer (ReactJS)"
                    required
                  />
                </div>


                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-sky-500" /> Cấp độ kinh nghiệm
                  </label>
                  <div className="relative">
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none transition-all duration-200 text-slate-700 font-medium appearance-none"
                    >
                      <option value="INTERN">Intern (Thực tập sinh)</option>
                      <option value="JUNIOR">Junior (Dưới 2 năm)</option>
                      <option value="MID">Mid-level (2-5 năm)</option>
                      <option value="SENIOR">Senior (Trên 5 năm)</option>
                      <option value="LEAD">Team Lead / Manager</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-500" /> Số lượng tuyển
                  </label>
                  <input
                    type="number"
                    name="vacancyCount"
                    value={formData.vacancyCount}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none transition-all duration-200 text-slate-700 font-medium"
                    placeholder="1"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Mức lương tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-slate-700 font-medium"
                    placeholder="VD: 15000000"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" /> Mức lương tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-slate-700 font-medium"
                    placeholder="VD: 30000000"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-500" /> Hạn nộp hồ sơ
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none transition-all duration-200 text-slate-700 font-medium"
                  />

                  <div className="flex items-center gap-3 pt-9">
                    <label className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          name="isSalaryVisible"
                          checked={formData.isSalaryVisible}
                          onChange={handleInputChange}
                          className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-700">Công khai mức lương</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Mô tả chi tiết */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Chi tiết công việc</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả công việc</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white outline-none resize-none transition-all duration-200 text-slate-700 leading-relaxed placeholder-slate-400"
                    placeholder="Viết mô tả chi tiết về vai trò, trách nhiệm, và văn hóa công ty..."
                  />
                </div>

              </div>
            </motion.div>

            {/* Section 3: Tiêu chí đánh giá AI */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-sm">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Tiêu chí đánh giá tự động</h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Hệ thống AI sẽ rà soát CV theo các tiêu chí này</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleAddRequirement}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl text-sm font-bold transition-colors border border-sky-100 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm tiêu chí
                </motion.button>
              </div>

              <div className="space-y-3 pt-2">
                <AnimatePresence>
                  {detailedRequirements.map((req, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95, margin: 0 }}
                      transition={{ duration: 0.2 }}
                      className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all"
                    >
                      <div className="flex-1 w-full flex items-center gap-3">
                        <span className="shrink-0 text-[10px] font-black text-slate-400 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-sky-100 group-hover:text-sky-500 transition-colors">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={req.requirement_text}
                          onChange={(e) => handleRequirementChange(index, "requirement_text", e.target.value)}
                          placeholder="Nhập kỹ năng hoặc yêu cầu (VD: English IELTS 6.5+)"
                          className="w-full px-2 py-2 bg-transparent border-none focus:ring-0 outline-none text-slate-700 font-medium text-sm placeholder-slate-400"
                        />
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto pl-9 sm:pl-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                        <label className="flex items-center gap-2 cursor-pointer group/toggle">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={req.is_mandatory}
                              onChange={(e) => handleRequirementChange(index, "is_mandatory", e.target.checked)}
                              className="peer sr-only"
                            />
                            <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 whitespace-nowrap group-hover/toggle:text-slate-800 transition-colors">
                            Bắt buộc
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(index)}
                          disabled={detailedRequirements.length === 1}
                          className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-20 disabled:hover:text-slate-400 rounded-lg hover:bg-rose-50 transition-colors ml-auto sm:ml-2"
                          title="Xóa tiêu chí"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

              </div>
            </motion.div>




            {/* Submit Action */}
            <motion.div variants={itemVariants} className="pt-8 mt-8 border-t border-slate-100">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-4 bg-sky-500 text-white font-bold text-lg rounded-2xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:bg-sky-400 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Briefcase className="w-5 h-5" />
                    Xuất bản Tin Tuyển Dụng
                  </>
                )}
              </motion.button>
              <p className="text-center text-xs text-slate-500 mt-4 font-medium">
                Bằng việc đăng tin, bạn đồng ý với các điều khoản tuyển dụng của chúng tôi.
              </p>
            </motion.div>


          </form>
        </motion.div>
      </div>
    </div>
  );
}
export default PostJob;
