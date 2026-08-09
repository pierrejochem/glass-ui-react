import * as React from 'react';
import { cx, nextIndex, useControllableState, useDismiss } from '../lib/utils';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  /** Right-aligned detail, e.g. a count or a time. */
  meta?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  'aria-label': string;
  accentColor?: string;
  className?: string;
  disabled?: boolean;
}

/** A value, not an action — that is what separates this from DropdownMenu. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  accentColor,
  className,
  disabled,
  ...rest
}: SelectProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? options[0]?.value ?? '',
    onChange: onValueChange,
  });
  const [open, setOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState(() =>
    Math.max(0, options.findIndex((o) => o.value === selected)),
  );
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => setOpen(false), []);
  useDismiss(open, close, [root]);

  const pick = (index: number) => {
    const option = options[index];
    if (!option) return;
    setSelected(option.value);
    setCursor(index);
    setOpen(false);
    trigger.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const index = nextIndex(cursor, event.key === 'ArrowDown' ? 1 : -1, options.length);
      setCursor(index);
      root.current?.querySelectorAll<HTMLButtonElement>('.opt')[index]?.focus();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      const active = document.activeElement;
      if (active?.classList.contains('opt')) {
        event.preventDefault();
        pick(Array.from(root.current?.querySelectorAll('.opt') ?? []).indexOf(active));
      }
    }
  };

  const current = options.find((option) => option.value === selected);

  return (
    <div
      ref={root}
      className={cx('drop', open && 'open', className)}
      onKeyDown={onKeyDown}
      style={accentColor ? ({ ['--accent' as string]: accentColor } as React.CSSProperties) : undefined}
    >
      <button
        ref={trigger}
        type="button"
        className="trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        {...rest}
      >
        <span className="swatch" aria-hidden="true" />
        <span className="val">{current?.label ?? ''}</span>
        <svg
          className="chev"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className="menu" role="listbox" aria-label={rest['aria-label']}>
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === selected}
            className="opt"
            style={{ ['--i' as string]: index } as React.CSSProperties}
            onClick={() => pick(index)}
          >
            <span className="dot" aria-hidden="true" />
            {option.label}
            {option.meta ? <span className="meta">{option.meta}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
