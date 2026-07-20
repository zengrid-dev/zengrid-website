import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

// teamData indices: 1 name · 7 salary · 9 joined(Date).

export const build: PageBuild = (host) => {
  const b1 = addBlock(host, {
    title: 'Derived / Calculated Columns',
    desc:
      'ZenGrid ships a formula engine internally, but it is not root-exported yet, so there is ' +
      'no formula: "…" column option today. In practice most calculated columns are simplest as ' +
      'plain derived data: compute the value once when you shape rows for the grid, and give it ' +
      'a normal column. Below, “Tenure” is derived from the join date and “Fully-loaded cost” ' +
      'from salary — both are ordinary number columns fed pre-computed values.',
    usage:
      "const rows = source.map((r) => [\n" +
      "  r.name,\n" +
      "  r.salary,\n" +
      "  yearsSince(r.joined),          // derived\n" +
      "  Math.round(r.salary * 1.3),    // derived\n" +
      "]);\n" +
      "// columns: name, salary, 'Tenure (yrs)', 'Cost' — all standard number/text columns",
    height: 340,
  });

  const columns = [
    { field: 'name', header: 'Name', width: 200, renderer: 'text', sortable: true },
    { field: 'salary', header: 'Salary', width: 140, renderer: 'number', sortable: true },
    { field: 'tenure', header: 'Tenure (yrs)', width: 140, renderer: 'number', sortable: true },
    { field: 'cost', header: 'Fully-loaded Cost', width: 170, renderer: 'number', sortable: true },
  ];

  const now = Date.now();
  const yearsSince = (d: Date) => Math.max(0, Math.round((now - d.getTime()) / (365.25 * 864e5) * 10) / 10);

  const data = teamData(400).map((r) => [
    r[1],
    r[7],
    yearsSince(r[9] as Date),
    Math.round((r[7] as number) * 1.3),
  ]);

  const grid = createGrid(b1.demo, { columns, data });
  const out = readout('Tenure = years since join date · Cost = salary × 1.3, computed per row.');
  host.append(out.node);

  return () => destroyGrid(grid);
};
