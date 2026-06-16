import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useUiStore } from '../../store/useUiStore';

export function ToastItem({ id, message, type }) {
  const removeToast = useUiStore((state) => state.removeToast);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // We decrease progress linearly from 100 to 0 over 4000ms
    const intervalTime = 40; // update every 40ms
    const totalSteps = 4000 / intervalTime;
    const stepSize = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - stepSize;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const icons = {
    info: <Info className="w-5 h-5 text-sky-400" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
  };

  const borderColors = {
    info: 'border-sky-500/30',
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    error: 'border-rose-500/30',
  };

  const progressColors = {
    info: 'bg-sky-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden w-80 md:w-96 rounded-xl border ${borderColors[type]} bg-slate-900/80 text-slate-100 shadow-2xl backdrop-blur-md pointer-events-auto p-4 pr-10`}
    >
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
      </div>

      <button
        onClick={() => removeToast(id)}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/40">
        <div
          className={`h-full ${progressColors[type]} transition-all duration-[40ms] ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

export default function CustomToastContainer() {
  const toasts = useUiStore((state) => state.toasts);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
