import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuthStore } from "../../store/useAuthStore";
import { ProfileHeader } from "./components/ProfileHeader";
import { AboutSection } from "./components/AboutSection";
import { ProfileSidebar } from "./components/ProfileSidebar";
import AtsReportDashboard from "./components/AtsReportDashboard";


export function Profile() {
  const { user } = useAuthStore();

  const calculateCompleteness = () => {
    if (!user) return 0;
    const fields = [
      user.full_name || user.fullName,
      user.email,
      user.phone,
      user.address,
      user.bio,
      user.avatar_url || user.avatarUrl
    ];
    const completedFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const completeness = calculateCompleteness();
  const rawAvatarUrl = user?.avatar_url || user?.avatarUrl || localStorage.getItem("googleAvatar") || "";
  const getAbsoluteAvatarUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const backendUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace("/api", "")
      : "http://localhost:5000";
    return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };
  const avatarUrl = rawAvatarUrl.includes("googleusercontent.com")
    ? rawAvatarUrl.replace(/=s\d+(-c)?$/, "=s384-c")
    : getAbsoluteAvatarUrl(rawAvatarUrl);

  return (
    <div className="dark:bg-[#0a0f1c] bg-gray-50 py-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader user={user} completeness={completeness} avatarUrl={avatarUrl} />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Tabs.Root defaultValue="about" className="dark:bg-[#0f172a] bg-white rounded-2xl shadow-sm border dark:border-white/10 border-gray-100 overflow-hidden">
              <Tabs.List className="flex border-b dark:border-white/10 border-gray-200">
                <Tabs.Trigger
                  value="about"
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors font-semibold"
                >
                  Giới Thiệu
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="ats-report"
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors font-semibold"
                >
                  Báo Cáo ATS
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="about" className="p-6">
                <AboutSection user={user} />
              </Tabs.Content>



              <Tabs.Content value="ats-report" className="p-6">
                <AtsReportDashboard />
              </Tabs.Content>
            </Tabs.Root>
          </div>

          <div className="space-y-6">
            <ProfileSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

