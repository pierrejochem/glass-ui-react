import * as React from 'react';
import { cx } from '../lib/utils';

export type ToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before it clears itself. Pass 0 to keep it until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastRecord extends ToastOptions {
  id: number;
}

const TONE_COLOR: Record<ToastTone, string> = {
  info: 'var(--sleep)',
  success: 'var(--ok)',
  warning: 'var(--personal)',
  danger: 'var(--dnd)',
};

const ToastContext = React.createContext<{
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
} | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Older toasts drop off the top once this many are on screen. */
  max?: number;
  defaultDuration?: number;
}

export function ToastProvider({ children, max = 3, defaultDuration = 4500 }: ToastProviderProps) {
  const [items, setItems] = React.useState<ToastRecord[]>([]);
  const seed = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = ++seed.current;
      setItems((current) => [...current, { ...options, id }].slice(-max));
      const duration = options.duration ?? defaultDuration;
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [defaultDuration, dismiss, max],
  );

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className="toast"
            style={
              {
                ['--accent']: TONE_COLOR[item.tone ?? 'info'],
                ['--ms']: `${item.duration ?? defaultDuration}ms`,
              } as React.CSSProperties
            }
          >
            <span className="chip" aria-hidden="true" />
            <span className="txt">
              <span className="t">{item.title}</span>
              {item.description ? <span className="d">{item.description}</span> : null}
            </span>
            {item.action ? (
              <button
                type="button"
                className="push"
                style={{ padding: '8px 14px', fontSize: 12 }}
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
              >
                {item.action.label}
              </button>
            ) : null}
            <button
              type="button"
              className="x"
              aria-label="Dismiss"
              onClick={() => dismiss(item.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round">
                <path d="m5 5 14 14M19 5 5 19" />
              </svg>
            </button>
            <span className={cx('life')} aria-hidden="true" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a <ToastProvider>');
  return context;
}
