import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, DatePicker, ModeToggle, ModeRack, type Column } from '../src';

interface Preset {
  name: string;
  mode: string;
  devices: number;
  status: string;
}

const rows: Preset[] = [
  { name: 'Night', mode: 'Sleep', devices: 3, status: 'Active' },
  { name: 'Deep work', mode: 'Do not disturb', devices: 2, status: 'Scheduled' },
  { name: 'Commute', mode: 'Personal', devices: 1, status: 'Active' },
  { name: 'Cinema', mode: 'Do not disturb', devices: 4, status: 'Paused' },
  { name: 'Reading', mode: 'Personal', devices: 5, status: 'Paused' },
  { name: 'Gym', mode: 'Personal', devices: 2, status: 'Active' },
];

const columns: Array<Column<Preset>> = [
  { key: 'name', header: 'Preset' },
  { key: 'mode', header: 'Mode' },
  { key: 'devices', header: 'Devices', sortValue: (row) => row.devices },
  { key: 'status', header: 'Status', sortable: false },
];

const table = (props: Partial<React.ComponentProps<typeof DataTable<Preset>>> = {}) =>
  render(
    <DataTable
      aria-label="Presets"
      rows={rows}
      columns={columns}
      rowId={(row) => row.name}
      searchFields={(row) => `${row.name} ${row.mode} ${row.status}`}
      pageSize={3}
      {...props}
    />,
  );

const bodyNames = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0]?.textContent);

describe('DataTable pagination', () => {
  it('shows one page at a time and says where you are', () => {
    table();
    expect(bodyNames()).toHaveLength(3);
    expect(screen.getByText('1–3 of 6')).toBeInTheDocument();
  });

  it('moves between pages', async () => {
    table();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('4–6 of 6')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByText('1–3 of 6')).toBeInTheDocument();
  });

  it('disables the arrows at each end', async () => {
    table();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('marks the current page for assistive tech', () => {
    table();
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('DataTable sorting', () => {
  it('sorts ascending, then flips on a second click', async () => {
    table();
    const sorter = screen.getByRole('button', { name: /devices/i });
    await userEvent.click(sorter);
    expect(bodyNames()[0]).toBe('Commute');
    await userEvent.click(sorter);
    expect(bodyNames()[0]).toBe('Reading');
  });

  it('exposes the direction through aria-sort, on one column only', async () => {
    table();
    await userEvent.click(screen.getByRole('button', { name: /devices/i }));
    expect(screen.getByRole('columnheader', { name: /devices/i })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await userEvent.click(screen.getByRole('button', { name: /preset/i }));
    expect(screen.getByRole('columnheader', { name: /devices/i })).not.toHaveAttribute('aria-sort');
    expect(screen.getByRole('columnheader', { name: /preset/i })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('leaves a column alone when sortable is false', () => {
    table();
    expect(screen.queryByRole('button', { name: /status/i })).toBeNull();
  });

  it('returns to the first page when the order changes', async () => {
    table();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await userEvent.click(screen.getByRole('button', { name: /preset/i }));
    expect(screen.getByText('1–3 of 6')).toBeInTheDocument();
  });
});

describe('DataTable search', () => {
  it('filters across the given fields', async () => {
    table();
    await userEvent.type(screen.getByRole('searchbox'), 'personal');
    expect(bodyNames()).toEqual(['Commute', 'Reading', 'Gym']);
  });

  it('offers a way out when nothing matches', async () => {
    table();
    await userEvent.type(screen.getByRole('searchbox'), 'zzz');
    expect(screen.queryByRole('row', { name: /night/i })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(bodyNames()).toHaveLength(3);
  });

  it('drops back to page one on a new search', async () => {
    table();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    await userEvent.type(screen.getByRole('searchbox'), 'a');
    expect(screen.getByText(/^1–/)).toBeInTheDocument();
  });
});

describe('DataTable selection', () => {
  it('keeps the header box indeterminate while only some rows are ticked', async () => {
    table({ selectable: true });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Night' }));
    const header = screen.getByRole('checkbox', { name: /select all/i }) as HTMLInputElement;
    expect(header.indeterminate).toBe(true);
    expect(header.checked).toBe(false);
  });

  it('ticks every row on the page from the header', async () => {
    table({ selectable: true });
    await userEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('survives paging', async () => {
    const onSelectionChange = vi.fn();
    table({ selectable: true, onSelectionChange });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Night' }));
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByRole('checkbox', { name: 'Select Night' })).toBeChecked();
    expect(onSelectionChange).toHaveBeenLastCalledWith(['Night']);
  });
});

describe('DatePicker', () => {
  const may = new Date(2026, 4, 14);

  it('shows the selected date on the trigger', () => {
    render(<DatePicker aria-label="Runs from" defaultValue={may} />);
    expect(screen.getByRole('button', { name: /runs from/i })).toHaveTextContent('14 May 2026');
  });

  it('opens a grid of days', async () => {
    render(<DatePicker aria-label="Runs from" defaultValue={may} />);
    await userEvent.click(screen.getByRole('button', { name: /runs from/i }));
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('picks a day and closes', async () => {
    const onValueChange = vi.fn();
    render(<DatePicker aria-label="Runs from" defaultValue={may} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: /runs from/i });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('gridcell', { name: /20 May 2026/ }));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 4, 20));
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('walks months with the header buttons', async () => {
    render(<DatePicker aria-label="Runs from" defaultValue={may} />);
    await userEvent.click(screen.getByRole('button', { name: /runs from/i }));
    const title = screen.getByRole('dialog').querySelector('.cal__title') as HTMLElement;
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(title).toHaveTextContent('June 2026');
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(title).toHaveTextContent('May 2026');
  });

  it('opens with ArrowDown and closes with Escape', async () => {
    render(<DatePicker aria-label="Runs from" defaultValue={may} />);
    const trigger = screen.getByRole('button', { name: /runs from/i });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('marks the selected day', async () => {
    render(<DatePicker aria-label="Runs from" defaultValue={may} />);
    await userEvent.click(screen.getByRole('button', { name: /runs from/i }));
    expect(screen.getByRole('gridcell', { name: /14 May 2026/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});

describe('ModeToggle', () => {
  it('swaps its caption when it lights up', async () => {
    render(<ModeToggle name="Sleep" onLabel="Dims at 10:30" offLabel="Off" />);
    const pill = screen.getByRole('button');
    expect(pill).toHaveTextContent('Off');
    await userEvent.click(pill);
    expect(pill).toHaveAttribute('aria-pressed', 'true');
    expect(pill).toHaveTextContent('Dims at 10:30');
  });

  it('can be controlled', async () => {
    const onPressedChange = vi.fn();
    render(<ModeToggle name="Sleep" pressed={false} onPressedChange={onPressedChange} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('lays the rack flat on request', () => {
    const { container, rerender } = render(
      <ModeRack>
        <ModeToggle name="Sleep" />
      </ModeRack>,
    );
    expect(container.querySelector('.stage')).not.toHaveClass('flat');
    rerender(
      <ModeRack flat>
        <ModeToggle name="Sleep" />
      </ModeRack>,
    );
    expect(container.querySelector('.stage')).toHaveClass('flat');
  });
});
