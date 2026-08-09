import * as React from 'react';
import { accentStyle, cx, type Accent } from '../lib/utils';

type Shared = {
  accent?: Accent;
  /** Leading glyph, usually a 24×24 svg. */
  icon?: React.ReactNode;
  /** Text after the field, e.g. a unit. */
  suffix?: React.ReactNode;
  /** Shown under the field; turns red when `invalid`. */
  hint?: React.ReactNode;
  invalid?: boolean;
  onClear?: () => void;
  wrapperClassName?: string;
};

export interface InputProps
  extends Shared,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {}

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="m5 5 14 14M19 5 5 19" />
  </svg>
);

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { accent, icon, suffix, hint, invalid, onClear, wrapperClassName, className, ...rest },
  ref,
) {
  const filled = Boolean(String(rest.value ?? rest.defaultValue ?? '').length);
  return (
    <div className={cx('field', invalid && 'bad', wrapperClassName)}>
      <div className={cx('input', filled && 'filled')} style={accentStyle(accent)}>
        {icon ? (
          <span className="lead" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <input {...rest} ref={ref} className={className} aria-invalid={invalid || undefined} />
        {suffix ? <span className="unit">{suffix}</span> : null}
        {onClear ? (
          <button type="button" className="clear" aria-label="Clear" onClick={onClear}>
            <ClearIcon />
          </button>
        ) : null}
      </div>
      {hint ? (
        <div className="hint">
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  );
});

export interface TextareaProps
  extends Shared,
    React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Shows a live count against `maxLength`. */
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { accent, hint, invalid, showCount, wrapperClassName, className, icon: _icon, suffix: _suffix, onClear: _onClear, ...rest },
  ref,
) {
  const length = String(rest.value ?? rest.defaultValue ?? '').length;
  return (
    <div className={cx('field', invalid && 'bad', wrapperClassName)}>
      <div className="input area" style={accentStyle(accent)}>
        <textarea {...rest} ref={ref} className={className} aria-invalid={invalid || undefined} />
      </div>
      {hint || showCount ? (
        <div className="hint">
          <span>{hint}</span>
          {showCount && rest.maxLength ? (
            <span className="count">
              {length}/{rest.maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
