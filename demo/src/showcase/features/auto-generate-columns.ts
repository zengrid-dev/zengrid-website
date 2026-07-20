import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { readout } from './parts';
import type { PageBuild } from '../registry';

type Row = Record<string, unknown>;

// A small object dataset — the shape a REST endpoint might return.
const ROWS: Row[] = [
  { id: 1, name: 'Ada Lovelace', active: true, salary: 142000, joined: new Date('2021-03-01') },
  { id: 2, name: 'Alan Turing', active: false, salary: 158000, joined: new Date('2019-07-12') },
  { id: 3, name: 'Grace Hopper', active: true, salary: 176000, joined: new Date('2020-11-23') },
  { id: 4, name: 'Katherine Johnson', active: true, salary: 133000, joined: new Date('2022-01-09') },
  { id: 5, name: 'Edsger Dijkstra', active: false, salary: 164000, joined: new Date('2018-05-30') },
];

const titleCase = (key: string) => key.replace(/(^|_)(\w)/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase());

/** Infer a ColumnDef per key from the first row's value type. App-side, ~12 lines. */
function inferColumns(rows: Row[]): any[] {
  const sample = rows[0] ?? {};
  return Object.keys(sample).map((field) => {
    const v = sample[field];
    const renderer =
      typeof v === 'number' ? 'number'
      : typeof v === 'boolean' ? 'checkbox'
      : v instanceof Date ? 'date'
      : 'text';
    return { field, header: titleCase(field), width: field === 'name' ? 190 : 130, renderer, sortable: true };
  });
}

export const build: PageBuild = (host) => {
  const b1 = addBlock(host, {
    title: 'Deriving Columns from Data Shape',
    desc:
      'ZenGrid does not auto-generate columns in core — you always pass an explicit column ' +
      'array. That is deliberate: real columns need headers, widths, formatting, and behaviour ' +
      'that raw data can’t infer. When you do want columns from an unknown shape (say, an ad-hoc ' +
      'API response), a dozen lines of app-side inference gets you there: walk the keys of a ' +
      'sample row and choose a renderer from each value’s type. The grid below was built that way.',
    usage:
      "function inferColumns(rows) {\n" +
      "  return Object.keys(rows[0]).map((field) => {\n" +
      "    const v = rows[0][field];\n" +
      "    const renderer = typeof v === 'number' ? 'number'\n" +
      "      : typeof v === 'boolean' ? 'checkbox'\n" +
      "      : v instanceof Date ? 'date' : 'text';\n" +
      "    return { field, header: titleCase(field), renderer, sortable: true };\n" +
      "  });\n" +
      "}",
    height: 300,
  });

  const columns = inferColumns(ROWS);
  // Convert object rows to the row-major any[][] the grid consumes.
  const data = ROWS.map((r) => columns.map((c) => r[c.field]));
  const grid = createGrid(b1.demo, { columns, data });

  const out = readout('');
  out.set(
    'inferred → ' +
      columns.map((c) => `${c.field}:${c.renderer}`).join('  ')
  );
  host.append(out.node);

  return () => destroyGrid(grid);
};
