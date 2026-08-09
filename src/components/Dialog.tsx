import * as React from 'react';
import { cx } from '../lib/utils';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small glass chip above the title. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  /** Buttons along the bottom. */
  footer?: React.ReactNode;
  accentColor?: string;
  className?: string;
}

/**
 * Wraps the native `<dialog>`, so focus trapping, inertness and Escape are the
 * platform's job rather than ours.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  accentColor,
  className,
}: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={className}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div
        className={cx('sheet')}
        style={accentColor ? ({ ['--accent' as string]: accentColor } as React.CSSProperties) : undefined}
      >
        {icon ? <span className="icon">{icon}</span> : null}
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {children ? <div className="fields">{children}</div> : null}
        {footer ? <div className="row">{footer}</div> : null}
      </div>
    </dialog>
  );
}

export interface AlertDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Paints the confirm button red and the sheet's halo with it. */
  destructive?: boolean;
}

/** A dialog that interrupts: it has exactly two ways out and no dismiss-by-accident. */
export function AlertDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  icon,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  destructive = true,
}: AlertDialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="alert-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div
        className="sheet"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        style={
          destructive ? ({ ['--accent' as string]: 'var(--dnd)' } as React.CSSProperties) : undefined
        }
      >
        {icon ? <span className="icon">{icon}</span> : null}
        <h3 id="alert-title">{title}</h3>
        {description ? <p>{description}</p> : null}
        <div className="row">
          <button type="button" className="push" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cx('push', destructive ? 'danger' : 'primary')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
