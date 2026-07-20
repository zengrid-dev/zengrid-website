import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

/** Render the current left-to-right field order from a state snapshot. */
function orderLine(grid: ReturnType<typeof createGrid>): string {
  return grid.columns
    .getState()
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((c) => c.field)
    .join(' → ');
}

export const build: PageBuild = (host) => {
  const grids: Array<ReturnType<typeof createGrid>> = [];

  // ---- Block 1: drag to reorder --------------------------------------------
  const b1 = addBlock(host, {
    title: 'Drag to Reorder',
    desc:
      'Column drag-and-drop is enabled by default: press a header and drag it left or right to ' +
      'a new position. A drop indicator shows where the column will land. Reordering updates ' +
      'the column model, and both the header row and the body re-flow together.',
    usage:
      "// on by default; disable globally or per column:\n" +
      "new Grid(el, { enableColumnDrag: false });      // whole grid\n" +
      "{ field: 'id', header: 'id', reorderable: false } // single column",
    height: 340,
  });

  const grid1 = createGrid(b1.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid1);
  const out1 = readout('Drag a header to reorder. Order: ' + orderLine(grid1));
  grid1.on('column:dragEnd', () => out1.set('order → ' + orderLine(grid1)));
  host.append(out1.node);

  // ---- Block 2: programmatic reorder ---------------------------------------
  const b2 = addBlock(host, {
    title: 'Programmatic Reorder',
    desc:
      'The same order is addressable in code. applyState with applyOrder moves columns to an ' +
      'explicit arrangement — useful for saved views, role-based layouts, or a “reset to ' +
      'default” action. Order is expressed per field, independent of current positions.',
    usage:
      "grid.columns.applyState([\n" +
      "  { field: 'name', order: 0 },\n" +
      "  { field: 'salary', order: 1 },\n" +
      "  { field: 'id', order: 2 },\n" +
      "], { applyOrder: true });",
    height: 340,
  });

  const grid2 = createGrid(b2.demo, { columns: teamColumns(), data: teamData(500) });
  grids.push(grid2);
  const out2 = readout('Order: ' + orderLine(grid2));

  const fields = teamColumns().map((c) => c.field);
  const idFirst = el('button', 'btn btn-accent', 'Name & Salary first');
  const reset = el('button', 'btn', 'Reset order');
  on(idFirst, 'click', () => {
    // Put name, then salary, then the rest in their original relative order.
    const front = ['name', 'salary'];
    const rest = fields.filter((f) => !front.includes(f));
    const ordered = [...front, ...rest];
    grid2.columns.applyState(ordered.map((f, i) => ({ field: f, order: i })), { applyOrder: true });
    out2.set('order → ' + orderLine(grid2));
  });
  on(reset, 'click', () => {
    grid2.columns.applyState(fields.map((f, i) => ({ field: f, order: i })), { applyOrder: true });
    out2.set('order → ' + orderLine(grid2));
  });
  b2.bar.append(idFirst, reset);
  host.append(out2.node);

  return () => grids.forEach(destroyGrid);
};
