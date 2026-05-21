import React from "react";
import { Linkedin, Github, Globe } from "lucide-react";

export function AboutSection({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Về Tôi</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {user?.bio || "Chưa cập nhật phần tự giới thiệu. Hãy vào mục Cài đặt để thêm thông tin giới thiệu bản thân của bạn."}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Liên Kết</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#f0f9ff] hover:text-[#0ea5e9] rounded-xl transition-all"
          >
            <Linkedin className="w-5 h-5" />
            <span>LinkedIn</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#f0f9ff] hover:text-[#0ea5e9] rounded-xl transition-all"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#f0f9ff] hover:text-[#0ea5e9] rounded-xl transition-all"
          >
            <Globe className="w-5 h-5" />
            <span>Portfolio</span>
          </a>
        </div>
      </div>
    </div>
  );
}
