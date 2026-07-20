import { faker } from '@faker-js/faker';
import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { TextEditor, UndoRedoManager } from '@zengrid/core';
import { readout } from './parts';
import type { PageBuild } from '../registry';

const SQUADS = ['Falcons', 'Wolves', 'Titans', 'Comets', 'Sharks'];

const columns = [
  { field: 'name', header: 'Name', width: 200, renderer: 'text', editable: true,
    editor: new TextEditor({ placeholder: 'Full name' }) },
  { field: 'squad', header: 'Squad', width: 160, renderer: 'text', editable: true,
    editor: new TextEditor({ placeholder: 'Squad' }) },
  { field: 'points', header: 'Points', width: 120, renderer: 'number', editable: true,
    editor: 'number', editorOptions: { min: 0, max: 100, step: 1 } },
];

function rows(n: number): any[][] {
  faker.seed(13);
  return Array.from({ length: n }, () => [
    faker.person.fullName(),
    faker.helpers.arrayElement(SQUADS),
    faker.number.int({ min: 0, max: 100 }),
  ]);
}

export const build: PageBuild = (host) => {
  const data = rows(12);

  const { demo, bar } = addBlock(host, {
    title: 'Undo & Redo',
    desc: 'UndoRedoManager keeps a command stack but does not observe the grid on its own — bridge it by recording each edit:commit as a cell edit. undo()/redo() then re-apply the value and re-render the cell. Imported from the @zengrid/core/features/undo-redo subpath.',
    usage:
      "const mgr = new UndoRedoManager({ enableCommandGrouping: false });\ngrid.on('edit:commit', ({ cell, oldValue, newValue }) =>\n  mgr.recordCellEdit(cell.row, cell.col, oldValue, newValue, apply));\nmgr.undo();  mgr.redo();",
    height: 380,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });
  const out = readout('Double-click a cell to edit, then undo/redo below.');

  const mgr = new UndoRedoManager({ enableCommandGrouping: false, maxHistorySize: 50 });
  const apply = (row: number, col: number, value: any): void => {
    data[row][col] = value;
    grid.updateCells([{ row, col }]);
  };

  grid.on('edit:commit', ({ cell, oldValue, newValue }) => {
    mgr.recordCellEdit(cell.row, cell.col, oldValue, newValue, apply);
    sync(`edit  (${cell.row}, ${cell.col})  ${oldValue} → ${newValue}`);
  });

  const btnUndo = el('button', 'btn btn-accent', 'Undo');
  const btnRedo = el('button', 'btn', 'Redo');
  const btnClear = el('button', 'btn', 'Clear history');

  function sync(line?: string): void {
    if (line) out.push(line);
    (btnUndo as HTMLButtonElement).disabled = !mgr.canUndo();
    (btnRedo as HTMLButtonElement).disabled = !mgr.canRedo();
    btnUndo.textContent = `Undo (${mgr.getUndoCount()})`;
    btnRedo.textContent = `Redo (${mgr.getRedoCount()})`;
  }

  on(btnUndo, 'click', () => { if (mgr.undo()) sync('undo()'); });
  on(btnRedo, 'click', () => { if (mgr.redo()) sync('redo()'); });
  on(btnClear, 'click', () => { mgr.clear(); sync('clear()'); });

  const onKey = (e: KeyboardEvent): void => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'z' && !e.shiftKey) { e.preventDefault(); if (mgr.undo()) sync('undo() (Ctrl+Z)'); }
    else if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); if (mgr.redo()) sync('redo() (Ctrl+Shift+Z)'); }
  };
  document.addEventListener('keydown', onKey);

  bar.append(btnUndo, btnRedo, btnClear, el('span', 'muted', 'Ctrl/Cmd+Z undo · Ctrl+Shift+Z / Ctrl+Y redo'));
  host.append(out.node);
  sync();

  return () => {
    document.removeEventListener('keydown', onKey);
    destroyGrid(grid);
  };
};
