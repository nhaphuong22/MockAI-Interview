import React from "react";

export function ExperienceSection({ experiences }) {
  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => (
        <div key={index} className="flex gap-4 pb-6 border-b dark:border-white/10 border-gray-200 last:border-0">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            {exp.logo}
          </div>
          <div className="flex-1">
            <h3 className="text-lg dark:text-white font-semibold mb-1">{exp.title}</h3>
            <p className="text-[#0ea5e9] mb-2">{exp.company}</p>
            <p className="text-sm dark:text-slate-400 text-gray-600 mb-2">{exp.duration}</p>
            <p className="dark:text-slate-300 text-gray-700">{exp.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
