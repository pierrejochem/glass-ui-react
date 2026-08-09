import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, Accordion, Collapsible, Progress, Slider, Input, Textarea, Avatar, Badge, Separator } from '../src';

const tabItems = [
  { value: 'devices', label: 'Devices', content: 'Three devices follow this preset.' },
  { value: 'apps', label: 'Apps', content: 'Slack and Mail are silenced.' },
  { value: 'people', label: 'People', content: 'Twelve favourites ring through.' },
];

describe('Tabs', () => {
  it('shows only the selected panel', () => {
    render(<Tabs aria-label="Scope" items={tabItems} />);
    expect(screen.getByText(/three devices/i)).toBeVisible();
    expect(screen.getByText(/slack and mail/i)).not.toBeVisible();
  });

  it('wires each tab to its panel', () => {
    render(<Tabs aria-label="Scope" items={tabItems} />);
    const tab = screen.getByRole('tab', { name: 'Devices' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('moves with the arrow keys and wraps around', async () => {
    render(<Tabs aria-label="Scope" items={tabItems} />);
    screen.getByRole('tab', { name: 'Devices' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Apps' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'People' })).toHaveAttribute('aria-selected', 'true');
  });

  it('keeps a single tab stop in the list', () => {
    render(<Tabs aria-label="Scope" items={tabItems} />);
    expect(screen.getByRole('tab', { name: 'Devices' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Apps' })).toHaveAttribute('tabindex', '-1');
  });
});

const accItems = [
  { value: 'sleep', title: 'Sleep', content: 'Dims the screen.' },
  { value: 'dnd', title: 'Do not disturb', content: 'Silences calls.' },
];

describe('Accordion', () => {
  it('opens one at a time by default', async () => {
    render(<Accordion items={accItems} defaultValue={['sleep']} />);
    await userEvent.click(screen.getByRole('button', { name: /do not disturb/i }));
    expect(screen.getByRole('button', { name: /^sleep/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /do not disturb/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('stacks them when multiple', async () => {
    render(<Accordion type="multiple" items={accItems} defaultValue={['sleep']} />);
    await userEvent.click(screen.getByRole('button', { name: /do not disturb/i }));
    expect(screen.getByRole('button', { name: /^sleep/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes an open item when clicked again', async () => {
    render(<Accordion items={accItems} defaultValue={['sleep']} />);
    await userEvent.click(screen.getByRole('button', { name: /^sleep/i }));
    expect(screen.getByRole('button', { name: /^sleep/i })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Collapsible', () => {
  it('swaps its label and reports state', async () => {
    const onOpenChange = vi.fn();
    render(
      <Collapsible label="Show 3 more" openLabel="Show fewer" onOpenChange={onOpenChange}>
        <p>Watch</p>
      </Collapsible>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Show 3 more' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Show fewer' })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Progress', () => {
  it('reports its value', () => {
    render(<Progress value={64} aria-label="Syncing" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '64');
  });

  it('omits the value when indeterminate', () => {
    render(<Progress aria-label="Waiting" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveClass('indeterminate');
  });

  it('clamps out-of-range values', () => {
    const { container } = render(<Progress value={140} aria-label="Syncing" />);
    expect(container.querySelector('.prog i')).toHaveStyle({ width: '100%' });
  });
});

describe('Slider', () => {
  it('is a native range with the right bounds', () => {
    render(<Slider aria-label="Volume" defaultValue={64} min={0} max={100} />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.value).toBe('64');
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
  });

  // jsdom does not implement arrow-key stepping on a range input, so drive the
  // change event directly — the wiring we own is the value -> callback path.
  it('reports the new value as a number', () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={50} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '73' } });
    expect(onValueChange).toHaveBeenCalledWith(73);
  });

  it('stays put when controlled from outside', () => {
    render(<Slider aria-label="Volume" value={20} onValueChange={vi.fn()} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '80' } });
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('20');
  });
});

describe('Input', () => {
  it('links its hint and marks itself invalid', () => {
    render(<Input aria-label="Name" invalid hint="Give it a name" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Give it a name')).toBeInTheDocument();
  });

  it('offers a clear button only when asked', async () => {
    const onClear = vi.fn();
    const { rerender } = render(<Input aria-label="Name" value="Night" readOnly />);
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
    rerender(<Input aria-label="Name" value="Night" readOnly onClear={onClear} />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledOnce();
  });
});

describe('Textarea', () => {
  it('counts characters against maxLength', () => {
    render(<Textarea aria-label="Note" value="Phone down" maxLength={120} showCount readOnly />);
    expect(screen.getByText('10/120')).toBeInTheDocument();
  });
});

describe('Avatar', () => {
  it('falls back to initials when the image fails', () => {
    render(<Avatar name="Rea Lindqvist" src="/broken.png" />);
    fireEvent.error(screen.getByRole('img', { name: 'Rea Lindqvist' }));
    expect(screen.getByLabelText('Rea Lindqvist')).toHaveTextContent('RL');
  });

  it('shows initials when there is no image at all', () => {
    render(<Avatar name="Jonas Tan" />);
    expect(screen.getByLabelText('Jonas Tan')).toHaveTextContent('JT');
  });
});

describe('Badge and Separator', () => {
  it('renders a badge with a status colour', () => {
    const { container } = render(<Badge color="var(--ok)">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(container.querySelector('.badge i')).toBeTruthy();
  });

  it('renders each separator orientation', () => {
    const { rerender } = render(<Separator orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    rerender(<Separator label="or" />);
    expect(screen.getByRole('separator')).toHaveTextContent('or');
  });
});
