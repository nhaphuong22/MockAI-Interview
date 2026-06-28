import React from "react";
import { Linkedin, Github, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUiStore } from "../../../store/useUiStore";

export function AboutSection({ user }) {
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);

  const handleLinkClick = (e, name, url, focusKey) => {
    e.preventDefault();
    if (url && url !== "#" && url.trim() !== "") {
      window.open(url.startsWith("http") ? url : `https://${url}`, "_blank");
    } else {
      showToast({
        message: `Bạn chưa thiết lập liên kết ${name}. Đang chuyển đến ô nhập ${name}...`,
        type: "info",
      });
      navigate(`/settings?focus=${focusKey}`);
    }
  };

  const linkedinUrl = user?.linkedin_url || user?.linkedinUrl || user?.linkedin || "";
  const githubUrl = user?.github_url || user?.githubUrl || user?.github || "";
  const portfolioUrl = user?.portfolio_url || user?.portfolioUrl || user?.portfolio || "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg dark:text-white font-semibold mb-3">Về Tôi</h3>
        <p className="dark:text-slate-300 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {user?.bio || "Chưa cập nhật phần tự giới thiệu. Hãy vào mục Cài đặt để thêm thông tin giới thiệu bản thân của bạn."}
        </p>
      </div>

      <div>
        <h3 className="text-lg dark:text-white font-semibold mb-3">Liên Kết</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={(e) => handleLinkClick(e, "LinkedIn", linkedinUrl, "linkedin")}
            className="flex items-center gap-2 px-4 py-2 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:bg-[#0ea5e9]/10 bg-gray-100 hover:bg-[#f0f9ff] hover:text-[#0ea5e9] rounded-xl transition-all cursor-pointer"
          >
            <Linkedin className="w-5 h-5" />
            <span>LinkedIn</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleLinkClick(e, "GitHub", githubUrl, "github")}
            className="flex items-center gap-2 px-4 py-2 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:bg-[#0ea5e9]/10 bg-gray-100 hover:bg-[#f0f9ff] hover:text-[#0ea5e9] rounded-xl transition-all cursor-pointer"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleLinkClick(e, "Portfolio", portfolioUrl, "portfolio")}
            className="flex items-center gap-2 px-4 py-2 dark:bg-[#1e293b] dark:text-slate-300 dark:hover:bg-[#0ea5e9]/10 bg-gray-100 hover:bg-[#f0f9ff] hover:text-[#0ea5e9] rounded-xl transition-all cursor-pointer"
          >
            <Globe className="w-5 h-5" />
            <span>Portfolio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
