import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select, readout } from './parts';
import { COL, filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

const OPS = [
  { label: '= equals', value: 'equals' },
  { label: '≠ not equals', value: 'notEquals' },
  { label: '> greater than', value: 'greaterThan' },
  { label: '≥ greater or equal', value: 'greaterThanOrEqual' },
  { label: '< less than', value: 'lessThan' },
  { label: '≤ less or equal', value: 'lessThanOrEqual' },
];
const COLS = [
  { label: 'Completion', value: String(COL.completion) },
  { label: 'Salary', value: String(COL.salary) },
  { label: 'Id', value: String(COL.id) },
];

export const build: PageBuild = (host) => {
  const columns = filterColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Number Filter',
    desc: 'Numeric comparisons on a single column. Values are coerced with Number(), so the operator applies to the underlying numeric value regardless of how the cell is rendered.',
    usage: "grid.setColumnFilter(7, [{ operator: 'greaterThanOrEqual', value: 150000 }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: filterData(1_000), rowHeight: 40 });
  const out = readout('Pick a column and operator, enter a number, then Apply.');

  const colSel = select(COLS);
  const opSel = select(OPS);
  opSel.value = 'greaterThanOrEqual';
  const val = el('input', 'input');
  val.type = 'number';
  val.placeholder = 'e.g. 150000';

  const btnApply = el('button', 'btn btn-accent', 'Apply');
  const btnClear = el('button', 'btn', 'Clear');
  let active: number | null = null;

  on(btnApply, 'click', () => {
    if (val.value === '') return;
    const col = Number(colSel.value);
    const operator = opSel.value;
    const value = Number(val.value);
    if (active != null && active !== col) grid.clearColumnFilter(active);
    grid.setColumnFilter(col, [{ operator, value }]);
    active = col;
    grid.refresh();
    out.set(`${COLS.find((c) => +c.value === col)?.label} ${opSel.options[opSel.selectedIndex].text} ${value}  →  ${matchLine(grid)}`);
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
