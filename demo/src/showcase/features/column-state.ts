import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';
import type { ColumnStateSnapshot } from '@zengrid/core';

export const build: PageBuild = (host) => {
  const grids: Array<ReturnType<typeof createGrid>> = [];

  const b1 = addBlock(host, {
    title: 'Capture & Restore Column State',
    desc:
      'Column state is a serialisable snapshot of each column’s width, visibility, and order. ' +
      'Read it with grid.columns.getState() to persist a user’s layout, and re-apply it with ' +
      'applyState() to restore that view later — on the same grid or a fresh one. Each facet ' +
      '(width / visibility / order) can be applied independently.',
    usage:
      "const saved = grid.columns.getState();\n" +
      "// … later, or on a new grid with the same fields …\n" +
      "grid.columns.applyState(saved, { applyWidth: true, applyVisibility: true, applyOrder: true });",
    height: 360,
  });

  const grid = createGrid(b1.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid);
  const out = readout('Rearrange the grid, snapshot it, then restore.');

  let saved: ColumnStateSnapshot[] | null = null;

  const show = (label: string) => {
    const state = grid.columns
      .getState()
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const summary = state
      .map((c) => `${c.field}:${Math.round(c.width ?? 0)}${c.visible === false ? '·hidden' : ''}`)
      .join('  ');
    out.set(`${label}  —  ${summary}`);
  };
  show('current state');

  const snapshot = el('button', 'btn btn-accent', 'Snapshot state');
  const scramble = el('button', 'btn', 'Scramble layout');
  const restore = el('button', 'btn', 'Restore snapshot');

  on(snapshot, 'click', () => {
    saved = grid.columns.getState();
    restore.disabled = false;
    show('snapshot saved');
  });
  on(scramble, 'click', () => {
    // Hide email, widen name, and move salary to the front.
    grid.columns.applyState(
      [
        { field: 'salary', order: 0, width: 130 },
        { field: 'name', order: 1, width: 220 },
        { field: 'email', visible: false },
      ],
      { applyWidth: true, applyVisibility: true, applyOrder: true }
    );
    show('scrambled');
  });
  on(restore, 'click', () => {
    if (!saved) return;
    grid.columns.applyState(saved, { applyWidth: true, applyVisibility: true, applyOrder: true });
    show('restored');
  });

  restore.disabled = true;
  b1.bar.append(snapshot, scramble, restore);
  host.append(out.node);

  return () => grids.forEach(destroyGrid);
};
