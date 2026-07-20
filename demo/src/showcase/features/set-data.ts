import { faker } from '@faker-js/faker';
import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { NumberRenderer } from '@zengrid/core';
import { readout } from './parts';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

const SQUADS = ['Falcons', 'Wolves', 'Titans', 'Comets', 'Sharks', 'Ravens'];

const columns = [
  { field: 'id', header: 'id', width: 72, renderer: 'number' },
  { field: 'name', header: 'Name', width: 200, renderer: 'text' },
  { field: 'squad', header: 'Squad', width: 150, renderer: 'text' },
  { field: 'points', header: 'Points', width: 120, renderer: new NumberRenderer({ maximumFractionDigits: 0 }) },
];

function makeRow(id: number): any[] {
  return [id, faker.person.fullName(), faker.helpers.arrayElement(SQUADS), faker.number.int({ min: 0, max: 100 })];
}

function makeRows(n: number): any[][] {
  faker.seed(7);
  return Array.from({ length: n }, (_, i) => makeRow(i + 1));
}

/** Push the mutated array back to the grid and resize the virtual body. */
function apply(grid: Grid, data: any[][]): void {
  grid.setData(data);
  grid.getStore().exec('lifecycle:syncAfterPipeline');
}

export const build: PageBuild = (host) => {
  let data = makeRows(12);
  let nextId = data.length + 1;

  const { demo, bar } = addBlock(host, {
    title: 'Adding, Removing & Replacing Rows',
    desc: 'grid.setData() replaces the whole dataset in one call, so row-level changes are made by mutating the array (push / unshift / splice) and re-supplying it. The virtual body resizes to the new row count — use this for structural changes; use updateCells for value-only edits.',
    usage: "data.push(newRow);\ngrid.setData(data);\ngrid.getStore().exec('lifecycle:syncAfterPipeline');",
    height: 420,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Mutate the roster with the buttons below.');
  const show = (label: string) =>
    out.push(`${label}  →  rows.count = ${(grid.getStore().get('rows.count') as number).toLocaleString()}`);

  const btnAppend = el('button', 'btn btn-accent', 'Add row (append)');
  const btnInsert = el('button', 'btn', 'Insert at top');
  const btnPop = el('button', 'btn', 'Remove last');
  const btnShift = el('button', 'btn', 'Remove first');
  const btnReplace = el('button', 'btn', 'Replace all (12)');
  const btnEmpty = el('button', 'btn', 'Empty');

  on(btnAppend, 'click', () => {
    data.push(makeRow(nextId++));
    apply(grid, data);
    show('push()');
  });
  on(btnInsert, 'click', () => {
    data.unshift(makeRow(nextId++));
    apply(grid, data);
    show('unshift()');
  });
  on(btnPop, 'click', () => {
    if (!data.length) return;
    data.pop();
    apply(grid, data);
    show('pop()');
  });
  on(btnShift, 'click', () => {
    if (!data.length) return;
    data.shift();
    apply(grid, data);
    show('shift()');
  });
  on(btnReplace, 'click', () => {
    data = makeRows(12);
    nextId = data.length + 1;
    apply(grid, data);
    show('setData(fresh 12)');
  });
  on(btnEmpty, 'click', () => {
    data = [];
    apply(grid, data);
    show('setData([])');
  });

  bar.append(btnAppend, btnInsert, btnPop, btnShift, btnReplace, btnEmpty);
  host.append(out.node);

  return () => destroyGrid(grid);
};
