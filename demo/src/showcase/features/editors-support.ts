import { faker } from '@faker-js/faker';
import { CheckboxRenderer, DateRenderer, DateRangeRenderer } from '@zengrid/core';

export const STATUS = ['Active', 'On Leave', 'Remote'];
export const TIERS = ['Free', 'Pro', 'Enterprise'];

/**
 * Editable roster as row-major any[][] (seeded for stable demos).
 * Fields: 0 name · 1 age · 2 active · 3 status · 4 tier · 5 joined · 6 duration{start,end}
 */
export function editorRows(n: number): any[][] {
  faker.seed(51);
  return Array.from({ length: n }, () => {
    const start = faker.date.recent({ days: 120 });
    const end = new Date(start.getTime() + faker.number.int({ min: 3, max: 40 }) * 86_400_000);
    return [
      faker.person.fullName(),
      faker.number.int({ min: 18, max: 72 }),
      faker.datatype.boolean(0.6),
      faker.helpers.arrayElement(STATUS),
      faker.helpers.arrayElement(TIERS),
      faker.date.past({ years: 4 }),
      { start, end },
    ];
  });
}

/** Project rows onto a subset of column indices, preserving the given order. */
export function pick(rows: any[][], cols: number[]): any[][] {
  return rows.map((r) => cols.map((c) => r[c]));
}

/** Options list for select/dropdown editors (value === label). */
export const asOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }));

export const checkboxRenderer = () => new CheckboxRenderer({ onChange: () => {} });
export const dateRenderer = () => new DateRenderer({ format: 'MMM DD, YYYY', locale: 'en-US' });
export const rangeRenderer = () =>
  new DateRangeRenderer({ format: 'DD/MM/YYYY', separator: ' → ', showDuration: true });
