import * as React from 'react';
import { cx, useControllableState } from '../lib/utils';

const THUMB = 40;

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Any CSS colour for the fill and its bloom. */
  accentColor?: string;
  disabled?: boolean;
  className?: string;
  'aria-label': string;
}

/**
 * The fill spans the whole track and is revealed by a moving mask, so the colour
 * ramp stays put instead of rescaling on every change. The mask head is placed in
 * pixels at the thumb's true centre — a native range thumb travels from half its
 * width to width minus half, not 0–100%.
 */
export function Slider({
  value,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  accentColor,
  disabled,
  className,
  ...rest
}: SliderProps) {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const input = React.useRef<HTMLInputElement>(null);
  const track = React.useRef<HTMLDivElement>(null);

  const paint = React.useCallback(() => {
    const el = input.current;
    const wrap = track.current;
    if (!el || !wrap) return;
    const width = el.clientWidth;
    if (!width) return;
    const ratio = (current - min) / (max - min || 1);
    const x = el.offsetLeft + THUMB / 2 + (width - THUMB) * ratio;
    wrap.style.setProperty('--p', `${x}px`);
  }, [current, min, max]);

  React.useEffect(() => {
    paint();
    window.addEventListener('resize', paint);
    return () => window.removeEventListener('resize', paint);
  }, [paint]);

  return (
    <div
      ref={track}
      className={cx('slider', className)}
      style={accentColor ? ({ ['--sl' as string]: accentColor } as React.CSSProperties) : undefined}
    >
      <span className="glow" aria-hidden="true" />
      <span className="fill" aria-hidden="true" />
      <input
        {...rest}
        ref={input}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={(event) => setCurrent(Number(event.target.value))}
      />
    </div>
  );
}

export interface ProgressProps {
  /** Leave undefined for the indeterminate sweep. */
  value?: number;
  max?: number;
  accentColor?: string;
  className?: string;
  'aria-label'?: string;
}

export function Progress({ value, max = 100, accentColor, className, ...rest }: ProgressProps) {
  const indeterminate = value === undefined;
  const pct = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : value}
      className={cx('prog', indeterminate && 'indeterminate', className)}
      style={accentColor ? ({ ['--accent' as string]: accentColor } as React.CSSProperties) : undefined}
    >
      <i style={indeterminate ? undefined : { width: `${pct}%` }} />
    </div>
  );
}
