import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

// Project teamData to the fields shown here: id, name, email, department, salary.
const PICK = [0, 1, 2, 3, 7];

export const build: PageBuild = (host) => {
  const columns = [
    {
      field: 'id', width: 90, renderer: 'number', sortable: true,
      header: {
        text: 'ID', type: 'sortable',
        sortIndicator: { show: true, position: 'trailing' },
        tooltip: { content: 'Unique row identifier', position: 'top' },
        interactive: true,
      },
    },
    {
      field: 'name', width: 190, renderer: 'text', sortable: true,
      header: {
        text: 'Name', type: 'sortable',
        leadingIcon: { content: '≡', position: 'leading' },
        sortIndicator: { show: true, position: 'trailing' },
        interactive: true,
      },
    },
    {
      field: 'email', width: 250, renderer: 'text',
      header: {
        text: 'Email', type: 'text',
        trailingIcon: { content: '@', position: 'trailing' },
        tooltip: { content: 'Primary contact address', position: 'top' },
      },
    },
    {
      field: 'department', width: 170, renderer: 'text',
      header: {
        text: 'Department', type: 'filterable',
        filterIndicator: { show: true },
        interactive: true,
      },
    },
    {
      field: 'salary', width: 130, renderer: 'number', sortable: true,
      header: {
        text: 'Salary', type: 'sortable',
        sortIndicator: { show: true, position: 'trailing' },
        style: { fontVariantNumeric: 'tabular-nums' },
        interactive: true,
      },
    },
  ];

  const b1 = addBlock(host, {
    title: 'Header Types & Adornments',
    desc:
      'A header is configured by an object, not just a string. The type picks a built-in header ' +
      'renderer — text, sortable (adds sort arrows that track sort state), filterable (adds a ' +
      'filter trigger), icon, or checkbox. On top of that, any header can carry a leading or ' +
      'trailing icon, a tooltip, custom classes, and inline styles. Click ID, Name, or Salary ' +
      'to watch the sortable indicators update.',
    usage:
      "{ field: 'name', sortable: true, header: {\n" +
      "    text: 'Name', type: 'sortable',\n" +
      "    leadingIcon: { content: '≡', position: 'leading' },\n" +
      "    sortIndicator: { show: true, position: 'trailing' },\n" +
      "    tooltip: { content: 'Full name' },\n" +
      "} }",
    height: 340,
  });

  const grid = createGrid(b1.demo, {
    columns,
    data: teamData(500).map((row) => PICK.map((i) => row[i])),
  });

  const out = readout('Sortable headers show arrows; the filterable header shows a trigger.');
  grid.on('sort:change', ({ sortState }) =>
    out.set(sortState.length ? `sort:change → column ${sortState[0].column} ${sortState[0].direction}` : 'unsorted')
  );
  host.append(out.node);

  return () => destroyGrid(grid);
};
