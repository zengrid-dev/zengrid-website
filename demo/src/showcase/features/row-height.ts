import { on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { field, select } from './parts';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

/** Uniform row height: every row shares one pixel height passed as a number. */
function uniformBlock(host: HTMLElement): () => void {
  const columns = teamColumns();
  const data = teamData(1_000);
  const { demo, bar } = addBlock(host, {
    title: 'Uniform Row Height',
    desc: 'A single rowHeight number gives every row the same pitch — the fastest path, since row offsets are pure multiplication.',
    usage: 'createGrid(container, { columns, data, rowHeight: 40 })',
    height: 360,
  });

  let grid: Grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const sel = select([
    { label: 'Compact — 32px', value: '32' },
    { label: 'Default — 40px', value: '40' },
    { label: 'Comfortable — 56px', value: '56' },
  ]);
  sel.value = '40';
  on(sel, 'change', () => {
    destroyGrid(grid);
    grid = createGrid(demo, { columns, data, rowHeight: Number(sel.value) });
  });
  bar.append(field('Row height', sel));
  return () => destroyGrid(grid);
}

/** Variable row height: a number[] gives each row its own pixel height. */
function variableBlock(host: HTMLElement): () => void {
  const columns = teamColumns();
  const data = teamData(1_000);
  const { demo, bar } = addBlock(host, {
    title: 'Variable Row Height',
    desc: 'Passing rowHeight as a number[] sizes each row independently. Here rows alternate between 40px and 72px; the virtual scroller sums the per-row heights to place each row.',
    usage: 'const heights = data.map((_, i) => (i % 2 ? 72 : 40));\ncreateGrid(container, { columns, data, overrides: { rowHeight: heights } })',
    height: 360,
  });

  const uniform = () => createGrid(demo, { columns, data, rowHeight: 44 });
  const varied = () =>
    createGrid(demo, {
      columns,
      data,
      overrides: { rowHeight: data.map((_, i) => (i % 2 ? 72 : 40)) },
    });

  let variable = true;
  let grid: Grid = varied();
  const sel = select([
    { label: 'Alternating 40 / 72', value: 'varied' },
    { label: 'Uniform 44', value: 'uniform' },
  ]);
  on(sel, 'change', () => {
    variable = sel.value === 'varied';
    destroyGrid(grid);
    grid = variable ? varied() : uniform();
  });
  bar.append(field('Height mode', sel));
  return () => destroyGrid(grid);
}

export const build: PageBuild = (host) => {
  const disposers = [uniformBlock(host), variableBlock(host)];
  return () => disposers.forEach((d) => d());
};
