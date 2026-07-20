import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { readout } from './parts';
import { filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

export const build: PageBuild = (host) => {
  const columns = filterColumns();
  const data = filterData(1_000);

  const { demo, bar } = addBlock(host, {
    title: 'Quick Filter',
    desc: 'One search box matches text across every column at once. Type to narrow the grid; the match runs over the whole dataset, not just the rows currently on screen.',
    usage: "grid.setQuickFilter('engineering');\ngrid.clearQuickFilter();",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Type to search across all columns.');

  const input = el('input', 'input');
  input.type = 'search';
  input.placeholder = 'Search name, email, department…';

  const report = (q: string) =>
    out.set(q ? `quickFilter "${q}"  →  ${matchLine(grid)}` : matchLine(grid));

  on(input, 'input', () => {
    const q = input.value.trim();
    if (q) grid.setQuickFilter(q);
    else grid.clearQuickFilter();
    grid.refresh();
    report(q);
  });

  const btnClear = el('button', 'btn', 'Clear');
  on(btnClear, 'click', () => {
    input.value = '';
    grid.clearQuickFilter();
    grid.refresh();
    report('');
  });

  report('');
  bar.append(input, btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
