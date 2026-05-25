import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { jobApi } from "../../api/jobApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, Plus, Trash2, CheckCircle, AlertCircle, Info, ArrowLeft, 
  Award, Users, Calendar, DollarSign, Eye, EyeOff, FileText, Check 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PostJob() {
  const navigate = useNavigate();

  // State quản lý Form chính
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState("OPEN");
  
  // State nâng cao vừa bổ sung
  const [experienceLevel, setExperienceLevel] = useState("JUNIOR");
  const [vacancyCount, setVacancyCount] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("VND");
  const [isSalaryVisible, setIsSalaryVisible] = useState(true);

  // State điều kiện lọc hồ sơ chi tiết
  const [detailedRequirements, setDetailedRequirements] = useState([
    { requirement_text: "", is_mandatory: true }
  ]);

  // State thông báo & validation
  const [validationError, setValidationError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Mutation đăng tin tuyển dụng
  const postJobMutation = useMutation({
    mutationFn: (data) => jobApi.createJob(data),
    onSuccess: (res) => {
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate("/hr/dashboard/manage-jobs");
      }, 2500);
    },
    onError: (error) => {
      console.error("Lỗi khi đăng tin tuyển dụng:", error);
      const msg = error.response?.data?.error || error.message || "Không thể đăng tin tuyển dụng.";
      setValidationError(msg);
    }
  });

  // Xử lý thêm yêu cầu chi tiết (điều kiện lọc)
  const handleAddRequirement = () => {
    setDetailedRequirements([
      ...detailedRequirements,
      { requirement_text: "", is_mandatory: true }
    ]);
  };

  // Xử lý xóa yêu cầu chi tiết
  const handleRemoveRequirement = (index) => {
    const updated = detailedRequirements.filter((_, i) => i !== index);
    setDetailedRequirements(updated.length > 0 ? updated : [{ requirement_text: "", is_mandatory: true }]);
  };

  // Xử lý thay đổi text yêu cầu chi tiết
  const handleRequirementTextChange = (index, value) => {
    const updated = [...detailedRequirements];
    updated[index].requirement_text = value;
    setDetailedRequirements(updated);
  };

  // Xử lý thay đổi tính bắt buộc
  const handleRequirementMandatoryToggle = (index) => {
    const updated = [...detailedRequirements];
    updated[index].is_mandatory = !updated[index].is_mandatory;
    setDetailedRequirements(updated);
  };

  // Xử lý gửi Form
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError("");

    // Validation cơ bản
    if (!title.trim()) {
      setValidationError("Tiêu đề công việc là bắt buộc và không được để trống.");
      return;
    }

    if (salaryMin && salaryMax && parseInt(salaryMax) < parseInt(salaryMin)) {
      setValidationError("Mức lương tối đa không được nhỏ hơn mức lương tối thiểu.");
      return;
    }

    // Lọc bỏ các yêu cầu chi tiết trống
    const validDetailedReqs = detailedRequirements
      .map(r => ({ ...r, requirement_text: r.requirement_text.trim() }))
      .filter(r => r.requirement_text !== "");

    // Gửi API
    postJobMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      status,
      experience_level: experienceLevel,
      vacancy_count: vacancyCount,
      deadline: deadline || null,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      salary_currency: salaryCurrency,
      is_salary_visible: isSalaryVisible,
      detailed_requirements: validDetailedReqs
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 relative overflow-hidden">
      {/* Toast thông báo thành công */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl border border-emerald-500/20 max-w-md"
          >
            <CheckCircle className="w-6 h-6 shrink-0 animate-bounce" />
            <div>
              <p className="font-semibold">Đăng tin tuyển dụng thành công!</p>
              <p className="text-xs text-emerald-100 font-normal">Hệ thống đang chuyển hướng về danh sách công việc...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate("/hr/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0ea5e9] mb-6 transition-colors group cursor-pointer text-sm font-medium border-0 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Quay lại bảng điều khiển
        </button>

        {/* Tiêu đề trang */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0ea5e9] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-[#0ea5e9]/20 shrink-0">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Đăng Tin Tuyển Dụng Mới</h1>
            <p className="text-gray-500 text-sm mt-0.5">Tạo tin tuyển dụng chuyên nghiệp, cấu hình mức lương, đãi ngộ và các tiêu chí lọc hồ sơ thông minh bằng AI.</p>
          </div>
        </div>

        {/* Khung Form đăng tuyển */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100 border border-gray-100 relative">
          {postJobMutation.isPending && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-3xl z-40 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-t-[#0ea5e9] border-[#0ea5e9]/20 rounded-full animate-spin"></div>
              <p className="text-gray-500 text-sm font-medium">Đang xử lý dữ liệu tin tuyển dụng...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Lỗi Validation */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 bg-rose-50 text-rose-700 p-4 rounded-2xl border border-rose-100 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-l-4 border-[#0ea5e9] pl-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0ea5e9]" />
                Thông tin cơ bản
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề công việc <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800"
                    placeholder="VD: Senior Frontend Developer (ReactJS)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái tin</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800 cursor-pointer"
                  >
                    <option value="OPEN">Mở tuyển dụng (OPEN)</option>
                    <option value="CLOSED">Đóng tuyển dụng (CLOSED)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả công việc</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800 resize-none"
                  placeholder="Mô tả tóm tắt về vai trò, nhiệm vụ và các phúc lợi hấp dẫn..."
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Yêu cầu công việc tổng quan</label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-2.5 w-64 shadow-lg z-20 font-normal leading-relaxed">
                      Thông tin yêu cầu tổng quan này sẽ được hệ thống AI sử dụng để tự động phân tích và sinh ra các câu hỏi phỏng vấn phù hợp cho ứng viên.
                    </div>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800 resize-none"
                  placeholder="Yêu cầu chung: Ngôn ngữ, kinh nghiệm làm việc, kỹ năng mềm..."
                />
              </div>
            </div>

            {/* PHẦN 2: CHI TIẾT ĐÃI NGỘ & YÊU CẦU */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 border-l-4 border-[#38bdf8] pl-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#38bdf8]" />
                Chi tiết tuyển dụng & Đãi ngộ
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cấp bậc / Kinh nghiệm */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gray-400" />
                    Cấp bậc yêu cầu
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800 cursor-pointer"
                  >
                    <option value="INTERN">Internship / Thực tập</option>
                    <option value="FRESHER">Fresher / Mới ra trường</option>
                    <option value="JUNIOR">Junior / Nhân viên</option>
                    <option value="MIDDLE">Middle / Trưởng nhóm phụ</option>
                    <option value="SENIOR">Senior / Chuyên gia</option>
                    <option value="LEAD">Lead / Trưởng nhóm</option>
                    <option value="MANAGER">Manager / Quản lý</option>
                  </select>
                </div>

                {/* Số lượng tuyển */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    Số lượng tuyển dụng
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={vacancyCount}
                    onChange={(e) => setVacancyCount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800"
                    placeholder="Số lượng"
                  />
                </div>

                {/* Hạn chót nhận hồ sơ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Hạn chót nộp hồ sơ
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/10 focus:outline-none transition-all text-gray-800 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mức lương */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-5 h-5 text-[#0ea5e9]" />
                    <span className="text-sm font-bold text-gray-800">Khoảng lương đãi ngộ</span>
                  </div>
                  {/* Toggle switch cho trạng thái Hiển thị công khai mức lương */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Hiển thị công khai</span>
                    <button
                      type="button"
                      onClick={() => setIsSalaryVisible(!isSalaryVisible)}
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
                        isSalaryVisible ? "bg-[#0ea5e9]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                          isSalaryVisible ? "translate-x-5.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isSalaryVisible ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center"
                  >
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Lương tối thiểu"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-all text-sm text-gray-800"
                      />
                    </div>
                    <div className="text-center text-gray-400 text-sm font-bold md:col-span-1">đến</div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Lương tối đa"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-all text-sm text-gray-800"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 text-gray-500 bg-white border border-gray-200 rounded-xl p-3.5"
                  >
                    <EyeOff className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">Lương sẽ hiển thị là **\"Thỏa thuận\"** đối với ứng viên</span>
                  </motion.div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <span className="text-xs font-semibold text-gray-500">Đơn vị tiền tệ:</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="currency" 
                        value="VND"
                        checked={salaryCurrency === "VND"} 
                        onChange={() => setSalaryCurrency("VND")} 
                        className="accent-[#0ea5e9]"
                      />
                      VND (đ)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-gray-700">
                      <input 
                        type="radio" 
                        name="currency" 
                        value="USD"
                        checked={salaryCurrency === "USD"} 
                        onChange={() => setSalaryCurrency("USD")} 
                        className="accent-[#0ea5e9]"
                      />
                      USD ($)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* PHẦN 3: ĐIỀU KIỆN LỌC HỒ SƠ CHI TIẾT */}
            <div className="space-y-6 pt-6 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 border-l-4 border-[#38bdf8] pl-3">Điều kiện lọc hồ sơ chi tiết (AI Filter)</h2>
                  <p className="text-xs text-gray-500 mt-1 pl-4">Thiết lập các tiêu chí chuyên môn để hệ thống AI tự động chấm điểm và đánh giá CV.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer self-start sm:self-center border-0"
                >
                  <Plus className="w-4 h-4" />
                  Thêm tiêu chí
                </button>
              </div>

              {/* Danh sách tiêu chí lọc */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {detailedRequirements.map((req, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      exit={{ opacity: 0, x: 50, height: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-150 relative group/item">
                        {/* Chỉ mục */}
                        <div className="w-6 h-6 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold self-start sm:self-center">
                          {idx + 1}
                        </div>

                        {/* Nhập text điều kiện */}
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            value={req.requirement_text}
                            onChange={(e) => handleRequirementTextChange(idx, e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-all text-sm text-gray-800"
                            placeholder="VD: Có ít nhất 2 năm kinh nghiệm làm việc với ReactJS"
                          />
                        </div>

                        {/* Switch Bắt buộc / Không bắt buộc */}
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-500 select-none">Bắt buộc</span>
                            <button
                              type="button"
                              onClick={() => handleRequirementMandatoryToggle(idx)}
                              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center ${
                                req.is_mandatory ? "bg-[#0ea5e9]" : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                  req.is_mandatory ? "translate-x-5.5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Nút xóa */}
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idx)}
                            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-200 cursor-pointer border-0 bg-transparent"
                            title="Xóa tiêu chí"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Nút đăng tuyển */}
            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={postJobMutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:from-[#0ea5e9]/95 hover:to-[#38bdf8]/95 hover:shadow-lg hover:shadow-[#0ea5e9]/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-base shadow-md border-0"
              >
                {postJobMutation.isPending ? "Đang xử lý đăng tin tuyển dụng..." : "Đăng Tin Tuyển Dụng Ngay"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default PostJob;
