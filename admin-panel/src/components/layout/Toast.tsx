import { useToast } from '../../hooks/useToast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Toast() {
  const { toast, clearToast } = useToast();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[toast.type]} border rounded-lg shadow-lg p-4 flex items-start space-x-3 max-w-md`}>
        {icons[toast.type]}
        <p className="flex-1 text-sm text-gray-800">{toast.message}</p>
        <button onClick={clearToast} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
