import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Search, PlusCircle, 
  Upload, Clock, AlertTriangle,
  CheckCircle, RefreshCw, LogOut,
  FileText, X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { useUiStore } from '../../../store/useUiStore';
import { useVerificationStore } from '../../../store/useVerificationStore';
import { uploadAvatarApi } from '../../../api/auth';

export function CompanyInfoTab({ onComplete, setActiveParentTab }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, setAuth, logout } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);
  
  // Checking prerequisites
  const isTab2Completed = useVerificationStore(state => state.isTab2Completed);
  const tab2Data = useVerificationStore(state => state.tab2Data);
  
  const hasBasicInfo = user?.full_name && user?.phone;
  const hasPrivacyAgreed = user?.privacy_agreed;
  const isAllPrerequisitesMet = hasBasicInfo && isTab2Completed && hasPrivacyAgreed;

  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showPrereqModal, setShowPrereqModal] = useState(false);
  
  // Create Company Form State
  const [createForm, setCreateForm] = useState({
    businessType: 'ENTERPRISE',
    name: '',
    taxCode: '',
    website: '',
    logoUrl: '',
    description: '',
    companySize: '11 - 50 nhân viên',
    industry: 'Công nghệ thông tin',
    city: 'Thành phố Hồ Chí Minh',
    address: '',
    documentUrl: ''
  });

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isFetchingTaxCode, setIsFetchingTaxCode] = useState(false);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400000); // disable auto debounce, search on click/enter
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch company info by Tax Code
  const fetchCompanyByTaxCode = async (taxCodeInput) => {
    const taxCode = taxCodeInput?.trim();
    if (!taxCode || taxCode.length < 10) return;
    setIsFetchingTaxCode(true);
    try {
      const res = await fetch(`https://api.vietqr.io/v2/business/${taxCode}`);
      const data = await res.json();
      if (data.code === '00' && data.data) {
        setCreateForm(prev => ({
          ...prev,
          name: data.data.name || prev.name,
          address: data.data.address || prev.address
        }));
        showToast('Đã tự động điền thông tin doanh nghiệp!', 'success');
      } else {
        showToast('Không tìm thấy thông tin từ Mã số thuế này', 'error');
      }
    } catch (error) {
      console.error("Lỗi khi tra cứu MST:", error);
      showToast('Có lỗi xảy ra khi tra cứu MST', 'error');
    } finally {
      setIsFetchingTaxCode(false);
    }
  };

  // Query verification status
  const { data: statusData, isLoading: isLoadingStatus, isError: isErrorStatus } = useQuery({
    queryKey: ['companyVerificationStatus'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/status');
      return res.data;
    },
    retry: 1
  });

  // Query active companies
  const { data: companies = [], isLoading: isLoadingCompanies, refetch: refetchCompanies } = useQuery({
    queryKey: ['activeCompanies', debouncedSearch],
    queryFn: async () => {
      const res = await axiosClient.get(`/companies?search=${debouncedSearch}`);
      return res.data;
    },
    enabled: activeTab === 'join'
  });

  // Mutation: Join Company
  const joinMutation = useMutation({
    mutationFn: async (companyId) => {
      return axiosClient.post('/companies/join', { 
        companyId,
        idCardNumber: tab2Data?.idCardNumber,
        urls: tab2Data?.urls
      });
    },
    onSuccess: (res) => {
      showToast({ message: res.data?.message || 'Đã gửi yêu cầu gia nhập thành công!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['companyVerificationStatus'] });
      if (onComplete) onComplete();
    },
    onError: (err) => {
      showToast({ message: err.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  });

  // Mutation: Create Company
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return axiosClient.post('/companies', {
        ...payload,
        idCardNumber: tab2Data?.idCardNumber,
        businessType: tab2Data?.businessType,
        urls: tab2Data?.urls
      });
    },
    onSuccess: (res) => {
      showToast({ message: 'Đăng ký công ty mới thành công! Đang chờ Admin duyệt.', type: 'success' });
      // Cập nhật thông tin user trong store
      if (res.data?.company) {
        setAuth({
          ...user,
          company_id: res.data.company.id,
          company_join_status: 'APPROVED'
        });
      }
      queryClient.invalidateQueries({ queryKey: ['companyVerificationStatus'] });
      if (onComplete) onComplete();
      navigate('/hr/dashboard');
    },
    onError: (err) => {
      showToast({ message: err.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  });

  // Reset join request if rejected
  const resetJoinMutation = useMutation({
    mutationFn: async () => {
      // Chỉ đơn giản reset locally hoặc backend reset
      // Vì backend set join_status = REJECTED, company_id = null nên ta cập nhật user
      return axiosClient.get('/verification/status');
    },
    onSuccess: () => {
      setAuth({
        ...user,
        company_id: null,
        company_join_status: null
      });
      queryClient.invalidateQueries({ queryKey: ['companyVerificationStatus'] });
      showToast({ message: 'Bạn có thể chọn lại công ty.', type: 'success' });
    }
  });

  const handleJoinClick = (companyId) => {
    if (!isAllPrerequisitesMet) {
      setShowPrereqModal(true);
      return;
    }
    joinMutation.mutate(companyId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
    refetchCompanies();
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const res = await uploadAvatarApi(file);
      if (res.data?.avatarUrl) {
        setCreateForm(prev => ({ ...prev, logoUrl: res.data.avatarUrl }));
        showToast({ message: 'Tải logo thành công!', type: 'success' });
      }
    } catch {
      showToast({ message: 'Không thể tải ảnh lên.', type: 'error' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const res = await uploadAvatarApi(file); // reuse avatar api to upload to cloudinary
      if (res.data?.avatarUrl) {
        setCreateForm(prev => ({ ...prev, documentUrl: res.data.avatarUrl }));
        showToast({ message: 'Tải tài liệu xác thực thành công!', type: 'success' });
      }
    } catch {
      showToast({ message: 'Không thể tải file lên.', type: 'error' });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!isAllPrerequisitesMet) {
      setShowPrereqModal(true);
      return;
    }
    if (!createForm.name || !createForm.taxCode) {
      showToast({ message: 'Vui lòng điền đầy đủ Tên công ty và MST!', type: 'error' });
      return;
    }
    createMutation.mutate(createForm);
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-50 dark:bg-[#0a0f1c] rounded-3xl">
        <RefreshCw className="w-10 h-10 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (isErrorStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 dark:bg-[#0a0f1c] rounded-3xl text-center p-8">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Lỗi kết nối máy chủ</h3>
        <p className="text-slate-500 text-sm mb-6">Không thể tải thông tin trạng thái xác minh. Vui lòng tải lại trang.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#0ea5e9] text-white rounded-full font-bold hover:bg-[#0284c7] transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    );
  }



  // --- RENDERING STATE SCREENS ---

  // Screen 1: Pending Join Approval (They have uploaded docs and it is sent to HR Gốc)
  if (statusData?.joinStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-xl p-8 border border-slate-100 dark:border-white/10 text-center"
        >
          <Clock className="w-20 h-20 text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Đang chờ phê duyệt</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
            Yêu cầu gia nhập công ty <strong className="text-slate-800 dark:text-white">{statusData.company?.name}</strong> của bạn đang được gửi tới quản trị viên của công ty. Vui lòng liên hệ HR gốc của công ty để được duyệt tài khoản.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['companyVerificationStatus'] })}
              className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Kiểm tra lại trạng thái
            </button>
            <button 
              onClick={() => logout()}
              className="w-full py-3 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Screen 2: Rejected
  if (statusData?.joinStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-xl p-8 border border-slate-100 dark:border-white/10 text-center"
        >
          <AlertTriangle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-rose-600 mb-3">Yêu cầu bị từ chối</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
            Rất tiếc, yêu cầu tham gia công ty của bạn đã bị từ chối. Vui lòng chọn công ty khác hoặc đăng ký công ty mới.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => resetJoinMutation.mutate()}
              className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
            >
              Chọn lại công ty
            </button>
            <button 
              onClick={() => logout()}
              className="w-full py-3 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Screen 3: Setup View (Join or Create)
  return (
    <div className="w-full">
        {/* Tab Controls (TopCV Style) */}
        <div className="flex border-b border-slate-200 dark:border-white/10 mb-6 bg-white dark:bg-[#0f172a] rounded-t-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-4 px-6 flex items-center justify-between transition-all border-b-[3px] ${
              activeTab === 'join' 
                ? 'border-[#0ea5e9] bg-[#0ea5e9]/5' 
                : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'join' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Search size={20} />
              </div>
              <div className="text-left">
                <div className={`font-bold text-[15px] ${activeTab === 'join' ? 'text-[#0ea5e9]' : 'text-slate-700 dark:text-slate-300'}`}>Tìm kiếm thông tin công ty</div>
                <div className="text-[13px] text-slate-500 mt-0.5">Dành cho Doanh nghiệp đã có trên MockAI</div>
              </div>
            </div>
            {activeTab === 'join' && <CheckCircle className="text-[#0ea5e9] w-6 h-6 shrink-0" />}
          </button>
          
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-4 px-6 flex items-center justify-between transition-all border-b-[3px] ${
              activeTab === 'create' 
                ? 'border-[#0ea5e9] bg-[#0ea5e9]/5' 
                : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'create' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <PlusCircle size={20} />
              </div>
              <div className="text-left">
                <div className={`font-bold text-[15px] ${activeTab === 'create' ? 'text-[#0ea5e9]' : 'text-slate-700 dark:text-slate-300'}`}>Tạo công ty mới</div>
                <div className="text-[13px] text-slate-500 mt-0.5">Dành cho Doanh nghiệp lần đầu sử dụng MockAI</div>
              </div>
            </div>
            {activeTab === 'create' && <CheckCircle className="text-[#0ea5e9] w-6 h-6 shrink-0" />}
          </button>
        </div>

        {/* Content Tabs */}
        <AnimatePresence mode="wait">
          {activeTab === 'join' ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/10"
            >
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tên công ty, tên thương mại"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-full outline-none focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/10 transition-all text-[15px]"
                  />
                </div>
                <button type="submit" className="px-8 py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-full transition-all whitespace-nowrap">
                  Tìm kiếm
                </button>
              </form>

              <div className="bg-sky-50 dark:bg-sky-500/10 border-l-4 border-[#0ea5e9] p-4 rounded-r-xl flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-[#0ea5e9] shrink-0 mt-0.5" />
                <p className="text-[13.5px] text-sky-800 dark:text-sky-200 font-medium">
                  Để tài khoản được xác thực nhanh chóng, vui lòng sử dụng <span className="font-bold">Tên công ty</span> trùng khớp với dữ liệu doanh nghiệp theo Trang thông tin điện tử của Cục Thuế.
                </p>
              </div>
              
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Công ty đã đăng ký trên hệ thống</h3>

              {isLoadingCompanies ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0ea5e9]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {companies.length > 0 ? (
                    companies.map((c) => (
                      <div key={c.id} className="relative flex items-center p-5 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-white/10 hover:border-[#0ea5e9] hover:shadow-lg hover:shadow-sky-500/10 transition-all group">
                        
                        {/* Logo */}
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 shrink-0 shadow-sm self-start mt-1 mr-4">
                          {c.logo_url ? <img src={c.logo_url} alt="Logo" className="w-full h-full object-contain p-1" /> : <Building className="text-slate-300 w-8 h-8" />}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-20">
                          <h3 className="font-bold text-slate-800 dark:text-white text-[15px] uppercase truncate mb-1" title={c.name}>{c.name}</h3>
                          <div className="text-[13px] text-slate-500 mb-1.5 font-medium">MST: {c.tax_code || 'không có'}</div>
                          <div className="text-[13px] text-slate-500 mb-2 truncate">
                            {c.address || c.city || 'Chưa cập nhật địa chỉ'} | {c.company_size || 'Chưa rõ'} nhân sự
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {c.industry && (
                              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-md whitespace-nowrap">
                                {c.industry}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                          <button
                            onClick={() => handleJoinClick(c.id)}
                            disabled={joinMutation.isPending}
                            className="px-5 py-2 bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white transition-all font-bold text-[13px] rounded-full"
                          >
                            Chọn
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 text-slate-400 dark:text-gray-500 text-sm font-semibold bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                      Chưa tìm thấy công ty đã được phê duyệt nào.<br/>Thử từ khóa khác hoặc chuyển sang "Đăng ký công ty mới"!
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-white/10"
            >
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                {/* Business Type Toggle */}
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, businessType: 'ENTERPRISE' }))}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[13px] font-bold transition-all ${
                      createForm.businessType === 'ENTERPRISE' 
                        ? 'border-[#0ea5e9] text-[#0ea5e9] bg-[#0ea5e9]/5' 
                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                      createForm.businessType === 'ENTERPRISE' ? 'border-[#0ea5e9]' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {createForm.businessType === 'ENTERPRISE' && <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />}
                    </div>
                    Doanh nghiệp
                  </button>

                  <button 
                    type="button"
                    onClick={() => setCreateForm(prev => ({ ...prev, businessType: 'HOUSEHOLD' }))}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[13px] font-bold transition-all ${
                      createForm.businessType === 'HOUSEHOLD' 
                        ? 'border-[#0ea5e9] text-[#0ea5e9] bg-[#0ea5e9]/5' 
                        : 'border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                      createForm.businessType === 'HOUSEHOLD' ? 'border-[#0ea5e9]' : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {createForm.businessType === 'HOUSEHOLD' && <div className="w-2 h-2 rounded-full bg-[#0ea5e9]" />}
                    </div>
                    Hộ kinh doanh
                  </button>
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 p-4 rounded-r-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[13.5px] text-amber-800 dark:text-amber-200 font-medium">
                    Để tài khoản được xác thực nhanh chóng, vui lòng nhập <span className="font-bold">{createForm.businessType === 'ENTERPRISE' ? 'Mã số thuế và Tên công ty' : 'Mã số thuế người đại diện và Tên hộ kinh doanh'}</span> trùng khớp với dữ liệu doanh nghiệp theo Trang thông tin điện tử của Cục Thuế.
                  </p>
                </div>
                {/* Logo & Basic Info */}
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="relative group w-24 h-24 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 overflow-hidden bg-slate-50 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:border-[#0ea5e9] transition-all">
                    {createForm.logoUrl ? (
                      <img src={createForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400 text-[10px] font-bold p-1">
                        {isUploadingLogo ? <RefreshCw className="animate-spin w-5 h-5 mx-auto" /> : <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400" />}
                        Tải Logo
                      </div>
                    )}
                    <input type="file" onChange={handleLogoUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">{createForm.businessType === 'ENTERPRISE' ? 'Tên Công Ty' : 'Tên hộ kinh doanh'} <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder={createForm.businessType === 'ENTERPRISE' ? "Ví dụ: Công ty Cổ phần Công nghệ MockAI" : "Ví dụ: Hộ kinh doanh MockAI"}
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">{createForm.businessType === 'ENTERPRISE' ? 'Mã Số Thuế (MST)' : 'Mã số thuế người đại diện'} <span className="text-rose-500">*</span></label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Nhập mã số thuế..."
                          required
                          value={createForm.taxCode}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, taxCode: e.target.value }))}
                          onBlur={(e) => fetchCompanyByTaxCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              fetchCompanyByTaxCode(createForm.taxCode);
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                        />
                        {isFetchingTaxCode && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <RefreshCw className="w-4 h-4 text-[#0ea5e9] animate-spin" />
                          </div>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => fetchCompanyByTaxCode(createForm.taxCode)}
                        disabled={isFetchingTaxCode || !createForm.taxCode || createForm.taxCode.length < 10}
                        className="px-4 py-2 bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 font-bold text-sm rounded-xl hover:bg-sky-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Tra cứu
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Website</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={createForm.website}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Lĩnh vực hoạt động</label>
                    <input
                      type="text"
                      placeholder="CNTT, Tài chính, Giáo dục..."
                      value={createForm.industry}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Quy mô nhân sự</label>
                    <select
                      value={createForm.companySize}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, companySize: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                    >
                      <option value="1 - 10 nhân viên">1 - 10 nhân viên</option>
                      <option value="11 - 50 nhân viên">11 - 50 nhân viên</option>
                      <option value="51 - 200 nhân viên">51 - 200 nhân viên</option>
                      <option value="201 - 500 nhân viên">201 - 500 nhân viên</option>
                      <option value="501 - 1000 nhân viên">501 - 1000 nhân viên</option>
                      <option value="1000+ nhân viên">1000+ nhân viên</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Tỉnh / Thành phố</label>
                    <input
                      type="text"
                      placeholder="Thành phố Hồ Chí Minh, Hà Nội..."
                      value={createForm.city}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Địa chỉ cụ thể</label>
                    <input
                      type="text"
                      placeholder="Số nhà, đường, phường/xã..."
                      value={createForm.address}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Mô tả công ty</label>
                  <textarea
                    rows={3}
                    placeholder="Giới thiệu sơ lược về công ty..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                  />
                </div>


                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full py-3.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Đang xử lý...' : 'Tạo mới & gửi hồ sơ kiểm duyệt'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prerequisite Lock Modal */}
        <AnimatePresence>
          {showPrereqModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPrereqModal(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              {/* Modal Body */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="max-w-md w-full bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl p-8 border border-slate-100 dark:border-white/10 text-center relative z-10"
              >
                <button 
                  onClick={() => setShowPrereqModal(false)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
                
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Thông tin chưa đầy đủ</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Bạn cần phải hoàn thành các bước <strong className="text-slate-800 dark:text-white">Thông tin cá nhân</strong>, <strong className="text-slate-800 dark:text-white">Xác minh danh tính</strong> và đồng ý <strong className="text-slate-800 dark:text-white">Thoả thuận dữ liệu</strong> trước khi có thể Tạo hoặc Gia nhập công ty.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      setShowPrereqModal(false);
                      if (setActiveParentTab) setActiveParentTab('account');
                    }}
                    className="w-full py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
                  >
                    Quay lại cập nhật thông tin
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
  );
}
