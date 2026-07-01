import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { User, FileText, ShieldCheck, Building } from 'lucide-react';
import { AccountInfoTab } from './tabs/AccountInfoTab';
import { CompanyInfoTab } from './tabs/CompanyInfoTab';
import { BusinessLicenseTab } from './tabs/BusinessLicenseTab';
import { DataPrivacyTab } from './tabs/DataPrivacyTab';
import { useAuthStore } from '../../store/useAuthStore';
import { useVerificationStore } from '../../store/useVerificationStore';

const TABS = [
  { id: 'account', label: 'Thông tin tài khoản', icon: User },
  { id: 'business_license', label: 'Xác minh danh tính & Doanh nghiệp', icon: FileText },
  { id: 'privacy', label: 'Văn bản xử lý Dữ liệu cá nhân', icon: ShieldCheck },
  { id: 'company', label: 'Thông tin công ty', icon: Building },
];

export function HRVerificationSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  
  // Default to 'account' tab if no tab is provided, or 'company' if they don't have a company yet
  const activeTab = searchParams.get('tab') || (user && user.company_id ? 'account' : 'company');

  const [completedTabs, setCompletedTabs] = useState({
    account: false,
    business_license: false,
    privacy: false,
    company: false
  });

  const saveTab2Data = useVerificationStore(state => state.saveTab2Data);
  const clearVerificationData = useVerificationStore(state => state.clearVerificationData);
  const isTab2Completed = useVerificationStore(state => state.isTab2Completed);

  // Đồng bộ trạng thái hoàn thành các tab theo từng user.id và dữ liệu thật từ Database
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`hr_verification_completed_tabs_${user.id}`);
        let state = saved ? JSON.parse(saved) : {
          account: false,
          business_license: false,
          privacy: false,
          company: false
        };

        // Đồng bộ cứng dựa trên Database của User để bảo vệ UX
        const hasBasicInfo = !!(user.full_name && user.phone);
        const hasUploadedDocsDb = !!(user.id_front_url || user.id_back_url || user.auth_letter_url);
        const hasPrivacyAgreed = !!user.privacy_agreed;

        state.account = hasBasicInfo;
        // Bước 2 hoàn thành nếu đã nộp ở DB hoặc đang được lưu tạm ở Zustand Store ở Frontend
        state.business_license = hasUploadedDocsDb || isTab2Completed;
        state.privacy = hasPrivacyAgreed;

        // Khôi phục dữ liệu giấy tờ từ DB vào Zustand Store (chỉ khi Zustand store chưa có dữ liệu lưu tạm)
        if (hasUploadedDocsDb && !isTab2Completed) {
          saveTab2Data({
            businessType: user.business_type || 'ENTERPRISE',
            idCardNumber: user.id_card_number || '',
            urls: {
              authFileUrl: user.auth_letter_url,
              idFrontUrl: user.id_front_url,
              idBackUrl: user.id_back_url,
              licenseFileUrl: user.license_file_url
            }
          });
        }

        // Cập nhật lại localStorage để đồng nhất
        localStorage.setItem(`hr_verification_completed_tabs_${user.id}`, JSON.stringify(state));
        setCompletedTabs(state);
      } catch (e) {
        console.error('Error parsing completed tabs from local storage', e);
      }
    }
  }, [user, saveTab2Data, clearVerificationData, isTab2Completed]);

  const handleTabComplete = useCallback((tabId) => {
    if (!user?.id) return;
    setCompletedTabs(prev => {
      if (prev[tabId]) return prev;
      const next = { ...prev, [tabId]: true };
      localStorage.setItem(`hr_verification_completed_tabs_${user.id}`, JSON.stringify(next));
      return next;
    });
  }, [user]);

  // Sync state to URL if missing, or redirect away from 'company' tab if already linked
  useEffect(() => {
    const hasCompany = user?.company_id && user?.company_join_status === 'APPROVED';
    if (activeTab === 'company' && hasCompany) {
      setSearchParams({ tab: 'account' }, { replace: true });
    } else if (!searchParams.get('tab')) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [searchParams, setSearchParams, activeTab, user]);

  const hasCompany = !!(user?.company_id && user?.company_join_status === 'APPROVED');

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {hasCompany ? (
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Cài đặt tài khoản
            </h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">
              Cấu hình thông tin cá nhân và bảo mật tài khoản
            </p>
          </div>
          <AccountInfoTab />
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Cài đặt & Xác minh tài khoản</h1>
            <p className="text-slate-500 dark:text-gray-400 mt-1">Hoàn thiện thông tin để kích hoạt tài khoản nhà tuyển dụng</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar */}
            <div className="w-full lg:w-72 shrink-0 bg-white dark:bg-[#0f172a] rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-white/10 sticky top-24">
              <nav className="flex flex-col gap-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const isCompleted = completedTabs[tab.id];

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSearchParams({ tab: tab.id })}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold text-left border-2
                        ${isCompleted 
                          ? isActive 
                            ? 'border-slate-800 bg-emerald-50 text-emerald-600 dark:border-white dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'border-transparent bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : isActive
                            ? 'border-transparent bg-slate-100 text-[#0ea5e9] dark:bg-slate-800 dark:text-white'
                            : 'border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                        }
                      `}
                    >
                      <Icon size={20} className={isCompleted ? 'text-emerald-500' : isActive ? 'text-[#0ea5e9]' : 'text-slate-400'} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0">
              <div className={activeTab === 'account' ? 'block' : 'hidden'}>
                <AccountInfoTab onComplete={() => handleTabComplete('account')} />
              </div>
              <div className={activeTab === 'business_license' ? 'block' : 'hidden'}>
                <BusinessLicenseTab onComplete={() => handleTabComplete('business_license')} />
              </div>
              <div className={activeTab === 'privacy' ? 'block' : 'hidden'}>
                <DataPrivacyTab onComplete={() => handleTabComplete('privacy')} />
              </div>
              <div className={activeTab === 'company' ? 'block' : 'hidden'}>
                <CompanyInfoTab onComplete={() => handleTabComplete('company')} />
              </div>
              {!TABS.some(t => t.id === activeTab) && <Navigate to="?tab=account" replace />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
