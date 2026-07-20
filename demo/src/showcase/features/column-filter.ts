import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { readout } from './parts';
import { filterColumns, filterData, matchLine } from './filter-support';
import type { PageBuild } from '../registry';

// Columns that expose the built-in header filter trigger, mapped to the
// operator set that fits each column's data type.
const FILTERABLE: Record<string, 'text' | 'number' | 'date'> = {
  name: 'text',
  email: 'text',
  department: 'text',
  role: 'text',
  salary: 'number',
  joined: 'date',
};

/** Clone the shared columns and switch the mapped ones to a filterable header. */
function withHeaderFilters(columns: any[]): any[] {
  return columns.map((col) => {
    const dropdownType = FILTERABLE[col.field];
    if (!dropdownType) return col;
    const header = typeof col.header === 'string' ? { text: col.header } : { ...col.header };
    return {
      ...col,
      filterable: true,
      header: {
        ...header,
        type: 'filterable',
        filterIndicator: { show: true, dropdownType },
      },
    };
  });
}

export const build: PageBuild = (host) => {
  const columns = withHeaderFilters(filterColumns());

  const { demo, bar } = addBlock(host, {
    title: 'Column Header Filter',
    desc:
      'Filterable columns carry a ▼ trigger in their header. Clicking it opens the grid\'s built-in filter popup — pick an operator, type a value, Apply. No external controls: the grid renders and applies the filter itself, and stacks multiple columns with AND. Text, number, and date columns each get the operator set that fits their type.',
    usage:
      "{ field: 'salary', filterable: true,\n" +
      "  header: { text: 'Salary', type: 'filterable',\n" +
      "    filterIndicator: { show: true, dropdownType: 'number' } } }",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: filterData(1_000), rowHeight: 40 });
  const out = readout('Click a ▼ in any column header to open its filter.');

  grid.on('filter:change', () => out.set(matchLine(grid)));

  const btnClear = el('button', 'btn', 'Clear all filters');
  on(btnClear, 'click', () => {
    grid.clearFilters();
    grid.refresh();
    out.set(matchLine(grid));
  });

  bar.append(btnClear);
  host.append(out.node);

  return () => destroyGrid(grid);
};
