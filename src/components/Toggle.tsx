import * as React from 'react';
import { accentStyle, cx, useControllableState, type Accent } from '../lib/utils';

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  accent?: Accent;
  /** Wider pill for text rather than an icon. */
  wide?: boolean;
}

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { pressed, defaultPressed = false, onPressedChange, accent, wide, className, onClick, ...rest },
  ref,
) {
  const [on, setOn] = useControllableState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });
  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      aria-pressed={on}
      style={accentStyle(accent)}
      className={cx('tgl', wide && 'wide', className)}
      onClick={(event) => {
        setOn(!on);
        onClick?.(event);
      }}
    />
  );
});

export interface ToggleGroupItem {
  value: string;
  label: React.ReactNode;
  'aria-label'?: string;
}

export interface ToggleGroupProps {
  items: ToggleGroupItem[];
  /** `single` behaves like a segmented choice, `multiple` like a set of switches. */
  type?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  accent?: Accent;
  wide?: boolean;
  'aria-label': string;
  className?: string;
}

export function ToggleGroup({
  items,
  type = 'multiple',
  value,
  defaultValue = [],
  onValueChange,
  accent,
  wide,
  className,
  ...rest
}: ToggleGroupProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const toggle = (item: string) => {
    if (type === 'single') {
      setSelected(selected.includes(item) ? [] : [item]);
      return;
    }
    setSelected(selected.includes(item) ? selected.filter((v) => v !== item) : [...selected, item]);
  };

  return (
    <div className={cx('tg', className)} role="group" {...rest}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-label={item['aria-label']}
          aria-pressed={selected.includes(item.value)}
          style={accentStyle(accent)}
          className={cx('tgl', wide && 'wide')}
          onClick={() => toggle(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export interface SegmentedProps {
  options: Array<{ value: string; label: React.ReactNode }>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  'aria-label': string;
  className?: string;
}

/** One choice out of a few, with a thumb that slides to the selection. */
export function Segmented({
  options,
  value,
  defaultValue,
  onValueChange,
  className,
  ...rest
}: SegmentedProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? options[0]?.value ?? '',
    onChange: onValueChange,
  });
  const wrap = React.useRef<HTMLDivElement>(null);
  const thumb = React.useRef<HTMLSpanElement>(null);

  const move = React.useCallback(() => {
    const root = wrap.current;
    const knob = thumb.current;
    if (!root || !knob) return;
    const index = Math.max(0, options.findIndex((o) => o.value === selected));
    const width = (root.clientWidth - 10) / (options.length || 1);
    knob.style.width = `${width}px`;
    knob.style.transform = `translateX(${5 + index * width}px)`;
  }, [options, selected]);

  React.useEffect(() => {
    move();
    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [move]);

  return (
    <div ref={wrap} className={cx('seg', className)} role="tablist" {...rest}>
      <span ref={thumb} className="thumb" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected === option.value}
          onClick={() => setSelected(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
