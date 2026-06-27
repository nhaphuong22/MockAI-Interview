import { useState } from 'react';
import { ShieldCheck, Upload, Building, Clock, AlertCircle } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { useUiStore } from '../../../store/useUiStore';

export const VerifyCompany = ({ status, setStatus }) => {
  const showToast = useUiStore((state) => state.showToast);
  const [companyName, setCompanyName] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !documentUrl) {
      showToast({ message: 'Vui lòng điền tên công ty và tải lên tài liệu!', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post('/verification/submit', { companyName, documentUrl });
      showToast({ message: 'Nộp hồ sơ thành công! Đang chờ Admin duyệt.', type: 'success' });
      setStatus('PENDING');
    } catch (error) {
      showToast({ message: error.response?.data?.message || 'Có lỗi xảy ra!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uploadMock = () => {
    // Trong thực tế sẽ gọi API upload (Cloudinary). Mock tạm bằng timeout.
    setLoading(true);
    setTimeout(() => {
      setDocumentUrl('https://example.com/document.pdf');
      setLoading(false);
      showToast({ message: 'Đã tải tài liệu lên thành công!', type: 'success' });
    }, 1500);
  };

  if (status === 'PENDING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Clock className="w-20 h-20 text-yellow-500 mb-6 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Hồ sơ đang được chờ duyệt</h2>
        <p className="text-gray-600 max-w-md">
          Hệ thống đã nhận được giấy tờ pháp lý của doanh nghiệp bạn. Quá trình kiểm duyệt có thể mất từ 1-2 ngày làm việc. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-red-600 mb-4">Hồ sơ bị từ chối</h2>
        <p className="text-gray-600 max-w-md mb-6">
          Giấy tờ pháp lý của bạn không hợp lệ hoặc thiếu thông tin. Vui lòng tải lại hồ sơ mới.
        </p>
        <button onClick={() => setStatus('UNVERIFIED')} className="px-6 py-2 bg-[#0ea5e9] text-white rounded-lg hover:bg-[#0284c7]">
          Nộp lại hồ sơ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <ShieldCheck className="w-16 h-16 text-[#0ea5e9] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác minh Doanh Nghiệp</h2>
          <p className="text-gray-600">Để đăng tin tuyển dụng, bạn cần cung cấp giấy phép kinh doanh hợp lệ.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên Doanh Nghiệp / Tổ Chức</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0ea5e9] focus:bg-white transition-all"
                placeholder="Nhập tên đăng ký kinh doanh..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giấy phép kinh doanh (PDF/JPG)</label>
            <div 
              onClick={uploadMock}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#0ea5e9] hover:bg-sky-50 transition-all"
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">Click để tải lên tài liệu pháp lý</p>
              <p className="text-xs text-gray-400">Hỗ trợ PDF, JPG, PNG (Tối đa 5MB)</p>
              {documentUrl && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center justify-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Đã đính kèm tài liệu thành công
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-sky-500/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Nộp Hồ Sơ Xác Minh'}
          </button>
        </form>
      </div>
    </div>
  );
};
