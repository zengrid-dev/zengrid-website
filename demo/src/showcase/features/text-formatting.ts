import { faker } from '@faker-js/faker';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { NumberRenderer, DateRenderer } from '@zengrid/core';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

const PRODUCTS = ['Cloud Seat', 'Analytics Add-on', 'Priority Support', 'Data Pipeline', 'API Credits', 'Storage Block'];

/** Row-major: [product, amount, amountEur, ratio, units, signedDate] */
function rows(n: number): any[][] {
  faker.seed(7);
  const out: any[][] = [];
  for (let i = 0; i < n; i++) {
    const amount = faker.number.float({ min: -4200, max: 98000, fractionDigits: 2 });
    out.push([
      faker.helpers.arrayElement(PRODUCTS),
      amount,
      amount,
      faker.number.float({ min: 0, max: 1, fractionDigits: 4 }),
      faker.number.int({ min: 1, max: 250000 }),
      faker.date.recent({ days: 300 }),
    ]);
  }
  return out;
}

const columns = [
  { field: 'product', header: 'Product', width: 180, renderer: 'text' },
  {
    field: 'amount', header: 'Amount (USD)', width: 150,
    renderer: new NumberRenderer({ style: 'currency', currency: 'USD' }),
  },
  {
    field: 'amountEur', header: 'Amount (EUR / de-DE)', width: 180,
    renderer: new NumberRenderer({ style: 'currency', currency: 'EUR', locale: 'de-DE' }),
  },
  {
    field: 'ratio', header: 'Utilisation', width: 130,
    renderer: new NumberRenderer({ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  },
  {
    field: 'units', header: 'Units', width: 130,
    renderer: new NumberRenderer({ style: 'decimal', maximumFractionDigits: 0 }),
  },
  {
    field: 'dateLong', header: 'Renewed', width: 160,
    renderer: new DateRenderer({ format: 'MMM DD, YYYY', locale: 'en-US' }),
  },
];

export const build: PageBuild = (host) => {
  const created: Grid[] = [];
  const mount = (demo: HTMLElement, data: any[][]) => {
    const g = createGrid(demo, { columns, data, rowHeight: 40 });
    created.push(g);
    return g;
  };

  const b1 = addBlock(host, {
    title: 'Number, Currency & Percent',
    desc: 'NumberRenderer wraps Intl.NumberFormat: locale-aware grouping, currency symbols, and percent (values 0–1 render as 0–100%). Negative values get the zg-cell-negative class for styling.',
    usage: "new NumberRenderer({ style: 'currency', currency: 'USD' })\nnew NumberRenderer({ style: 'percent', minimumFractionDigits: 1 })",
    height: 420,
  });
  mount(b1.demo, rows(400));

  const b2 = addBlock(host, {
    title: 'Date Formatting',
    desc: 'DateRenderer formats Date values with token strings and a locale. The same underlying values can be presented in whichever format a column calls for.',
    usage: "new DateRenderer({ format: 'MMM DD, YYYY', locale: 'en-US' })",
    height: 320,
  });
  const dateCols = [
    { field: 'product', header: 'Product', width: 180, renderer: 'text' },
    { field: 'd1', header: 'MMM DD, YYYY', width: 170, renderer: new DateRenderer({ format: 'MMM DD, YYYY', locale: 'en-US' }) },
    { field: 'd2', header: 'YYYY-MM-DD', width: 150, renderer: new DateRenderer({ format: 'YYYY-MM-DD' }) },
    { field: 'd3', header: 'DD/MM/YYYY', width: 150, renderer: new DateRenderer({ format: 'DD/MM/YYYY' }) },
  ];
  faker.seed(11);
  const dateData = Array.from({ length: 200 }, () => {
    const d = faker.date.recent({ days: 400 });
    return [faker.helpers.arrayElement(PRODUCTS), d, d, d];
  });
  const g2 = createGrid(b2.demo, { columns: dateCols, data: dateData, rowHeight: 40 });
  created.push(g2);

  return () => created.forEach(destroyGrid);
};
