import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Tag, Briefcase } from "lucide-react";

const popularPositions = [
  "React Developer",
  "Node.js Backend Developer",
  "Full Stack Developer",
  "QA Automation Engineer",
  "Business Analyst",
  "UI/UX Designer"
];

const positionSkillsMap = {
  "React Developer": ["React", "JavaScript", "HTML/CSS", "Redux", "Tailwind CSS"],
  "Node.js Backend Developer": ["Node.js", "Express", "PostgreSQL", "REST API", "JWT"],
  "Full Stack Developer": ["React", "Node.js", "PostgreSQL", "JavaScript", "Git"],
  "QA Automation Engineer": ["Selenium", "Cypress", "JavaScript", "Testing", "CI/CD"],
  "Business Analyst": ["Requirements", "Agile/Scrum", "SQL", "UML", "Jira"],
  "UI/UX Designer": ["Figma", "Wireframing", "Prototyping", "User Research", "UI Design"]
};

export function InterviewInfoInput({ onProceed, onBack, isSubmitting = false }) {
  const [position, setPosition] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [level, setLevel] = useState("JUNIOR");

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSelectPopularPosition = (pos) => {
    setPosition(pos);
    if (positionSkillsMap[pos]) {
      setSkills(positionSkillsMap[pos]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!position.trim()) return;
    onProceed({
      position: position.trim(),
      skills: skills.join(", "),
      level
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Dynamic ocean blue gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]" />

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 text-[#0ea5e9]">
          <Sparkles className="w-8 h-8 animate-pulse text-[#0ea5e9]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Cấu Hình Luyện Tập</h2>
        <p className="text-sm text-gray-500 mt-1">Cung cấp kỹ năng và vị trí để AI chuẩn bị câu hỏi cá nhân hóa dành riêng cho bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Job Position Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#0ea5e9]" />
            Vị trí muốn luyện tập <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Ví dụ: Frontend Developer, Business Analyst..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 focus:outline-none text-gray-700 transition-all"
          />

          {/* Quick Suggestions */}
          <div className="mt-3">
            <span className="text-xs font-medium text-gray-400 block mb-1.5">Gợi ý phổ biến:</span>
            <div className="flex flex-wrap gap-2">
              {popularPositions.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => handleSelectPopularPosition(pos)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                    position === pos
                      ? "bg-[#0ea5e9] text-white border-[#0ea5e9] shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#0ea5e9] hover:bg-sky-50/50"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Skills Tag Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#0ea5e9]" />
            Kỹ năng chuyên môn (Nhập và nhấn Enter)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Ví dụ: React, SQL, Git..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none text-gray-700 transition-all text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddSkill(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 bg-gray-100 hover:bg-[#f0f9ff] text-gray-700 hover:text-[#0ea5e9] rounded-xl font-medium transition-all text-sm border border-gray-200 hover:border-[#0ea5e9]"
            >
              Thêm
            </button>
          </div>

          {/* Displayed Skill Tags */}
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl max-h-32 overflow-y-auto">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-gray-400 hover:text-red-500 font-bold ml-1 text-sm focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Chưa thêm kỹ năng nào. AI sẽ hỏi các câu hỏi cơ bản.</p>
          )}
        </div>

        {/* 3. Level Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cấp bậc kinh nghiệm
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#0ea5e9] focus:outline-none text-gray-700 bg-white transition-all"
          >
            <option value="INTERN">Intern (Thực tập sinh)</option>
            <option value="JUNIOR">Junior (Dưới 2 năm kinh nghiệm)</option>
            <option value="MID">Middle (2 - 5 năm kinh nghiệm)</option>
            <option value="SENIOR">Senior (Trên 5 năm kinh nghiệm)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border-2 border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl font-semibold transition-all hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay Lại
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !position.trim()}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] hover:shadow-lg hover:shadow-sky-100 text-white font-bold rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:from-sky-300 disabled:to-sky-400 disabled:pointer-events-none"
          >
            <span>Tiếp Tục</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
