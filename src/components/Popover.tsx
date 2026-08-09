import * as React from 'react';
import { cx, nextIndex, useControllableState, useDismiss } from '../lib/utils';

export interface PopoverProps {
  /** Rendered inside the anchor; gets the open state wired to it. */
  trigger: (props: {
    ref: React.Ref<HTMLButtonElement>;
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'dialog' | 'menu' | 'listbox';
    open: boolean;
  }) => React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  role?: 'dialog' | 'menu' | 'listbox';
  'aria-label'?: string;
  className?: string;
  panelClassName?: string;
  /** Aligns the panel's right edge with the anchor's. */
  align?: 'start' | 'end';
}

/**
 * The one floating surface everything else is built on. It owns open state,
 * outside-click and Escape dismissal, and nothing else — no positioning library,
 * since every panel here is anchored to its own trigger.
 */
export function Popover({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  role = 'dialog',
  className,
  panelClassName,
  align = 'start',
  ...rest
}: PopoverProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const anchor = React.useRef<HTMLDivElement>(null);
  const button = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => {
    if (!isOpen) return;
    setOpen(false);
    button.current?.focus();
  }, [isOpen, setOpen]);

  useDismiss(isOpen, close, [anchor]);

  return (
    <div ref={anchor} className={cx('pv', className)}>
      {trigger({
        ref: button,
        onClick: () => setOpen(!isOpen),
        'aria-expanded': isOpen,
        'aria-haspopup': role,
        open: isOpen,
      })}
      <div
        role={role}
        className={cx('pop', isOpen && 'open', panelClassName)}
        style={align === 'end' ? { left: 'auto', right: 0 } : undefined}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}

export interface MenuItem {
  label: React.ReactNode;
  onSelect?: () => void;
  icon?: React.ReactNode;
  /** Right-aligned shortcut hint; purely decorative. */
  shortcut?: string;
  danger?: boolean;
  separatorBefore?: boolean;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  items: MenuItem[];
  label: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  'aria-label'?: string;
  align?: 'start' | 'end';
  className?: string;
  triggerClassName?: string;
}

/** Actions, not values. Arrow keys walk the list, Enter picks. */
export function DropdownMenu({
  items,
  label,
  open,
  defaultOpen,
  onOpenChange,
  align,
  className,
  triggerClassName,
  ...rest
}: DropdownMenuProps) {
  const [cursor, setCursor] = React.useState(0);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const list = React.useRef<HTMLDivElement>(null);

  // A menu takes focus when it opens, so the arrow keys have somewhere to start.
  React.useEffect(() => {
    if (!isOpen) return;
    setCursor(0);
    const first = list.current?.querySelector<HTMLButtonElement>('.item:not(:disabled)');
    first?.focus();
  }, [isOpen]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const index = nextIndex(cursor, delta, items.length);
    setCursor(index);
    list.current?.querySelectorAll<HTMLButtonElement>('.item')[index]?.focus();
  };

  return (
    <Popover
      role="menu"
      align={align}
      open={isOpen}
      onOpenChange={setOpen}
      className={cx('menus', className)}
      {...rest}
      trigger={(props) => (
        <button {...props} type="button" className={cx('push', triggerClassName)}>
          {label}
        </button>
      )}
    >
      <div ref={list} onKeyDown={onKeyDown}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.separatorBefore ? <hr className="sep" /> : null}
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className={cx('item', item.danger && 'danger')}
              onClick={() => item.onSelect?.()}
            >
              {item.icon}
              {item.label}
              {item.shortcut ? <span className="sc">{item.shortcut}</span> : null}
            </button>
          </React.Fragment>
        ))}
      </div>
    </Popover>
  );
}

export interface TooltipProps {
  label: React.ReactNode;
  children: React.ReactElement;
}

/** Pure CSS on hover and focus, so it costs nothing until someone looks at it. */
export function Tooltip({ label, children }: TooltipProps) {
  const id = React.useId();
  return (
    <span className="tip">
      {React.cloneElement(children, { 'aria-describedby': id } as Record<string, unknown>)}
      <span className="bubble" role="tooltip" id={id}>
        {label}
      </span>
    </span>
  );
}

export interface HoverCardProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  'aria-label'?: string;
}

export function HoverCard({
  trigger,
  children,
  openDelay = 170,
  closeDelay = 140,
  ...rest
}: HoverCardProps) {
  const [open, setOpen] = React.useState(false);
  // React 19 dropped the argument-less useRef overload, so the initial value
  // is now explicit rather than implied undefined
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const schedule = (next: boolean, delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  };
  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div
      className="hc"
      onMouseEnter={() => schedule(true, openDelay)}
      onMouseLeave={() => schedule(false, closeDelay)}
    >
      <button
        type="button"
        className="hc__trig"
        onFocus={() => schedule(true, openDelay)}
        onBlur={() => schedule(false, closeDelay)}
      >
        {trigger}
      </button>
      <div className={cx('pop', open && 'open')} role="dialog" {...rest}>
        {children}
      </div>
    </div>
  );
}
