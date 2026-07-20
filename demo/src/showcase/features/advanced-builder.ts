import { el, on, clear } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { select, readout } from './parts';
import { COL, filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

const COLS = [
  { label: 'Name', value: String(COL.name) },
  { label: 'Department', value: String(COL.department) },
  { label: 'Role', value: String(COL.role) },
  { label: 'Completion', value: String(COL.completion) },
  { label: 'Salary', value: String(COL.salary) },
];
const OPS = [
  { label: 'contains', value: 'contains' },
  { label: 'equals', value: 'equals' },
  { label: 'starts with', value: 'startsWith' },
  { label: '>', value: 'greaterThan' },
  { label: '≥', value: 'greaterThanOrEqual' },
  { label: '<', value: 'lessThan' },
  { label: '≤', value: 'lessThanOrEqual' },
];
const LABEL = (v: number) => COLS.find((c) => +c.value === v)?.label ?? `col ${v}`;
const coerce = (op: string, raw: string) =>
  ['greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'].includes(op) ? Number(raw) : raw;

interface Row { col: HTMLSelectElement; op: HTMLSelectElement; val: HTMLInputElement; node: HTMLElement; }

export const build: PageBuild = (host) => {
  const columns = filterColumns();

  const { demo, bar } = addBlock(host, {
    title: 'Advanced Builder',
    desc: 'Compose several conditions at once. Conditions on the same column combine with the chosen within-column logic (AND / OR); different columns always combine with AND. Each column group is one setColumnFilter call.',
    usage: "grid.setColumnFilter(6, [{ operator: 'lessThan', value: 20 },\n                        { operator: 'greaterThan', value: 90 }], 'OR');",
    height: 460,
  });

  const grid = createGrid(demo, { columns, data: filterData(2_000), rowHeight: 40 });
  const out = readout('Add conditions, choose within-column logic, then Apply.');

  const logicSel = select([{ label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' }]);
  logicSel.value = 'OR';
  const rowsHost = el('div', 'chk-group');
  rowsHost.style.flexDirection = 'column';
  rowsHost.style.alignItems = 'stretch';
  const rows: Row[] = [];

  const addRow = (c = COL.completion, o = 'lessThan', v = '') => {
    const node = el('div', 'demo-bar');
    node.style.marginTop = '0';
    const col = select(COLS); col.value = String(c);
    const op = select(OPS); op.value = o;
    const val = el('input', 'input'); val.value = v; val.placeholder = 'value';
    const del = el('button', 'btn', '✕');
    const row: Row = { col, op, val, node };
    on(del, 'click', () => { rows.splice(rows.indexOf(row), 1); node.remove(); });
    node.append(col, op, val, del);
    rowsHost.append(node);
    rows.push(row);
  };

  const apply = () => {
    grid.clearFilters();
    const logic = logicSel.value as 'AND' | 'OR';
    const groups = new Map<number, Array<{ operator: string; value: any }>>();
    for (const r of rows) {
      if (r.val.value === '') continue;
      const c = Number(r.col.value);
      if (!groups.has(c)) groups.set(c, []);
      groups.get(c)!.push({ operator: r.op.value, value: coerce(r.op.value, r.val.value) });
    }
    const parts: string[] = [];
    for (const [c, conds] of groups) {
      grid.setColumnFilter(c, conds, logic);
      parts.push('(' + conds.map((k) => `${LABEL(c)} ${k.operator} ${k.value}`).join(` ${logic} `) + ')');
    }
    grid.refresh();
    out.set(`${parts.join(' AND ') || 'no conditions'}  →  ${matchLine(grid)}`);
  };

  addRow(COL.completion, 'lessThan', '20');
  addRow(COL.completion, 'greaterThan', '90');

  const btnAdd = el('button', 'btn', '+ Condition');
  const btnApply = el('button', 'btn btn-accent', 'Apply');
  const btnClear = el('button', 'btn', 'Clear');
  on(btnAdd, 'click', () => addRow());
  on(btnApply, 'click', apply);
  on(btnClear, 'click', () => { grid.clearFilters(); grid.refresh(); out.set(matchLine(grid)); });

  const logicField = el('label', 'field');
  logicField.append(el('span', 'field-label', 'Within-column'), logicSel);
  bar.append(logicField, btnAdd, btnApply, btnClear);
  host.append(rowsHost, out.node);

  return () => destroyGrid(grid);
};
