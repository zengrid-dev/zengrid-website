import { faker } from '@faker-js/faker';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { AdvancedCellRenderer, NumberRenderer } from '@zengrid/core';
import type { PageBuild, PageCleanup } from '../registry';
import type { Grid, RenderParams } from '@zengrid/core';

/** Score cell: shows the number, background class chosen by threshold (toggled, not stacked). */
function scoreRenderer(): AdvancedCellRenderer {
  return new AdvancedCellRenderer({
    elements: [{ type: 'text', getValue: (p: RenderParams) => String(p.value ?? '') }],
    conditions: [
      { condition: (p) => Number(p.value) < 40, className: 'sc-bad' },
      { condition: (p) => Number(p.value) >= 40 && Number(p.value) < 75, className: 'sc-warn' },
      { condition: (p) => Number(p.value) >= 75, className: 'sc-good' },
    ],
  });
}

const SERVICES = ['auth', 'billing', 'search', 'ingest', 'notify', 'gateway', 'render', 'sync'];

/** [service, health(0-100), latencyDelta(±ms), uptime(0-100)] */
function rows(n: number): any[][] {
  faker.seed(44);
  return Array.from({ length: n }, () => [
    faker.helpers.arrayElement(SERVICES),
    faker.number.int({ min: 5, max: 100 }),
    faker.number.float({ min: -140, max: 320, fractionDigits: 1 }),
    faker.number.int({ min: 30, max: 100 }),
  ]);
}

export const build: PageBuild = (host): PageCleanup => {
  const created: Grid[] = [];

  const b1 = addBlock(host, {
    title: 'Conditional Cell Classes',
    desc: 'AdvancedCellRenderer toggles a CSS class per cell based on the value. Class conditions are added/removed as cells recycle during scroll, so thresholds stay correct across the virtualized body.',
    usage: "new AdvancedCellRenderer({\n  elements: [{ type: 'text', getValue: p => p.value }],\n  conditions: [{ condition: p => p.value < 40, className: 'sc-bad' }],\n})",
    height: 420,
  });
  const cols1 = [
    { field: 'service', header: 'Service', width: 160, renderer: 'text' },
    { field: 'health', header: 'Health', width: 130, renderer: scoreRenderer() },
    { field: 'uptime', header: 'Uptime', width: 130, renderer: scoreRenderer() },
  ];
  created.push(createGrid(b1.demo, { columns: cols1, data: rows(600), rowHeight: 40 }));

  const b2 = addBlock(host, {
    title: 'Negative Value Styling',
    desc: 'NumberRenderer adds the zg-cell-negative class to negative values; style that class to flag deficits. Here latency deltas below zero (improvements) render in red.',
    usage: "new NumberRenderer({ maximumFractionDigits: 1 })\n/* CSS */ .zg-cell-negative { color: #ef4444; }",
    height: 320,
  });
  const cols2 = [
    { field: 'service', header: 'Service', width: 160, renderer: 'text' },
    { field: 'latencyDelta', header: 'Latency Δ (ms)', width: 160, renderer: new NumberRenderer({ maximumFractionDigits: 1 }) },
  ];
  created.push(createGrid(b2.demo, { columns: cols2, data: rows(400), rowHeight: 40 }));

  return () => created.forEach(destroyGrid);
};
