import { Bookmark, MapPin, DollarSign, Briefcase, Trash2, StickyNote } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const savedJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Vietnam",
    logo: "🚀",
    location: "Hà Nội",
    salary: "25-35 triệu",
    type: "Full-time",
    tags: ["React", "TypeScript"],
    savedDate: "2026-05-15",
    note: "Công ty tốt, cần chuẩn bị kỹ về React",
  },
  {
    id: 2,
    title: "Full Stack Developer",
    company: "Startup Hub",
    logo: "💻",
    location: "Remote",
    salary: "28-38 triệu",
    type: "Full-time",
    tags: ["React", "Node.js"],
    savedDate: "2026-05-14",
    note: "",
  },
];

export function SavedJobs() {
  const [jobs, setJobs] = useState(savedJobs);
  const [editingNote, setEditingNote] = useState<number | null>(null);

  const removeJob = (id: number) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Việc Làm Đã Lưu</h1>
          <p className="text-gray-600">Bạn có {jobs.length} việc làm đã lưu</p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#E8580C] transition-all"
            >
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E8580C] to-[#ff7a3d] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {job.logo}
                </div>

                <div className="flex-1">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-xl font-semibold mb-2 hover:text-[#E8580C] transition-colors block"
                  >
                    {job.title}
                  </Link>
                  <p className="text-gray-600 mb-3">{job.company}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#E8580C] font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#FFF3ED] text-[#E8580C] rounded-md text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {editingNote === job.id ? (
                    <div className="mb-3">
                      <textarea
                        defaultValue={job.note}
                        placeholder="Thêm ghi chú..."
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#E8580C] focus:outline-none resize-none"
                        rows={2}
                        onBlur={() => setEditingNote(null)}
                        autoFocus
                      />
                    </div>
                  ) : job.note ? (
                    <div
                      onClick={() => setEditingNote(job.id)}
                      className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-3 cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">{job.note}</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingNote(job.id)}
                      className="text-sm text-gray-600 hover:text-[#E8580C] mb-3 flex items-center gap-1"
                    >
                      <StickyNote className="w-4 h-4" />
                      <span>Thêm ghi chú</span>
                    </button>
                  )}

                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>Đã lưu: {new Date(job.savedDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="px-6 py-2 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Nộp Đơn
                  </Link>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-16">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl mb-2">Chưa có việc làm nào được lưu</h3>
              <p className="text-gray-600 mb-6">Lưu các việc làm bạn quan tâm để xem lại sau</p>
              <Link
                to="/jobs"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#E8580C] to-[#ff7a3d] text-white rounded-xl hover:shadow-lg transition-all"
              >
                Tìm Việc Ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
