import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { field, select } from './parts';
import { COL, filterColumns, filterData, distinct } from './filter-support';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

function codeCard(host: HTMLElement, title: string): HTMLPreElement {
  const wrap = el('div', 'export-card');
  wrap.append(el('div', 'export-title', title));
  const pre = el('pre', 'usage');
  wrap.append(pre);
  host.append(wrap);
  return pre;
}

export const build: PageBuild = (host) => {
  const columns = filterColumns();
  const data = filterData(1_000);

  const { demo, bar } = addBlock(host, {
    title: 'Filter Export',
    desc: 'The active filter state serializes to backend-ready formats. As you change the filters, the REST query string, GraphQL where clause, and parameterized SQL update live from grid.getFilterExports().',
    usage: 'const exp = grid.getFilterExports();\nfetch(`/api/users${exp.rest.queryString}`);',
    height: 380,
  });

  const grid = createGrid(demo, { columns, data, rowHeight: 40 });

  const deptSel = select([{ label: '(any)', value: '' }, ...distinct(data, COL.department).map((d) => ({ label: d, value: d }))]);
  const salary = el('input', 'input');
  salary.type = 'number';
  salary.placeholder = 'min salary';

  const grids = el('div', 'export-grid');
  const restPre = codeCard(grids, 'REST');
  const gqlPre = codeCard(grids, 'GraphQL (where)');
  const sqlPre = codeCard(grids, 'SQL');

  const render = (g: Grid) => {
    const exp = g.getFilterExports();
    if (!exp) {
      restPre.textContent = gqlPre.textContent = sqlPre.textContent = 'No filters applied';
      return;
    }
    restPre.textContent = exp.rest.queryString || '(empty)';
    gqlPre.textContent = JSON.stringify(exp.graphql.where, null, 2);
    sqlPre.textContent = exp.sql.whereClause
      ? `WHERE ${exp.sql.whereClause}\nparams: ${JSON.stringify(exp.sql.positionalParams)}`
      : '(empty)';
  };

  const apply = () => {
    grid.clearFilters();
    if (deptSel.value) grid.setColumnFilter(COL.department, [{ operator: 'equals', value: deptSel.value }]);
    if (salary.value !== '') grid.setColumnFilter(COL.salary, [{ operator: 'greaterThanOrEqual', value: Number(salary.value) }]);
    grid.refresh();
    render(grid);
  };

  on(deptSel, 'change', apply);
  on(salary, 'input', apply);

  bar.append(field('Department', deptSel), field('Min salary', salary));
  host.append(grids);
  render(grid);

  return () => destroyGrid(grid);
};
