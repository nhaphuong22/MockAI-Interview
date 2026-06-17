import { useState } from "react";
import { Bot, Clock, CheckCircle2, XCircle, Info, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { applicationApi } from "../../api/applicationApi";
import * as Tabs from "@radix-ui/react-tabs";
import { TrackingStats } from "./components/TrackingStats";
import { ApplicationCard } from "./components/ApplicationCard";
import * as Dialog from "@radix-ui/react-dialog";
import AtsReportDashboard from "./components/AtsReportDashboard";

const statusConfig = {
  reviewing: { label: "Đang Xem", color: "dark:bg-yellow-900/30 dark:text-yellow-400 bg-yellow-100 text-yellow-700", icon: Clock },
  ai_interview_invited: { label: "Mời PV AI", color: "dark:bg-orange-900/30 dark:text-orange-400 bg-orange-100 text-orange-700", icon: Bot },
  interview: { label: "Phỏng Vấn", color: "dark:bg-blue-900/30 dark:text-blue-400 bg-blue-100 text-blue-700", icon: Info },
  accepted: { label: "Đã Tuyển", color: "dark:bg-green-900/30 dark:text-green-400 bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Từ Chối", color: "dark:bg-red-900/30 dark:text-red-400 bg-red-100 text-red-700", icon: XCircle },
};

export function ApplicationTracking() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [showAtsModal, setShowAtsModal] = useState(false);

  // Fetch đơn ứng tuyển của Candidate từ DB
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["candidate-applications"],
    queryFn: async () => {
      const res = await applicationApi.getApplications();
      return res; // Axios interceptor đã bóc tách response.data
    }
  });

  const rawApplications = response?.data || [];

  // Chuẩn hoá và sinh thông tin động thích ứng với UI
  const applications = rawApplications.map(app => {
    // Ánh xạ trạng thái từ backend sang frontend config
    let status = "reviewing";
    const rawStatus = app.status?.toLowerCase();
    if (rawStatus === "submitted" || rawStatus === "reviewing") status = "reviewing";
    else if (rawStatus === "ai_interview_invited") status = "ai_interview_invited";
    else if (rawStatus === "interviewed") status = "interview";
    else if (rawStatus === "accepted") status = "accepted";
    else if (rawStatus === "rejected") status = "rejected";
    // Sinh timeline động dựa trên trạng thái
    const timeline = [
      { step: "Nộp hồ sơ", completed: true, date: new Date(app.appliedDate).toLocaleDateString("vi-VN") },
      { step: "Chấm điểm CV AI", completed: true, date: new Date(app.appliedDate).toLocaleDateString("vi-VN"), score: app.aiScore },
      { step: "Chờ phản hồi", completed: rawStatus !== "submitted", date: rawStatus !== "submitted" ? new Date(app.appliedDate).toLocaleDateString("vi-VN") : null },
      { step: "Phỏng vấn Nhà Tuyển Dụng", completed: rawStatus === "interviewed" || rawStatus === "accepted", date: null },
      { step: "Kết quả cuối cùng", completed: rawStatus === "accepted" || rawStatus === "rejected", date: null },
    ];

    return {
      id: app.id,
      title: app.jobTitle,
      company: app.companyName,
      logo: app.companyName?.substring(0, 1).toUpperCase() || "🚀",
      appliedDate: app.appliedDate,
      status,
      rawStatus,
      timeline,
      aiScore: app.aiScore
    };
  });

  const stats = {
    total: applications.length,
    reviewing: applications.filter(a => a.status === "reviewing").length,
    interview: applications.filter(a => a.status === "interview").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const filteredApplications = activeTab === "all"
    ? applications
    : applications.filter(app => app.status === activeTab);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] pt-20">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-gray-500 font-semibold text-sm">Đang tải lịch sử ứng tuyển của bạn...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        Đã xảy ra lỗi khi tải danh sách ứng tuyển. Vui lòng thử lại!
      </div>
    );
  }

  return (
    <div className="dark:bg-transparent bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-2 tracking-tight">Theo Dõi Ứng Tuyển</h1>
            <p className="text-lg dark:text-slate-300 text-gray-600 font-medium">Trạng thái hồ sơ của bạn đang được xử lý như thế nào?</p>
          </div>
          <div className="flex gap-2">
            <span className="px-4 py-2 dark:bg-[#0f172a] bg-white border dark:border-white/10 border-gray-100 rounded-xl shadow-sm text-sm font-bold text-gray-500">
              Tổng cộng: <span className="text-[#0ea5e9]">{stats.total}</span>
            </span>
          </div>
        </div>

        <TrackingStats stats={stats} />

        <Tabs.Root 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-8"
        >
          <Tabs.List className="flex gap-1 dark:bg-[#0a0f1c]/80 bg-white p-1.5 rounded-2xl shadow-lg shadow-gray-200/30 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-100 max-w-fit">
            <Tabs.Trigger
              value="all"
              className="px-6 py-2.5 rounded-xl text-sm font-bold dark:text-slate-400 text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300 cursor-pointer"
            >
              Tất Cả
            </Tabs.Trigger>
            <Tabs.Trigger
              value="reviewing"
              className="px-6 py-2.5 rounded-xl text-sm font-bold dark:text-slate-400 text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300 cursor-pointer"
            >
              Đang Xét
            </Tabs.Trigger>
            <Tabs.Trigger
              value="interview"
              className="px-6 py-2.5 rounded-xl text-sm font-bold dark:text-slate-400 text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300 cursor-pointer"
            >
              Phỏng Vấn
            </Tabs.Trigger>
            <Tabs.Trigger
              value="accepted"
              className="px-6 py-2.5 rounded-xl text-sm font-bold dark:text-slate-400 text-gray-500 data-[state=active]:bg-[#0ea5e9] data-[state=active]:text-white transition-all duration-300 cursor-pointer"
            >
              Trúng Tuyển
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value={activeTab} className="space-y-6 outline-none">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <ApplicationCard 
                  key={app.id} 
                  app={app} 
                  statusConfig={statusConfig} 
                  onViewAtsReport={(appId) => {
                    setSelectedAppId(appId);
                    setShowAtsModal(true);
                  }}
                />
              ))
            ) : (
              <div className="dark:bg-[#0a0f1c]/50 bg-white rounded-3xl p-12 text-center shadow-xl shadow-gray-200/30 dark:shadow-[#0ea5e9]/10 border dark:border-white/10 border-gray-50">
                <p className="dark:text-slate-400 text-gray-500 font-medium">Chưa có hồ sơ ứng tuyển nào ở trạng thái này.</p>
              </div>
            )}
          </Tabs.Content>
        </Tabs.Root>

        {/* ATS Report Modal */}
        <Dialog.Root open={showAtsModal} onOpenChange={setShowAtsModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50 animate-in zoom-in-95 duration-300 outline-none border dark:border-white/10">
              <div className="relative">
                <div className="absolute top-6 right-6 z-10">
                  <Dialog.Close className="p-2 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 outline-none cursor-pointer">
                    <XCircle className="w-6 h-6" />
                  </Dialog.Close>
                </div>
                <div className="p-10">
                  {selectedAppId && (
                    <AtsReportDashboard appId={selectedAppId} />
                  )}
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
export default ApplicationTracking;
