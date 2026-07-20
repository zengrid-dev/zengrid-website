import { ColumnGroupModel } from '@zengrid/core';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import { readout } from './parts';
import type { PageBuild } from '../registry';

export const build: PageBuild = (host) => {
  const b1 = addBlock(host, {
    title: 'Column Groups — Model vs. Rendering',
    desc:
      'Column grouping is modelled in core: ColumnGroupModel builds a validated hierarchy of ' +
      'groups over leaf columns, supporting nesting, expand/collapse flags, and traversal. What ' +
      'is NOT yet wired is a grouped header row — the grid does not currently render a banded ' +
      'top row spanning grouped columns. The grid below is a normal grid; the model demo builds ' +
      'a two-group hierarchy and prints it, ready for a header renderer to consume.',
    usage:
      "import { ColumnGroupModel } from '@zengrid/core';\n" +
      "const groups = new ColumnGroupModel();\n" +
      "groups.addGroup({ groupId: 'identity', headerName: 'Identity',\n" +
      "  parentGroupId: null, children: [], columnFields: ['id', 'name', 'email'] });\n" +
      "groups.addGroup({ groupId: 'employment', headerName: 'Employment',\n" +
      "  parentGroupId: null, children: [], columnFields: ['department', 'role', 'salary'] });\n" +
      "groups.getRootGroups(); // → the two groups above",
    height: 300,
  });

  const grid = createGrid(b1.demo, { columns: teamColumns(), data: teamData(400) });

  // Standalone model demo — builds a real group hierarchy.
  const groups = new ColumnGroupModel();
  groups.addGroup({ groupId: 'identity', headerName: 'Identity', parentGroupId: null, children: [], columnFields: ['id', 'name', 'email'] });
  groups.addGroup({ groupId: 'employment', headerName: 'Employment', parentGroupId: null, children: [], columnFields: ['department', 'role', 'salary'] });

  const out = readout('');
  out.set(
    'model groups → ' +
      groups
        .getRootGroups()
        .map((g) => `${g.headerName} [${g.columnFields.join(', ')}]`)
        .join('   ·   ')
  );
  host.append(out.node);

  return () => destroyGrid(grid);
};
