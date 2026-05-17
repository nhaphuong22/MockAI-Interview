import { Bell } from "lucide-react";

export function Notifications() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl mb-2">Thông Báo</h1>
        <p className="text-gray-600 mb-8">Cập nhật mới nhất về đơn ứng tuyển và tin tức</p>
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Chưa có thông báo mới</p>
        </div>
      </div>
    </div>
  );
}
