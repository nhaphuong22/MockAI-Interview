import React from "react";

export function ExperienceSection({ experiences }) {
  return (
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
  );
}
