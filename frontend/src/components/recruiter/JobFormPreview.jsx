import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar,
  Users,
  GraduationCap,
  Award,
  Languages,
  FileText,
  Sparkles,
  CheckCircle,
  Circle
} from "lucide-react";

const REQUIREMENT_ICONS = {
  EDUCATION: GraduationCap,
  EXPERIENCE: Briefcase,
  SKILL: Award,
  LANGUAGE: Languages,
  CERTIFICATE: FileText,
  OTHER: Sparkles,
};

const REQUIREMENT_LABELS = {
  EDUCATION: "Học vấn",
  EXPERIENCE: "Kinh nghiệm",
  SKILL: "Kỹ năng",
  LANGUAGE: "Ngôn ngữ",
  CERTIFICATE: "Chứng chỉ",
  OTHER: "Khác",
};

export function JobFormPreview({ jobData, requirements }) {
  const formatSalary = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {jobData.title || "Tiêu đề công việc"}
        </h3>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
          {jobData.experience_level && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {jobData.experience_level}
            </span>
          )}
          {jobData.vacancy_count && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {jobData.vacancy_count} vị trí
            </span>
          )}
          {jobData.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Hạn: {new Date(jobData.deadline).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Salary */}
      {(jobData.salary_min || jobData.salary_max) && jobData.is_salary_visible && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <DollarSign className="w-5 h-5" />
            <span>Mức lương</span>
          </div>
          <p className="text-lg font-bold text-green-800 mt-1">
            {formatSalary(jobData.salary_min)} - {formatSalary(jobData.salary_max)}
          </p>
        </div>
      )}

      {/* Description */}
      {jobData.description && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Mô tả công việc</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{jobData.description}</p>
        </div>
      )}

      {/* Requirements */}
      {requirements && requirements.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Yêu cầu công việc</h4>
          <div className="space-y-3">
            {requirements.map((req, index) => {
              const Icon = REQUIREMENT_ICONS[req.requirement_type] || Award;
              const label = REQUIREMENT_LABELS[req.requirement_type] || "Khác";
              
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {req.is_required ? (
                      <CheckCircle className="w-5 h-5 text-[#0ea5e9]" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#0ea5e9]" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      {!req.is_required && (
                        <span className="text-xs text-gray-500">(Không bắt buộc)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{req.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
