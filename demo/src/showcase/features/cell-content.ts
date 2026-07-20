import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { addCellStyleOverride } from './cell-style-override';
import { teamColumns, teamData } from '../data/datasets';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

function scrollEl(grid: Grid): HTMLElement | null {
  return (grid.getStore().get('dom.scrollContainer') as HTMLElement) ?? null;
}

export const build: PageBuild = (host) => {
  const columns = teamColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Rendered Cell Types',
    desc: 'Every column uses a purpose-built renderer — text, number, select, progress bar, skill chips, date, and checkbox — over a virtualized body. Scroll freely: only visible cells are in the DOM.',
    usage:
      "{ field: 'completion',\n  renderer: new ProgressBarRenderer({ showValue: true }) }",
    height: 460,
  });

  let rows = 10_000;
  let grid: Grid = createGrid(demo, { columns, data: teamData(rows), rowHeight: 40 });

  const btnTop = el('button', 'btn', 'Top');
  const btnBottom = el('button', 'btn', 'Bottom');
  const btnRows = el('button', 'btn btn-accent', 'Load 100K rows');
  const count = el('span', 'block-desc');
  const renderCount = () => (count.textContent = `${rows.toLocaleString()} rows`);
  renderCount();

  on(btnTop, 'click', () => {
    const s = scrollEl(grid);
    if (s) s.scrollTo({ top: 0, behavior: 'smooth' });
  });
  on(btnBottom, 'click', () => {
    const s = scrollEl(grid);
    if (s) s.scrollTo({ top: s.scrollHeight, behavior: 'smooth' });
  });
  on(btnRows, 'click', () => {
    rows = rows === 10_000 ? 100_000 : 10_000;
    btnRows.textContent = rows === 10_000 ? 'Load 100K rows' : 'Load 10K rows';
    destroyGrid(grid);
    grid = createGrid(demo, { columns, data: teamData(rows), rowHeight: 40 });
    renderCount();
  });

  bar.append(btnTop, btnBottom, btnRows, count);

  const disposeStyleOverride = addCellStyleOverride(host);

  return () => {
    disposeStyleOverride();
    destroyGrid(grid);
  };
};
