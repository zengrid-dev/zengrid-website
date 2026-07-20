import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { field, readout } from './parts';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

const FIELDS = ['id', 'name', 'email', 'department', 'role', 'status', 'completion', 'salary', 'skills', 'joined', 'active'];

function cellText(value: unknown): string {
  if (Array.isArray(value)) return value.map((c: any) => c?.label ?? c).join(', ');
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

/** Assemble one row as a field→value record via grid.getData(row, col). */
function readRow(grid: Grid, row: number): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  FIELDS.forEach((f, col) => (rec[f] = cellText(grid.getData(row, col))));
  return rec;
}

export const build: PageBuild = (host) => {
  const columns = teamColumns();
  const data = teamData(2_000);

  const { demo, bar } = addBlock(host, {
    title: 'Accessing Rows',
    desc: 'Read rows through the data accessor with grid.getData(row, col), or reach the raw row array via the store with getStore().getRow(index). Click a cell to read its row, or enter an index below.',
    usage: 'grid.getData(row, col);\ngrid.getStore().getRow(index);\ngrid.getStore().get(\'rows.count\');',
    height: 420,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Click a cell or read a row by index.');

  const emit = (row: number) => {
    const rec = readRow(grid, row);
    out.set(`getRow(${row})  →  ${JSON.stringify(rec)}`);
  };

  grid.on('cell:click', ({ cell }) => emit(cell.row));

  const rowInput = el('input', 'input') as HTMLInputElement;
  rowInput.type = 'number';
  rowInput.min = '0';
  rowInput.max = String(data.length - 1);
  rowInput.value = '0';
  rowInput.style.minWidth = '90px';

  const btnRead = el('button', 'btn btn-accent', 'Read row');
  on(btnRead, 'click', () => {
    const row = Math.min(Math.max(0, Number(rowInput.value) || 0), data.length - 1);
    emit(row);
  });

  const btnCount = el('button', 'btn', 'Row count');
  on(btnCount, 'click', () =>
    out.set(`getStore().get('rows.count')  →  ${(grid.getStore().get('rows.count') as number).toLocaleString()}`)
  );

  bar.append(field('Row index', rowInput), btnRead, btnCount);
  host.append(out.node);

  return () => destroyGrid(grid);
};
