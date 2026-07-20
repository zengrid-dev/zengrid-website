import { faker } from '@faker-js/faker';
import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { NumberRenderer } from '@zengrid/core';
import { readout } from './parts';
import type { PageBuild } from '../registry';

const SERVICES = ['auth', 'billing', 'search', 'ingest', 'notify', 'gateway', 'render', 'sync', 'queue', 'cache'];
const LOAD = 1; // column index of "load" in the row tuple

function rows(n: number): any[][] {
  faker.seed(55);
  return Array.from({ length: n }, (_, i) => [
    `${SERVICES[i % SERVICES.length]}-${i}`,
    faker.number.int({ min: 0, max: 100 }),
    faker.number.int({ min: 0, max: 40 }),
  ]);
}

const columns = [
  { field: 'service', header: 'Service', width: 180, renderer: 'text' },
  { field: 'load', header: 'Load %', width: 130, renderer: new NumberRenderer({ maximumFractionDigits: 0 }) },
  { field: 'errors', header: 'Errors', width: 120, renderer: new NumberRenderer({ maximumFractionDigits: 0 }) },
];

export const build: PageBuild = (host) => {
  const data = rows(300);

  const { demo, bar } = addBlock(host, {
    title: 'Refreshing the View',
    desc: 'The grid reads from the live data array. After mutating values, tell the grid what changed: updateCells() re-renders specific cells, refresh() re-renders the visible viewport, and clearCache() drops cached renderer output.',
    usage: "grid.updateCells([{ row, col }]);\ngrid.refresh();\ngrid.clearCache();",
    height: 420,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Mutate the data, then refresh.');

  const btnCell = el('button', 'btn btn-accent', 'Update one cell');
  on(btnCell, 'click', () => {
    const row = faker.number.int({ min: 0, max: 8 });
    const next = faker.number.int({ min: 0, max: 100 });
    data[row][LOAD] = next;
    grid.updateCells([{ row, col: LOAD }]);
    out.push(`updateCells([{ row: ${row}, col: ${LOAD} }])  →  load = ${next}`);
  });

  const btnAll = el('button', 'btn', 'Bump all loads');
  on(btnAll, 'click', () => {
    for (const r of data) r[LOAD] = Math.min(100, (r[LOAD] as number) + faker.number.int({ min: 1, max: 15 }));
    grid.refresh();
    out.push('refresh()  →  re-rendered visible viewport after bulk mutation');
  });

  const btnCache = el('button', 'btn', 'Clear cache + refresh');
  on(btnCache, 'click', () => {
    grid.clearCache();
    grid.refresh();
    out.push('clearCache() + refresh()  →  dropped cached renderer output');
  });

  const btnHeaders = el('button', 'btn', 'Refresh headers');
  on(btnHeaders, 'click', () => {
    grid.refreshHeaders();
    out.push('refreshHeaders()  →  re-rendered the header row');
  });

  bar.append(btnCell, btnAll, btnCache, btnHeaders);
  host.append(out.node);

  return () => destroyGrid(grid);
};
