import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  title: string;
  detail?: string;
}

interface ToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function ToastBanner({ toast, onDismiss }: ToastBannerProps) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 lg:bottom-6 right-4 left-4 lg:left-auto lg:w-96 z-50 rounded-2xl p-4 shadow-lg border transition-all duration-200 ${
        isError
          ? 'bg-red-50 border-red-200 text-red-950'
          : 'bg-[#0D4A31] border-[#15734E] text-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-[#4ADE80] shrink-0 mt-0.5" aria-hidden="true" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug">{toast.title}</p>
          {toast.detail && (
            <p
              className={`text-xs mt-0.5 leading-relaxed ${
                isError ? 'text-red-800' : 'text-emerald-100'
              }`}
            >
              {toast.detail}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className={`min-h-[36px] min-w-[36px] -mr-1 -mt-1 flex items-center justify-center rounded-xl transition-colors ${
            isError ? 'hover:bg-red-100 text-red-700' : 'hover:bg-white/10 text-emerald-100'
          }`}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
