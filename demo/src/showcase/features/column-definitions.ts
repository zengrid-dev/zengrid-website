import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

// teamData field order: 0 id · 1 name · 2 email · 3 department · 4 role ·
// 5 status · 6 completion · 7 salary · 8 skills · 9 joined · 10 active.

export const build: PageBuild = (host) => {
  const grids: Array<ReturnType<typeof createGrid>> = [];

  // ---- Block 1: anatomy of a ColumnDef -------------------------------------
  const b1 = addBlock(host, {
    title: 'Anatomy of a Column',
    desc:
      'A grid is configured by an array of ColumnDef objects — one per visual column. ' +
      'Each definition binds a data field to a header, a width, and a renderer, and opts ' +
      'the column into behaviours like sorting and resizing. Columns render left-to-right ' +
      'in array order; the grid only needs as many definitions as you want shown.',
    usage:
      "const columns = [\n" +
      "  { field: 'id',    header: 'id',      width: 72,  renderer: 'number', sortable: true },\n" +
      "  { field: 'name',  header: 'Name',    width: 180, renderer: 'text',   sortable: true },\n" +
      "  { field: 'email', header: 'Email',   width: 260, renderer: 'text' },\n" +
      "];\n" +
      "new Grid(container, { columns, colWidth: columns.map(c => c.width), /* … */ });",
    height: 300,
  });
  grids.push(createGrid(b1.demo, { columns: teamColumns().slice(0, 5), data: teamData(200) }));

  // ---- Block 2: per-column behaviour flags ---------------------------------
  const b2 = addBlock(host, {
    title: 'Per-Column Behaviour Flags',
    desc:
      'Behaviour is opt-in per column, so one grid can mix interactive and locked columns. ' +
      'Below: “id” is pinned in place (resizable:false, reorderable:false) and width-clamped; ' +
      '“Name” is sortable and free to resize; “Salary” is sortable with a minimum width. Try ' +
      'dragging a header to reorder, and drag a column edge to resize — “id” resists both.',
    usage:
      "{ field: 'id',     header: 'id',     width: 72,  resizable: false, reorderable: false },\n" +
      "{ field: 'name',   header: 'Name',   width: 180, sortable: true,  minWidth: 120 },\n" +
      "{ field: 'salary', header: 'Salary', width: 120, sortable: true,  minWidth: 90, maxWidth: 240,\n" +
      "  renderer: 'number' }",
    height: 340,
  });

  const cols = teamColumns();
  const locked = [
    { ...cols[0], resizable: false, reorderable: false, minWidth: 72, maxWidth: 72 },
    { ...cols[1], minWidth: 120 },
    { ...cols[3] },
    { ...cols[7], minWidth: 90, maxWidth: 240 },
  ];
  // Project data columns to match the picked fields (id, name, department, salary).
  const pick = [0, 1, 3, 7];
  const projected = teamData(200).map((row) => pick.map((i) => row[i]));
  const grid2 = createGrid(b2.demo, { columns: locked, data: projected });
  grids.push(grid2);

  const out = readout('Reorder or resize the headers to see which columns are locked.');
  grid2.on('sort:change', ({ sortState }) =>
    out.set(sortState.length ? `sorted → column ${sortState[0].column} ${sortState[0].direction}` : 'unsorted')
  );
  host.append(out.node);

  return () => grids.forEach(destroyGrid);
};
