import { NumberRenderer, ProgressBarRenderer } from '@zengrid/core';
import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

// Column indices in teamColumns order.
const NAME = 1;
const COMPLETION = 6;

export const build: PageBuild = (host) => {
  const grids: Array<ReturnType<typeof createGrid>> = [];

  // ---- Block 1: mutate the live column model -------------------------------
  const b1 = addBlock(host, {
    title: 'Updating Widths, Order & Visibility at Runtime',
    desc:
      'The column array you pass at construction seeds an internal column model. After that, ' +
      'update the model through grid.columns rather than re-creating the grid — width, ' +
      'constraints, order, and visibility all apply live and re-render only what changed.',
    usage:
      "grid.columns.resize(1, 260);                       // set a width\n" +
      "grid.columns.setConstraints(1, { min: 120, max: 320 });\n" +
      "grid.columns.applyState([{ field: 'email', visible: false }], { applyVisibility: true });\n" +
      "grid.columns.autoFitAll();                         // size every column to content",
    height: 340,
  });

  const grid1 = createGrid(b1.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid1);
  const out1 = readout('Use the buttons to update the live columns.');

  const wideName = el('button', 'btn btn-accent', 'Widen Name → 260');
  const autoFit = el('button', 'btn', 'Auto-fit all');
  const hideEmail = el('button', 'btn', 'Hide Email');
  const showEmail = el('button', 'btn', 'Show Email');
  const reset = el('button', 'btn', 'Reset widths');

  on(wideName, 'click', () => {
    grid1.columns.resize(NAME, 260);
    out1.set('grid.columns.resize(1, 260) — Name widened');
  });
  on(autoFit, 'click', () => {
    grid1.columns.autoFitAll();
    out1.set('grid.columns.autoFitAll() — every column sized to its content');
  });
  on(hideEmail, 'click', () => {
    grid1.columns.applyState([{ field: 'email', visible: false }], { applyVisibility: true });
    out1.set('applyState([{ field: "email", visible: false }]) — Email hidden');
  });
  on(showEmail, 'click', () => {
    grid1.columns.applyState([{ field: 'email', visible: true }], { applyVisibility: true });
    out1.set('applyState([{ field: "email", visible: true }]) — Email shown');
  });
  on(reset, 'click', () => {
    grid1.columns.applyState(
      teamColumns().map((c, i) => ({ field: c.field, width: c.width, order: i, visible: true })),
      { applyWidth: true, applyVisibility: true, applyOrder: true }
    );
    out1.set('applyState(defaults) — original layout restored');
  });

  b1.bar.append(wideName, autoFit, hideEmail, showEmail, reset);
  host.append(out1.node);

  // ---- Block 2: swap a cell renderer at runtime ----------------------------
  const b2 = addBlock(host, {
    title: 'Swapping a Renderer at Runtime',
    desc:
      'Cell renderers are resolved from the column definition on each paint, so a column can ' +
      'change how it presents data without a rebuild: mutate its renderer, clear the render ' +
      'cache so pooled cells re-resolve, then refresh. Here the Completion column toggles ' +
      'between a plain number and a progress bar.',
    usage:
      "column.renderer = new ProgressBarRenderer({ min: 0, max: 100 });\n" +
      "grid.clearCache(); // pooled cells hold the previous renderer\n" +
      "grid.refresh();",
    height: 300,
  });

  const cols = teamColumns();
  const grid2 = createGrid(b2.demo, { columns: cols, data: teamData(500) });
  grids.push(grid2);
  const out2 = readout('Completion column currently: progress bar.');

  const asBar = new ProgressBarRenderer({
    min: 0, max: 100, showValue: true, height: 10,
    colorThresholds: [{ value: 0, color: '#ef4444' }, { value: 40, color: '#f59e0b' }, { value: 75, color: '#10b981' }],
  });
  const asNumber = new NumberRenderer();
  const toggle = el('button', 'btn btn-accent', 'Toggle Completion renderer');
  let bar = true;
  on(toggle, 'click', () => {
    bar = !bar;
    cols[COMPLETION].renderer = bar ? asBar : asNumber;
    grid2.clearCache();
    grid2.refresh();
    out2.set(`Completion column currently: ${bar ? 'progress bar' : 'plain number'}.`);
  });

  b2.bar.append(toggle);
  host.append(out2.node);

  return () => grids.forEach(destroyGrid);
};
