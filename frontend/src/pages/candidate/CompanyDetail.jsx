import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
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
  Heart,
  Crown,
  Sparkles
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

  const [isDescExpanded, setIsDescExpanded] = useState(false);

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

  const isVip = company.is_vip === true;
  const vipThemeColor = isVip ? (company.vip_theme_color || "#0ea5e9") : "#0ea5e9";
  const vipBorderStyle = isVip ? (company.vip_border_style || "gradient-glow") : null;
  const bannerUrl = company.banner_url || (isVip ? company.vip_banner_url : null);

  return (
    <div className="min-h-screen dark:bg-[#030712] bg-[#f8fafc] pb-20 font-inter">
      {/* Banner Cover */}
      <div 
        className="w-full h-72 md:h-96 relative bg-cover bg-center"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
          backgroundColor: bannerUrl ? undefined : `${vipThemeColor}15`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0a0f1c]/90 dark:to-[#0a0f1c]"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-start pt-6 relative z-10">
          <Link to="/jobs" className="flex items-center gap-2 text-white/90 hover:text-white transition-all bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/10 hover:border-white/30 hover:scale-105 duration-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Việc làm</span>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-20">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Cột trái - Sidebar Profile */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col items-center text-center relative"
            >
              <div className="relative mb-6 group -mt-16 md:-mt-20">
                {isImageUrl(company.logo_url) ? (
                  <img 
                    src={company.logo_url} 
                    alt={company.name} 
                    className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 object-cover bg-white relative z-10 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      borderColor: isVip ? vipThemeColor : '#ffffff',
                      boxShadow: (isVip && vipBorderStyle === 'gradient-glow') ? `0 10px 30px -10px ${vipThemeColor}` : '0 10px 30px -10px rgba(0,0,0,0.15)'
                    }}
                  />
                ) : (
                  <div 
                    className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center text-6xl font-black text-white relative z-10 shadow-xl transition-transform duration-500 group-hover:scale-105"
                    style={{
                      boxShadow: (isVip && vipBorderStyle === 'gradient-glow') ? `0 10px 30px -10px ${vipThemeColor}` : undefined
                    }}
                  >
                    {companyLogo}
                  </div>
                )}
                
                {/* VIP badge */}
                {isVip && vipBorderStyle === 'crown-badge' && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white p-2 rounded-xl shadow-lg z-20 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-300">
                    <Crown size={20} className="fill-white text-white drop-shadow-md" />
                  </div>
                )}

                {isVip && vipBorderStyle === 'sparkle-stars' && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-400 to-blue-500 text-white p-1.5 rounded-full shadow-lg z-20 flex items-center justify-center animate-pulse">
                    <Sparkles size={16} className="text-white drop-shadow-md" />
                  </div>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 line-clamp-2 tracking-tight">
                {company.name}
              </h1>

              {company.industry && (
                <span 
                  className="inline-block px-4 py-1.5 text-xs font-bold rounded-xl mb-4 backdrop-blur-md"
                  style={{
                    backgroundColor: `${vipThemeColor}15`,
                    color: vipThemeColor,
                    border: `1px solid ${vipThemeColor}30`
                  }}
                >
                  {company.industry}
                </span>
              )}

              {/* Số người theo dõi */}
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-100 dark:fill-rose-950" />
                <span><strong className="text-slate-800 dark:text-white text-base">{followerCount.toLocaleString()}</strong> người theo dõi</span>
              </div>

              {/* Nút Follow */}
              {isCandidate && (
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 mb-6 border ${
                    isFollowing
                      ? "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/20 dark:hover:border-rose-800"
                      : "text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  }`}
                  style={{
                    backgroundColor: !isFollowing ? vipThemeColor : undefined,
                    borderColor: !isFollowing ? vipThemeColor : undefined,
                  }}
                >
                  {followMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <BellOff className="w-5 h-5" />
                      <span>Đang theo dõi</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      <span>Theo dõi công ty</span>
                    </>
                  )}
                </button>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                  <Link to="/login" className="text-[#0ea5e9] hover:underline font-bold">Đăng nhập</Link> để theo dõi công ty.
                </p>
              )}

              <div className="w-full border-t border-slate-100 dark:border-white/10 pt-6 space-y-4 text-left">
                {company.company_size && (
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <span>{company.company_size} nhân sự</span>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                      <Globe className="w-5 h-5" />
                    </div>
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
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="line-clamp-2">{company.address}</span>
                  </div>
                )}
                
                {company.is_tax_code_public && company.tax_code && (
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="line-clamp-1">MST: {company.tax_code}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Thông tin liên hệ */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: vipThemeColor }}></div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                Thông tin liên hệ
              </h3>
              
              <div className="space-y-5">
                {company.contact_public ? (
                  <>
                    {company.email && (
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium group">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0 text-sky-500 group-hover:scale-110 transition-transform">
                          <Mail className="w-5 h-5" />
                        </div>
                        <a href={`mailto:${company.email}`} className="hover:text-[#0ea5e9] transition-colors break-all">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 font-medium group">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0 text-sky-500 group-hover:scale-110 transition-transform">
                          <Phone className="w-5 h-5" />
                        </div>
                        <a href={`tel:${company.phone}`} className="hover:text-[#0ea5e9] transition-colors">
                          {company.phone}
                        </a>
                      </div>
                    )}
                    {!company.email && !company.phone && (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic">Chưa cập nhật thông tin liên lạc.</p>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-white/5">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <BellOff className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-1">Riêng tư</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">Nhà tuyển dụng đã ẩn thông tin liên hệ. Bạn có thể nhắn tin qua nền tảng sau khi nộp đơn.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Cột phải - Nội dung giới thiệu & Việc làm đang tuyển */}
          <div className="lg:col-span-8 space-y-6">
            {/* Giới thiệu công ty */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                  <Building className="w-5 h-5" style={{ color: vipThemeColor }} />
                </div>
                <span>Về chúng tôi</span>
              </h2>

              {company.description ? (
                <div className="relative">
                  <div 
                    data-color-mode={theme} 
                    className={`prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-slate-300 leading-relaxed overflow-hidden transition-all duration-500 ${!isDescExpanded ? 'max-h-64' : ''}`}
                  >
                    <MDEditor.Markdown source={company.description} style={{ backgroundColor: 'transparent', padding: 0 }} />
                  </div>
                  
                  {/* Lớp phủ mờ (Fade Out) khi chưa mở rộng */}
                  {!isDescExpanded && (
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-[#0f172a] to-transparent pointer-events-none"></div>
                  )}
                  
                  {/* Nút Hiển thị thêm / Thu gọn */}
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      {isDescExpanded ? "Thu gọn bớt" : "Hiển thị thêm"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-400 dark:text-slate-500 italic text-sm">Chưa có thông tin giới thiệu chi tiết.</p>
                </div>
              )}
            </motion.div>

            {/* Gallery ảnh công ty */}
            {company.images && (() => {
              const imgs = typeof company.images === 'string' ? JSON.parse(company.images) : company.images;
              return imgs && imgs.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800"
                >
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: vipThemeColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <span>Môi trường làm việc</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imgs.map((imgUrl, idx) => (
                      <div key={idx} className="aspect-square sm:aspect-video rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer relative border border-slate-100 dark:border-white/5">
                        <img src={imgUrl} alt={`Ảnh công ty ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null;
            })()}

            {/* Việc làm đang tuyển dụng */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="p-2.5 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                  <Briefcase className="w-5 h-5 text-[#0ea5e9]" />
                </div>
                <span>Vị trí đang mở ({jobs.length})</span>
              </h2>

              {isJobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#0ea5e9] animate-spin mr-3" />
                  <span className="text-slate-500 font-medium">Đang tải danh sách công việc...</span>
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job.id} 
                      className="group p-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/60 dark:border-slate-700/50 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-sm transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                      <div className="flex-1">
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0ea5e9] transition-colors line-clamp-1"
                        >
                          {job.title}
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {job.company_address || "Việt Nam"}
                          </span>
                          <span className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-900/10 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-md font-semibold border border-sky-100 dark:border-sky-800/30">
                            <DollarSign className="w-3.5 h-3.5" />
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.is_salary_visible)}
                          </span>
                          {job.experience_level && (
                            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-700/50">
                              {job.experience_level}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link 
                        to={`/jobs/${job.id}`} 
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex-shrink-0"
                      >
                        <span>Xem chi tiết</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-600">
                    <Briefcase className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Chưa có tin tuyển dụng</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hiện tại công ty chưa mở vị trí nào mới.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;
