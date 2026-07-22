import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import { jobApi } from "../../api/jobApi";
import { CampaignAIReport } from "./components/CampaignAIReport";

export function CampaignAnalytics() {
  const { jobId } = useParams();

  // Lấy chi tiết Job để hiển thị Header
  const { data: jobData, isLoading } = useQuery({
    queryKey: ["job-detail", jobId],
    queryFn: async () => {
      const res = await jobApi.getJobById(jobId);
      return res.data;
    },
    enabled: !!jobId
  });

  const job = jobData;

  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="mb-8">
          <Link 
            to="/hr/dashboard/manage-jobs" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0ea5e9] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Quản lý Tin Tuyển Dụng
          </Link>

          {isLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-[#0ea5e9] animate-spin" />
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-sky-500">
                  Báo Cáo Chiến Dịch:
                </span> 
                {job?.title || "Không rõ chiến dịch"}
              </h1>
              <div className="flex items-center gap-4 mt-3 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                  <Briefcase className="w-4 h-4 text-[#0ea5e9]" />
                  {job?.experience_level || "Không yêu cầu kinh nghiệm"}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                  Số lượng tuyển: {job?.vacancy_count || 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Boss AI Report Area */}
        <div className="mt-6">
          <CampaignAIReport jobId={jobId} />
        </div>

      </div>
    </div>
  );
}

export default CampaignAnalytics;
