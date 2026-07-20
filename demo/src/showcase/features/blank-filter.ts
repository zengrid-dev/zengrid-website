import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { readout } from './parts';
import { COL, filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

export const build: PageBuild = (host) => {
  const columns = filterColumns();
  const data = filterData(1_000);
  // Clear ~1 in 3 emails so the blank / not-blank distinction is demonstrable.
  for (let r = 0; r < data.length; r++) if (r % 3 === 0) data[r][COL.email] = '';

  const { demo, bar } = addBlock(host, {
    title: 'Blank / Not-blank Filter',
    desc: 'Filter by the presence or absence of a value. "blank" keeps rows that are null or empty; "notBlank" keeps rows that have a value. Here roughly a third of the Email cells were cleared to show both sides.',
    usage: "grid.setColumnFilter(2, [{ operator: 'blank' }]);\ngrid.setColumnFilter(2, [{ operator: 'notBlank' }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Show rows whose Email is blank or not-blank.');

  const btnBlank = el('button', 'btn btn-accent', 'Email is blank');
  const btnNotBlank = el('button', 'btn', 'Email is not blank');
  const btnClear = el('button', 'btn', 'Clear');

  const apply = (operator: 'blank' | 'notBlank') => {
    grid.setColumnFilter(COL.email, [{ operator, value: undefined }]);
    grid.refresh();
    out.set(`Email ${operator}  →  ${matchLine(grid)}`);
  };

  on(btnBlank, 'click', () => apply('blank'));
  on(btnNotBlank, 'click', () => apply('notBlank'));
  on(btnClear, 'click', () => {
    grid.clearColumnFilter(COL.email);
    grid.refresh();
    out.set(matchLine(grid));
  });

  bar.append(btnBlank, btnNotBlank, btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
