import * as React from 'react';
import { cx } from '../lib/utils';

export interface Column<Row> {
  key: string;
  header: React.ReactNode;
  /** Omit to render `String(row[key])`. */
  cell?: (row: Row) => React.ReactNode;
  /** Value used for sorting; return a number for numeric or date columns. */
  sortValue?: (row: Row) => string | number;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<Row> {
  rows: Row[];
  columns: Array<Column<Row>>;
  /** Stable identity per row, used for selection. */
  rowId: (row: Row) => string;
  /** Fields searched by the box above the table. */
  searchFields?: (row: Row) => string;
  pageSize?: number;
  selectable?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  emptyMessage?: (query: string) => React.ReactNode;
  'aria-label': string;
  className?: string;
}

type SortState = { key: string; dir: 1 | -1 } | null;

const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 15 6-6 6 6" />
  </svg>
);

/**
 * Sorting, searching, pagination and selection over a plain array. Selection is
 * keyed by id so it survives paging and filtering.
 */
export function DataTable<Row>({
  rows,
  columns,
  rowId,
  searchFields,
  pageSize = 5,
  selectable = false,
  onSelectionChange,
  emptyMessage,
  className,
  ...rest
}: DataTableProps<Row>) {
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<SortState>(null);
  const [page, setPage] = React.useState(1);
  const [picked, setPicked] = React.useState<string[]>([]);

  const view = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = rows;
    if (term && searchFields) {
      list = list.filter((row) => searchFields(row).toLowerCase().includes(term));
    }
    if (sort) {
      const column = columns.find((c) => c.key === sort.key);
      if (column) {
        const value = (row: Row) =>
          column.sortValue
            ? column.sortValue(row)
            : String((row as Record<string, unknown>)[column.key] ?? '').toLowerCase();
        list = [...list].sort((a, b) => {
          const x = value(a);
          const y = value(b);
          return (x < y ? -1 : x > y ? 1 : 0) * sort.dir;
        });
      }
    }
    return list;
  }, [rows, query, sort, columns, searchFields]);

  const pages = Math.max(1, Math.ceil(view.length / pageSize));
  const current = Math.min(page, pages);
  const from = (current - 1) * pageSize;
  const slice = view.slice(from, from + pageSize);

  const setSelection = (next: string[]) => {
    setPicked(next);
    onSelectionChange?.(next);
  };

  const pageIds = slice.map(rowId);
  const onPage = pageIds.filter((id) => picked.includes(id)).length;
  const allOnPage = slice.length > 0 && onPage === slice.length;

  const headerBox = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = onPage > 0 && !allOnPage;
  }, [onPage, allOnPage]);

  const toggleSort = (key: string) => {
    setPage(1);
    setSort((prev) => (prev && prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  };

  return (
    <div className={className}>
      <div className="tbl__top">
        <div className="search">
          <div className="input">
            <input
              type="search"
              aria-label="Search"
              placeholder="Search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {selectable && picked.length > 0 ? (
        <div className="tbl__sel">
          {picked.length} selected
          <span className="spacer" />
          <button type="button" className="push" onClick={() => setSelection([])}>
            Clear
          </button>
        </div>
      ) : null}

      <div className="tbl__wrap">
        <table {...rest}>
          <thead>
            <tr>
              {selectable ? (
                <th scope="col">
                  <label className="ctl" style={{ padding: 0 }}>
                    <input
                      ref={headerBox}
                      type="checkbox"
                      aria-label="Select all on this page"
                      checked={allOnPage}
                      onChange={(event) =>
                        setSelection(
                          event.target.checked
                            ? Array.from(new Set([...picked, ...pageIds]))
                            : picked.filter((id) => !pageIds.includes(id)),
                        )
                      }
                    />
                    <span className="box" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="m5 12.5 4.5 4.5L19 7" />
                      </svg>
                    </span>
                  </label>
                </th>
              ) : null}
              {columns.map((column) => {
                const active = sort?.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}
                    className={column.className}
                  >
                    {column.sortable === false ? (
                      column.header
                    ) : (
                      <button type="button" className="sorter" onClick={() => toggleSort(column.key)}>
                        {column.header}
                        <Chevron />
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => {
              const id = rowId(row);
              const on = picked.includes(id);
              return (
                <tr key={id} className={cx(on && 'on')}>
                  {selectable ? (
                    <td>
                      <label className="ctl" style={{ padding: 0 }}>
                        <input
                          type="checkbox"
                          aria-label={`Select ${id}`}
                          checked={on}
                          onChange={(event) =>
                            setSelection(
                              event.target.checked
                                ? [...picked, id]
                                : picked.filter((value) => value !== id),
                            )
                          }
                        />
                        <span className="box" aria-hidden="true">
                          <svg viewBox="0 0 24 24">
                            <path d="m5 12.5 4.5 4.5L19 7" />
                          </svg>
                        </span>
                      </label>
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.key} className={column.className}>
                      {column.cell
                        ? column.cell(row)
                        : String((row as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {view.length === 0 ? (
          <div className="tbl__empty">
            <p>{emptyMessage ? emptyMessage(query) : `Nothing matches “${query}”.`}</p>
            <button type="button" className="push" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        ) : null}
      </div>

      {view.length > 0 ? (
        <div className="pager">
          <span className="range">
            {from + 1}–{from + slice.length} of {view.length}
          </span>
          <button
            type="button"
            className="pg"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            ‹
          </button>
          {Array.from({ length: pages }, (_, index) => (
            <button
              key={index}
              type="button"
              className="pg"
              aria-current={current === index + 1 ? 'page' : undefined}
              onClick={() => setPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            type="button"
            className="pg"
            aria-label="Next page"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
