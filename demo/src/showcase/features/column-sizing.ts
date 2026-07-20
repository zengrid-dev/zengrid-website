import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

const NAME = 1;
const EMAIL = 2;

export const build: PageBuild = (host) => {
  const grids: Array<ReturnType<typeof createGrid>> = [];

  // ---- Block 1: interactive + programmatic resize --------------------------
  const b1 = addBlock(host, {
    title: 'Resizing Columns',
    desc:
      'Every column is resizable by default: hover a header’s right edge and drag. The same ' +
      'widths can be driven programmatically through grid.columns.resize, so persisted or ' +
      'computed layouts apply without user interaction. Widths update the model and re-render ' +
      'only the affected columns.',
    usage:
      "// interactive: enableColumnResize is on by default\n" +
      "grid.columns.resize(1, 240);   // Name → 240px\n" +
      "grid.columns.resize(2, 180);   // Email → 180px",
    height: 320,
  });

  const grid1 = createGrid(b1.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid1);
  const out1 = readout('Drag a header edge, or use the buttons.');

  const wide = el('button', 'btn btn-accent', 'Name → 240');
  const narrow = el('button', 'btn', 'Email → 180');
  on(wide, 'click', () => { grid1.columns.resize(NAME, 240); out1.set('grid.columns.resize(1, 240)'); });
  on(narrow, 'click', () => { grid1.columns.resize(EMAIL, 180); out1.set('grid.columns.resize(2, 180)'); });
  b1.bar.append(wide, narrow);
  host.append(out1.node);

  // ---- Block 2: auto-fit to content ----------------------------------------
  const b2 = addBlock(host, {
    title: 'Auto-Fit to Content',
    desc:
      'Auto-fit measures rendered cell content (and the header) and sets each column to the ' +
      'width it needs — no guessing at pixel values. Fit a single column or the whole grid at ' +
      'once; sampling keeps it fast on large datasets.',
    usage:
      "grid.columns.autoFit(1);   // fit the Name column\n" +
      "grid.columns.autoFitAll(); // fit every column to its content",
    height: 320,
  });

  const grid2 = createGrid(b2.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid2);
  const out2 = readout('Auto-fit sizes columns to their widest visible content.');

  const fitName = el('button', 'btn btn-accent', 'Auto-fit Name');
  const fitAll = el('button', 'btn', 'Auto-fit all');
  on(fitName, 'click', () => { grid2.columns.autoFit(NAME); out2.set('grid.columns.autoFit(1)'); });
  on(fitAll, 'click', () => { grid2.columns.autoFitAll(); out2.set('grid.columns.autoFitAll()'); });
  b2.bar.append(fitName, fitAll);
  host.append(out2.node);

  // ---- Block 3: min/max constraints ----------------------------------------
  const b3 = addBlock(host, {
    title: 'Width Constraints',
    desc:
      'Constraints clamp a column between a minimum and maximum width. They apply to both drag ' +
      'and programmatic resizes, so a layout can guarantee a column never collapses below a ' +
      'readable size or grows past its purpose. Try dragging Name after clamping it.',
    usage:
      "grid.columns.setConstraints(1, { minWidth: 140, maxWidth: 220 });\n" +
      "// per-column defaults can also be set on the ColumnDef: { minWidth, maxWidth }",
    height: 300,
  });

  const grid3 = createGrid(b3.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid3);
  const out3 = readout('Clamp Name, then drag its edge to feel the limits.');

  const clamp = el('button', 'btn btn-accent', 'Clamp Name 140–220');
  const free = el('button', 'btn', 'Remove clamp');
  on(clamp, 'click', () => {
    grid3.columns.setConstraints(NAME, { minWidth: 140, maxWidth: 220 });
    out3.set('setConstraints(1, { minWidth: 140, maxWidth: 220 })');
  });
  on(free, 'click', () => {
    grid3.columns.setConstraints(NAME, { minWidth: 30, maxWidth: 600 });
    out3.set('setConstraints(1, { minWidth: 30, maxWidth: 600 })');
  });
  b3.bar.append(clamp, free);
  host.append(out3.node);

  return () => grids.forEach(destroyGrid);
};
