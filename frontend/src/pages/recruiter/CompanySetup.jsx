import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Search, PlusCircle, 
  Upload, Clock, AlertTriangle, Globe, 
  MapPin, CheckCircle, RefreshCw, LogOut, ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';
import { uploadAvatarApi } from '../../api/auth';

export function CompanySetup() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, setAuth, logout } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState('join'); // 'join' | 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Create Company Form State
  const [createForm, setCreateForm] = useState({
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

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400000); // disable auto debounce, search on click/enter
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Query verification status
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['companyVerificationStatus'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/status');
      return res.data;
    }
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
      return axiosClient.post('/companies/join', { companyId });
    },
    onSuccess: (res) => {
      showToast({ message: res.data?.message || 'Đã gửi yêu cầu gia nhập thành công!', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['companyVerificationStatus'] });
    },
    onError: (err) => {
      showToast({ message: err.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    }
  });

  // Mutation: Create Company
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return axiosClient.post('/companies', payload);
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
    if (!createForm.name || !createForm.taxCode || !createForm.documentUrl) {
      showToast({ message: 'Vui lòng điền đầy đủ Tên, MST và Giấy phép kinh doanh!', type: 'error' });
      return;
    }
    createMutation.mutate(createForm);
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0f1c]">
        <RefreshCw className="w-10 h-10 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  // --- RENDERING STATE SCREENS ---

  // Screen 1: Pending Join Approval
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-sky-100 dark:bg-sky-950/30 text-sky-500 rounded-2xl mb-4 border border-sky-100/50">
            <Building className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Kích hoạt tài khoản HR</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2 text-sm font-medium">Chọn liên kết với công ty đã có hoặc tạo mới thông tin doanh nghiệp</p>
        </div>

        {/* Tab Controls */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-1.5 shadow-sm border border-slate-100 dark:border-white/10 flex mb-8">
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'join' 
                ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/10' 
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <Search size={16} /> Tìm & gia nhập công ty
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'create' 
                ? 'bg-[#0ea5e9] text-white shadow-md shadow-sky-500/10' 
                : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <PlusCircle size={16} /> Đăng ký công ty mới
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
              <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nhập tên công ty cần tìm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                  />
                </div>
                <button type="submit" className="px-6 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-colors">
                  Tìm kiếm
                </button>
              </form>

              {isLoadingCompanies ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0ea5e9]" />
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {companies.length > 0 ? (
                    companies.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100/50 dark:border-white/5 hover:border-[#0ea5e9] transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-100">
                            {c.logo_url ? <img src={c.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Building className="text-gray-300 w-6 h-6" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">{c.name}</h3>
                            <div className="flex gap-3 text-xs text-slate-400 mt-1 font-medium">
                              <span className="flex items-center gap-1"><MapPin size={12} /> {c.city}</span>
                              <span className="flex items-center gap-1"><Globe size={12} /> {c.industry}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => joinMutation.mutate(c.id)}
                          disabled={joinMutation.isPending}
                          className="px-4 py-2 bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-all font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm border border-sky-100 dark:border-sky-950"
                        >
                          Gia nhập <ArrowRight size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 dark:text-gray-500 text-xs font-semibold">
                      Chưa tìm thấy công ty đã được phê duyệt nào. Thử từ khóa khác hoặc chuyển sang "Đăng ký công ty mới"!
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
                      <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Tên Công Ty <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Công ty Cổ phần Công nghệ MockAI"
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
                    <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-1 uppercase">Mã Số Thuế (MST) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Mã số thuế doanh nghiệp..."
                      required
                      value={createForm.taxCode}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, taxCode: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-[#0ea5e9] transition-all text-sm font-medium"
                    />
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

                {/* Giấy phép đăng ký KD */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-gray-400 mb-2 uppercase">Giấy phép đăng ký kinh doanh (PDF/Ảnh) <span className="text-rose-500">*</span></label>
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 text-center hover:border-[#0ea5e9] hover:bg-sky-50/20 transition-all cursor-pointer">
                    <input type="file" onChange={handleDocUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {isUploadingDoc ? (
                      <RefreshCw className="w-8 h-8 text-[#0ea5e9] mx-auto mb-2 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    )}
                    <p className="text-xs text-slate-500 font-semibold">Tải lên tài liệu chứng minh tư cách pháp nhân</p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG tối đa 5MB</p>
                    {createForm.documentUrl && (
                      <div className="mt-4 p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl inline-flex items-center gap-1.5 text-xs font-bold border border-emerald-100">
                        <CheckCircle size={14} /> Đã tải tệp lên thành công
                      </div>
                    )}
                  </div>
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
      </div>
    </div>
  );
}
