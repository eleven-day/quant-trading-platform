'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'error' | 'success' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: ToastItem }
  | { type: 'REMOVE_TOAST'; payload: { id: string } };

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST': {
      const next = [...state.toasts, action.payload];
      return {
        toasts: next.slice(-MAX_TOASTS),
      };
    }
    case 'REMOVE_TOAST': {
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.payload.id),
      };
    }
    default:
      return state;
  }
}

interface ShowToastInput {
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (input: ShowToastInput) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getToastStyle(type: ToastType): string {
  switch (type) {
    case 'error':
      return 'border-red-400/40 bg-red-500/10 text-red-100';
    case 'success':
      return 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100';
    case 'info':
      return 'border-accent/40 bg-accent/10 text-cyan-100';
    default:
      return 'border-white/10 bg-bg-card text-text-primary';
  }
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'error') {
    return <AlertCircle size={16} className="text-red-300" />;
  }
  if (type === 'success') {
    return <CheckCircle2 size={16} className="text-emerald-300" />;
  }
  return <Info size={16} className="text-accent" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });
  const timerMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timerMapRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timerMapRef.current.delete(id);
    }
    dispatch({ type: 'REMOVE_TOAST', payload: { id } });
  }, []);

  const showToast = useCallback(
    ({ type, message }: ShowToastInput) => {
      const id = createToastId();
      dispatch({ type: 'ADD_TOAST', payload: { id, type, message } });

      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: { id } });
        timerMapRef.current.delete(id);
      }, AUTO_DISMISS_MS);
      timerMapRef.current.set(id, timer);

      return id;
    },
    [],
  );

  useEffect(() => {
    return () => {
      timerMapRef.current.forEach((timer) => clearTimeout(timer));
      timerMapRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({ showToast, removeToast }),
    [showToast, removeToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex w-full max-w-[360px] flex-col gap-3">
        {state.toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-[0_12px_30px_rgba(2,6,23,0.45)] backdrop-blur ${getToastStyle(toast.type)}`}
          >
            <div className="mt-0.5 shrink-0">
              <ToastIcon type={toast.type} />
            </div>
            <p className="flex-1 text-[13px] leading-5">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded p-1 text-text-tertiary transition-colors hover:bg-white/10 hover:text-text-primary"
              aria-label="关闭通知"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
