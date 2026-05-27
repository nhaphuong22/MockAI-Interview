import { useEffect, useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, Download, Eye, FileText, ChevronDown, Zap, Target, Cpu } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import confetti from "canvas-confetti";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-[#0ea5e9]/30 bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-3xl shadow-md dark:shadow-[0_0_15px_rgba(14,165,233,0.1)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(14,165,233,0.2)] transition-shadow duration-500 ${className}`}
    >
      {/* HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#0ea5e9]/70 rounded-tl-[2rem] opacity-80 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#0ea5e9]/70 rounded-tr-[2rem] opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#0ea5e9]/70 rounded-bl-[2rem] opacity-80 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#0ea5e9]/70 rounded-br-[2rem] opacity-80 pointer-events-none" />

      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0 mix-blend-screen"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(14,165,233,0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

function AICore() {
  const outer = useRef();
  const mid1 = useRef();
  const mid2 = useRef();
  const inner = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outer.current) outer.current.rotation.z = t * 0.15;
    if (mid1.current) { mid1.current.rotation.x = t * 0.2; mid1.current.rotation.y = t * 0.1; }
    if (mid2.current) { mid2.current.rotation.x = -t * 0.15; mid2.current.rotation.y = t * 0.25; }
    if (inner.current) { inner.current.rotation.y = -t * 0.3; inner.current.rotation.z = t * 0.15; }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        {/* Outer Orbit */}
        <mesh ref={outer}>
          <torusGeometry args={[2.6, 0.006, 16, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
          <mesh position={[2.6, 0, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </mesh>
        
        {/* Mid Orbit 1 */}
        <mesh ref={mid1}>
          <torusGeometry args={[2.0, 0.01, 16, 100]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.4} />
          <mesh position={[2.0, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#0ea5e9" />
          </mesh>
          <mesh position={[-2.0, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#0ea5e9" />
          </mesh>
        </mesh>
        
        {/* Mid Orbit 2 */}
        <mesh ref={mid2}>
          <torusGeometry args={[1.4, 0.015, 16, 100]} />
          <meshBasicMaterial color="#0284c7" transparent opacity={0.6} />
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </mesh>
        
        {/* Inner Core Ring */}
        <mesh ref={inner}>
          <torusGeometry args={[0.8, 0.02, 16, 100]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.8} />
          <mesh position={[0.8, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </mesh>
        
        {/* Center Nucleus */}
        <mesh>
          <sphereGeometry args={[0.25, 32, 32]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.9} />
        </mesh>
      </Float>
    </group>
  );
}

const SkillAccordion = ({ section, isOpen, onClick }) => {
  return (
    <motion.div 
      layout
      className={`relative overflow-hidden transition-all duration-300 rounded-3xl ${isOpen ? 'bg-slate-50 dark:bg-[#020617]/90 shadow-lg dark:shadow-[0_0_30px_rgba(14,165,233,0.2)] border border-sky-400 dark:border-[#38bdf8] scale-[1.01]' : 'bg-white/60 dark:bg-[#0a0f1c]/60 hover:bg-slate-50 dark:hover:bg-[#020617] border border-slate-200 dark:border-[#0ea5e9]/30 shadow-sm hover:shadow-md dark:shadow-[0_0_10px_rgba(14,165,233,0.05)] dark:hover:shadow-[0_0_20px_rgba(14,165,233,0.15)]'}`}
    >
      <motion.button 
        layout
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 relative z-10 gap-4"
      >
        <div className="flex items-center gap-5 flex-1">
          <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(14,165,233,0.5)]">
              <circle cx="50" cy="50" r="40" className="fill-transparent stroke-[#0ea5e9]/20" strokeWidth="8" />
              <motion.circle 
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * section.score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                cx="50" cy="50" r="40" 
                className={`fill-transparent ${section.score >= 80 ? "stroke-emerald-500 dark:stroke-emerald-400" : section.score >= 60 ? "stroke-sky-500 dark:stroke-[#38bdf8]" : "stroke-amber-500 dark:stroke-amber-400"}`} 
                strokeWidth="8" strokeLinecap="round" strokeDasharray="251.2" 
              />
            </svg>
            <span className={`relative z-10 text-base font-bold font-mono ${section.score >= 80 ? "text-emerald-600 dark:text-emerald-400" : section.score >= 60 ? "text-sky-600 dark:text-[#38bdf8]" : "text-amber-600 dark:text-amber-400"}`}>
              {section.score}%
            </span>
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-left text-lg tracking-wide uppercase flex-1 pr-2 leading-tight">{section.name}</span>
        </div>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }} 
          className={`w-10 h-10 flex items-center justify-center rounded-full border border-[#0ea5e9]/30 ${isOpen ? 'bg-[#0ea5e9] text-white' : 'bg-[#0ea5e9]/10 text-[#38bdf8]'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-8 pb-8 pt-2 relative z-10">
              <div className="absolute left-10 top-0 bottom-8 w-px bg-[#0ea5e9]/50" />
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base pl-8">
                {section.feedback}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CustomRadarTick = ({ payload, x, y, textAnchor }) => {
  const lines = payload.value.split('\n');
  return (
    <text
      x={x}
      y={y - (lines.length > 1 ? 8 : 0)}
      textAnchor={textAnchor}
      className="fill-slate-700 dark:fill-[#7dd3fc]"
      fontSize={12}
      fontWeight={600}
    >
      {lines.map((line, index) => (
        <tspan x={x} dy={index === 0 ? 0 : 16} key={index}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

export function CVAnalysisResult({ aiResults, onReupload: _onReupload }) {
  const [openSectionIndex, setOpenSectionIndex] = useState(0);

  useEffect(() => {
    if (aiResults?.overallScore >= 70) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({ particleCount: 10, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'], zIndex: 100 });
        confetti({ particleCount: 10, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'], zIndex: 100 });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [aiResults?.overallScore]);

  const radarData = aiResults.sections.map(s => {
    let subjectName = s.name;
    if (subjectName.toLowerCase().includes('tình trạng') || subjectName.toLowerCase().includes('ats')) {
      subjectName = 'Định dạng\nATS';
    }
    if (subjectName.toLowerCase().includes('kinh nghiệm')) {
      subjectName = 'Kinh\nnghiệm';
    }
    if (subjectName.toLowerCase().includes('thông tin')) {
      subjectName = 'Thông tin\ncá nhân';
    }
    return {
      subject: subjectName,
      score: s.score,
      fullMark: 100,
    };
  });

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-8 pb-20 mt-6">
      
      {/* CYBERPUNK BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-6">
        
        {/* 1. OVERALL SCORE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="lg:col-span-8 lg:row-span-2 relative overflow-hidden rounded-[2rem] p-[2px] group shadow-lg dark:shadow-[0_0_40px_rgba(14,165,233,0.15)]"
        >
          <div className="absolute inset-[2px] bg-slate-50 dark:bg-[#020617] rounded-[2rem] z-0 overflow-hidden flex flex-col items-center justify-center p-12 text-center">
              
              {/* Internal Grid */}
              <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />
              
              {/* Holographic 3D Core */}
              <div className="absolute inset-0 h-full w-full opacity-40 dark:opacity-100 z-0 transition-opacity duration-500 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                  <AICore />
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
                </Canvas>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+1rem)] w-64 h-64 z-0 pointer-events-none opacity-60">
                 <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_10s_linear_infinite]">
                    <circle cx="50" cy="50" r="48" className="fill-transparent stroke-sky-500 dark:stroke-[#38bdf8]" strokeWidth="0.5" strokeDasharray="2 4" />
                 </svg>
              </div>
              
              <div className="relative z-10 mt-4">
                <div className="absolute -inset-10 bg-[#0ea5e9]/20 dark:bg-[#0ea5e9]/30 blur-[80px] rounded-full z-0 pointer-events-none" />
                <div className="relative z-10 text-[8rem] font-black tracking-tighter leading-none text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_20px_rgba(56,189,248,0.8)] font-mono">
                  {aiResults?.overallScore || 0}
                </div>
              </div>
              
              <h3 className="relative z-10 text-2xl font-bold text-slate-800 dark:text-white mt-4 tracking-widest uppercase flex items-center gap-2 drop-shadow-none dark:drop-shadow-[0_0_10px_#0ea5e9]">
                <Cpu className="w-6 h-6 text-sky-600 dark:text-[#38bdf8]" /> ĐIỂM TỔNG QUAN AI
              </h3>
              <p className="relative z-10 mt-3 text-base text-slate-600 dark:text-[#38bdf8] max-w-lg leading-relaxed">
                Hồ sơ của bạn đã được hệ thống phân tích không gian đa chiều. Dưới đây là kết quả bóc tách từng năng lực.
              </p>
          </div>
        </motion.div>


        {/* 2. RADAR CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", delay: 0.2 }}
          className="lg:col-span-4 lg:row-span-2"
        >
          <SpotlightCard className="h-full p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-2 px-4 pt-2 relative z-10 border-b border-[#0ea5e9]/20 pb-4">
              <Target className="w-6 h-6 text-sky-600 dark:text-[#38bdf8]" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-widest uppercase font-mono">MẠNG LƯỚI KỸ NĂNG</h3>
            </div>
            <div className="flex-1 w-full relative z-10 mt-2 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData} margin={{ top: 20, right: 55, bottom: 20, left: 55 }}>
                  <PolarGrid stroke="#0ea5e9" strokeOpacity={0.4} strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={<CustomRadarTick />} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(14,165,233,0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #38bdf8', boxShadow: '0 0 20px rgba(14,165,233,0.4)', backgroundColor: 'rgba(2,6,23,0.9)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value) => [`${value}%`]}
                  />
                  <Radar name="Kỹ năng" dataKey="score" stroke="#38bdf8" strokeWidth={3} fill="url(#colorSkyCore)" fillOpacity={0.6} />
                  <defs>
                    <radialGradient id="colorSkyCore" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                    </radialGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* 3. STRENGTHS */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-6"
        >
          <SpotlightCard className="h-full p-8 !border-emerald-400/30">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white relative z-10 tracking-widest uppercase">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              VŨ KHÍ BÍ MẬT
            </h3>
            <div className="flex flex-wrap gap-3 relative z-10">
              {aiResults.strengths.map((strength, index) => (
                <div 
                  key={index} 
                  className="relative overflow-hidden px-4 py-2 bg-emerald-50 dark:bg-[#020617] border border-emerald-400/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium flex items-center gap-2 rounded-lg group"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {strength}
                </div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* 4. WEAKNESSES */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-6"
        >
          <SpotlightCard className="h-full p-8 !border-amber-400/30">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white relative z-10 tracking-widest uppercase">
              <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              ĐIỂM MÙ CẦN KHẮC PHỤC
            </h3>
            <div className="flex flex-wrap gap-3 relative z-10">
              {aiResults.improvements.map((improvement, index) => (
                <div 
                  key={index} 
                  className="relative overflow-hidden px-4 py-2 bg-amber-50 dark:bg-[#020617] border border-amber-400/50 text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center gap-2 rounded-lg group"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {improvement}
                </div>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* 5. DEEP DIVE ACCORDION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="lg:col-span-12"
        >
          <SpotlightCard className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-widest uppercase flex items-center gap-3">
                  <FileText className="w-7 h-7 text-[#0ea5e9]" /> BÓC TÁCH CHI TIẾT
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  Phân tích sâu vào từng khối kỹ năng dựa trên yêu cầu thị trường.
                </p>
              </div>
              
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-[#0ea5e9] text-white rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-bold uppercase tracking-wide">
                  <Download className="w-5 h-5" /> XUẤT BÁO CÁO
                </button>
                <button className="px-6 py-3 bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-[#0ea5e9]/50 text-sky-600 dark:text-[#38bdf8] rounded-xl hover:bg-slate-50 dark:hover:bg-[#0ea5e9]/10 transition-all duration-300 flex items-center gap-2 font-bold uppercase tracking-wide">
                  <Eye className="w-5 h-5" /> MẪU CV CHUẨN
                </button>
              </div>
            </div>

            <LayoutGroup>
              <div className="flex flex-col md:flex-row gap-6 relative z-10 items-start">
                {/* Column 1 (Odds) */}
                <div className="flex-1 flex flex-col gap-6 w-full">
                  {aiResults.sections.map((section, index) => {
                    if (index % 2 !== 0) return null;
                    return (
                      <SkillAccordion 
                        key={index}
                        section={section}
                        isOpen={openSectionIndex === index}
                        onClick={() => setOpenSectionIndex(openSectionIndex === index ? -1 : index)}
                      />
                    );
                  })}
                </div>
                {/* Column 2 (Evens) */}
                <div className="flex-1 flex flex-col gap-6 w-full">
                  {aiResults.sections.map((section, index) => {
                    if (index % 2 === 0) return null;
                    return (
                      <SkillAccordion 
                        key={index}
                        section={section}
                        isOpen={openSectionIndex === index}
                        onClick={() => setOpenSectionIndex(openSectionIndex === index ? -1 : index)}
                      />
                    );
                  })}
                </div>
              </div>
            </LayoutGroup>
          </SpotlightCard>
        </motion.div>

      </div>
    </div>
  );
}
