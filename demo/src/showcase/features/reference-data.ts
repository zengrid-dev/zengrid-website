import { faker } from '@faker-js/faker';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { DropdownRenderer } from '@zengrid/core';
import type { PageBuild } from '../registry';
import type { Grid, CellRenderer, RenderParams } from '@zengrid/core';

const STATUS = [
  { label: 'Awaiting Payment', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Refunded', value: 'refunded' },
];

const PRIORITY: Record<string, { label: string; color: string }> = {
  '0': { label: 'Low', color: '#64748b' },
  '1': { label: 'Normal', color: '#3178c6' },
  '2': { label: 'High', color: '#f59e0b' },
  '3': { label: 'Critical', color: '#ef4444' },
};

/** Read-only reference lookup: raw key → labelled badge. */
class RefBadgeRenderer implements CellRenderer {
  constructor(private map: Record<string, { label: string; color: string }>) {}
  render(el: HTMLElement, p: RenderParams): void {
    this.update(el, p);
  }
  update(el: HTMLElement, p: RenderParams): void {
    const entry = this.map[String(p.value)];
    el.textContent = entry?.label ?? String(p.value ?? '');
    el.style.color = entry?.color ?? 'inherit';
    el.style.fontWeight = '600';
  }
  destroy(el: HTMLElement): void {
    el.textContent = '';
    el.style.color = '';
    el.style.fontWeight = '';
  }
}

/** [orderId, statusCode, priorityCode] — columns store raw codes, not labels. */
function rows(n: number): any[][] {
  faker.seed(66);
  return Array.from({ length: n }, () => [
    `#${faker.number.int({ min: 10000, max: 99999 })}`,
    faker.helpers.arrayElement(STATUS).value,
    String(faker.number.int({ min: 0, max: 3 })),
  ]);
}

export const build: PageBuild = (host) => {
  const created: Grid[] = [];

  const b1 = addBlock(host, {
    title: 'Value → Label Mapping',
    desc: 'The column stores a raw code (e.g. "shipped"); DropdownRenderer maps each cell’s value to the matching option label for display, and lets the user pick a new value from the reference set.',
    usage: "new DropdownRenderer({ options: [{ label: 'Shipped', value: 'shipped' }, …] })",
    height: 420,
  });
  const cols1 = [
    { field: 'orderId', header: 'Order', width: 140, renderer: 'text' },
    { field: 'status', header: 'Status', width: 220, renderer: new DropdownRenderer({ options: STATUS, placeholder: '—' }) },
    { field: 'priority', header: 'Priority (code)', width: 150, renderer: 'text' },
  ];
  created.push(createGrid(b1.demo, { columns: cols1, data: rows(400), rowHeight: 40 }));

  const b2 = addBlock(host, {
    title: 'Static Reference Table',
    desc: 'For read-only mapping, a small renderer looks up the display label and colour from a reference table keyed by the stored code — no editor, just presentation.',
    usage: "const PRIORITY = { '3': { label: 'Critical', color: '#ef4444' } };\n{ field: 'priority', renderer: new RefBadgeRenderer(PRIORITY) }",
    height: 320,
  });
  const cols2 = [
    { field: 'orderId', header: 'Order', width: 140, renderer: 'text' },
    { field: 'status', header: 'Status (code)', width: 160, renderer: 'text' },
    { field: 'priority', header: 'Priority', width: 140, renderer: new RefBadgeRenderer(PRIORITY) },
  ];
  created.push(createGrid(b2.demo, { columns: cols2, data: rows(300), rowHeight: 40 }));

  return () => created.forEach(destroyGrid);
};
