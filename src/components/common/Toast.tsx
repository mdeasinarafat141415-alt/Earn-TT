import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toast, clearToast } = useApp();

  const iconMap = {
    success: <CheckCircle2 size={16} className="text-[#00F0FF] shrink-0" />,
    error: <XCircle size={16} className="text-[#FF3366] shrink-0" />,
    warning: <AlertCircle size={16} className="text-[#FFB800] shrink-0" />,
    info: <Info size={16} className="text-[#3B82F6] shrink-0" />,
  };

  const borderMap = {
    success: 'border-[#00F0FF]/30 bg-[#0E1724]/95 text-white',
    error: 'border-[#FF3366]/30 bg-[#1A0E17]/95 text-white',
    warning: 'border-[#FFB800]/30 bg-[#1A170E]/95 text-white',
    info: 'border-[#3B82F6]/30 bg-[#0E1524]/95 text-white',
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm w-full ${
              borderMap[toast.type]
            }`}
          >
            {iconMap[toast.type]}
            <p className="text-xs font-medium flex-1 tracking-tight leading-snug">
              {toast.message}
            </p>
            <button
              onClick={clearToast}
              className="text-neutral-400 hover:text-white p-0.5 rounded-md transition-colors"
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
