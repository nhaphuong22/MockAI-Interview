import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../../store/useThemeStore';

export function GlobalBackground() {
  const { theme } = useThemeStore();
  
  if (theme !== 'dark') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#030712]">
      {/* Animated Moving Orbs */}
      <motion.div 
        animate={{ x: [0, 100, -50, 0], y: [0, -100, 50, 0], scale: [1, 1.2, 0.8, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#0ea5e9] rounded-full mix-blend-screen filter blur-[150px] opacity-10" 
      />
      <motion.div 
        animate={{ x: [0, -150, 100, 0], y: [0, 100, -150, 0], scale: [1, 0.9, 1.3, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[-10%] w-[50vw] h-[70vw] bg-[#38bdf8] rounded-full mix-blend-screen filter blur-[150px] opacity-10" 
      />
      <motion.div 
        animate={{ x: [0, 80, -80, 0], y: [0, -80, 80, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[60vw] bg-[#7dd3fc] rounded-full mix-blend-screen filter blur-[150px] opacity-10" 
      />

      {/* Tech Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }} 
      />

      {/* Scrolling Scanlines */}
      <motion.div 
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#0ea5e9]/5 to-transparent opacity-30"
      />
    </div>
  );
}
