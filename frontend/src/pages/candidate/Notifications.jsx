import { Bell, CheckCircle2, MessageCircle, Briefcase, Star, Settings, Trash2, Search, Filter } from "lucide-react";
import { useState } from "react";

const notificationsData = [
  {
    id: 1,
    type: "application",
    title: "Cập nhật trạng thái đơn ứng tuyển",
    content: "Hồ sơ của bạn cho vị trí Senior Frontend Developer tại TechCorp Vietnam đã được AI đánh giá đạt 95/100.",
    time: "2 giờ trước",
    isRead: false,
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
  },
  {
    id: 2,
    type: "message",
    title: "Tin nhắn mới từ Nhà Tuyển Dụng",
    content: "Startup Hub đã gửi cho bạn một lời mời phỏng vấn trực tiếp vào 10:00 AM ngày mai.",
    time: "5 giờ trước",
    isRead: false,
    icon: MessageCircle,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: 3,
    type: "recommendation",
    title: "Việc làm mới phù hợp với bạn",
    content: "Có 5 vị trí React Developer mới phù hợp với kỹ năng và mức lương kỳ vọng của bạn.",
    time: "1 ngày trước",
    isRead: true,
    icon: Briefcase,
    color: "text-purple-600 bg-purple-50",
  },
  {
    id: 4,
    type: "system",
    title: "Hoàn thiện hồ sơ để tăng cơ hội",
    content: "Hồ sơ của bạn còn thiếu phần 'Dự án cá nhân'. Hãy bổ sung để thu hút thêm Nhà Tuyển Dụng.",
    time: "2 ngày trước",
    isRead: true,
    icon: Star,
    color: "text-yellow-600 bg-yellow-50",
  },
];

export function Notifications() {
  const [notifications, setNotifications] = useState(notificationsData);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Thông Báo</h1>
            <p className="text-lg text-gray-600 font-medium">Cập nhật những tin tức và cơ hội mới nhất dành cho bạn</p>
          </div>
          <button 
            onClick={markAllRead}
            className="text-sm font-bold text-[#0ea5e9] hover:text-[#0284c7] transition-colors flex items-center gap-2 uppercase tracking-widest"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`group bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/20 border transition-all flex gap-6 relative overflow-hidden ${
                  notification.isRead ? "border-gray-50 opacity-80" : "border-sky-100 ring-1 ring-sky-50"
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0ea5e9]"></div>
                )}
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${notification.color}`}>
                  <Icon className="w-7 h-7" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-lg font-bold ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{notification.time}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium mb-4">{notification.content}</p>
                  
                  <div className="flex items-center gap-4">
                    {!notification.isRead && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs font-bold text-[#0ea5e9] hover:underline uppercase tracking-widest"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-xl shadow-gray-200/20 border border-gray-50">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Hộp thư trống</h3>
              <p className="text-gray-500 font-medium max-w-xs mx-auto">Bạn không có thông báo nào mới vào lúc này.</p>
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <button className="px-8 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:text-[#0ea5e9] hover:border-sky-100 transition-all shadow-sm">
            Xem thông báo cũ hơn
          </button>
        </div>
      </div>
    </div>
  );
}
