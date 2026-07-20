import { faker } from '@faker-js/faker';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import type { PageBuild } from '../registry';
import type { Grid, CellRenderer, RenderParams } from '@zengrid/core';

/** Custom renderer: fills ★ up to a 0–5 rating. Implements the CellRenderer contract. */
class RatingRenderer implements CellRenderer {
  render(el: HTMLElement, p: RenderParams): void {
    el.style.letterSpacing = '1px';
    this.update(el, p);
  }
  update(el: HTMLElement, p: RenderParams): void {
    const n = Math.round(Number(p.value) || 0);
    el.textContent = '★★★★★☆☆☆☆☆'.slice(5 - n, 10 - n);
    el.style.color = n >= 4 ? '#f59e0b' : n >= 2 ? '#a3a3a3' : '#d4d4d4';
  }
  destroy(el: HTMLElement): void {
    el.textContent = '';
    el.style.color = '';
  }
}

/** Custom renderer: coloured ▲/▼ trend with the numeric delta. */
class TrendRenderer implements CellRenderer {
  render(el: HTMLElement, p: RenderParams): void {
    el.style.fontWeight = '600';
    this.update(el, p);
  }
  update(el: HTMLElement, p: RenderParams): void {
    const v = Number(p.value) || 0;
    const up = v >= 0;
    el.textContent = `${up ? '▲' : '▼'} ${Math.abs(v).toFixed(1)}%`;
    el.style.color = up ? '#10b981' : '#ef4444';
  }
  destroy(el: HTMLElement): void {
    el.textContent = '';
    el.style.color = '';
  }
}

const COMPANIES = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Soylent', 'Vandelay'];

function rows(n: number): any[][] {
  faker.seed(21);
  return Array.from({ length: n }, () => [
    faker.helpers.arrayElement(COMPANIES),
    faker.number.int({ min: 0, max: 5 }),
    faker.number.float({ min: -18, max: 24, fractionDigits: 1 }),
    faker.number.int({ min: 12, max: 980 }),
  ]);
}

export const build: PageBuild = (host) => {
  const created: Grid[] = [];

  const b1 = addBlock(host, {
    title: 'Custom Renderer Instances',
    desc: 'A cell component is any object implementing render / update / destroy. Pass an instance directly as a column’s renderer. update() is called on scroll and value change, so keep it cheap.',
    usage: "class RatingRenderer implements CellRenderer { render(el, p){…} update(el, p){…} destroy(el){} }\n{ field: 'rating', renderer: new RatingRenderer() }",
    height: 400,
  });
  const cols1 = [
    { field: 'company', header: 'Account', width: 180, renderer: 'text' },
    { field: 'rating', header: 'Rating', width: 140, renderer: new RatingRenderer() },
    { field: 'trend', header: 'MoM Trend', width: 140, renderer: new TrendRenderer() },
    { field: 'seats', header: 'Seats', width: 120, renderer: 'number' },
  ];
  created.push(createGrid(b1.demo, { columns: cols1, data: rows(500), rowHeight: 40 }));

  const b2 = addBlock(host, {
    title: 'Registered By Name',
    desc: 'Register a renderer on the grid, then reference it by string from any column. Useful when the same component is shared across many columns or configured from serialized column defs.',
    usage: "grid.registerRenderer('rating', new RatingRenderer());\n{ field: 'rating', renderer: 'rating' }",
    height: 320,
  });
  const cols2 = [
    { field: 'company', header: 'Account', width: 180, renderer: 'text' },
    { field: 'rating', header: 'Rating', width: 140, renderer: 'rating' },
    { field: 'trend', header: 'Trend', width: 140, renderer: 'trend' },
  ];
  const g2 = createGrid(b2.demo, { columns: cols2, data: rows(300), rowHeight: 40 });
  g2.registerRenderer('rating', new RatingRenderer());
  g2.registerRenderer('trend', new TrendRenderer());
  g2.refresh();
  created.push(g2);

  return () => created.forEach(destroyGrid);
};
