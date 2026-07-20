import { faker } from '@faker-js/faker';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { NumberRenderer, DateRenderer, CheckboxRenderer, ChipRenderer } from '@zengrid/core';
import type { PageBuild } from '../registry';

const TIERS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: '#64748b' },
  pro: { label: 'Pro', color: '#3178c6' },
  enterprise: { label: 'Enterprise', color: '#16a34a' },
};

/** [name(string), age(number), balance(number), active(boolean), joined(date), tier(enum)] */
function rows(n: number): any[][] {
  faker.seed(33);
  const keys = Object.keys(TIERS);
  return Array.from({ length: n }, () => {
    const tier = faker.helpers.arrayElement(keys);
    return [
      faker.person.fullName(),
      faker.number.int({ min: 18, max: 72 }),
      faker.number.float({ min: 0, max: 25000, fractionDigits: 2 }),
      faker.datatype.boolean(0.6),
      faker.date.past({ years: 4 }),
      [{ label: TIERS[tier].label, value: tier, color: TIERS[tier].color, textColor: '#fff' }],
    ];
  });
}

const columns = [
  { field: 'name', header: 'String', width: 190, renderer: 'text' },
  { field: 'age', header: 'Number', width: 110, renderer: 'number' },
  {
    field: 'balance', header: 'Number (currency)', width: 160,
    renderer: new NumberRenderer({ style: 'currency', currency: 'USD' }),
  },
  {
    field: 'active', header: 'Boolean', width: 110,
    renderer: new CheckboxRenderer({ onChange: () => {} }),
  },
  {
    field: 'joined', header: 'Date', width: 150,
    renderer: new DateRenderer({ format: 'MMM DD, YYYY', locale: 'en-US' }),
  },
  {
    field: 'tier', header: 'Enum', width: 140,
    renderer: new ChipRenderer({ overflowMode: 'scroll' }),
  },
];

export const build: PageBuild = (host) => {
  const { demo } = addBlock(host, {
    title: 'Built-in Data Types',
    desc: 'A column’s data type is expressed by its renderer. ZenGrid ships renderers for the common types — string, number, boolean, date, and enumerations — each formatting the raw value appropriately over the virtualized body.',
    usage: "{ field: 'active', renderer: new CheckboxRenderer({ onChange }) }  // boolean\n{ field: 'joined', renderer: new DateRenderer({ format: 'MMM DD, YYYY' }) }  // date",
    height: 440,
  });

  const grid = createGrid(demo, { columns, data: rows(1_000), rowHeight: 40 });
  return () => destroyGrid(grid);
};
