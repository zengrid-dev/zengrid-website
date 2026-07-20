import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

/** Replace the grid's dataset and resync the virtual body to the new row count. */
function applyData(grid: Grid, data: any[][]): void {
  grid.setData(data);
  grid.getStore().exec('lifecycle:syncAfterPipeline');
}

export const build: PageBuild = (host) => {
  const columns = teamColumns();
  const base = teamData(2_000);

  const { demo, bar } = addBlock(host, {
    title: 'Supplying & Replacing Row Data',
    desc: 'Row data is a row-major any[][] passed with grid.setData(). Replacing it swaps the entire dataset and resizes the virtualized body — only the visible slice is ever in the DOM.',
    usage: "grid.setData(rows);\ngrid.getStore().exec('lifecycle:syncAfterPipeline');",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: base, rowHeight: 40 });
  const out = readout('Replace the dataset with the buttons below.');
  const show = (label: string, n: number) =>
    out.set(`${label}  →  rows.count = ${(grid.getStore().get('rows.count') as number).toLocaleString()}  (${n.toLocaleString()} supplied)`);
  show('initial', base.length);

  const btnReset = el('button', 'btn btn-accent', 'Reset (2,000)');
  const btnReverse = el('button', 'btn', 'Reverse order');
  const btnSmall = el('button', 'btn', 'First 50');
  const btnLarge = el('button', 'btn', 'Load 5,000');
  const btnEmpty = el('button', 'btn', 'Empty');

  on(btnReset, 'click', () => {
    const d = teamData(2_000);
    applyData(grid, d);
    show('setData(2,000)', d.length);
  });
  on(btnReverse, 'click', () => {
    const d = [...base].reverse();
    applyData(grid, d);
    show('setData(reversed)', d.length);
  });
  on(btnSmall, 'click', () => {
    const d = base.slice(0, 50);
    applyData(grid, d);
    show('setData(50)', d.length);
  });
  on(btnLarge, 'click', () => {
    const d = teamData(5_000);
    applyData(grid, d);
    show('setData(5,000)', d.length);
  });
  on(btnEmpty, 'click', () => {
    applyData(grid, []);
    show('setData([])', 0);
  });

  bar.append(btnReset, btnReverse, btnSmall, btnLarge, btnEmpty);
  host.append(out.node);

  return () => destroyGrid(grid);
};
