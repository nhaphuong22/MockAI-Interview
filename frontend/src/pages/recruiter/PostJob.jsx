import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Briefcase, Plus, Trash2, Calendar, DollarSign, Users, Award } from "lucide-react";
import { jobApi } from "../../api/jobApi";

export function PostJob() {
  const navigate = useNavigate();
  
  // 1. Quản lý State cho các trường thông tin cơ bản
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
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

  // 3. Kết nối API Đăng tin bằng useMutation
  const mutation = useMutation({
    mutationFn: (data) => jobApi.createJob(data),
    onSuccess: () => {
      alert("Đăng tin tuyển dụng thành công!");
      navigate("/hr/dashboard/manage-jobs");
    },
    onError: (error) => {
      console.error("Lỗi khi đăng tin tuyển dụng:", error);
      const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi kết nối hệ thống.";
      alert(errorMessage);
    }
  });

  // Handler gửi form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề công việc.");
      return;
    }

    // Lọc bỏ các yêu cầu chi tiết trống
    const cleanedDetailedReqs = detailedRequirements
      .filter((req) => req.requirement_text.trim() !== "")
      .map((req) => ({
        requirement_text: req.requirement_text.trim(),
        is_mandatory: !!req.is_mandatory
      }));

    // Chuẩn bị payload khớp với Schema Backend
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      requirements: formData.requirements.trim() || null,
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

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#0ea5e9]/10 rounded-2xl text-[#0ea5e9]">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Đăng Tin Tuyển Dụng</h1>
            <p className="text-gray-500 text-sm">Tạo tin tuyển dụng mới và thiết lập các yêu cầu chi tiết phục vụ AI đánh giá</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Thông tin chung */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0ea5e9]" />
                Thông tin chung công việc
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề công việc <span className="text-red-500">*</span></label>
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Award className="w-4 h-4 text-gray-400" /> Cấp độ kinh nghiệm
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors bg-white"
                  >
                    <option value="INTERN">Intern (Thực tập sinh)</option>
                    <option value="JUNIOR">Junior (Dưới 2 năm)</option>
                    <option value="MID">Mid-level (2-5 năm)</option>
                    <option value="SENIOR">Senior (Trên 5 năm)</option>
                    <option value="LEAD">Team Lead / Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" /> Số lượng cần tuyển
                  </label>
                  <input
                    type="number"
                    name="vacancyCount"
                    value={formData.vacancyCount}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                    placeholder="Số lượng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" /> Mức lương tối thiểu
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                    placeholder="VD: 15000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" /> Mức lương tối đa
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                    placeholder="VD: 30000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-400" /> Hạn nộp hồ sơ
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-6 pt-8">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      name="isSalaryVisible"
                      checked={formData.isSalaryVisible}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0ea5e9] border-gray-300 rounded focus:ring-[#0ea5e9]"
                    />
                    Hiển thị mức lương tuyển dụng
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Mô tả & Yêu cầu tổng quan */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả công việc</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none transition-colors"
                  placeholder="Mô tả chi tiết công việc, trách nhiệm..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Yêu cầu chung công việc (AI Context)</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none transition-colors"
                  placeholder="Ví dụ: Có kỹ năng ReactJS, hiểu biết sâu về Git, kinh nghiệm làm việc Agile/Scrum..."
                />
                <p className="text-gray-400 text-xs mt-1">Thông tin này sẽ được AI sử dụng làm bối cảnh để tạo câu hỏi phỏng vấn ứng viên.</p>
              </div>
            </div>

            {/* Section 3: Yêu cầu chi tiết để chấm điểm (Dynamic List) */}
            <div>
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0ea5e9]" />
                  Yêu cầu chi tiết để AI chấm điểm CV
                </h2>
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9]/20 rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm yêu cầu
                </button>
              </div>

              <div className="space-y-4">
                {detailedRequirements.map((req, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1 w-full">
                      <input
                        type="text"
                        value={req.requirement_text}
                        onChange={(e) => handleRequirementChange(index, "requirement_text", e.target.value)}
                        placeholder="VD: Thành thạo HTML5, CSS3 và Javascript ES6"
                        className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={req.is_mandatory}
                          onChange={(e) => handleRequirementChange(index, "is_mandatory", e.target.checked)}
                          className="w-4 h-4 text-[#0ea5e9] border-gray-300 rounded focus:ring-[#0ea5e9]"
                        />
                        Bắt buộc
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        disabled={detailedRequirements.length === 1}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa yêu cầu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Button Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-sky-100 hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mutation.isPending ? "Đang xử lý..." : "Đăng Tin Tuyển Dụng"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
export default PostJob;
