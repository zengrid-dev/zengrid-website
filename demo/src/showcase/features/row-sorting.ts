import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';
import type { SortState } from '@zengrid/core';

// Data-column indices in teamColumns order.
const COL = { name: 1, department: 3, salary: 7 };
const DIR = (d: SortState['direction']) => (d === 'asc' ? '↑' : d === 'desc' ? '↓' : '—');
const FIELD = ['id', 'name', 'email', 'department', 'role', 'status', 'completion', 'salary', 'skills', 'joined', 'active'];

export const build: PageBuild = (host) => {
  const columns = teamColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Single & Multi-Column Sorting',
    desc: 'Click any sortable header to cycle ascending → descending → unsorted. Sorting runs over the full dataset, not just the visible rows. Multi-column sort composes several keys with a priority order.',
    usage:
      "grid.toggleSort(colIndex);\ngrid.sort.apply([{ column: 3, direction: 'asc', sortIndex: 0 },\n                 { column: 7, direction: 'desc', sortIndex: 1 }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: teamData(1_000), rowHeight: 40 });
  const out = readout('Sort via the headers or the buttons below.');

  const describe = (state: SortState[]) =>
    state.length
      ? state
          .slice()
          .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
          .map((s) => `${FIELD[s.column] ?? `col ${s.column}`} ${DIR(s.direction)}`)
          .join('  ·  ')
      : 'unsorted';

  grid.on('sort:change', ({ sortState }) => out.set(`sortState  →  ${describe(sortState)}`));

  const btnName = el('button', 'btn btn-accent', 'Toggle Name');
  const btnSalary = el('button', 'btn', 'Toggle Salary');
  const btnMulti = el('button', 'btn', 'Dept ↑ then Salary ↓');
  const btnClear = el('button', 'btn', 'Clear');

  on(btnName, 'click', () => grid.toggleSort(COL.name));
  on(btnSalary, 'click', () => grid.toggleSort(COL.salary));
  on(btnMulti, 'click', () =>
    grid.sort.apply([
      { column: COL.department, direction: 'asc', sortIndex: 0 },
      { column: COL.salary, direction: 'desc', sortIndex: 1 },
    ])
  );
  on(btnClear, 'click', () => grid.clearSort());

  bar.append(btnName, btnSalary, btnMulti, btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
