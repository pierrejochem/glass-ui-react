import * as React from 'react';
import { cx, useControllableState, useDismiss } from '../lib/utils';

export interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (date: Date) => void;
  /** BCP 47 tag used for the month names and the formatted trigger label. */
  locale?: string;
  /** 1 = Monday. */
  weekStartsOn?: 0 | 1;
  'aria-label': string;
  className?: string;
}

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  locale = 'en-GB',
  weekStartsOn = 1,
  className,
  ...rest
}: DatePickerProps) {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? today,
    onChange: onValueChange,
  });
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
  const [cursor, setCursor] = React.useState(selected);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => setOpen(false), []);
  useDismiss(open, close, [root]);

  const format = (date: Date) =>
    date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const days = React.useMemo(() => {
    const offset = (view.getDay() - weekStartsOn + 7) % 7;
    const start = new Date(view);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [view, weekStartsOn]);

  const pick = (date: Date) => {
    setSelected(date);
    setCursor(date);
    setView(new Date(date.getFullYear(), date.getMonth(), 1));
    setOpen(false);
    trigger.current?.focus();
  };

  const shift = (months: number) => {
    const next = new Date(view.getFullYear(), view.getMonth() + months, 1);
    const last = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    setView(next);
    setCursor(new Date(next.getFullYear(), next.getMonth(), Math.min(cursor.getDate(), last)));
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
      return;
    }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (step) {
      event.preventDefault();
      const next = new Date(cursor);
      next.setDate(next.getDate() + step);
      setCursor(next);
      if (next.getMonth() !== view.getMonth()) {
        setView(new Date(next.getFullYear(), next.getMonth(), 1));
      }
      return;
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      shift(event.key === 'PageUp' ? -1 : 1);
      return;
    }
    if (event.key === 'Enter' && document.activeElement?.classList.contains('day')) {
      event.preventDefault();
      pick(cursor);
    }
  };

  const weekdays = React.useMemo(() => {
    const base = new Date(2024, 0, weekStartsOn === 1 ? 1 : 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return date.toLocaleDateString(locale, { weekday: 'short' });
    });
  }, [locale, weekStartsOn]);

  return (
    <div ref={root} className={cx('picker', open && 'open', className)} onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        className="input as-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        {...rest}
      >
        <span className="date">{format(selected)}</span>
      </button>

      <div className="cal" role="dialog" aria-label={rest['aria-label']}>
        <div className="cal__head">
          <button type="button" className="navbtn" aria-label="Previous month" onClick={() => shift(-1)}>
            ‹
          </button>
          <div className="cal__title" aria-live="polite">
            {view.toLocaleDateString(locale, { month: 'long' })} <span>{view.getFullYear()}</span>
          </div>
          <button type="button" className="navbtn" aria-label="Next month" onClick={() => shift(1)}>
            ›
          </button>
        </div>
        <div className="cal__dow">
          {weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="cal__grid" role="grid">
          {days.map((date) => (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              aria-label={format(date)}
              aria-selected={sameDay(date, selected)}
              tabIndex={sameDay(date, cursor) ? 0 : -1}
              className={cx(
                'day',
                date.getMonth() !== view.getMonth() && 'mut',
                sameDay(date, cursor) && 'cursor',
              )}
              onClick={() => pick(date)}
            >
              {date.getDate()}
              {sameDay(date, today) ? <span className="mark" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
