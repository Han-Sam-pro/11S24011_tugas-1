import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message?: string;
  onUndo?: () => void;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="pointer-events-auto bg-white rounded-xl border border-slate-200 p-4 shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200">
      <div className="mt-0.5 shrink-0">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {toast.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-600" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
      </div>

      <div className="flex-1 text-xs">
        <h5 className="font-bold text-slate-900 leading-snug">{toast.title}</h5>
        {toast.message && <p className="text-slate-600 mt-0.5">{toast.message}</p>}
        {toast.onUndo && (
          <button
            onClick={() => {
              toast.onUndo?.();
              onDismiss(toast.id);
            }}
            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            Batalkan (Undo)
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
