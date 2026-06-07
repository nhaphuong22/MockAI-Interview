import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuthStore } from "../../store/useAuthStore";
import { ProfileHeader } from "./components/ProfileHeader";
import { AboutSection } from "./components/AboutSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { SkillsSection } from "./components/SkillsSection";
import { AchievementsSection } from "./components/AchievementsSection";
import { ProfileSidebar } from "./components/ProfileSidebar";
import AtsReportDashboard from "./components/AtsReportDashboard";

const skills = [
  { name: "React", level: 90, category: "Frontend" },
  { name: "TypeScript", level: 85, category: "Frontend" },
  { name: "Node.js", level: 75, category: "Backend" },
  { name: "Python", level: 70, category: "Backend" },
  { name: "UI/UX Design", level: 65, category: "Design" },
];

const experiences = [
  {
    title: "Senior Frontend Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    duration: "2023 - Present",
    description: "Leading frontend development team, building scalable React applications",
  },
  {
    title: "Frontend Developer",
    company: "Startup Hub",
    logo: "💻",
    duration: "2021 - 2023",
    description: "Developed multiple SaaS products using React and TypeScript",
  },
];

const achievements = [
  {
    title: "AWS Certified Developer",
    issuer: "Amazon Web Services",
    date: "2024",
    verified: true,
  },
  {
    title: "React Advanced Certification",
    issuer: "Meta",
    date: "2023",
    verified: true,
  },
  {
    title: "Best Hackathon Project",
    issuer: "Vietnam Tech Summit",
    date: "2023",
    verified: false,
  },
];

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
  const rawAvatarUrl = user?.avatar_url || user?.avatarUrl || "";
  const avatarUrl = rawAvatarUrl.includes("googleusercontent.com")
    ? rawAvatarUrl.replace(/=s\d+(-c)?$/, "=s384-c")
    : rawAvatarUrl;

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
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Giới Thiệu
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="experience"
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Kinh Nghiệm
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="skills"
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Kỹ Năng
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="achievements"
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Thành Tích
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="ats-report"
                  className="flex-1 px-6 py-4 dark:text-slate-400 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Báo Cáo ATS
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="about" className="p-6">
                <AboutSection user={user} />
              </Tabs.Content>

              <Tabs.Content value="experience" className="p-6">
                <ExperienceSection experiences={experiences} />
              </Tabs.Content>

              <Tabs.Content value="skills" className="p-6">
                <SkillsSection skills={skills} />
              </Tabs.Content>

              <Tabs.Content value="achievements" className="p-6">
                <AchievementsSection achievements={achievements} />
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

