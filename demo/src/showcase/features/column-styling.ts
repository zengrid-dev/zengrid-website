import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

const PICK = [1, 3, 7, 6]; // name, department, salary, completion

export const build: PageBuild = (host) => {
  const columns = [
    { field: 'name', width: 190, renderer: 'text', sortable: true,
      header: { text: 'Name', type: 'sortable', sortIndicator: { show: true, position: 'trailing' } } },
    { field: 'department', width: 170, renderer: 'text',
      header: { text: 'Department', type: 'text', className: 'sc-hdr-accent' } },
    { field: 'salary', width: 140, renderer: 'number', sortable: true,
      header: { text: 'Salary', type: 'sortable', sortIndicator: { show: true, position: 'trailing' },
        style: { color: '#0e7490', fontWeight: '700', letterSpacing: '0.02em' } } },
    { field: 'completion', width: 150, renderer: 'number',
      header: { text: 'Completion', type: 'text', className: 'sc-hdr-muted' } },
  ];

  const b1 = addBlock(host, {
    title: 'Styling Headers',
    desc:
      'Every header accepts a className and an inline style object, so individual columns can be ' +
      'branded, colour-coded, or emphasised without touching global CSS. Below, Department uses ' +
      'a class, Salary uses inline styles, and Completion is muted — all through the header ' +
      'config. Classes are the better choice when the same look repeats across grids.',
    usage:
      "{ header: { text: 'Department', className: 'sc-hdr-accent' } }\n" +
      "{ header: { text: 'Salary', style: { color: '#0e7490', fontWeight: '700' } } }",
    height: 300,
  });

  const grid = createGrid(b1.demo, { columns, data: teamData(400).map((r) => PICK.map((i) => r[i])) });
  host.append(readout('Header styling is per-column via className / style.').node);

  // ---- Honest gap: header height is not configurable -----------------------
  const b2 = addBlock(host, {
    title: 'Header Height',
    desc:
      'Header height is currently fixed at 40px in core (a constant in the header plugin, with ' +
      'no headerHeight option on GridOptions or ColumnDef). Taller multi-line headers are ' +
      'therefore not configurable yet — the two-line custom renderer under “Custom Components” ' +
      'fits its content inside the 40px band rather than growing the header row. Tracked as a ' +
      'rough edge to wire a configurable header height.',
    usage: "// not yet supported:\n// new Grid(el, { headerHeight: 64 })",
  });
  b2.demo.remove(); // note-only block: no live grid

  return () => destroyGrid(grid);
};
