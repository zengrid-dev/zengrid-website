import { ColumnModel, ColumnPinPlugin } from '@zengrid/core';
import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

export const build: PageBuild = (host) => {
  const b1 = addBlock(host, {
    title: 'Pinning — Model vs. Rendering',
    desc:
      'Pinning is modelled in core: ColumnPinPlugin sets a column’s pinned state to "left" or ' +
      '"right", and that state is tracked and serialised. What is NOT yet wired is the rendering ' +
      'side — the grid body does not currently freeze pinned columns into sticky edges, so ' +
      'pinning has no visual effect on a live grid today. The grid below is a normal grid; the ' +
      'model demo underneath proves the state API works and is ready for a renderer to consume.',
    usage:
      "import { ColumnModel, ColumnPinPlugin } from '@zengrid/core';\n" +
      "const model = new ColumnModel(columns);\n" +
      "const pinning = new ColumnPinPlugin(model);\n" +
      "pinning.pin('col-0', 'left');   // model updated; sticky render not yet wired\n" +
      "model.getColumn('col-0').pinned; // → 'left'",
    height: 300,
  });

  const grid = createGrid(b1.demo, { columns: teamColumns(), data: teamData(400) });

  // Standalone model demo — real API, no grid rendering dependency.
  const model = new ColumnModel(teamColumns());
  const pinning = new ColumnPinPlugin(model);
  const out = readout('Pin/unpin updates the column model’s pinned state.');

  const render = () => {
    const pins = model
      .getColumnsInOrder()
      .filter((c) => c.pinned)
      .map((c) => `${c.field}:${c.pinned}`);
    out.set(pins.length ? `model pinned → ${pins.join('  ')}` : 'model pinned → (none)');
  };

  const pinLeft = el('button', 'btn btn-accent', 'Pin id ← left');
  const pinRight = el('button', 'btn', 'Pin active → right');
  const clear = el('button', 'btn', 'Unpin all');
  on(pinLeft, 'click', () => { pinning.pin('col-0', 'left'); render(); });
  on(pinRight, 'click', () => { pinning.pin('col-10', 'right'); render(); });
  on(clear, 'click', () => { pinning.unpin('col-0'); pinning.unpin('col-10'); render(); });

  b1.bar.append(pinLeft, pinRight, clear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
