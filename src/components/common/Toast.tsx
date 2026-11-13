import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-[#167D78] shrink-0 mt-0.5" />
  };

  const bgStyles = {
    success: 'border-emerald-500/30 bg-white dark:bg-stone-900',
    error: 'border-rose-500/30 bg-white dark:bg-stone-900',
    info: 'border-[#167D78]/30 bg-white dark:bg-stone-900'
  };

  return (
    <div
      className={`pointer-events-auto p-4 rounded-xl border shadow-lg flex items-start gap-3 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-2 ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 text-xs">
        <h5 className="font-bold text-stone-900 dark:text-white leading-tight">
          {toast.title}
        </h5>
        {toast.description && (
          <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded-md cursor-pointer transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
