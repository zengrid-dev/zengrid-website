import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select, readout } from './parts';
import { COL, filterColumns, filterData, distinct } from './filter-support';
import type { PageBuild } from '../registry';

interface Cond { col: number; op: string; value: any; }

// Simulated "server": filters the master table for the requested window.
function serverQuery(master: any[][], conds: Cond[], startRow: number, endRow: number) {
  const match = (row: any[]) =>
    conds.every((c) => {
      const v = row[c.col];
      if (c.op === 'equals') return String(v) === String(c.value);
      if (c.op === 'contains') return String(v).toLowerCase().includes(String(c.value).toLowerCase());
      if (c.op === 'greaterThanOrEqual') return Number(v) >= Number(c.value);
      return true;
    });
  const filtered = conds.length ? master.filter(match) : master;
  return { data: filtered.slice(startRow, endRow), totalRows: filtered.length };
}

export const build: PageBuild = (host) => {
  const columns = filterColumns();
  const master = filterData(5_000); // lives only on the "server"

  const { demo, bar } = addBlock(host, {
    title: 'Backend Filter Mode',
    desc: 'With dataMode: "backend" the grid never filters locally — each filter change fires onDataRequest with the query state, and the grid renders only the rows the server returns. The master table here lives outside the grid; a simulated server answers each request.',
    usage:
      "new Grid(el, { dataMode: 'backend', onDataRequest: async (req) => {\n" +
      "  const { data, totalRows } = await api.query(req.query, req.startRow, req.endRow);\n" +
      "  return { data, totalRows, startRow: req.startRow, endRow: req.endRow };\n} });",
    height: 440,
  });

  const out = readout('Filters are sent to the server; the grid shows the response.');
  let conds: Cond[] = [];
  let requests = 0;

  const grid = createGrid(demo, {
    columns,
    data: master.slice(0, 100),
    rowHeight: 40,
    overrides: {
      dataMode: 'backend',
      onDataRequest: async (req: any) => {
        requests++;
        const { data, totalRows } = serverQuery(master, conds, req.startRow, req.endRow);
        out.set(`request #${requests}  rows ${req.startRow}–${req.endRow}  →  server returned ${totalRows.toLocaleString()} matching`);
        return { data, totalRows, startRow: req.startRow, endRow: req.endRow };
      },
    },
  });

  const deptSel = select([{ label: '(any)', value: '' }, ...distinct(master, COL.department).map((d) => ({ label: d, value: d }))]);
  const salary = el('input', 'input');
  salary.type = 'number';
  salary.placeholder = 'min salary';

  const apply = () => {
    conds = [];
    if (deptSel.value) conds.push({ col: COL.department, op: 'equals', value: deptSel.value });
    if (salary.value !== '') conds.push({ col: COL.salary, op: 'greaterThanOrEqual', value: Number(salary.value) });
    // Drive the grid's filter state so it delegates a fresh backend request.
    grid.clearFilters();
    for (const c of conds) grid.setColumnFilter(c.col, [{ operator: c.op, value: c.value }]);
    if (conds.length === 0) grid.getGridApi().getMethod('data', 'reload')?.();
  };

  on(deptSel, 'change', apply);
  on(salary, 'input', apply);

  bar.append(field('Department', deptSel), field('Min salary', salary));
  host.append(out.node);

  return () => destroyGrid(grid);
};
