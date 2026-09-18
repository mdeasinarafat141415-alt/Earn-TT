import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            className="w-full max-w-sm glass-card border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
          >
            {/* Background accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00F0FF] via-[#7928CA] to-[#FFB800]" />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-lg ${
                    isDestructive
                      ? 'bg-[#FF3366]/15 text-[#FF3366]'
                      : 'bg-[#00F0FF]/15 text-[#00F0FF]'
                  }`}
                >
                  <AlertTriangle size={18} />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-5">
              {description}
            </p>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center ${
                  isDestructive
                    ? 'bg-gradient-to-r from-[#FF3366] to-[#E60045] text-white hover:opacity-90 shadow-[0_4px_15px_rgba(255,51,102,0.3)]'
                    : 'bg-gradient-to-r from-[#00F0FF] to-[#00A3FF] text-[#07090E] hover:opacity-90 shadow-[0_4px_15px_rgba(0,240,255,0.3)]'
                }`}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
