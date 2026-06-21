import { Bookmark, MapPin, DollarSign, Briefcase, Trash2, StickyNote, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobApi } from "../../api/jobApi";
import { useUiStore } from "../../store/useUiStore";

export function SavedJobs() {
  const queryClient = useQueryClient();
  const [editingNoteId, setEditingNoteId] = useState(null);
  const showToast = useUiStore((state) => state.showToast);

  const { data: jobs = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['savedJobs'],
    queryFn: async () => {
      const res = await jobApi.getSavedJobs();
      return res.data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (jobId) => jobApi.toggleSavedJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      queryClient.invalidateQueries({ queryKey: ['savedJobIds'] });
      showToast({ message: "Đã bỏ lưu việc làm.", type: "success" });
    },
    onError: () => showToast({ message: "Có lỗi xảy ra.", type: "error" })
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ jobId, note }) => jobApi.updateSavedJobNote(jobId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      showToast({ message: "Cập nhật ghi chú thành công.", type: "success" });
      setEditingNoteId(null);
    },
    onError: () => showToast({ message: "Không thể lưu ghi chú.", type: "error" })
  });

  const removeJob = (id) => {
    toggleMutation.mutate(id);
  };

  const saveNote = (id, newNote) => {
    updateNoteMutation.mutate({ jobId: id, note: newNote });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4 bg-gray-50/50">
        <div className="text-red-500 font-extrabold text-xl">
          Đã xảy ra lỗi khi tải danh sách việc làm!
        </div>
        <div className="text-gray-500 text-sm font-semibold">
          {error?.response?.data?.error || error?.response?.data?.message || error?.message || "Lỗi hệ thống"}
        </div>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Việc Làm Đã Lưu</h1>
        </div>

        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/30 border border-gray-50 hover:border-sky-100 transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-sky-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden text-white">
                  {job.logo && (job.logo.startsWith("http") || job.logo.startsWith("/") || job.logo.startsWith("data:")) ? (
                    <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold">{job.logo || "🚀"}</span>
                  )}
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
                          onBlur={(e) => {
                            if (e.target.value !== job.note) {
                              saveNote(job.id, e.target.value);
                            } else {
                              setEditingNoteId(null);
                            }
                          }}
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
