import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { field, select, readout } from './parts';
import type { PageBuild } from '../registry';

export const build: PageBuild = (host) => {
  const columns = teamColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Client-Side Pagination',
    desc: 'With pagination enabled the grid slices the post-sort/filter view into pages. These controls drive the public pagination API; sorting a column re-paginates the sorted order.',
    usage:
      "createGrid(container, { columns, data,\n  overrides: { pagination: { enabled: true, pageSize: 25 } } });\ngrid.nextPage(); grid.setPageSize(50);",
    height: 420,
  });

  const grid = createGrid(demo, {
    columns,
    data: teamData(500),
    rowHeight: 40,
    overrides: {
      pagination: { enabled: true, pageSize: 25, pageSizeOptions: [10, 25, 50, 100] },
      onPageChange: () => sync(),
    },
  });

  const out = readout();
  const sync = () => {
    const page = grid.getCurrentPage();
    const total = grid.getTotalPages();
    out.set(`Page ${page + 1} / ${Math.max(1, total)}  ·  ${grid.getPageSize()} rows/page  ·  500 total`);
    btnFirst.disabled = btnPrev.disabled = page <= 0;
    btnNext.disabled = btnLast.disabled = page >= total - 1;
  };

  const btnFirst = el('button', 'btn', '⏮ First') as HTMLButtonElement;
  const btnPrev = el('button', 'btn', '◀ Prev') as HTMLButtonElement;
  const btnNext = el('button', 'btn btn-accent', 'Next ▶') as HTMLButtonElement;
  const btnLast = el('button', 'btn', 'Last ⏭') as HTMLButtonElement;

  on(btnFirst, 'click', () => { grid.firstPage(); sync(); });
  on(btnPrev, 'click', () => { grid.previousPage(); sync(); });
  on(btnNext, 'click', () => { grid.nextPage(); sync(); });
  on(btnLast, 'click', () => { grid.lastPage(); sync(); });

  const sizeSel = select([
    { label: '10 / page', value: '10' },
    { label: '25 / page', value: '25' },
    { label: '50 / page', value: '50' },
    { label: '100 / page', value: '100' },
  ]);
  sizeSel.value = '25';
  on(sizeSel, 'change', () => { grid.setPageSize(Number(sizeSel.value)); sync(); });

  bar.append(btnFirst, btnPrev, btnNext, btnLast, field('Page size', sizeSel));
  host.append(out.node);
  sync();

  return () => destroyGrid(grid);
};
