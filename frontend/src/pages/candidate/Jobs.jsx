import { Search, MapPin, DollarSign, Briefcase, Clock, Bookmark, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

const jobsData = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    location: "Hà Nội",
    salary: "25-35 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "3-5 years",
    tags: ["React", "TypeScript", "Node.js"],
    aiMatch: 95,
    posted: "2 ngày trước",
    applicants: 45,
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Startup Hub",
    logo: "💻",
    location: "Remote",
    salary: "28-38 triệu",
    type: "Full-time",
    remote: "Remote",
    experience: "2-4 years",
    tags: ["React", "Node.js", "MongoDB"],
    aiMatch: 88,
    posted: "1 tuần trước",
    applicants: 32,
  },
  {
    id: 3,
    title: "Frontend Developer",
    company: "Design Studio",
    logo: "🎨",
    location: "TP.HCM",
    salary: "20-30 triệu",
    type: "Full-time",
    remote: "Office",
    experience: "1-3 years",
    tags: ["React", "Vue.js", "CSS"],
    aiMatch: 82,
    posted: "3 ngày trước",
    applicants: 28,
  },
  {
    id: 4,
    title: "Backend Developer (Node.js)",
    company: "E-Commerce Plus",
    logo: "📱",
    location: "Đà Nẵng",
    salary: "22-32 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "2-4 years",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    aiMatch: 78,
    posted: "5 ngày trước",
    applicants: 18,
  },
  {
    id: 5,
    title: "UI/UX Designer",
    company: "Creative Agency",
    logo: "✨",
    location: "Hà Nội",
    salary: "18-28 triệu",
    type: "Full-time",
    remote: "Hybrid",
    experience: "1-3 years",
    tags: ["Figma", "Adobe XD", "UI Design"],
    aiMatch: 75,
    posted: "4 ngày trước",
    applicants: 22,
  },
];

