import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select, readout } from './parts';
import { COL, filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

const COLS = [
  { label: 'Completion', value: String(COL.completion) },
  { label: 'Salary', value: String(COL.salary) },
];

export const build: PageBuild = (host) => {
  const columns = filterColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Between Filter',
    desc: 'An inclusive numeric range in one condition. The "between" operator takes a [min, max] pair and keeps rows whose value falls within — endpoints included.',
    usage: "grid.setColumnFilter(6, [{ operator: 'between', value: [40, 80] }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: filterData(1_000), rowHeight: 40 });
  const out = readout('Set a min and max on a numeric column, then Apply.');

  const colSel = select(COLS);
  const min = el('input', 'input');
  min.type = 'number';
  min.placeholder = 'min';
  const max = el('input', 'input');
  max.type = 'number';
  max.placeholder = 'max';

  const btnApply = el('button', 'btn btn-accent', 'Apply');
  const btnClear = el('button', 'btn', 'Clear');
  let active: number | null = null;

  on(btnApply, 'click', () => {
    if (min.value === '' || max.value === '') return;
    const col = Number(colSel.value);
    const lo = Number(min.value);
    const hi = Number(max.value);
    if (active != null && active !== col) grid.clearColumnFilter(active);
    grid.setColumnFilter(col, [{ operator: 'between', value: [lo, hi] }]);
    active = col;
    grid.refresh();
    out.set(`${COLS.find((c) => +c.value === col)?.label} between [${lo}, ${hi}]  →  ${matchLine(grid)}`);
  });

  on(btnClear, 'click', () => {
    if (active != null) grid.clearColumnFilter(active);
    active = null;
    min.value = max.value = '';
    grid.refresh();
    out.set(matchLine(grid));
  });

  bar.append(field('Column', colSel), field('Min', min), field('Max', max), btnApply, btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
