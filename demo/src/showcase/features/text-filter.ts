import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select, readout } from './parts';
import { COL, filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

const OPS = [
  { label: 'Contains', value: 'contains' },
  { label: 'Does not contain', value: 'notContains' },
  { label: 'Equals', value: 'equals' },
  { label: 'Starts with', value: 'startsWith' },
  { label: 'Ends with', value: 'endsWith' },
];
const COLS = [
  { label: 'Name', value: String(COL.name) },
  { label: 'Email', value: String(COL.email) },
  { label: 'Department', value: String(COL.department) },
  { label: 'Role', value: String(COL.role) },
];

export const build: PageBuild = (host) => {
  const columns = filterColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Text Filter',
    desc: 'String comparisons on a single column — contains, equals, starts-with, ends-with. Matching is case-insensitive over the raw cell text.',
    usage: "grid.setColumnFilter(1, [{ operator: 'contains', value: 'lee' }]);\ngrid.clearColumnFilter(1);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: filterData(1_000), rowHeight: 40 });
  const out = readout('Choose a column, operator, and value, then Apply.');

  const colSel = select(COLS);
  const opSel = select(OPS);
  const val = el('input', 'input');
  val.placeholder = 'e.g. lee';

  const btnApply = el('button', 'btn btn-accent', 'Apply');
  const btnClear = el('button', 'btn', 'Clear');
  let active: number | null = null;

  on(btnApply, 'click', () => {
    const col = Number(colSel.value);
    const operator = opSel.value;
    const value = val.value;
    if (active != null && active !== col) grid.clearColumnFilter(active);
    grid.setColumnFilter(col, [{ operator, value }]);
    active = col;
    grid.refresh();
    out.set(`${COLS.find((c) => +c.value === col)?.label} ${operator} "${value}"  →  ${matchLine(grid)}`);
  });

  on(btnClear, 'click', () => {
    if (active != null) grid.clearColumnFilter(active);
    active = null;
    val.value = '';
    grid.refresh();
    out.set(matchLine(grid));
  });

  bar.append(field('Column', colSel), field('Operator', opSel), field('Value', val), btnApply, btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
