import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Users, 
  Briefcase, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  DollarSign,
  Bell,
  BellOff,
  Heart
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { companyApi } from "../../api/companyApi";
import { jobApi } from "../../api/jobApi";
import { useThemeStore } from "../../store/useThemeStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useUiStore } from "../../store/useUiStore";

export function CompanyDetail() {
  const { id } = useParams();
  const { theme } = useThemeStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const showToast = useUiStore((state) => state.showToast);
  const queryClient = useQueryClient();

  // 1. Lấy thông tin chi tiết công ty (bao gồm is_following và follower_count)
  const { data: companyResponse, isLoading: isCompanyLoading, isError: isCompanyError } = useQuery({
    queryKey: ["company-detail", id],
    queryFn: async () => {
      const res = await companyApi.getCompanyById(id);
      return res.data;
    },
    enabled: !!id
  });

  // 2. Lấy danh sách việc làm đang mở của công ty này
  const { data: jobsResponse, isLoading: isJobsLoading } = useQuery({
    queryKey: ["company-jobs", id],
    queryFn: async () => {
      const res = await jobApi.getJobs({ company_id: id, status: "OPEN", limit: 100 });
      return res.data;
    },
    enabled: !!id
  });

  // 3. Mutation toggle follow
  const followMutation = useMutation({
    mutationFn: () => companyApi.toggleFollow(id),
    onSuccess: (res) => {
      const { is_following, follower_count, message } = res.data;
      // Cập nhật cache ngay lập tức để UI cập nhật tức thì (optimistic-like)
      queryClient.setQueryData(["company-detail", id], (old) => ({
        ...old,
        is_following,
        follower_count,
      }));
      showToast({ message, type: "success" });
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || "Không thể cập nhật trạng thái theo dõi.";
      showToast({ message: msg, type: "error" });
    }
  });

  const company = companyResponse;
  const jobs = jobsResponse?.items || [];

  if (isCompanyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-[#0a0f1c] bg-gray-50">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
        <p className="dark:text-slate-400 text-gray-500 text-sm">Đang tải hồ sơ công ty...</p>
      </div>
    );
  }

  if (isCompanyError || !company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-[#0a0f1c] bg-gray-50 text-center px-4">
        <Building className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <p className="text-red-500 font-bold mb-4">Không tìm thấy thông tin công ty này!</p>
        <Link to="/jobs" className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
          Quay lại danh sách việc làm
        </Link>
      </div>
    );
  }

  const isImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/") || url.startsWith("data:image");
  };

  const companyLogo = company.logo_url || company.name?.substring(0, 1).toUpperCase() || "C";

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

  // Kiểm tra người dùng hiện tại có phải ứng viên không (không phải HR/Admin)
  const isCandidate = isAuthenticated && user?.role?.toUpperCase() === 'USER';
  const isFollowing = company.is_following || false;
  const followerCount = company.follower_count || 0;

  return (
    <div className="min-h-screen dark:bg-[#0a0f1c] bg-gray-50 pb-16">
      {/* Banner Cover */}
      <div className="w-full h-48 bg-gradient-to-r from-[#0ea5e9]/20 to-[#38bdf8]/10 dark:from-[#0ea5e9]/10 dark:to-[#38bdf8]/5 relative border-b dark:border-white/5 border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end relative pb-6">
          <Link to="/jobs" className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Việc làm</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cột trái - Sidebar Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Thẻ thông tin nhanh */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
              {isImageUrl(company.logo_url) ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 object-cover shadow-md mb-4 bg-white"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl flex items-center justify-center text-5xl font-bold text-white shadow-md mb-4">
                  {companyLogo}
                </div>
              )}

              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {company.name}
              </h1>

              {company.industry && (
                <span className="inline-block px-3 py-1 bg-sky-50 dark:bg-sky-950/40 text-[#0ea5e9] dark:text-[#38bdf8] text-xs font-semibold rounded-full mb-3">
                  {company.industry}
                </span>
              )}

              {/* Số người theo dõi */}
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 mb-4">
                <Heart className="w-4 h-4 text-rose-400" />
                <span><strong className="text-gray-800 dark:text-white">{followerCount.toLocaleString()}</strong> người theo dõi</span>
              </div>

              {/* Nút Follow / Unfollow */}
              {isCandidate && (
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 mb-4 ${
                    isFollowing
                      ? "bg-sky-50 dark:bg-sky-950/30 text-[#0ea5e9] border-2 border-[#0ea5e9]/30 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:border-red-800"
                      : "bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white shadow-md shadow-sky-100 dark:shadow-sky-950 hover:shadow-lg hover:opacity-90"
                  }`}
                  id={`follow-btn-company-${id}`}
                >
                  {followMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <BellOff className="w-4 h-4" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Theo dõi công ty</span>
                    </>
                  )}
                </button>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-gray-400 dark:text-slate-500 italic mb-4">
                  <Link to="/login" className="text-[#0ea5e9] hover:underline font-semibold">Đăng nhập</Link> để theo dõi công ty này.
                </p>
              )}

              <div className="w-full border-t border-gray-100 dark:border-white/5 pt-4 space-y-3 text-left">
                {company.company_size && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Quy mô: {company.company_size} nhân sự</span>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a 
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#0ea5e9] hover:underline break-all"
                    >
                      {company.website.replace(/(^\w+:|^)\/\//, '')}
                    </a>
                  </div>
                )}

                {company.address && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="line-clamp-2">{company.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thẻ Thông tin liên hệ */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Thông tin liên hệ</h3>
              
              <div className="space-y-4">
                {company.contact_public ? (
                  <>
                    {company.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a href={`mailto:${company.email}`} className="hover:text-[#0ea5e9] transition-colors break-all">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <a href={`tel:${company.phone}`} className="hover:text-[#0ea5e9] transition-colors">
                          {company.phone}
                        </a>
                      </div>
                    )}
                    {!company.email && !company.phone && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 italic">Chưa cập nhật thông tin liên lạc.</p>
                    )}
                  </>
                ) : (
                  <div className="text-center p-3 bg-gray-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-gray-200 dark:border-white/5">
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Thông tin liên hệ được đặt ở chế độ riêng tư.</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">Liên hệ với nhà tuyển dụng qua hệ thống nộp đơn hoặc tin nhắn.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải - Nội dung giới thiệu & Việc làm đang tuyển */}
          <div className="lg:col-span-2 space-y-6">
            {/* Giới thiệu công ty */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#0ea5e9]" />
                <span>Giới thiệu công ty</span>
              </h2>

              {company.description ? (
                <div 
                  data-color-mode={theme} 
                  className="prose dark:prose-invert prose-sky max-w-none text-gray-700 dark:text-slate-300"
                >
                  <MDEditor.Markdown source={company.description} style={{ backgroundColor: 'transparent', padding: 0 }} />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-slate-400 italic text-sm">Chưa có thông tin giới thiệu chi tiết.</p>
              )}
            </div>

            {/* Việc làm đang tuyển dụng */}
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0ea5e9]" />
                <span>Vị trí đang tuyển dụng ({jobs.length})</span>
              </h2>

              {isJobsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin mr-2" />
                  <span className="text-sm text-gray-500 dark:text-slate-400">Đang tải danh sách công việc...</span>
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="group p-4 bg-gray-50/50 dark:bg-slate-800/20 rounded-xl border border-gray-100 dark:border-white/5 hover:border-sky-100 dark:hover:border-sky-950 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="font-semibold text-gray-900 dark:text-white hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] text-base transition-colors"
                        >
                          {job.title}
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-400 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.company_address || "Việt Nam"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#0ea5e9] dark:text-[#38bdf8] font-medium">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible)}
                          </span>
                          {job.experience_level && (
                            <>
                              <span>•</span>
                              <span>{job.experience_level}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <Link 
                        to={`/jobs/${job.id}`} 
                        className="flex items-center gap-1 text-xs font-bold text-[#0ea5e9] dark:text-[#38bdf8] hover:text-[#0284c7] group-hover:translate-x-1 transition-all flex-shrink-0"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50/50 dark:bg-slate-800/10 rounded-xl border border-dashed border-gray-200 dark:border-white/5">
                  <Briefcase className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-400 italic">Hiện tại công ty chưa đăng tin tuyển dụng nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;
