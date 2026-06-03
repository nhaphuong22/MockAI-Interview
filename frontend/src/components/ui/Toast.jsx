import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Toast Notification Component
 * Types: 'info' | 'success' | 'warning' | 'error'
 */
export function Toast({ 
  message, 
  type = 'info', 
  isVisible, 
  onClose, 
  duration = 4000,
  position = 'top-right' // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
  };

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  const positions = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed ${positions[position]} z-[9999] max-w-md pointer-events-auto`}
        >
          <div className={`flex items-start gap-3 p-4 pr-10 rounded-xl border-2 ${colors[type]} shadow-xl backdrop-blur-sm`}>
            <div className="mt-0.5 flex-shrink-0">
              {icons[type]}
            </div>
            <p className="text-sm font-semibold leading-relaxed flex-1">
              {message}
            </p>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
