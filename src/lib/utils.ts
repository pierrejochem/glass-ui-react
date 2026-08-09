import * as React from 'react';

/** Join class names, dropping anything falsy. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * State that a consumer may or may not want to own. Pass `value` to control it,
 * leave it out to let the component keep its own.
 */
export function useControllableState<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? (value as T) : uncontrolled;

  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, set];
}

/** Fires when a pointer goes down anywhere outside the given elements. */
export function useDismiss(
  active: boolean,
  onDismiss: () => void,
  refs: Array<React.RefObject<HTMLElement | null>>,
) {
  React.useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, onDismiss]);
}

/** Roving arrow-key movement across a list. Returns the next index. */
export function nextIndex(current: number, delta: number, length: number, loop = true): number {
  if (length === 0) return -1;
  const raw = current + delta;
  if (loop) return (raw + length) % length;
  return Math.min(Math.max(raw, 0), length - 1);
}

export type Accent = 'sleep' | 'dnd' | 'personal';

/** Maps the accent name onto the CSS custom property the styles read. */
export function accentStyle(accent?: Accent): React.CSSProperties | undefined {
  return accent ? ({ ['--accent' as string]: `var(--${accent})` } as React.CSSProperties) : undefined;
}
