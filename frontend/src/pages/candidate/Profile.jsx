import { MapPin, Mail, Phone, Linkedin, Github, Globe, Edit, Download, Share2, Award, Briefcase, GraduationCap, Star } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import * as Tabs from "@radix-ui/react-tabs";

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
  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-20 relative">
              <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] ring-4 ring-white flex items-center justify-center text-6xl flex-shrink-0">
                👨‍💻
              </div>

              <div className="flex-1 pt-24 md:pt-0 md:mt-20">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl mb-2">Nguyễn Văn A</h1>
                    <p className="text-xl text-gray-600 mb-2">Senior Frontend Developer</p>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>Hà Nội, Việt Nam</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>nguyenvana@example.com</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>0912345678</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      <span>Chỉnh Sửa</span>
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Tải CV</span>
                    </button>
                    <button className="p-2 border-2 border-gray-300 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#f0f9ff] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Hoàn thiện hồ sơ</span>
                    <span className="text-sm font-semibold text-[#0ea5e9]">85%</span>
                  </div>
                  <Progress.Root className="h-2 bg-white rounded-full overflow-hidden">
                    <Progress.Indicator
                      className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all"
                      style={{ width: "85%" }}
                    />
                  </Progress.Root>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Tabs.Root defaultValue="about" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <Tabs.List className="flex border-b border-gray-200">
                <Tabs.Trigger
                  value="about"
                  className="flex-1 px-6 py-4 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Giới Thiệu
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="experience"
                  className="flex-1 px-6 py-4 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Kinh Nghiệm
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="skills"
                  className="flex-1 px-6 py-4 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Kỹ Năng
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="achievements"
                  className="flex-1 px-6 py-4 text-gray-600 hover:text-[#0ea5e9] data-[state=active]:text-[#0ea5e9] data-[state=active]:border-b-2 data-[state=active]:border-[#0ea5e9] transition-colors"
                >
                  Thành Tích
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="about" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Về Tôi</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Tôi là một Senior Frontend Developer với hơn 5 năm kinh nghiệm phát triển ứng dụng web
                      hiện đại. Đam mê công nghệ và luôn cập nhật những xu hướng mới nhất trong lĩnh vực
                      frontend development. Có kinh nghiệm làm việc với các công ty startup và tập đoàn lớn.
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
              </Tabs.Content>

              <Tabs.Content value="experience" className="p-6">
                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div key={index} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                        {exp.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{exp.title}</h3>
                        <p className="text-[#0ea5e9] mb-2">{exp.company}</p>
                        <p className="text-sm text-gray-600 mb-2">{exp.duration}</p>
                        <p className="text-gray-700">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="skills" className="p-6">
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{skill.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-[#f0f9ff] text-[#0ea5e9] rounded-full">
                            {skill.category}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{skill.level}%</span>
                      </div>
                      <Progress.Root className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <Progress.Indicator
                          className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all"
                          style={{ width: `${skill.level}%` }}
                        />
                      </Progress.Root>
                    </div>
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="achievements" className="p-6">
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-[#0ea5e9] transition-all"
                    >
                      <div className="w-12 h-12 bg-[#f0f9ff] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-[#0ea5e9]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          {achievement.verified && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{achievement.issuer}</p>
                        <p className="text-xs text-gray-500">{achievement.date}</p>
                      </div>
                    </div>
                  ))}

                  <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9] hover:bg-[#f0f9ff] transition-all">
                    + Thêm Thành Tích
                  </button>
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold mb-4">AI Score</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.88)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl text-[#0ea5e9]">88</div>
                    <div className="text-xs text-gray-600">/ 100</div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600">
                Hồ sơ của bạn có độ phù hợp cao với các công ty công nghệ
              </p>
            </div>

            <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-2xl p-6 text-white">
              <h3 className="text-lg mb-2">Lượt Xem Hồ Sơ</h3>
              <div className="text-4xl mb-1">2,456</div>
              <p className="text-sm opacity-90">Trong 30 ngày qua</p>
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span>Tuần này</span>
                  <span className="font-semibold">+23%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-[#f0f9ff] text-[#0ea5e9] rounded-xl hover:bg-[#0ea5e9] hover:text-white transition-all flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span>AI Phỏng Vấn Thử</span>
                </button>
                <button className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] hover:text-[#0ea5e9] transition-all flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Khóa Học Đề Xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