export function Jobs() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [bookmarked, setBookmarked] = useState([]);
  const [salaryRange, setSalaryRange] = useState([10, 50]);
  const [showFilters, setShowFilters] = useState(true);

  const toggleBookmark = (jobId) => {
    setBookmarked((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const selectedJobData = jobsData.find((job) => job.id === selectedJob);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <aside
        className={`${
          showFilters ? "w-80" : "w-0"
        } transition-all duration-300 overflow-hidden bg-white border-r border-gray-200`}
      >
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bộ Lọc</h2>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Địa điểm..."
                className="flex-1 outline-none"
              />
            </div>
          </div>

          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] transition-colors">
              <span className="font-semibold">Lĩnh Vực</span>
              <ChevronDown className="w-5 h-5" />
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-3 mt-3">
              {["IT", "Marketing", "Design", "Finance", "Sales"].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox.Root
                    className="w-5 h-5 border-2 border-gray-300 rounded bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors"
                    id={field}
                  >
                    <Checkbox.Indicator>
                      <Check className="w-4 h-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={field} className="text-sm cursor-pointer">
                    {field}
                  </label>
                </div>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Mức Lương (triệu VND)</span>
              <span className="text-sm text-[#0ea5e9]">
                {salaryRange[0]} - {salaryRange[1]}+
              </span>
            </div>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={salaryRange}
              onValueChange={setSalaryRange}
              max={50}
              min={10}
              step={5}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-1.5">
                <Slider.Range className="absolute bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#0ea5e9] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] transition-transform" />
              <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-[#0ea5e9] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] transition-transform" />
            </Slider.Root>
          </div>

          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] transition-colors">
              <span className="font-semibold">Kinh Nghiệm</span>
              <ChevronDown className="w-5 h-5" />
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-3 mt-3">
              {["0-1 năm", "1-3 năm", "3-5 năm", "5+ năm"].map((exp) => (
                <div key={exp} className="flex items-center gap-2">
                  <Checkbox.Root
                    className="w-5 h-5 border-2 border-gray-300 rounded bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors"
                    id={exp}
                  >
                    <Checkbox.Indicator>
                      <Check className="w-4 h-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={exp} className="text-sm cursor-pointer">
                    {exp}
                  </label>
                </div>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger className="flex items-center justify-between w-full py-2 hover:text-[#0ea5e9] transition-colors">
              <span className="font-semibold">Hình Thức</span>
              <ChevronDown className="w-5 h-5" />
            </Collapsible.Trigger>
            <Collapsible.Content className="space-y-3 mt-3">
              {["Full-time", "Part-time", "Remote", "Hybrid", "Office"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <Checkbox.Root
                    className="w-5 h-5 border-2 border-gray-300 rounded bg-white hover:border-[#0ea5e9] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9] transition-colors"
                    id={type}
                  >
                    <Checkbox.Indicator>
                      <Check className="w-4 h-4 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label htmlFor={type} className="text-sm cursor-pointer">
                    {type}
                  </label>
                </div>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          <button className="w-full py-2 text-[#0ea5e9] hover:underline text-sm">
            Xóa bộ lọc
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showFilters && (
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Bộ lọc</span>
                </button>
              )}
              <div>
                <p className="text-sm text-gray-600">
                  Tìm thấy <span className="font-semibold text-[#0ea5e9]">{jobsData.length}</span> công việc
                </p>
              </div>
            </div>
            <select className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none">
              <option>Phù hợp nhất</option>
              <option>Mới nhất</option>
              <option>Lương cao nhất</option>
            </select>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {jobsData.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
                className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all ${
                  selectedJob === job.id
                    ? "border-[#0ea5e9] shadow-lg"
                    : "border-gray-100 hover:border-gray-300"
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {job.logo}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1 hover:text-[#0ea5e9] transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                          {job.aiMatch}% phù hợp
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(job.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Bookmark
                            className={`w-5 h-5 ${
                              bookmarked.includes(job.id)
                                ? "fill-[#0ea5e9] text-[#0ea5e9]"
                                : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-[#0ea5e9]" />
                        <span className="font-semibold text-[#0ea5e9]">{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                      <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                        {job.remote}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[#f0f9ff] text-[#0ea5e9] rounded-md text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.posted}</span>
                      </div>
                      <span>{job.applicants} ứng viên</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedJobData && (
            <div className="w-1/2 border-l border-gray-200 bg-white overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-3xl">
                    {selectedJobData.logo}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-1">{selectedJobData.title}</h2>
                    <p className="text-lg text-gray-600">{selectedJobData.company}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-xl hover:shadow-lg transition-all">
                    Nộp Đơn Ngay
                  </button>
                  <button className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-[#0ea5e9] hover:bg-[#f0f9ff] transition-all">
                    <Bookmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Thông Tin Chung</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mức lương</p>
                      <p className="font-semibold text-[#0ea5e9]">{selectedJobData.salary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kinh nghiệm</p>
                      <p className="font-semibold">{selectedJobData.experience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Hình thức</p>
                      <p className="font-semibold">{selectedJobData.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Địa điểm</p>
                      <p className="font-semibold">{selectedJobData.location}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Mô Tả Công Việc</h3>
                  <div className="text-gray-700 space-y-2">
                    <p>
                      Chúng tôi đang tìm kiếm một {selectedJobData.title} để gia nhập đội ngũ phát triển
                      sản phẩm. Bạn sẽ làm việc với các công nghệ hiện đại và tham gia vào các dự án
                      thú vị.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Phát triển và maintain các tính năng mới</li>
                      <li>Làm việc với team để đảm bảo chất lượng code</li>
                      <li>Tham gia code review và đóng góp ý tưởng</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Yêu Cầu</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Kinh nghiệm {selectedJobData.experience}</li>
                    <li>Thành thạo {selectedJobData.tags.join(", ")}</li>
                    <li>Kỹ năng giao tiếp tốt</li>
                    <li>Tinh thần tr책nhiệm và làm việc nhóm</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Phúc Lợi</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Lương thưởng cạnh tranh</li>
                    <li>Bảo hiểm đầy đủ</li>
                    <li>Làm việc linh hoạt</li>
                    <li>Môi trường năng động, chuyên nghiệp</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
