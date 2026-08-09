import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, IconButton, Checkbox, Switch, RadioGroup, Toggle, ToggleGroup, Segmented } from '../src';

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save preset</Button>);
    expect(screen.getByRole('button', { name: 'Save preset' })).toHaveAttribute('type', 'button');
  });

  it('carries the variant into the class list', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('push', 'danger');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Run</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('IconButton', () => {
  it('exposes its pressed state only when it is a toggle', () => {
    const { rerender } = render(<IconButton aria-label="Mute" />);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
    rerender(<IconButton aria-label="Mute" pressed />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Switch', () => {
  it('is a switch to assistive tech, and toggles on click', async () => {
    render(<Switch label="Dim the screen" />);
    const control = screen.getByRole('switch', { name: /dim the screen/i });
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(control).toBeChecked();
  });

  it('stays controlled when a value is passed', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Hide badges" checked={false} onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('toggles with the keyboard', async () => {
    render(<Switch label="Auto-reply" />);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('switch')).toBeChecked();
  });
});

describe('Checkbox', () => {
  it('supports the indeterminate state', () => {
    render(<Checkbox label="Everything" indeterminate />);
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
  });

  it('reports changes', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Calls" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe('RadioGroup', () => {
  const options = [
    { value: 'never', label: 'Never' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'daily', label: 'Every day' },
  ];

  it('selects the first option by default and only one at a time', async () => {
    render(<RadioGroup aria-label="Repeat" options={options} />);
    expect(screen.getByRole('radio', { name: 'Never' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'Every day' }));
    expect(screen.getByRole('radio', { name: 'Every day' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Never' })).not.toBeChecked();
  });

  it('reports the chosen value', async () => {
    const onValueChange = vi.fn();
    render(<RadioGroup aria-label="Repeat" options={options} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Weekdays' }));
    expect(onValueChange).toHaveBeenCalledWith('weekdays');
  });
});

describe('Toggle', () => {
  it('flips aria-pressed', async () => {
    render(<Toggle aria-label="Star">*</Toggle>);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('ToggleGroup', () => {
  const items = [
    { value: 'b', label: 'B' },
    { value: 'i', label: 'I' },
    { value: 'u', label: 'U' },
  ];

  it('lets several be on at once when multiple', async () => {
    render(<ToggleGroup aria-label="Style" items={items} />);
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    await userEvent.click(screen.getByRole('button', { name: 'I' }));
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'I' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps only one on when single', async () => {
    render(<ToggleGroup aria-label="Ratio" type="single" items={items} />);
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    await userEvent.click(screen.getByRole('button', { name: 'I' }));
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'I' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Segmented', () => {
  it('marks the selected option and reports changes', async () => {
    const onValueChange = vi.fn();
    render(
      <Segmented
        aria-label="Alert style"
        options={[
          { value: 'banner', label: 'Banner' },
          { value: 'list', label: 'List' },
        ]}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Banner' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'List' }));
    expect(onValueChange).toHaveBeenCalledWith('list');
  });
});
