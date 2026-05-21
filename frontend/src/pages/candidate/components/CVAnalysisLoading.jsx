import React from "react";
import { Sparkles } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

export function CVAnalysisLoading() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center animate-pulse">
      <div className="w-20 h-20 mx-auto mb-6 bg-[#f0f9ff] rounded-full flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-[#0ea5e9]" />
      </div>
      <h2 className="text-2xl mb-3">AI đang phân tích CV...</h2>
      <p className="text-gray-600 mb-6">Vui lòng đợi trong giây lát</p>
      <Progress.Root className="h-2 bg-gray-200 rounded-full overflow-hidden max-w-md mx-auto">
        <Progress.Indicator
          className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] transition-all duration-500"
          style={{ width: "60%" }}
        />
      </Progress.Root>
    </div>
  );
}
