import React from 'react';
import { useMarket } from '../context/MarketContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMarket();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-lg border shadow-xl flex items-start gap-2.5 text-xs transition-all animate-in slide-in-from-bottom-2 duration-150 ${
              toast.type === 'success'
                ? 'bg-[#1E222D] border-[#089981] text-[#F0F3FA]'
                : toast.type === 'alert'
                ? 'bg-[#1E222D] border-[#F23645] text-[#F0F3FA]'
                : 'bg-[#1E222D] border-[#2962FF] text-[#F0F3FA]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#089981] shrink-0 mt-0.5" />}
            {toast.type === 'alert' && <AlertTriangle className="w-4 h-4 text-[#F23645] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#2962FF] shrink-0 mt-0.5" />}

            <div className="flex-1 font-medium leading-snug">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#787B86] hover:text-[#F0F3FA] shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
