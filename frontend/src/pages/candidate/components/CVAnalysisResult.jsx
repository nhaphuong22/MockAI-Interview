import React, { useEffect, useState, useRef } from "react";
import { CheckCircle2, AlertTriangle, Download, Eye, FileText, Sparkles, ChevronDown, Zap, Target, Cpu } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import confetti from "canvas-confetti";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sphere, Sparkles as DreiSparkles } from '@react-three/drei';

const AnimatedNumber = ({ value }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2500;
    const endValue = parseInt(value, 10);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.floor(easeProgress * endValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  return <>{current}</>;
};

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
      className={`relative overflow-hidden rounded-[3rem] border dark:border-white/5 border-gray-100 dark:bg-[#0a0f1c]/80 bg-white/60 backdrop-blur-3xl shadow-2xl ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0 hidden dark:block"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(14,165,233,0.15), transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-0 dark:hidden"
        style={{
          opacity,
          background: `radial-gradient(800px circle at ${position.x}px ${position.y}px, rgba(14,165,233,0.08), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
};

// Advanced 3D Core
function AICore() {
  const meshRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={3} rotationIntensity={2} floatIntensity={3}>
        <Sphere args={[2, 64, 64]}>
          <MeshDistortMaterial color="#0ea5e9" attach="material" distort={0.6} speed={4} roughness={0.1} metalness={0.9} transparent opacity={0.15} />
        </Sphere>
        <Sphere args={[1.4, 64, 64]}>
          <MeshDistortMaterial color="#38bdf8" attach="material" distort={0.3} speed={5} roughness={0.4} metalness={1} transparent opacity={0.4} wireframe />
        </Sphere>
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial color="#0284c7" emissive="#0ea5e9" emissiveIntensity={2} roughness={0.2} metalness={1} />
        </Sphere>
      </Float>
      <DreiSparkles count={100} scale={5} size={2} speed={0.4} opacity={0.5} color="#38bdf8" />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#0ea5e9" distance={10} />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
    </group>
  );
}

const SkillAccordion = ({ section, isOpen, onClick }) => {
  return (
    <motion.div 
      layout
      className={`relative overflow-hidden transition-all duration-500 rounded-3xl ${isOpen ? 'dark:bg-[#0f172a] bg-white shadow-[0_20px_50px_rgba(14,165,233,0.1)] border-2 border-[#0ea5e9]/50 scale-[1.02]' : 'dark:bg-[#0f172a]/60 bg-white/60 dark:hover:bg-[#0f172a] hover:bg-white border dark:border-white/5 border-gray-100 shadow-lg hover:shadow-xl hover:shadow-[#0ea5e9]/10'}`}
    >
      <motion.button 
        layout
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 relative z-10"
      >
        <div className="flex items-center gap-6">
            <svg viewBox="0 0 100 100" className="w-14 h-14 -rotate-90">
              <circle cx="50" cy="50" r="40" className="fill-transparent stroke-gray-200 dark:stroke-slate-800" strokeWidth="8" />
              <motion.circle 
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * section.score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="50" cy="50" r="40" 
                className={`fill-transparent ${section.score >= 80 ? "stroke-emerald-400" : section.score >= 60 ? "stroke-[#0ea5e9]" : "stroke-amber-400"}`} 
                strokeWidth="8" strokeLinecap="round" strokeDasharray="251.2" 
              />
            </svg>
            <span className={`relative z-10 text-sm font-black tracking-tighter ${section.score >= 80 ? "text-emerald-500 dark:text-emerald-400" : section.score >= 60 ? "text-[#0ea5e9]" : "text-amber-500 dark:text-amber-400"}`}>
              <AnimatedNumber value={section.score} />%
            </span>
          </div>
          <span className="font-extrabold dark:text-slate-200 text-slate-800 text-left text-xl tracking-tight">{section.name}</span>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0, scale: isOpen ? 1.2 : 1 }} 
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${isOpen ? 'bg-[#0ea5e9] text-white shadow-[0_0_15px_#0ea5e9]' : 'dark:bg-white/5 bg-gray-100 dark:text-slate-400 text-slate-500'}`}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-8 pb-8 pt-2 relative z-10">
              <div className="absolute left-10 top-0 bottom-8 w-px bg-gradient-to-b from-sky-500/50 to-transparent" />
              <p className="dark:text-slate-400 text-slate-600 leading-relaxed text-lg pl-8 relative">
                <span className="absolute left-[-21px] top-2 w-3 h-3 rounded-full bg-[#0ea5e9] shadow-[0_0_10px_#0ea5e9]" />
                {section.feedback}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function CVAnalysisResult({ aiResults, onReupload }) {
  const [openSectionIndex, setOpenSectionIndex] = useState(0);

  useEffect(() => {
    if (aiResults?.overallScore >= 70) {
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({ particleCount: 8, angle: 60, spread: 80, origin: { x: 0 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'], zIndex: 100 });
        confetti({ particleCount: 8, angle: 120, spread: 80, origin: { x: 1 }, colors: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#ffffff'], zIndex: 100 });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [aiResults?.overallScore]);

  const radarData = aiResults.sections.map(s => ({
    subject: s.name,
    score: s.score,
    fullMark: 100,
  }));

  return (
    <div className="relative w-full max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-6">
        
        {/* 1. OVERALL SCORE CARD (Large, Left) with Magic Border */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="lg:col-span-8 lg:row-span-2 relative overflow-hidden rounded-[3rem] p-[2px] group"
        >
          {/* Magic Spinning Border */}
          <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0ea5e9_0%,#030712_50%,#0ea5e9_100%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="absolute inset-[2px] dark:bg-[#0a0f1c] bg-white rounded-[3rem] z-0 overflow-hidden flex flex-col items-center justify-center p-12 text-center">
              
              {/* Internal Grid */}
              <div className="absolute inset-0 z-0 opacity-20 dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mix-blend-screen" />
              
              {/* 3D Core Animation */}
              <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                  <AICore />
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
              </div>
              
              <motion.div 
                animate={{ scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="absolute -inset-10 bg-sky-500/30 blur-[80px] rounded-full z-0 pointer-events-none" />
                <div className="text-[10rem] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-sky-100 to-sky-300 dark:from-white dark:via-sky-200 dark:to-[#0ea5e9] drop-shadow-[0_0_40px_rgba(14,165,233,0.5)]">
                  <AnimatedNumber value={aiResults?.overallScore || 0} />
                </div>
              </motion.div>
              
              <h3 className="relative z-10 text-3xl font-extrabold dark:text-slate-200 text-slate-800 mt-6 tracking-tight">ĐIỂM TỔNG QUAN</h3>
              <p className="relative z-10 mt-4 text-xl dark:text-slate-400 text-slate-600 max-w-lg font-medium leading-relaxed">
                Mức độ phù hợp của CV với vị trí ứng tuyển. Mọi chỉ số đều được phân tích trực tiếp bằng Trí Tuệ Nhân Tạo.
              </p>
          </div>
        </motion.div>


        {/* 2. RADAR CHART (Medium, Right) */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", delay: 0.2 }}
          className="lg:col-span-4 lg:row-span-2"
        >
          <SpotlightCard className="h-full p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-2 px-4 pt-2 relative z-10">
              <Target className="w-6 h-6 text-[#0ea5e9]" />
              <h3 className="text-xl font-black dark:text-white text-gray-900 tracking-tight">Phổ Kỹ Năng</h3>
            </div>
            <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                  <PolarGrid stroke="rgba(14,165,233,0.2)" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#0ea5e9', fontSize: 12, fontWeight: 800 }} className="dark:fill-[#bae6fd]" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(14,165,233,0.1)' }}
                    contentStyle={{ borderRadius: '24px', border: '1px solid rgba(14,165,233,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', padding: '16px 24px' }}
                    itemStyle={{ color: '#38bdf8', fontWeight: '900', fontSize: '20px' }}
                    formatter={(value) => [`${value}%`, 'Mức độ']}
                  />
                  <Radar name="Kỹ năng" dataKey="score" stroke="#38bdf8" strokeWidth={4} fill="url(#colorSkyCore)" fillOpacity={0.6} />
                  <defs>
                    <radialGradient id="colorSkyCore" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    </radialGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_30px_15px_rgba(14,165,233,0.8)] pointer-events-none" />
            </div>
          </SpotlightCard>
        </motion.div>

        {/* 3. STRENGTHS (Bottom Left) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-6"
        >
          <SpotlightCard className="h-full p-8 border-emerald-500/20">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10" />
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 dark:text-white text-gray-900 relative z-10">
              <span className="p-2 bg-emerald-500/20 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"><CheckCircle2 className="w-6 h-6" /></span>
              Vũ Khí Bí Mật
            </h3>
            <div className="flex flex-wrap gap-3 relative z-10">
              {aiResults.strengths.map((strength, index) => (
                <motion.span 
                  whileHover={{ scale: 1.05, y: -2 }}
                  key={index} 
                  className="px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 backdrop-blur-md border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl font-bold flex items-center gap-2 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-shadow"
                >
                  <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  {strength}
                </motion.span>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* 4. WEAKNESSES (Bottom Right) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-6"
        >
          <SpotlightCard className="h-full p-8 border-amber-500/20">
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-amber-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10" />
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 dark:text-white text-gray-900 relative z-10">
              <span className="p-2 bg-amber-500/20 border border-amber-500/50 text-amber-600 dark:text-amber-400 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)]"><AlertTriangle className="w-6 h-6" /></span>
              Điểm Mù Cần Khắc Phục
            </h3>
            <div className="flex flex-wrap gap-3 relative z-10">
              {aiResults.improvements.map((improvement, index) => (
                <motion.span 
                  whileHover={{ scale: 1.05, y: -2 }}
                  key={index} 
                  className="px-5 py-3 bg-amber-50 dark:bg-amber-500/10 backdrop-blur-md border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 rounded-2xl font-bold flex items-center gap-2 cursor-default shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-shadow"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse shadow-[0_0_10px_#fbbf24]" />
                  {improvement}
                </motion.span>
              ))}
            </div>
          </SpotlightCard>
        </motion.div>

        {/* 5. DEEP DIVE ACCORDION (Full Width Bottom) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-12"
        >
          <SpotlightCard className="p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 relative z-10">
              <div>
                <h3 className="text-3xl font-black dark:text-white text-gray-900 tracking-tight flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-[#0ea5e9] drop-shadow-[0_0_10px_#0ea5e9]" /> Bóc Tách Chuyên Sâu
                </h3>
                <p className="dark:text-slate-400 text-slate-500 mt-2 font-medium text-lg">Phân tích từng khía cạnh kỹ năng dựa trên hàng triệu dữ liệu JD thực tế.</p>
              </div>
              
              <div className="flex gap-3">
                <button className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-bold">
                  <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 hidden group-hover:block" />
                  <Download className="w-5 h-5 relative z-10" /> <span className="relative z-10">Tải PDF</span>
                </button>
                <button className="px-6 py-4 dark:bg-[#0a0f1c] bg-white border-2 border-[#0ea5e9] text-[#0ea5e9] rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.2)] hover:bg-[#0ea5e9]/10 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 font-bold">
                  <Eye className="w-5 h-5" /> Mẫu CV
                </button>
                <button onClick={onReupload} className="p-4 dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 dark:text-slate-300 text-gray-600 rounded-2xl dark:hover:bg-white/10 hover:bg-gray-100 dark:hover:text-white hover:text-gray-900 hover:-translate-y-1 transition-all duration-300">
                  <FileText className="w-6 h-6" />
                </button>
              </div>
            </div>

            <LayoutGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 items-start">
                {aiResults.sections.map((section, index) => (
                  <SkillAccordion 
                    key={index}
                    section={section}
                    isOpen={openSectionIndex === index}
                    onClick={() => setOpenSectionIndex(openSectionIndex === index ? -1 : index)}
                  />
                ))}
              </div>
            </LayoutGroup>
          </SpotlightCard>
        </motion.div>

      </div>
    </div>
  );
}
