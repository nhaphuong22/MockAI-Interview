import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Star, Briefcase, Users, Download, Loader2, CheckCircle2,
  Phone, FileDown, NotepadText, ArrowUpDown, Trophy
} from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

// Status label + color for qualified candidates
const STATUS_BADGES = {
  SHORTLISTED: { label: "Đậu PV (Chờ KQ)", color: "text-orange-700 bg-orange-50 border-orange-200" },
  HIRED:       { label: "Đạt / Trúng tuyển", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  ACCEPTED:    { label: "Trúng tuyển",        color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};

// Derive AI verdict from aiFeedback
function getAIVerdict(app) {
  const feedback = app.aiFeedback;
  if (!feedback) return { passed: true, score: app.aiScore ?? 0 };
  return {
    passed: feedback.knockout_status !== "REJECTED",
    score: feedback.semantic_score ?? app.aiScore ?? 0,
  };
}

// Inline editable note cell
function NoteCell({ app, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(app.hrNotes || "");
  const inputRef = useRef(null);

  const handleBlur = () => {
    setEditing(false);
    if (value !== (app.hrNotes || "")) {
      onSave(app.id, value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") inputRef.current?.blur();
    if (e.key === "Escape") {
      setValue(app.hrNotes || "");
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full min-w-[160px] px-2 py-1 text-xs border border-[#0ea5e9] rounded-lg outline-none bg-sky-50 text-gray-800 focus:ring-2 focus:ring-[#0ea5e9]/20"
        placeholder="Ghi chú của HR..."
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-left w-full min-w-[120px] px-2 py-1 rounded-lg text-xs hover:bg-sky-50 transition-colors group"
      title="Click để ghi chú"
    >
      {value ? (
        <span className="text-gray-700">{value}</span>
      ) : (
        <span className="text-gray-300 italic group-hover:text-[#0ea5e9] transition-colors flex items-center gap-1">
          <NotepadText className="w-3 h-3" /> Ghi chú...
        </span>
      )}
    </button>
  );
}

export function ShortlistBoard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const currentHrId = user?.id;

  // Active job in table view
  const [activeJobId, setActiveJobId] = useState("all");
  // Checked jobs for multi-export (Set of job IDs)
  const [checkedJobIds, setCheckedJobIds] = useState(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [sortByScore, setSortByScore] = useState(true);

  // Fetch all HR jobs
  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["hr-jobs", currentHrId],
    queryFn: async () => {
      const res = await jobApi.getJobs({ hr_id: currentHrId, limit: 100 });
      return res.data;
    },
    enabled: !!currentHrId,
  });
  const jobsList = useMemo(() => jobsResponse?.items || [], [jobsResponse]);

  // Fetch all qualified applications (SHORTLISTED + HIRED + ACCEPTED)
  const { data: allAppsResponse, isLoading: isLoadingApps } = useQuery({
    queryKey: ["shortlist-all", currentHrId],
    queryFn: async () => {
      const res = await jobApi.getJobApplications();
      return res.data;
    },
    enabled: !!currentHrId,
  });

  const allApps = useMemo(() => {
    const raw = Array.isArray(allAppsResponse) ? allAppsResponse : [];
    return raw.filter((a) =>
      ["shortlisted", "hired", "accepted"].includes((a.status || "").toLowerCase())
    );
  }, [allAppsResponse]);

  // Jobs that have at least 1 qualified candidate
  const qualifiedJobs = useMemo(() => {
    const jobIdsWithQualified = new Set(allApps.map((a) => a.jobId));
    return jobsList.filter((j) => jobIdsWithQualified.has(j.id));
  }, [jobsList, allApps]);

  // Applications for active table view
  const tableApps = useMemo(() => {
    const filtered =
      activeJobId === "all"
        ? allApps
        : allApps.filter((a) => a.jobId === activeJobId);
    if (!sortByScore) return filtered;
    return [...filtered].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }, [allApps, activeJobId, sortByScore]);

  // Count qualified candidates per job
  const qualifiedCountPerJob = useMemo(() => {
    const map = {};
    allApps.forEach((a) => {
      map[a.jobId] = (map[a.jobId] || 0) + 1;
    });
    return map;
  }, [allApps]);

  // Checkbox logic
  const allJobIds = qualifiedJobs.map((j) => j.id);
  const allChecked = allJobIds.length > 0 && allJobIds.every((id) => checkedJobIds.has(id));
  const indeterminate = checkedJobIds.size > 0 && !allChecked;

  const toggleJob = (jobId) => {
    setCheckedJobIds((prev) => {
      const next = new Set(prev);
      next.has(jobId) ? next.delete(jobId) : next.add(jobId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allChecked) {
      setCheckedJobIds(new Set());
    } else {
      setCheckedJobIds(new Set(allJobIds));
    }
  };

  // Save note mutation
  const saveNoteMutation = useMutation({
    mutationFn: ({ applicationId, note }) =>
      jobApi.saveApplicationNote({ applicationId, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortlist-all", currentHrId] });
    },
    onError: () => toast.error("Lưu ghi chú thất bại. Vui lòng thử lại."),
  });

  const handleSaveNote = (applicationId, note) => {
    saveNoteMutation.mutate({ applicationId, note });
  };

  // Export handler
  const handleExport = async (jobIds = []) => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await jobApi.exportApplications({ jobIds });
      toast.success("Xuất file Excel thành công!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Xuất file thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  // Export label for sidebar button
  const exportSidebarLabel = () => {
    if (allChecked) return "Xuất Tất Cả";
    return `Xuất ${checkedJobIds.size} tin đã chọn`;
  };

  const activeJobInfo = qualifiedJobs.find((j) => j.id === activeJobId);

  const isLoading = isLoadingJobs || isLoadingApps;

  return (
    <div className="bg-gray-50/50 min-h-screen pt-4 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            Danh Sách Chọn Lọc
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">
              {allApps.length} ứng viên đạt
            </span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">
            Danh sách ứng viên đạt yêu cầu — Xuất Excel để liên hệ tuyển dụng thực tế
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#0ea5e9]" /> Vị trí tuyển dụng
            </h2>

            {/* Multi-export button (visible when ≥1 checked) */}
            {checkedJobIds.size > 0 && (
              <button
                onClick={() => handleExport([...checkedJobIds])}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
              >
                {isExporting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FileDown className="w-4 h-4" />
                }
                📥 {exportSidebarLabel()}
              </button>
            )}

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
              </div>
            ) : qualifiedJobs.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-medium">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                Chưa có ứng viên nào đạt yêu cầu.
                <br />
                <Link to="/hr/dashboard/applications" className="text-[#0ea5e9] font-bold hover:underline">
                  Vào duyệt hồ sơ
                </Link>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-[65vh] overflow-y-auto pr-1">
                {/* All jobs row */}
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                  <input
                    type="checkbox"
                    id="check-all"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = indeterminate; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded accent-[#0ea5e9] cursor-pointer"
                  />
                  <button
                    onClick={() => setActiveJobId("all")}
                    className={`flex-1 text-left flex items-center justify-between ${activeJobId === "all" ? "text-[#0ea5e9] font-bold" : "text-gray-600 font-semibold"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 opacity-60" />
                      <span className="text-sm">Tất cả vị trí</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeJobId === "all" ? "bg-[#0ea5e9] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {allApps.length}
                    </span>
                  </button>
                </div>

                <div className="h-px bg-gray-100 my-1" />

                {/* Individual job rows */}
                {qualifiedJobs.map((job) => {
                  const isActive = activeJobId === job.id;
                  const isChecked = checkedJobIds.has(job.id);
                  const count = qualifiedCountPerJob[job.id] || 0;

                  return (
                    <div key={job.id} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all">
                      <input
                        type="checkbox"
                        id={`check-job-${job.id}`}
                        checked={isChecked}
                        onChange={() => toggleJob(job.id)}
                        className="w-4 h-4 rounded accent-[#0ea5e9] cursor-pointer flex-shrink-0"
                      />
                      <button
                        onClick={() => setActiveJobId(job.id)}
                        className={`flex-1 text-left flex items-center justify-between gap-2 ${isActive ? "text-[#0ea5e9]" : "text-gray-600"}`}
                      >
                        <span className={`text-sm line-clamp-2 ${isActive ? "font-bold" : "font-semibold"}`}>
                          {job.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${isActive ? "bg-[#0ea5e9] text-white" : "bg-amber-100 text-amber-700"}`}>
                          {count}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main table */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  {activeJobId === "all"
                    ? `Tất cả ứng viên đạt yêu cầu (${tableApps.length})`
                    : `${activeJobInfo?.title || "Vị trí"} — ${tableApps.length} ứng viên đạt`}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Chỉ hiển thị ứng viên SHORTLISTED, HIRED và ACCEPTED
                </p>
              </div>

              {/* Export current view button */}
              <button
                onClick={() => handleExport(activeJobId === "all" ? [] : [activeJobId])}
                disabled={isExporting || tableApps.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 whitespace-nowrap"
              >
                {isExporting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />
                }
                📥 Xuất {activeJobId === "all" ? "Tất Cả" : "Job này"}
              </button>
            </div>

            {/* Table Content */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-[#0ea5e9] animate-spin mb-4" />
                  <p className="text-gray-500 text-sm font-medium">Đang tải danh sách...</p>
                </div>
              ) : tableApps.length === 0 ? (
                <div className="text-center py-24 flex flex-col items-center justify-center">
                  <Trophy className="w-16 h-16 text-gray-100 mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Chưa có ứng viên đạt yêu cầu</h3>
                  <p className="text-gray-400 text-sm max-w-sm font-medium">
                    {activeJobId === "all"
                      ? "Hãy duyệt hồ sơ và cập nhật trạng thái SHORTLISTED hoặc HIRED để ứng viên xuất hiện tại đây."
                      : "Vị trí này chưa có ứng viên nào được chọn lọc."}
                  </p>
                  <Link
                    to="/hr/dashboard/applications"
                    className="mt-4 px-5 py-2 bg-[#0ea5e9] text-white text-sm font-bold rounded-xl hover:bg-[#0284c7] transition-colors"
                  >
                    Đi tới Quản lý Hồ Sơ
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[860px]">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100">
                        <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ứng Viên</th>
                        <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <button
                            onClick={() => setSortByScore((v) => !v)}
                            className="flex items-center gap-1.5 hover:text-[#0ea5e9] transition-colors"
                          >
                            Điểm AI CV
                            <ArrowUpDown className={`w-3.5 h-3.5 ${sortByScore ? "text-[#0ea5e9]" : "text-gray-400"}`} />
                          </button>
                        </th>
                        <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm PV AI</th>
                        <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi Chú HR</th>
                        <th className="px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tableApps.map((app, index) => {
                        const verdict = getAIVerdict(app);
                        const statusKey = (app.status || "").toUpperCase();
                        const badge = STATUS_BADGES[statusKey];

                        return (
                          <tr key={app.id} className="hover:bg-amber-50/30 transition-all group">
                            {/* STT */}
                            <td className="px-4 py-4 text-xs font-bold text-gray-400">{index + 1}</td>

                            {/* Ứng viên */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-gray-900 text-sm group-hover:text-[#0ea5e9] transition-colors line-clamp-1">
                                  {app.candidateName || "—"}
                                </span>
                                <span className="text-xs text-gray-500 line-clamp-1">{app.candidateEmail || "—"}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {app.candidatePhone || "Chưa cập nhật"}
                                </span>
                                {activeJobId === "all" && (
                                  <span className="text-[10px] font-bold text-[#0ea5e9] mt-0.5 flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> {app.jobTitle}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Điểm AI CV */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-black ${verdict.score >= 70 ? "text-emerald-600" : verdict.score >= 50 ? "text-amber-600" : "text-red-500"}`}>
                                    {verdict.score}
                                  </span>
                                  <div className="flex-1 min-w-[48px] bg-gray-100 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full ${verdict.score >= 70 ? "bg-emerald-500" : verdict.score >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                                      style={{ width: `${verdict.score}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black w-fit bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" /> PASS
                                </span>
                              </div>
                            </td>

                            {/* Điểm PV AI */}
                            <td className="px-4 py-4">
                              {app.interviewScore != null ? (
                                <div className="flex flex-col gap-1">
                                  <span className={`text-sm font-black ${app.interviewScore >= 70 ? "text-emerald-600" : app.interviewScore >= 50 ? "text-amber-600" : "text-red-500"}`}>
                                    {app.interviewScore}
                                  </span>
                                  <div className="w-full bg-gray-100 rounded-full h-1.5 min-w-[48px]">
                                    <div
                                      className={`h-1.5 rounded-full ${app.interviewScore >= 70 ? "bg-emerald-500" : app.interviewScore >= 50 ? "bg-amber-500" : "bg-red-400"}`}
                                      style={{ width: `${app.interviewScore}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400 italic">—</span>
                              )}
                            </td>

                            {/* Ghi Chú HR — Inline editable */}
                            <td className="px-4 py-4 max-w-[200px]">
                              <NoteCell app={{ ...app, hrNotes: app.hrNotes }} onSave={handleSaveNote} />
                            </td>

                            {/* Trạng thái */}
                            <td className="px-4 py-4">
                              {badge ? (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block border ${badge.color}`}>
                                  {badge.label}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">{app.status}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShortlistBoard;
