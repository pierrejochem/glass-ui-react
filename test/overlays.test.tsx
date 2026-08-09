import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import {
  Popover,
  DropdownMenu,
  Tooltip,
  HoverCard,
  Select,
  Dialog,
  AlertDialog,
  ToastProvider,
  useToast,
  Button,
} from '../src';

describe('Popover', () => {
  const setup = () =>
    render(
      <Popover
        aria-label="Share preset"
        trigger={(props) => (
          <button {...props} type="button">
            Share preset
          </button>
        )}
      >
        <p>Anyone with the link can add this preset.</p>
      </Popover>,
    );

  it('starts closed and reports it on the trigger', () => {
    setup();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveClass('open');
  });

  it('opens on click', async () => {
    setup();
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).toHaveClass('open');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    setup();
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toHaveFocus();
  });

  it('closes when a pointer goes down outside it', async () => {
    render(
      <div>
        <Popover trigger={(props) => <button {...props} type="button">Open</button>}>
          <p>Panel</p>
        </Popover>
        <button type="button">Elsewhere</button>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('aria-expanded', 'false'),
    );
  });

  it('can be driven from outside', async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        open={false}
        onOpenChange={onOpenChange}
        trigger={(props) => <button {...props} type="button">Open</button>}
      >
        <p>Panel</p>
      </Popover>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('DropdownMenu', () => {
  const items = [
    { label: 'Duplicate', shortcut: '⌘D', onSelect: vi.fn() },
    { label: 'Export', shortcut: '⌘E' },
    { label: 'Delete preset', danger: true, separatorBefore: true },
  ];

  it('marks itself as a menu', async () => {
    render(<DropdownMenu label="More actions" items={items} />);
    const trigger = screen.getByRole('button', { name: 'More actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(trigger);
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
  });

  it('runs the item action', async () => {
    const onSelect = vi.fn();
    render(<DropdownMenu label="More" items={[{ label: 'Duplicate', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('walks the list with the arrow keys', async () => {
    render(<DropdownMenu label="More" items={items} />);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /export/i })).toHaveFocus();
  });
});

describe('Tooltip', () => {
  it('describes the control it wraps', () => {
    render(
      <Tooltip label="Mute everything">
        <button type="button" aria-label="Mute" />
      </Tooltip>,
    );
    const tip = screen.getByRole('tooltip');
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby', tip.id);
    expect(tip).toHaveTextContent('Mute everything');
  });
});

describe('HoverCard', () => {
  it('opens after the delay and closes again', async () => {
    render(
      <HoverCard aria-label="About Rea" trigger="Rea Lindqvist" openDelay={20} closeDelay={20}>
        <p>Always allowed through.</p>
      </HoverCard>,
    );
    const panel = screen.getByRole('dialog', { hidden: true });
    expect(panel).not.toHaveClass('open');
    await userEvent.hover(screen.getByRole('button'));
    await waitFor(() => expect(panel).toHaveClass('open'));
    await userEvent.unhover(screen.getByRole('button'));
    await waitFor(() => expect(panel).not.toHaveClass('open'));
  });
});

describe('Select', () => {
  const options = [
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 hour' },
    { value: 'morning', label: 'Until morning', meta: '7:00' },
  ];

  it('shows the first option until told otherwise', () => {
    render(<Select aria-label="Turn on for" options={options} />);
    expect(screen.getByRole('button')).toHaveTextContent('15 minutes');
  });

  it('opens a listbox and picks a value', async () => {
    const onValueChange = vi.fn();
    render(<Select aria-label="Turn on for" options={options} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('option', { name: /until morning/i }));
    expect(onValueChange).toHaveBeenCalledWith('morning');
    expect(screen.getByRole('button')).toHaveTextContent('Until morning');
  });

  it('marks the selected option for assistive tech', async () => {
    render(<Select aria-label="Turn on for" options={options} defaultValue="1h" />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('option', { name: '1 hour' })).toHaveAttribute('aria-selected', 'true');
  });

  it('opens with ArrowDown and closes with Escape', async () => {
    render(<Select aria-label="Turn on for" options={options} />);
    const trigger = screen.getByRole('button');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Dialog', () => {
  it('opens and closes with the open prop', () => {
    const { rerender } = render(
      <Dialog open={false} onClose={vi.fn()} title="Edit Night">
        <p>Body</p>
      </Dialog>,
    );
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(false);
    rerender(
      <Dialog open onClose={vi.fn()} title="Edit Night">
        <p>Body</p>
      </Dialog>,
    );
    expect(dialog.open).toBe(true);
    expect(screen.getByText('Edit Night')).toBeInTheDocument();
  });

  it('asks to close when Escape is pressed rather than closing itself', () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Edit Night" />);
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('AlertDialog', () => {
  it('offers exactly two ways out', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <AlertDialog
        open
        onCancel={onCancel}
        onConfirm={onConfirm}
        title="Delete Night?"
        confirmLabel="Delete preset"
        cancelLabel="Keep it"
      />,
    );
    expect(screen.getByRole('alertdialog')).toHaveAccessibleName('Delete Night?');
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(onCancel).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Delete preset' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe('Toast', () => {
  function Harness({ max }: { max?: number }) {
    return (
      <ToastProvider max={max}>
        <Trigger />
      </ToastProvider>
    );
  }
  function Trigger() {
    const { toast } = useToast();
    const [n, setN] = React.useState(0);
    return (
      <Button
        onClick={() => {
          setN(n + 1);
          toast({ title: `Saved ${n + 1}`, description: 'Your changes are live', duration: 0 });
        }}
      >
        Save
      </Button>
    );
  }

  it('shows a toast and dismisses it', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('status')).toHaveTextContent('Saved 1');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('drops the oldest past the limit', async () => {
    render(<Harness max={2} />);
    const save = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(save);
    await userEvent.click(save);
    await userEvent.click(save);
    const toasts = screen.getAllByRole('status');
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveTextContent('Saved 2');
  });

  it('clears itself after the duration', async () => {
    vi.useFakeTimers();
    function Auto() {
      const { toast } = useToast();
      React.useEffect(() => {
        toast({ title: 'Preset saved', duration: 1000 });
      }, [toast]);
      return null;
    }
    render(
      <ToastProvider>
        <Auto />
      </ToastProvider>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(1200);
    expect(screen.queryByRole('status')).toBeNull();
    vi.useRealTimers();
  });

  it('refuses to work outside its provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Orphan() {
      useToast();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
