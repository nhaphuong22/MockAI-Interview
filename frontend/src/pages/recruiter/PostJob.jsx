import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2, Calendar, DollarSign, Users, Award, ChevronRight, CheckCircle2, Loader2, Layers, AlignLeft, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { jobApi } from "../../api/jobApi";
import axiosClient from "../../api/axiosClient";
import { VerifyCompany } from "./components/VerifyCompany";

export function PostJob() {
  const navigate = useNavigate();
  
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
    if (verifyData?.status) {
      setVerificationStatus(verifyData.status);
    }
  }, [verifyData]);

  // Campaign State (job_post)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: ""
  });

  // Positions State (jobs)
  const [positions, setPositions] = useState([
    {
      title: "",
      requirements: "",
      experienceLevel: "JUNIOR",
      salaryMin: "",
      salaryMax: "",
      salaryCurrency: "VND",
      isSalaryVisible: true,
      vacancyCount: 1,
      detailedRequirements: [
        { requirement_text: "", is_mandatory: true }
      ]
    }
  ]);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePositionChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setPositions(prev => {
      const newList = [...prev];
      newList[index] = {
        ...newList[index],
        [name]: type === "checkbox" ? checked : value
      };
      return newList;
    });
  };

  const handleAddPosition = () => {
    setPositions(prev => [
      ...prev,
      {
        title: "",
        requirements: "",
        experienceLevel: "JUNIOR",
        salaryMin: "",
        salaryMax: "",
        salaryCurrency: "VND",
        isSalaryVisible: true,
        vacancyCount: 1,
        detailedRequirements: [
          { requirement_text: "", is_mandatory: true }
        ]
      }
    ]);
  };

  const handleRemovePosition = (index) => {
    if (positions.length === 1) return;
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRequirement = (posIndex) => {
    setPositions(prev => {
      const newList = [...prev];
      newList[posIndex].detailedRequirements.push({ requirement_text: "", is_mandatory: true });
      return newList;
    });
  };

  const handleRemoveRequirement = (posIndex, reqIndex) => {
    setPositions(prev => {
      const newList = [...prev];
      if (newList[posIndex].detailedRequirements.length === 1) return newList;
      newList[posIndex].detailedRequirements = newList[posIndex].detailedRequirements.filter((_, i) => i !== reqIndex);
      return newList;
    });
  };

  const handleFillMockData = () => {
    setFormData({
      title: "Tuyển dụng nhân sự khối Kỹ thuật (Engineering) - Quý 3/2026",
      description: "Gia nhập đội ngũ kỹ sư tinh nhuệ của MockAI để xây dựng các nền tảng AI đột phá. Môi trường làm việc Hybrid linh hoạt, trang bị Macbook Pro M3 Max, bảo hiểm sức khỏe Premium và thưởng hiệu suất lên đến 6 tháng lương.",
      deadline: "2026-12-31"
    });
    setPositions([
      {
        title: "Senior Frontend Developer (React/Next.js)",
        requirements: "Tối thiểu 4 năm kinh nghiệm làm việc với ReactJS và hệ sinh thái (Zustand, TanStack Query). Nắm vững kiến trúc Frontend và Vite. Có kinh nghiệm tối ưu hóa hiệu năng, Core Web Vitals và thiết kế UI/UX hiện đại.",
        experienceLevel: "SENIOR",
        salaryMin: 40000000,
        salaryMax: 65000000,
        salaryCurrency: "VND",
        isSalaryVisible: true,
        vacancyCount: 2,
        detailedRequirements: [
          { requirement_text: "Thành thạo ReactJS 18+ và TypeScript", is_mandatory: true },
          { requirement_text: "Có kinh nghiệm tích hợp API và WebSockets", is_mandatory: true },
          { requirement_text: "Có khả năng đọc hiểu tài liệu Tiếng Anh tốt", is_mandatory: true }
        ]
      },
      {
        title: "Mid-level Node.js Backend Engineer",
        requirements: "Có kiến thức sâu rộng về Node.js (Express), cơ chế xử lý bất đồng bộ, Event Loop. Am hiểu về thiết kế cơ sở dữ liệu quan hệ (PostgreSQL) và bộ nhớ đệm (Redis).",
        experienceLevel: "MID",
        salaryMin: 25000000,
        salaryMax: 45000000,
        salaryCurrency: "VND",
        isSalaryVisible: true,
        vacancyCount: 3,
        detailedRequirements: [
          { requirement_text: "Có tối thiểu 2 năm kinh nghiệm thực tế với Node.js", is_mandatory: true },
          { requirement_text: "Nắm vững SQL và tối ưu hóa truy vấn PostgreSQL", is_mandatory: true },
          { requirement_text: "Có hiểu biết cơ bản về Docker và CI/CD", is_mandatory: false }
        ]
      }
    ]);
    showToast("Đã nạp dữ liệu mẫu thành công!", "success");
  };

  const handleRequirementChange = (posIndex, reqIndex, field, value) => {
    setPositions(prev => {
      const newList = [...prev];
      newList[posIndex].detailedRequirements[reqIndex] = {
        ...newList[posIndex].detailedRequirements[reqIndex],
        [field]: value
      };
      return newList;
    });
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
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi kết nối hệ thống.";
      showToast(errorMessage, "error");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tiêu đề chiến dịch.", "error");
      return;
    }

    let hasError = false;
    const cleanedPositions = positions.map((pos, i) => {
      if (!pos.title.trim()) {
        showToast(`Vui lòng nhập tên vị trí số ${i + 1}.`, "error");
        hasError = true;
      }
      
      const cleanedDetailedReqs = pos.detailedRequirements
        .filter((req) => req.requirement_text.trim() !== "")
        .map((req) => ({
          requirement_text: req.requirement_text.trim(),
          is_mandatory: !!req.is_mandatory
        }));

      return {
        title: pos.title.trim(),
        requirements: pos.requirements.trim() || null,
        experienceLevel: pos.experienceLevel,
        salaryMin: pos.salaryMin ? parseInt(pos.salaryMin) : null,
        salaryMax: pos.salaryMax ? parseInt(pos.salaryMax) : null,
        salaryCurrency: pos.salaryCurrency,
        isSalaryVisible: !!pos.isSalaryVisible,
        vacancyCount: parseInt(pos.vacancyCount) || 1,
        detailedRequirements: cleanedDetailedReqs
      };
    });

    if (hasError) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      deadline: formData.deadline || null,
      positions: cleanedPositions
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
    return <VerifyCompany status={verificationStatus} setStatus={setVerificationStatus} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-inter relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50, y: 0 }}
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

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-sky-100/80 rounded-2xl text-sky-500 shadow-sm border border-sky-100">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Đăng Tin Tuyển Dụng</h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">Tạo chiến dịch tuyển dụng và định nghĩa các vị trí cần tuyển</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillMockData}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-sm transition-colors border border-indigo-100 shadow-sm mt-4 sm:mt-0"
          >
            <Wand2 className="w-4 h-4" /> Nạp Dữ Liệu Mẫu
          </button>
        </motion.div>

        {/* Layout Grid Split */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
          {/* CỘT TRÁI: THÔNG TIN CHIẾN DỊCH (Sticky) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-4 space-y-6 lg:sticky lg:top-8"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>

               <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6 relative z-10">
                 <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] text-white p-2.5 rounded-xl shadow-md shadow-sky-200">
                   <AlignLeft className="w-5 h-5" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-slate-800">Thông Tin Chiến Dịch</h2>
                   <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Bước 1</p>
                 </div>
               </div>

               {/* Inputs */}
               <div className="space-y-6 relative z-10">
                 {/* Title */}
                 <div className="group">
                   <label className="block text-sm font-bold text-slate-700 mb-2">
                     Tiêu đề chiến dịch <span className="text-rose-500">*</span>
                   </label>
                   <input
                     type="text"
                     name="title"
                     value={formData.title}
                     onChange={handleInputChange}
                     className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-4 focus:ring-sky-500/10 outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-700 font-medium"
                     placeholder="VD: Tuyển dụng lập trình viên Quý 3"
                     required
                   />
                 </div>

                 {/* Description */}
                 <div className="group">
                   <label className="block text-sm font-bold text-slate-700 mb-2">
                     Mô tả chung (Văn hóa, phúc lợi...)
                   </label>
                   <textarea
                     name="description"
                     value={formData.description}
                     onChange={handleInputChange}
                     rows={5}
                     className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none resize-none transition-all duration-200 text-slate-700 leading-relaxed placeholder-slate-400"
                     placeholder="Giới thiệu về chiến dịch và đãi ngộ công ty..."
                   />
                 </div>

                 {/* Deadline */}
                 <div className="group">
                   <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-sky-500" /> Hạn nộp hồ sơ
                   </label>
                   <input
                     type="date"
                     name="deadline"
                     value={formData.deadline}
                     onChange={handleInputChange}
                     className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all duration-200 text-slate-700 font-medium"
                   />
                 </div>
               </div>

               {/* Submit Button Inside Sticky Sidebar */}
               <div className="mt-8 pt-6 border-t border-slate-100 relative z-10">
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   type="submit"
                   disabled={mutation.isPending}
                   className="w-full py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold text-lg rounded-xl shadow-[0_4px_20px_0_rgba(14,165,233,0.3)] hover:shadow-[0_6px_25px_rgba(14,165,233,0.4)] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                 >
                   {mutation.isPending ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Đang xử lý...
                     </>
                   ) : (
                     <>
                       <Briefcase className="w-5 h-5" />
                       Xuất Bản Chiến Dịch
                     </>
                   )}
                 </motion.button>
                 <p className="text-center text-[11px] text-slate-400 mt-4 font-medium uppercase tracking-wide">
                   Lưu ý: Bạn có thể thêm nhiều vị trí ở cột bên phải
                 </p>
               </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI: DANH SÁCH VỊ TRÍ */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6 relative z-10">
                 <div className="flex items-center gap-3">
                   <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-200">
                     <Layers className="w-5 h-5" />
                   </div>
                   <div>
                     <h2 className="text-lg font-bold text-slate-800">Các Vị Trí Tuyển Dụng</h2>
                     <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Bước 2</p>
                   </div>
                 </div>
                 
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   type="button"
                   onClick={handleAddPosition}
                   className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-sm font-bold transition-colors border border-emerald-100/50 shadow-sm"
                 >
                   <Plus className="w-4 h-4" /> Thêm Vị Trí Mới
                 </motion.button>
               </div>

               <div className="space-y-6 relative z-10">
                 <AnimatePresence>
                   {positions.map((pos, pIndex) => (
                     <motion.div
                       key={pIndex}
                       initial={{ opacity: 0, y: 10, scale: 0.98 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                       transition={{ duration: 0.3 }}
                       className="bg-slate-50/70 rounded-2xl p-6 sm:p-8 border border-slate-200 relative group overflow-hidden"
                     >
                       {/* Line Accent */}
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                       {/* Delete Position Button */}
                       {positions.length > 1 && (
                         <button
                           type="button"
                           onClick={() => handleRemovePosition(pIndex)}
                           className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                           title="Xóa Vị Trí Này"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                       )}

                       <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-3">
                         <span className="bg-emerald-100 text-emerald-600 w-8 h-8 flex items-center justify-center rounded-xl text-sm border border-emerald-200 shadow-sm">
                           {pIndex + 1}
                         </span>
                         Thông tin Vị Trí
                       </h3>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {/* Job Title */}
                         <div className="md:col-span-2">
                           <label className="block text-sm font-bold text-slate-700 mb-2">
                             Tên vị trí <span className="text-rose-500">*</span>
                           </label>
                           <input
                             type="text"
                             name="title"
                             value={pos.title}
                             onChange={(e) => handlePositionChange(pIndex, e)}
                             className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-colors"
                             placeholder="VD: Senior Frontend Developer"
                             required
                           />
                         </div>

                         {/* Experience Level */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                             <Award className="w-4 h-4 text-emerald-500" /> Cấp độ kinh nghiệm
                           </label>
                           <div className="relative">
                             <select
                               name="experienceLevel"
                               value={pos.experienceLevel}
                               onChange={(e) => handlePositionChange(pIndex, e)}
                               className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200 text-slate-700 font-medium appearance-none"
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

                         {/* Vacancy Count */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                             <Users className="w-4 h-4 text-emerald-500" /> Số lượng tuyển
                           </label>
                           <input
                             type="number"
                             name="vacancyCount"
                             value={pos.vacancyCount}
                             onChange={(e) => handlePositionChange(pIndex, e)}
                             min="1"
                             className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200 text-slate-700 font-medium"
                             placeholder="1"
                           />
                         </div>

                         {/* Salary Min */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                             <DollarSign className="w-4 h-4 text-emerald-500" /> Mức lương tối thiểu (VNĐ)
                           </label>
                           <input
                             type="number"
                             name="salaryMin"
                             value={pos.salaryMin}
                             onChange={(e) => handlePositionChange(pIndex, e)}
                             min="0"
                             className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200 text-slate-700 font-medium"
                             placeholder="VD: 15000000"
                           />
                         </div>

                         {/* Salary Max */}
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                             <DollarSign className="w-4 h-4 text-emerald-500" /> Mức lương tối đa (VNĐ)
                           </label>
                           <input
                             type="number"
                             name="salaryMax"
                             value={pos.salaryMax}
                             onChange={(e) => handlePositionChange(pIndex, e)}
                             min="0"
                             className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-200 text-slate-700 font-medium"
                             placeholder="VD: 30000000"
                           />
                         </div>

                         {/* Salary Visibility */}
                         <div className="md:col-span-2 flex items-center gap-3 pt-2 pb-2">
                           <label className="flex items-center gap-3 cursor-pointer group/toggle">
                             <div className="relative flex items-center">
                               <input
                                 type="checkbox"
                                 name="isSalaryVisible"
                                 checked={pos.isSalaryVisible}
                                 onChange={(e) => handlePositionChange(pIndex, e)}
                                 className="peer sr-only"
                               />
                               <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                             </div>
                             <span className="text-sm font-bold text-slate-700 select-none">Công khai mức lương trên tin đăng</span>
                           </label>
                         </div>

                         {/* AI Requirements Context */}
                         <div className="md:col-span-2 bg-sky-50/60 p-5 rounded-2xl border border-sky-100 mt-2">
                           <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                             <span>Yêu cầu chung cho vị trí này</span>
                             <span className="text-[10px] uppercase tracking-wider font-bold bg-sky-200 text-sky-700 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                               AI Context
                             </span>
                           </label>
                           <textarea
                             name="requirements"
                             value={pos.requirements}
                             onChange={(e) => handlePositionChange(pIndex, e)}
                             rows={3}
                             className="w-full px-4 py-3.5 bg-white border border-sky-100 rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 outline-none resize-none transition-all duration-200 text-slate-700 leading-relaxed placeholder-slate-400 shadow-sm"
                             placeholder="VD: Thành thạo ReactJS, có kiến thức sâu về State Management, hiểu biết về CI/CD..."
                           />
                           <p className="text-sky-700 text-xs mt-3 font-semibold flex items-center gap-1.5 bg-white/50 w-fit px-3 py-1.5 rounded-lg border border-sky-100/50">
                             <CheckCircle2 className="w-4 h-4 text-sky-500" />
                             Hệ thống AI sẽ phân tích nội dung này để tự động thiết kế bộ câu hỏi phỏng vấn.
                           </p>
                         </div>

                         {/* Tiêu chí đánh giá AI */}
                         <div className="md:col-span-2 mt-4">
                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                             <div>
                               <label className="block text-sm font-bold text-slate-800">Các Tiêu Chí Trích Xuất (Resume Parser)</label>
                               <p className="text-xs text-slate-500 font-medium mt-1">Dùng để quét CV tự động và chấm điểm ứng viên</p>
                             </div>
                             <button
                               type="button"
                               onClick={() => handleAddRequirement(pIndex)}
                               className="flex items-center gap-1.5 px-3 py-2 bg-slate-200/50 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                             >
                               <Plus className="w-3.5 h-3.5" /> Thêm tiêu chí
                             </button>
                           </div>

                           <div className="space-y-3">
                             {pos.detailedRequirements.map((req, rIndex) => (
                               <div key={rIndex} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-200 transition-colors group/req">
                                 <div className="flex-1 w-full flex items-center gap-3 pl-1">
                                   <span className="shrink-0 text-[10px] font-black text-slate-400 bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center">
                                     {rIndex + 1}
                                   </span>
                                   <input
                                     type="text"
                                     value={req.requirement_text}
                                     onChange={(e) => handleRequirementChange(pIndex, rIndex, "requirement_text", e.target.value)}
                                     placeholder="VD: Tiếng Anh IELTS 6.5+ hoặc chứng chỉ React Developer"
                                     className="w-full px-2 py-1.5 bg-transparent border-none focus:ring-0 outline-none text-slate-700 font-medium text-sm placeholder-slate-400"
                                   />
                                 </div>
                                 <div className="flex items-center gap-3 w-full sm:w-auto pl-10 sm:pl-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                                   <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                     <div className="relative flex items-center">
                                       <input
                                         type="checkbox"
                                         checked={req.is_mandatory}
                                         onChange={(e) => handleRequirementChange(pIndex, rIndex, "is_mandatory", e.target.checked)}
                                         className="peer sr-only"
                                       />
                                       <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500"></div>
                                     </div>
                                     <span className="text-xs font-bold text-slate-600 whitespace-nowrap group-hover/toggle:text-slate-800 transition-colors select-none">
                                       Bắt buộc
                                     </span>
                                   </label>
                                   <button
                                     type="button"
                                     onClick={() => handleRemoveRequirement(pIndex, rIndex)}
                                     disabled={pos.detailedRequirements.length === 1}
                                     className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-20 disabled:hover:text-slate-400 rounded-lg hover:bg-rose-50 transition-colors ml-auto sm:ml-2"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>

                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
            </div>
          </motion.div>

        </form>
      </div>
    </div>
  );
}
export default PostJob;
