import { useToast } from '../../hooks/useToast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export function Toast() {
  const { toasts, clearToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
  };

  const colors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-rose-50 border-rose-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  };

  const accent = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  };

  const labels = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
    warning: 'Warning',
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-full max-w-sm space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`relative toast-enter ${colors[toast.type]} border rounded-xl shadow-lg p-4 flex items-start gap-3 pointer-events-auto`}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">{labels[toast.type]}</p>
            <p className="text-sm text-gray-800 leading-5 break-words">{toast.message}</p>
          </div>
          <button
            onClick={() => clearToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute left-0 right-0 bottom-0 h-1 bg-black/5 overflow-hidden rounded-b-xl">
            <div
              className={`${accent[toast.type]} h-full toast-progress`}
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
