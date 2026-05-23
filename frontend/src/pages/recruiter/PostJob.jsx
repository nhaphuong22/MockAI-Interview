import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createJobApi } from "../../api/jobs";
import { 
  Briefcase, 
  Plus, 
  X, 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  GraduationCap,
  Award,
  Languages,
  FileText,
  Sparkles
} from "lucide-react";

const REQUIREMENT_TYPES = [
  { value: "EDUCATION", label: "Học vấn", icon: GraduationCap },
  { value: "EXPERIENCE", label: "Kinh nghiệm", icon: Briefcase },
  { value: "SKILL", label: "Kỹ năng", icon: Award },
  { value: "LANGUAGE", label: "Ngôn ngữ", icon: Languages },
  { value: "CERTIFICATE", label: "Chứng chỉ", icon: FileText },
  { value: "OTHER", label: "Khác", icon: Sparkles },
];

const EXPERIENCE_LEVELS = [
  { value: "INTERN", label: "Thực tập sinh" },
  { value: "JUNIOR", label: "Junior (0-2 năm)" },
  { value: "MID", label: "Middle (2-5 năm)" },
  { value: "SENIOR", label: "Senior (5+ năm)" },
  { value: "LEAD", label: "Lead/Manager" },
];

export function PostJob() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "VND",
    is_salary_visible: true,
    vacancy_count: 1,
    deadline: "",
  });

  const [jobRequirements, setJobRequirements] = useState([
    { requirement_type: "EDUCATION", description: "", is_required: true, priority: 0 }
  ]);

  const createJobMutation = useMutation({
    mutationFn: createJobApi,
    onSuccess: (data) => {
      alert("Đăng tin tuyển dụng thành công!");
      // Reset form
      setFormData({
        title: "",
        description: "",
        requirements: "",
        experience_level: "",
        salary_min: "",
        salary_max: "",
        salary_currency: "VND",
        is_salary_visible: true,
        vacancy_count: 1,
        deadline: "",
      });
      setJobRequirements([
        { requirement_type: "EDUCATION", description: "", is_required: true, priority: 0 }
      ]);
    },
    onError: (error) => {
      alert("Có lỗi xảy ra: " + (error.response?.data?.error || error.message));
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleRequirementChange = (index, field, value) => {
    const updated = [...jobRequirements];
    updated[index][field] = value;
    setJobRequirements(updated);
  };

  const addRequirement = () => {
    setJobRequirements([
      ...jobRequirements,
      { 
        requirement_type: "SKILL", 
        description: "", 
        is_required: true, 
        priority: jobRequirements.length 
      }
    ]);
  };

  const removeRequirement = (index) => {
    if (jobRequirements.length > 1) {
      setJobRequirements(jobRequirements.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description) {
      alert("Vui lòng điền đầy đủ tiêu đề và mô tả công việc");
      return;
    }

    // Filter out empty requirements
    const validRequirements = jobRequirements.filter(req => req.description.trim());

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
      vacancy_count: parseInt(formData.vacancy_count) || 1,
      job_requirements: validRequirements,
    };

    createJobMutation.mutate(payload);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-[#0ea5e9]" />
            Đăng Tin Tuyển Dụng
          </h1>
          <p className="text-gray-600 mt-2">
            Tạo tin tuyển dụng chuyên nghiệp với các yêu cầu chi tiết
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0ea5e9]" />
              Thông tin cơ bản
            </h2>

            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề công việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                  placeholder="VD: Senior Frontend Developer"
                  required
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả công việc <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none transition-colors"
                  placeholder="Mô tả chi tiết về công việc, trách nhiệm, quyền lợi..."
                  required
                />
              </div>

              {/* Requirements Summary (for AI) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tóm tắt yêu cầu (dùng cho AI)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none transition-colors"
                  placeholder="VD: 3+ năm kinh nghiệm React, thành thạo JavaScript, TypeScript..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Thông tin này sẽ được AI sử dụng để đặt câu hỏi phỏng vấn
                </p>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ kinh nghiệm
                </label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                >
                  <option value="">-- Chọn cấp độ --</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Mức lương tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                    placeholder="10000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Mức lương tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                    placeholder="20000000"
                  />
                </div>
              </div>

              {/* Salary Visibility */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_salary_visible"
                  id="is_salary_visible"
                  checked={formData.is_salary_visible}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#0ea5e9] border-gray-300 rounded focus:ring-[#0ea5e9]"
                />
                <label htmlFor="is_salary_visible" className="text-sm text-gray-700">
                  Hiển thị mức lương công khai
                </label>
              </div>

              {/* Vacancy Count & Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Số lượng tuyển
                  </label>
                  <input
                    type="number"
                    name="vacancy_count"
                    value={formData.vacancy_count}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Hạn nộp hồ sơ
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Requirements */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0ea5e9]" />
                Yêu cầu chi tiết
              </h2>
              <button
                type="button"
                onClick={addRequirement}
                className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Thêm yêu cầu
              </button>
            </div>

            <div className="space-y-4">
              {jobRequirements.map((req, index) => {
                const Icon = REQUIREMENT_TYPES.find(t => t.value === req.requirement_type)?.icon || Award;
                
                return (
                  <div key={index} className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#0ea5e9] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-2">
                        <Icon className="w-5 h-5 text-[#0ea5e9]" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {/* Requirement Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <select
                            value={req.requirement_type}
                            onChange={(e) => handleRequirementChange(index, "requirement_type", e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:outline-none text-sm"
                          >
                            {REQUIREMENT_TYPES.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={req.is_required}
                              onChange={(e) => handleRequirementChange(index, "is_required", e.target.checked)}
                              className="w-4 h-4 text-[#0ea5e9] border-gray-300 rounded focus:ring-[#0ea5e9]"
                              id={`required-${index}`}
                            />
                            <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
                              Bắt buộc
                            </label>
                          </div>
                        </div>

                        {/* Description */}
                        <textarea
                          value={req.description}
                          onChange={(e) => handleRequirementChange(index, "description", e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0ea5e9] focus:outline-none resize-none text-sm"
                          placeholder="Mô tả chi tiết yêu cầu..."
                        />
                      </div>

                      {/* Remove Button */}
                      {jobRequirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createJobMutation.isPending}
              className="flex-1 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createJobMutation.isPending ? "Đang đăng tin..." : "Đăng Tin Tuyển Dụng"}
            </button>
            <button
              type="button"
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
