import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { readout } from './parts';
import { TextEditor } from '@zengrid/core';
import { editorRows, pick } from './editors-support';
import type { PageBuild } from '../registry';
import type { Grid, CellRef } from '@zengrid/core';

const at = (cell: CellRef) => `(${cell.row}, ${cell.col})`;
const show = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));

/** Text editor that rejects anything without an "@" — drives the validation demo. */
const emailEditor = () =>
  new TextEditor({
    type: 'email',
    required: true,
    placeholder: 'name@company.com',
    validator: (v) => String(v).includes('@') || 'Email must contain “@”',
  });

const columns = [
  { field: 'name', header: 'Name', width: 200, renderer: 'text', editable: true,
    editor: new TextEditor({ placeholder: 'Full name' }) },
  { field: 'age', header: 'Age', width: 110, renderer: 'number', editable: true,
    editor: 'number', editorOptions: { min: 18, max: 72, step: 1 } },
  { field: 'email', header: 'Email (validated)', width: 260, renderer: 'text', editable: true,
    editor: emailEditor() },
];

export const build: PageBuild = (host) => {
  const rows = editorRows(300).map((r, i) => [r[0], r[1], `user${i + 1}@team.dev`]);

  const { demo, bar } = addBlock(host, {
    title: 'Edit Lifecycle & Validation',
    desc: 'Editing emits a lifecycle: edit:start when an editor opens, edit:commit on a changed value, edit:cancel on Escape, and edit:end whichever way it closes. The Email column rejects any value without an “@”, blocking the commit until it is fixed.',
    usage:
      "grid.on('edit:start',  ({ cell, value }) => …)\ngrid.on('edit:commit', ({ cell, oldValue, newValue }) => …)\ngrid.on('edit:cancel', ({ cell }) => …)\ngrid.on('edit:end',    ({ cell, cancelled }) => …)",
    height: 320,
  });

  const grid: Grid = createGrid(demo, { columns, data: pick(rows, [0, 1, 2]), rowHeight: 40 });
  const out = readout('Double-click a cell to begin an edit.');

  grid.on('edit:start', ({ cell, value }) => out.push(`start   ${at(cell)}  = ${show(value)}`));
  grid.on('edit:commit', ({ cell, oldValue, newValue }) =>
    out.push(`commit  ${at(cell)}  ${show(oldValue)} → ${show(newValue)}`));
  grid.on('edit:cancel', ({ cell }) => out.push(`cancel  ${at(cell)}`));
  grid.on('edit:end', ({ cell, cancelled }) =>
    out.push(`end     ${at(cell)}  ${cancelled ? 'cancelled' : 'committed'}`));

  const cancelBtn = el('button', 'btn', 'Cancel current edit');
  on(cancelBtn, 'click', () => grid.getGridApi().getMethod('editing', 'cancelEdit')?.());

  bar.append(cancelBtn, el('span', 'muted', 'Enter commits · Esc cancels · commit fires only when the value changes'));
  host.append(out.node);

  return () => destroyGrid(grid);
};
