import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => string;
  clearToast: (id?: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
}

const DEFAULT_DURATION_MS = 5000;
const MAX_TOASTS = 4;
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearToast = useCallback((id?: string) => {
    if (!id) {
      timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutsRef.current.clear();
      setToasts([]);
      return;
    }

    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = DEFAULT_DURATION_MS) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const toast: ToastItem = { id, message, type, duration };

      setToasts((current) => [...current, toast].slice(-MAX_TOASTS));

      const timeoutId = setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
        timeoutsRef.current.delete(id);
      }, duration);

      timeoutsRef.current.set(id, timeoutId);
      return id;
    },
    []
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      showToast,
      clearToast,
      success: (message: string, duration?: number) => showToast(message, 'success', duration),
      error: (message: string, duration?: number) => showToast(message, 'error', duration),
      info: (message: string, duration?: number) => showToast(message, 'info', duration),
      warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    }),
    [toasts, showToast, clearToast]
  );

  return createElement(ToastContext.Provider, { value }, children);
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
