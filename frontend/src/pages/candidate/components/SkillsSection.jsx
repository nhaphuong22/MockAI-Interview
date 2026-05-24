import React from "react";
import * as Progress from "@radix-ui/react-progress";

export function SkillsSection({ skills }) {
  return (
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
  );
}
