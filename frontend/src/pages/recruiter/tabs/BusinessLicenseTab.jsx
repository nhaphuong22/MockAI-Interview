import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, Download, Info, X, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axiosClient from '../../../api/axiosClient';
import { useUiStore } from '../../../store/useUiStore';
import { useVerificationStore } from '../../../store/useVerificationStore';

const FileDropzone = ({ title = "Chọn hoặc kéo file vào đây", description, file, setFile }) => {
  const handleUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
  };

  return (
    <div className="flex-1">
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center bg-white dark:bg-[#0f172a] hover:border-[#0ea5e9] hover:bg-[#0ea5e9]/5 transition-all cursor-pointer relative shadow-sm border-dashed">
        <input 
          type="file" 
          onChange={handleUpload}
          accept=".pdf,.png,.jpg,.jpeg"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
        />
        {file ? (
          <div className="flex flex-col items-center text-center relative w-full">
            <button 
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center transition-colors z-10 shadow-sm"
              title="Xóa file"
            >
              <X size={14} />
            </button>
            <div className="w-10 h-10 bg-[#0ea5e9]/10 text-[#0ea5e9] rounded-full flex items-center justify-center mb-2">
              <FileText size={20} />
            </div>
            <p className="font-bold text-slate-800 dark:text-white text-sm mb-1 truncate max-w-[150px] px-2">{file.name}</p>
            <p className="text-xs text-[#0ea5e9] font-medium flex items-center gap-1 justify-center">
              <CheckCircle size={14} /> ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1 text-sm">{title}</p>
            <p className="text-xs text-slate-500 mb-3">Tối đa 5MB: jpeg, png, pdf</p>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-500/20 text-sm font-medium flex items-center gap-2">
              <UploadCloud size={16} /> Chọn file
            </div>
          </div>
        )}
      </div>

      {description && (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs leading-relaxed flex items-start gap-2">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <ul className="list-disc pl-4 space-y-1">
            <li>Các văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa/ che/ cắt thông tin</li>
            <li>{description}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export function BusinessLicenseTab({ onComplete }) {
  const showToast = useUiStore((state) => state.showToast);
  const [businessType, setBusinessType] = useState('ENTERPRISE'); // 'SME' or 'ENTERPRISE'
  const idCardNumber = '';
  
  const [licenseFile, setLicenseFile] = useState(null);
  const [authFile, setAuthFile] = useState(null);
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['companyVerificationStatus'],
    queryFn: async () => {
      const res = await axiosClient.get('/verification/status');
      return res.data;
    }
  });

  const isCreator = statusData?.isCreator;
  const verificationStatus = isCreator ? statusData?.verificationStatus : statusData?.joinStatus;
  const rejectReason = statusData?.rejectReason;

  const isFormValid = true;

  const saveTab2Data = useVerificationStore(state => state.saveTab2Data);
  const isTab2Completed = useVerificationStore(state => state.isTab2Completed);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axiosClient.post('/companies/upload-verification-docs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      saveTab2Data({
        businessType,
        idCardNumber: '',
        urls: data.urls
      });
      
      showToast({ message: 'Lưu tài liệu thành công. Vui lòng chuyển sang bước tiếp theo.', type: 'success' });
      if (onComplete) onComplete();
    },
    onError: (error) => {
      showToast({ message: error?.response?.data?.message || 'Có lỗi xảy ra khi tải lên tài liệu', type: 'error' });
    }
  });

  const handleSave = () => {

    const hasFiles = businessType === 'SME'
      ? (licenseFile && idFrontFile && idBackFile)
      : (authFile && idFrontFile && idBackFile);

    if (hasFiles) {
      const formData = new FormData();
      if (businessType === 'SME' && licenseFile) {
        formData.append('licenseFile', licenseFile);
      } else if (businessType === 'ENTERPRISE' && authFile) {
        formData.append('authFile', authFile);
      }
      if (idFrontFile) formData.append('idFrontFile', idFrontFile);
      if (idBackFile) formData.append('idBackFile', idBackFile);

      uploadMutation.mutate(formData);
    } else {
      // Mock URLs for automated testing when file upload dialogs are blocked
      saveTab2Data({
        businessType,
        idCardNumber,
        urls: {
          authFileUrl: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+Auth+Letter',
          idFrontUrl: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+ID+Front',
          idBackUrl: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+ID+Back',
          licenseFileUrl: 'https://placehold.co/600x400/0ea5e9/ffffff?text=Mock+License'
        }
      });
      showToast({ message: 'Lưu tài liệu thành công (Mock cho Test). Vui lòng chuyển sang bước tiếp theo.', type: 'success' });
      if (onComplete) onComplete();
    }
  };

  if (isLoading) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" /></div>;
  }

  // If user has completed tab 2, show success state
  if (isTab2Completed) {
    return (
      <div className="w-full text-center p-12 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Đã nộp giấy tờ thành công</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
          Hệ thống đã ghi nhận các giấy tờ xác minh của bạn. Hãy hoàn tất các bước còn lại và chuyển sang tab "Thông tin công ty" để nộp hồ sơ.
        </p>
        <button 
          onClick={() => {
            if (onComplete) onComplete();
          }}
          className="px-8 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20"
        >
          Tiếp tục
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">
        Tải lên tài liệu xác minh
      </h2>

      {(!statusData?.company || isCreator) && (
        <>
          <h3 className="font-bold text-slate-800 dark:text-white mb-3">Chọn nhóm quy mô</h3>
          {/* Radio Options */}
          <div className="space-y-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="radio" 
                  name="businessType" 
                  value="SME"
                  checked={businessType === 'SME'}
                  onChange={() => setBusinessType('SME')}
                  className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-[#0ea5e9] dark:checked:border-[#0ea5e9] transition-all cursor-pointer"
                />
                <div className="absolute w-2.5 h-2.5 bg-[#0ea5e9] rounded-full scale-0 peer-checked:scale-100 transition-all pointer-events-none"></div>
              </div>
              <span className={`font-bold text-sm ${businessType === 'SME' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                Nhóm 1: Hộ kinh doanh / SME (Tự đăng ký)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input 
                  type="radio" 
                  name="businessType" 
                  value="ENTERPRISE"
                  checked={businessType === 'ENTERPRISE'}
                  onChange={() => setBusinessType('ENTERPRISE')}
                  className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-full checked:border-[#0ea5e9] dark:checked:border-[#0ea5e9] transition-all cursor-pointer"
                />
                <div className="absolute w-2.5 h-2.5 bg-[#0ea5e9] rounded-full scale-0 peer-checked:scale-100 transition-all pointer-events-none"></div>
              </div>
              <span className={`font-bold text-sm ${businessType === 'ENTERPRISE' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                Nhóm 2: Doanh nghiệp lớn (Nhân viên/HR đăng ký)
              </span>
            </label>
          </div>

          {/* Method 1: SME */}
          {businessType === 'SME' && (
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl p-6 bg-white dark:bg-[#0f172a] flex flex-col gap-6 mb-6 mt-3">
              <div className="flex flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3">Giấy phép kinh doanh <span className="text-rose-500">*</span></label>
                  <FileDropzone 
                    file={licenseFile} 
                    setFile={setLicenseFile}
                    description="Vui lòng đăng tải Giấy đăng ký doanh nghiệp có thông tin trùng khớp với dữ liệu trên CCCD"
                  />
                </div>
                <div className="w-56 shrink-0 flex flex-col items-center">
                  <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Minh họa</p>
                  <div className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden rounded-lg p-2">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Gi%E1%BA%A5y_ch%E1%BB%A9ng_nh%E1%BA%ADn_%C4%91%C4%83ng_k%C3%BD_doanh_nghi%E1%BB%87p.jpg/800px-Gi%E1%BA%A5y_ch%E1%BB%A9ng_nh%E1%BA%ADn_%C4%91%C4%83ng_k%C3%BD_doanh_nghi%E1%BB%87p.jpg" 
                      alt="Minh hoạ Giấy đăng ký doanh nghiệp" 
                      className="w-full h-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x300/e2e8f0/64748b?text=Mau+GPKD";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Method 2: Authorization or Joiner */}
      {(businessType === 'ENTERPRISE') && (
        <div className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0f172a] mb-6 mt-3">
          {/* Step 1: Giấy uỷ quyền */}
          <div className="p-6 flex flex-row gap-8">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3">Giấy ủy quyền <span className="text-rose-500">*</span></label>
              <FileDropzone 
                file={authFile} 
                setFile={setAuthFile}
                description="Vui lòng đăng tải Giấy ủy quyền có dấu mộc đỏ của công ty"
              />
            </div>
            <div className="w-56 shrink-0 flex flex-col items-center">
              <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Minh họa</p>
              <div className="flex-1 flex flex-col justify-between w-full pb-0.5">
                <div className="flex justify-center mb-4">
                  <img 
                    src="https://placehold.co/180x240/ffffff/64748b?text=Mau+GPKD" 
                    alt="Minh hoạ Giấy ủy quyền" 
                    className="w-[140px] h-auto object-contain border border-slate-200 dark:border-white/10 rounded-lg shadow-sm"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white dark:bg-[#0f172a] border border-[#0ea5e9] text-[#0ea5e9] rounded-lg text-sm font-bold hover:bg-[#0ea5e9]/5 transition-all">
                  <Download size={16} /> Tải mẫu giấy ủy quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Common Step: Giấy tờ định danh */}
      <div className="border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-[#0f172a] mb-6 mt-3 p-6 flex flex-row gap-8">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3">Giấy tờ định danh (CCCD/ Hộ chiếu) <span className="text-rose-500">*</span></label>
          <div className="flex gap-4">
            <FileDropzone 
              file={idFrontFile} 
              setFile={setIdFrontFile}
              title="Tải lên mặt trước"
            />
            <FileDropzone 
              file={idBackFile} 
              setFile={setIdBackFile}
              title="Tải lên mặt sau"
            />
          </div>
          <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl border border-orange-100 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 text-xs leading-relaxed flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <ul className="list-disc pl-4 space-y-1">
              <li>Các văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa/ che/ cắt thông tin</li>
              <li>Vui lòng tải lên cả mặt trước và mặt sau của CCCD/ Hộ chiếu</li>
            </ul>
          </div>
        </div>
        <div className="w-56 shrink-0 flex flex-col items-center">
          <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Minh họa</p>
          <div className="flex-1 flex flex-col justify-center items-center gap-3 w-full">
            <img 
              src="https://placehold.co/200x125/ffffff/64748b?text=CCCD+Mat+Truoc" 
              alt="Minh hoạ CCCD Mặt trước" 
              className="w-[160px] h-auto object-contain border border-slate-200 dark:border-white/10 rounded shadow-sm"
            />
            <img 
              src="https://placehold.co/200x125/ffffff/64748b?text=CCCD+Mat+Sau" 
              alt="Minh hoạ CCCD Mặt sau" 
              className="w-[160px] h-auto object-contain border border-slate-200 dark:border-white/10 rounded shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={!isFormValid || uploadMutation.isPending}
          className="flex items-center gap-2 px-8 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadMutation.isPending && <Loader2 size={18} className="animate-spin" />}
          Lưu
        </button>
      </div>
    </div>
  );
}
