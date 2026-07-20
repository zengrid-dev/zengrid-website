import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

function copySelection(grid: Grid): Promise<void> {
  const fn = grid.getGridApi().getMethod('clipboard', 'copy');
  return fn ? (fn() as Promise<void>) ?? Promise.resolve() : Promise.resolve();
}

/** Live config snippet reflecting the current selection mode. */
function configCode(multi: boolean): string {
  return (
    'const grid = new Grid(container, {\n' +
    '  columns, rowCount, colCount,\n' +
    '  enableSelection: true,\n' +
    (multi
      ? '  enableMultiSelection: true, // Ctrl/Cmd+Click to add or remove cells\n});'
      : '});\n// Single selection — click a cell (click it again to clear)')
  );
}

export const build: PageBuild = (host) => {
  const columns = teamColumns();
  const data = teamData(2_000);

  const { demo, bar } = addBlock(host, {
    title: 'Copy Cell Text',
    desc: 'Select a cell or drag a rectangular range, then copy with Ctrl/Cmd+C. Turn on multi-select to Ctrl/Cmd+Click several discontiguous cells and copy them together. Values are written to the clipboard as tab-separated text.',
    usage: "// built-in: Ctrl/Cmd + C on the current selection\ngrid.getGridApi().getMethod('clipboard', 'copy')?.();",
    height: 440,
  });

  let multi = false;
  let grid = createGrid(demo, { columns, data, rowHeight: 40, overrides: { enableMultiSelection: multi } });

  const out = readout('Select cells, then copy.');

  // Live code display for the selection config.
  const code = el('pre', 'usage');
  code.textContent = configCode(multi);
  const codeWrap = el('div', 'usage-wrap');
  codeWrap.append(code);
  host.append(codeWrap, out.node);

  const doCopy = async () => {
    try {
      await copySelection(grid);
      let note = 'Copied selection to clipboard (TSV).';
      try {
        const text = await navigator.clipboard.readText();
        if (text) note = `Copied ${text.split('\n').length} row(s):  ${text.replace(/\t/g, ' | ').slice(0, 120)}`;
      } catch {
        /* clipboard read may be blocked; copy still succeeded */
      }
      out.set(note);
    } catch {
      out.set('Copy failed — select a cell first, then try again.');
    }
  };

  const btnMulti = el('button', 'btn', 'Multi-select: Off');
  const syncMulti = () => {
    btnMulti.textContent = `Multi-select: ${multi ? 'On' : 'Off'}`;
    btnMulti.classList.toggle('is-on', multi);
    code.textContent = configCode(multi);
    out.set(multi ? 'Ctrl/Cmd+Click cells to build a multi-selection.' : 'Select cells, then copy.');
  };
  on(btnMulti, 'click', () => {
    multi = !multi;
    destroyGrid(grid);
    grid = createGrid(demo, { columns, data, rowHeight: 40, overrides: { enableMultiSelection: multi } });
    syncMulti();
  });

  const btnCopy = el('button', 'btn btn-accent', 'Copy selection');
  on(btnCopy, 'click', () => void doCopy());

  bar.append(btnMulti, btnCopy, el('span', 'block-desc', 'or press Ctrl / Cmd + C'));

  return () => destroyGrid(grid);
};
