import { faker } from '@faker-js/faker';
import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { NumberRenderer } from '@zengrid/core';
import { readout } from './parts';
import type { PageBuild } from '../registry';
import type { CellRef } from '@zengrid/core';

const SERVICES = ['auth', 'billing', 'search', 'ingest', 'notify', 'gateway', 'render', 'sync'];
const REGIONS = ['us-east', 'us-west', 'eu-central', 'ap-south'];
const LOAD = 2;
const LATENCY = 3;

const columns = [
  { field: 'service', header: 'Service', width: 150, renderer: 'text' },
  { field: 'region', header: 'Region', width: 140, renderer: 'text' },
  { field: 'load', header: 'Load %', width: 120, renderer: new NumberRenderer({ maximumFractionDigits: 0 }) },
  { field: 'latency', header: 'Latency ms', width: 140, renderer: new NumberRenderer({ maximumFractionDigits: 0 }) },
];

function rows(n: number): any[][] {
  faker.seed(21);
  return Array.from({ length: n }, (_, i) => [
    `${SERVICES[i % SERVICES.length]}-${i}`,
    faker.helpers.arrayElement(REGIONS),
    faker.number.int({ min: 0, max: 100 }),
    faker.number.int({ min: 5, max: 400 }),
  ]);
}

export const build: PageBuild = (host) => {
  const data = rows(60);

  const { demo, bar } = addBlock(host, {
    title: 'Targeted Cell Updates',
    desc: 'When only values change, mutate the live data array in place and name exactly which cells moved with grid.updateCells([{ row, col }]). Only those cells re-render and the grid is not resized — the fine-grained counterpart to setData.',
    usage: "data[row][col] = value;\ngrid.updateCells([{ row, col }]);",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Update cells with the buttons below.');

  const btnOne = el('button', 'btn btn-accent', 'Update one cell');
  const btnBatch = el('button', 'btn', 'Update 5 cells');
  const btnColumn = el('button', 'btn', 'Update whole Load column');

  on(btnOne, 'click', () => {
    const row = faker.number.int({ min: 0, max: data.length - 1 });
    const next = faker.number.int({ min: 0, max: 100 });
    data[row][LOAD] = next;
    grid.updateCells([{ row, col: LOAD }]);
    out.push(`updateCells([{ row: ${row}, col: ${LOAD} }])  →  load = ${next}`);
  });

  on(btnBatch, 'click', () => {
    const cells: CellRef[] = [];
    for (let i = 0; i < 5; i++) {
      const row = faker.number.int({ min: 0, max: data.length - 1 });
      const col = faker.helpers.arrayElement([LOAD, LATENCY]);
      data[row][col] = faker.number.int({ min: 0, max: col === LOAD ? 100 : 400 });
      cells.push({ row, col });
    }
    grid.updateCells(cells);
    out.push(`updateCells([…${cells.length} cells])  →  one batched re-render`);
  });

  on(btnColumn, 'click', () => {
    const cells: CellRef[] = [];
    for (let row = 0; row < data.length; row++) {
      data[row][LOAD] = faker.number.int({ min: 0, max: 100 });
      cells.push({ row, col: LOAD });
    }
    grid.updateCells(cells);
    out.push(`updateCells([…${cells.length} rows of Load])  →  column refreshed, grid not resized`);
  });

  bar.append(btnOne, btnBatch, btnColumn);
  host.append(out.node);

  return () => destroyGrid(grid);
};
