import { Bookmark, MapPin, DollarSign, Briefcase, Trash2, StickyNote, Send, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const savedJobsData = [
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
  const [jobs, setJobs] = useState(savedJobsData);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const removeJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Việc Làm Đã Lưu</h1>
            <p className="text-lg text-gray-600 font-medium">Bạn có <span className="text-[#0ea5e9] font-bold">{jobs.length}</span> cơ hội tiềm năng đang chờ đợi</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm trong mục đã lưu..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:border-[#0ea5e9] focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/30 border border-gray-50 hover:border-sky-100 transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-sky-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {job.logo}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col mb-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#0ea5e9] transition-colors"
                    >
                      {job.title}
                    </Link>
                    <p className="text-lg text-gray-500 font-medium">{job.company}</p>
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm mb-6">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <MapPin className="w-4 h-4 text-[#0ea5e9]" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0ea5e9] font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                      <Briefcase className="w-4 h-4 text-[#0ea5e9]" />
                      <span>{job.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-sky-50 text-[#0ea5e9] rounded-lg text-[10px] font-bold uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-50">
                    {editingNoteId === job.id ? (
                      <div className="mb-4">
                        <textarea
                          defaultValue={job.note}
                          placeholder="Thêm ghi chú cá nhân về công việc này..."
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#0ea5e9] focus:bg-white focus:outline-none transition-all resize-none text-sm font-medium"
                          rows={3}
                          onBlur={() => setEditingNoteId(null)}
                          autoFocus
                        />
                      </div>
                    ) : job.note ? (
                      <div
                        onClick={() => setEditingNoteId(job.id)}
                        className="bg-yellow-50/50 border-l-4 border-yellow-400 p-4 rounded-2xl mb-4 cursor-pointer hover:bg-yellow-50 transition-colors group/note"
                      >
                        <div className="flex items-start gap-3">
                          <StickyNote className="w-4 h-4 text-yellow-600 mt-0.5 group-hover/note:rotate-12 transition-transform" />
                          <p className="text-sm text-yellow-800 font-medium leading-relaxed">{job.note}</p>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingNoteId(job.id)}
                        className="text-xs font-bold text-gray-400 hover:text-[#0ea5e9] mb-4 flex items-center gap-2 uppercase tracking-widest transition-colors"
                      >
                        <StickyNote className="w-4 h-4" />
                        <span>Thêm ghi chú cá nhân</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Đã lưu vào: {new Date(job.savedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex-1 md:flex-none px-8 py-3 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-100"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp Đơn</span>
                  </Link>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="px-6 py-3 border border-gray-100 text-gray-400 font-bold rounded-2xl hover:border-red-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Bỏ Lưu</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[40px] shadow-xl shadow-gray-200/20 border border-gray-50">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Danh sách trống</h3>
              <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">Hãy lưu lại những công việc bạn yêu thích để không bỏ lỡ cơ hội.</p>
              <Link
                to="/jobs"
                className="inline-flex px-10 py-4 bg-[#0ea5e9] text-white font-bold rounded-2xl hover:bg-[#0284c7] hover:shadow-xl transition-all shadow-md shadow-sky-100"
              >
                Khám phá việc làm ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
