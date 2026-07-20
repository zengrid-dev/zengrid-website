import { el, on, clear } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select, readout } from './parts';
import { COL, filterColumns, filterData, distinct, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

const COLS = [
  { label: 'Department', value: String(COL.department) },
  { label: 'Role', value: String(COL.role) },
  { label: 'Status', value: String(COL.status) },
];

export const build: PageBuild = (host) => {
  const columns = filterColumns();
  const data = filterData(1_000);

  const { demo, bar } = addBlock(host, {
    title: 'Set / Select Filter',
    desc: 'Pick any subset of the distinct values in a column. The selection compiles to an "in" condition — a row passes when its value is one of the checked options.',
    usage: "grid.setColumnFilter(3, [{ operator: 'in', value: ['Design', 'Product'] }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Check the values to include, then Apply.');

  const colSel = select(COLS);
  const options = el('div', 'chk-group');
  let col = COL.department;

  const boxes = () => Array.from(options.querySelectorAll('input')) as HTMLInputElement[];
  const renderOptions = () => {
    clear(options);
    for (const v of distinct(data, col)) {
      const label = el('label', 'chk');
      const box = el('input');
      box.type = 'checkbox';
      box.value = v;
      box.checked = true;
      label.append(box, document.createTextNode(v));
      options.append(label);
    }
  };
  renderOptions();

  on(colSel, 'change', () => {
    grid.clearColumnFilter(col);
    col = Number(colSel.value);
    renderOptions();
    grid.refresh();
    out.set(matchLine(grid));
  });

  const btnApply = el('button', 'btn btn-accent', 'Apply');
  const btnClear = el('button', 'btn', 'Clear');

  on(btnApply, 'click', () => {
    const picked = boxes().filter((b) => b.checked).map((b) => b.value);
    grid.setColumnFilter(col, [{ operator: 'in', value: picked }]);
    grid.refresh();
    out.set(`${COLS.find((c) => +c.value === col)?.label} in [${picked.join(', ') || '∅'}]  →  ${matchLine(grid)}`);
  });

  on(btnClear, 'click', () => {
    boxes().forEach((b) => (b.checked = true));
    grid.clearColumnFilter(col);
    grid.refresh();
    out.set(matchLine(grid));
  });

  bar.append(field('Column', colSel), btnApply, btnClear);
  host.append(options, out.node);

  return () => destroyGrid(grid);
};
