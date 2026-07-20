import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select, readout } from './parts';
import { COL, filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

const OPS = [
  { label: 'After', value: 'after' },
  { label: 'Before', value: 'before' },
  { label: 'Between', value: 'between' },
];

export const build: PageBuild = (host) => {
  const columns = filterColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Date Filter',
    desc: 'Compare a date column against one or two reference dates. Date cells coerce to their timestamp, so after / before / between operate chronologically.',
    usage:
      "grid.setColumnFilter(9, [{ operator: 'greaterThan', value: new Date('2022-01-01') }]);\n" +
      "grid.setColumnFilter(9, [{ operator: 'between', value: [from, to] }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: filterData(1_000), rowHeight: 40 });
  const out = readout('Pick an operator and date(s) on the Joined column, then Apply.');

  const opSel = select(OPS);
  const from = el('input', 'input');
  from.type = 'date';
  const to = el('input', 'input');
  to.type = 'date';

  const syncTo = () => (to.style.display = opSel.value === 'between' ? '' : 'none');
  on(opSel, 'change', syncTo);
  syncTo();

  const btnApply = el('button', 'btn btn-accent', 'Apply');
  const btnClear = el('button', 'btn', 'Clear');

  on(btnApply, 'click', () => {
    if (!from.value) return;
    const op = opSel.value;
    const a = new Date(from.value);
    let label: string;
    if (op === 'between') {
      if (!to.value) return;
      grid.setColumnFilter(COL.joined, [{ operator: 'between', value: [a, new Date(to.value)] }]);
      label = `Joined between ${from.value} and ${to.value}`;
    } else {
      const operator = op === 'after' ? 'greaterThan' : 'lessThan';
      grid.setColumnFilter(COL.joined, [{ operator, value: a }]);
      label = `Joined ${op} ${from.value}`;
    }
    grid.refresh();
    out.set(`${label}  →  ${matchLine(grid)}`);
  });

  on(btnClear, 'click', () => {
    grid.clearColumnFilter(COL.joined);
    grid.refresh();
    out.set(matchLine(grid));
  });

  bar.append(field('Operator', opSel), field('From', from), field('To', to), btnApply, btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
