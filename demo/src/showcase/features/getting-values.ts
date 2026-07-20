import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { field, readout } from './parts';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

const FIELDS = ['id', 'name', 'email', 'department', 'role', 'status', 'completion', 'salary', 'skills', 'joined', 'active'];

/** Read a full row as a field→value record via grid.getData(row, col). */
function readRow(grid: Grid, row: number): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  FIELDS.forEach((f, col) => (rec[f] = grid.getData(row, col)));
  return rec;
}

function preview(value: unknown): string {
  if (Array.isArray(value)) return value.map((c: any) => c?.label ?? c).join(', ');
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export const build: PageBuild = (host) => {
  const columns = teamColumns();
  const data = teamData(2_000);

  const { demo, bar } = addBlock(host, {
    title: 'Reading Cell Values',
    desc: 'Every value is read through the grid’s data accessor. Click any cell to read its value with grid.getData(row, col); the row below is assembled by reading each column of that row.',
    usage: "const value = grid.getData(row, col);\ngrid.on('cell:click', ({ cell, value }) => …)",
    height: 420,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Click a cell to read its value.');

  grid.on('cell:click', ({ cell, value }) => {
    const field = FIELDS[cell.col] ?? `col ${cell.col}`;
    out.set(`getData(${cell.row}, ${cell.col})  →  ${field} = ${preview(value)}`);
  });

  const rowInput = el('input', 'input') as HTMLInputElement;
  rowInput.type = 'number';
  rowInput.min = '0';
  rowInput.max = String(data.length - 1);
  rowInput.value = '0';
  rowInput.style.minWidth = '90px';

  const btnRead = el('button', 'btn btn-accent', 'Read row');
  on(btnRead, 'click', () => {
    const row = Math.min(Math.max(0, Number(rowInput.value) || 0), data.length - 1);
    const rec = readRow(grid, row);
    out.set(`row ${row}  →  ${JSON.stringify(rec, (_k, v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))}`);
  });

  bar.append(field('Row index', rowInput), btnRead);
  host.append(out.node);

  return () => destroyGrid(grid);
};
