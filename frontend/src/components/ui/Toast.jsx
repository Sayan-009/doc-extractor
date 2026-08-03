import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../hooks/useToast';

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="pointer-events-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 flex items-start gap-3"
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{toast.title}</p>
              {toast.message && (
                <p className="text-sm text-gray-500 mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
