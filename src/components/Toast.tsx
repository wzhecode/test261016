import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-neutral-900 text-white text-xs font-medium rounded-xl shadow-lg animate-in slide-in-from-bottom-2 duration-150"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
