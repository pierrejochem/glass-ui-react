import * as React from 'react';
import { cx, nextIndex, useControllableState } from '../lib/utils';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  'aria-label': string;
  className?: string;
}

export function Tabs({ items, value, defaultValue, onValueChange, className, ...rest }: TabsProps) {
  const id = React.useId();
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? '',
    onChange: onValueChange,
  });
  const list = React.useRef<HTMLDivElement>(null);
  const ink = React.useRef<HTMLSpanElement>(null);

  const move = React.useCallback(() => {
    const root = list.current;
    const bar = ink.current;
    if (!root || !bar) return;
    const active = root.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (!active) return;
    bar.style.width = `${active.offsetWidth}px`;
    bar.style.transform = `translateX(${active.offsetLeft}px)`;
  }, []);

  React.useEffect(() => {
    move();
    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [move, selected]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const index = items.findIndex((item) => item.value === selected);
    const next = items[nextIndex(index, delta, items.length)];
    if (!next) return;
    setSelected(next.value);
    const buttons = list.current?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[items.indexOf(next)]?.focus();
  };

  return (
    <div className={className}>
      <div className="tabs" role="tablist" ref={list} onKeyDown={onKeyDown} {...rest}>
        <span className="ink" ref={ink} aria-hidden="true" />
        {items.map((item) => {
          const active = item.value === selected;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`${id}-tab-${item.value}`}
              aria-controls={`${id}-panel-${item.value}`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(item.value)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${id}-panel-${item.value}`}
          aria-labelledby={`${id}-tab-${item.value}`}
          className="tabpanel"
          hidden={item.value !== selected}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}

const Chevron = () => (
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
);

export interface AccordionItemData {
  value: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  /** `single` closes the others, `multiple` lets them stack. */
  type?: 'single' | 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
}

export function Accordion({
  items,
  type = 'single',
  value,
  defaultValue = [],
  onValueChange,
  className,
}: AccordionProps) {
  const id = React.useId();
  const [open, setOpen] = useControllableState({ value, defaultValue, onChange: onValueChange });

  const toggle = (item: string) => {
    if (open.includes(item)) {
      setOpen(open.filter((v) => v !== item));
      return;
    }
    setOpen(type === 'single' ? [item] : [...open, item]);
  };

  return (
    <div className={cx('acc', className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.value);
        return (
          <div className={cx('acc__item', isOpen && 'open')} key={item.value}>
            <button
              type="button"
              className="acc__trig"
              aria-expanded={isOpen}
              aria-controls={`${id}-${item.value}`}
              onClick={() => toggle(item.value)}
            >
              {item.title}
              <Chevron />
            </button>
            <div className="acc__body" id={`${id}-${item.value}`} role="region">
              <div>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export interface CollapsibleProps {
  /** Label for the trigger when closed; `openLabel` replaces it when open. */
  label: React.ReactNode;
  openLabel?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({
  label,
  openLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: CollapsibleProps) {
  const id = React.useId();
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <div className={cx('acc__item', isOpen && 'open', className)}>
      <div className="acc__body" id={id} role="region">
        <div>{children}</div>
      </div>
      <button
        type="button"
        className="push"
        aria-expanded={isOpen}
        aria-controls={id}
        style={{ marginTop: 10, width: '100%', textAlign: 'center' }}
        onClick={() => setOpen(!isOpen)}
      >
        {isOpen ? (openLabel ?? label) : label}
      </button>
    </div>
  );
}
