import { Bell, CheckCircle2, XCircle, MessageCircle, Briefcase, Star, Settings, Trash2, Search, Filter, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../../api/notificationApi";
import { Link } from "react-router-dom";

const getIconForType = (type, content = "") => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("không đạt") || lowerContent.includes("từ chối") || lowerContent.includes("rejected")) {
    return XCircle;
  }
  switch (type) {
    case "application":
      return CheckCircle2;
    case "message":
    case "interview_invite":
      return MessageCircle;
    case "recommendation":
    case "job_alert":
      return Briefcase;
    default:
      return Star;
  }
};

const getColorForType = (type, content = "") => {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes("không đạt") || lowerContent.includes("từ chối") || lowerContent.includes("rejected")) {
    return "text-red-600 bg-red-50 border-red-100";
  }
  if (lowerContent.includes("mời phỏng vấn") || lowerContent.includes("phỏng vấn")) {
    return "text-purple-600 bg-purple-50 border-purple-100";
  }
  switch (type) {
    case "application":
      return "text-green-600 bg-green-50 border-green-100";
    case "message":
    case "interview_invite":
      return "text-[#0ea5e9] bg-sky-50 border-sky-100";
    case "recommendation":
    case "job_alert":
      return "text-purple-600 bg-purple-50 border-purple-100";
    default:
      return "text-amber-600 bg-amber-50 border-amber-100";
  }
};

export function RecruiterNotifications() {
  const queryClient = useQueryClient();

  // Fetch danh sách thông báo của Recruiter
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await notificationApi.getNotifications();
      return res; // Axios client bóc tách trả về response.data
    }
  });

  // Mutation đánh dấu một thông báo là đã đọc
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  // Mutation đánh dấu tất cả đã đọc
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    }
  });

  const notifications = response?.data || [];

  const markAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const markAllRead = () => {
    markAllReadMutation.mutate();
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) return `${diffMins || 1} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50/50">
        <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
        <p className="text-gray-500 font-semibold text-sm">Đang tải thông báo tuyển dụng...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50/50 text-red-500 font-bold">
        Đã xảy ra lỗi khi tải danh sách thông báo. Vui lòng tải lại trang!
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-[calc(100vh-64px)] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Hộp Thư Thông Báo</h1>
            <p className="text-lg text-gray-600 font-medium">Theo dõi các hoạt động tuyển dụng, hồ sơ ứng tuyển mới và cập nhật hệ thống</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllRead}
              className="text-sm font-bold text-[#0ea5e9] hover:text-[#0284c7] transition-colors flex items-center gap-2 uppercase tracking-widest cursor-pointer whitespace-nowrap"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getIconForType(notification.type, notification.content);
            const colorClass = getColorForType(notification.type, notification.content);
            return (
              <div
                key={notification.id}
                className={`group bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/10 border transition-all flex gap-6 relative overflow-hidden ${
                  notification.isRead ? "border-gray-100/50 opacity-80" : "border-sky-100 ring-1 ring-sky-50"
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0ea5e9]"></div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105 ${colorClass}`}>
                  <Icon className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-bold ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatTime(notification.time)}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium mb-4">{notification.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {!notification.isRead && (
                        <button 
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-bold text-[#0ea5e9] hover:underline uppercase tracking-widest cursor-pointer"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>

                    {notification.link && (
                      <Link 
                        to={notification.link}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                        }}
                        className="text-xs font-bold text-gray-400 group-hover:text-[#0ea5e9] hover:underline uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                        <span>Đi tới trang</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-xl shadow-gray-200/10 border border-gray-100">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hộp thư trống</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto">Nhà tuyển dụng chưa có thông báo nào vào lúc này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterNotifications;
