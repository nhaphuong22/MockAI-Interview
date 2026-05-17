import { Briefcase } from "lucide-react";

export function PostJob() {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl mb-8">Đăng Tin Tuyển Dụng</h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <form className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Tiêu đề công việc</label>
              <input type="text" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none" placeholder="VD Frontend Developer" />
            </div>
            <div>
              <label className="block text-sm mb-2">Mô tả công việc</label>
              <textarea rows={8} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none resize-none" />
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all">
              Đăng Tin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
