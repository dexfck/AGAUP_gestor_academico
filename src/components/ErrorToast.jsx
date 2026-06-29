import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

export const showError = (message) => {
  window.dispatchEvent(new CustomEvent('show_error_toast', { detail: message }));
};

export default function ErrorToast() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const handleShowError = (e) => {
      const newErr = { id: Date.now(), msg: e.detail };
      setErrors((prev) => [...prev, newErr]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setErrors((prev) => prev.filter(err => err.id !== newErr.id));
      }, 5000);
    };

    window.addEventListener('show_error_toast', handleShowError);
    return () => window.removeEventListener('show_error_toast', handleShowError);
  }, []);

  const dismiss = (id) => {
    setErrors((prev) => prev.filter(err => err.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {errors.map(err => (
          <motion.div
            key={err.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="bg-red-600 text-white p-4 rounded-lg shadow-2xl flex items-start gap-3 w-80 pointer-events-auto"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium leading-tight">
              {err.msg}
            </div>
            <button 
              onClick={() => dismiss(err.id)}
              className="text-red-200 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
