import { faker } from '@faker-js/faker';
import {
  ProgressBarRenderer,
  ChipRenderer,
  DropdownRenderer,
  CheckboxRenderer,
  DateRenderer,
} from '@zengrid/core';

const DEPTS = ['Engineering', 'Design', 'Product', 'Sales', 'Support', 'Finance'];
const ROLES = ['Principal', 'Lead', 'Senior', 'Mid', 'Junior'];
const STATUS = ['Active', 'On Leave', 'Remote'];
const STATUS_COLOR: Record<string, string> = {
  Active: '#10b981', 'On Leave': '#f59e0b', Remote: '#3b82f6',
};

/** Modern status option: a colored dot + label. Menu is portaled, so style via .sc-opt (global). */
function statusOption(opt: { label: string; value: any }): HTMLElement {
  const row = document.createElement('div');
  row.className = 'sc-opt';
  const dot = document.createElement('span');
  dot.className = 'sc-opt-dot';
  dot.style.background = STATUS_COLOR[opt.label] ?? '#64748b';
  row.append(dot, document.createTextNode(opt.label));
  return row;
}
const SKILLS = ['TS', 'Rust', 'Go', 'React', 'SQL', 'Figma', 'Cloud', 'ML'];
const SKILL_COLOR: Record<string, string> = {
  TS: '#3178c6', Rust: '#c56b3b', Go: '#2aa5b8', React: '#3fa9c9',
  SQL: '#6b7280', Figma: '#a259ff', Cloud: '#0ea5e9', ML: '#16a34a',
};

function skillChips() {
  return faker.helpers.arrayElements(SKILLS, { min: 1, max: 4 }).map((s) => ({
    label: s, value: s.toLowerCase(), color: SKILL_COLOR[s] ?? '#64748b', textColor: '#fff',
  }));
}

/** Realistic team roster as row-major any[][] (seeded for stable demos). */
export function teamData(rows: number): any[][] {
  faker.seed(42);
  const out: any[][] = [];
  for (let r = 0; r < rows; r++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    out.push([
      r + 1,
      `${first} ${last}`,
      faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      faker.helpers.arrayElement(DEPTS),
      faker.helpers.arrayElement(ROLES),
      faker.helpers.arrayElement(STATUS),
      faker.number.int({ min: 0, max: 100 }),
      faker.number.int({ min: 68000, max: 210000 }),
      skillChips(),
      faker.date.past({ years: 6 }),
      faker.datatype.boolean(0.7),
    ]);
  }
  return out;
}

// Keyboard-character headers only (no emoji): plain text plus sort indicators.
const H = (text: string, type = 'sortable') => ({
  text,
  type,
  sortIndicator: { show: true, position: 'trailing' },
  interactive: true,
});

/** Column definitions matching teamData column order. */
export function teamColumns(): any[] {
  return [
    { field: 'id', header: H('id', 'sortable'), width: 72, renderer: 'number', sortable: true },
    { field: 'name', header: H('Name', 'sortable'), width: 170, renderer: 'text', sortable: true },
    { field: 'email', header: H('Email', 'text'), width: 240, renderer: 'text' },
    { field: 'department', header: H('Department'), width: 150, renderer: 'text', sortable: true },
    { field: 'role', header: H('Role'), width: 120, renderer: 'text', sortable: true },
    {
      field: 'status', header: H('Status'), width: 140, sortable: true,
      renderer: new DropdownRenderer({
        className: 'sc-status',
        options: STATUS.map((s) => ({ label: s, value: s })),
        optionRenderer: statusOption,
      }),
    },
    {
      field: 'completion', header: H('Completion'), width: 160, sortable: true,
      renderer: new ProgressBarRenderer({
        min: 0, max: 100, showValue: true, height: 10,
        // "at least" thresholds: red < 40, amber 40-74, green >= 75
        colorThresholds: [
          { value: 0, color: '#ef4444' },
          { value: 40, color: '#f59e0b' },
          { value: 75, color: '#10b981' },
        ],
      }),
    },
    { field: 'salary', header: H('Salary'), width: 120, renderer: 'number', sortable: true },
    {
      field: 'skills', header: H('Skills', 'text'), width: 210,
      renderer: new ChipRenderer({ overflowMode: 'scroll', showOverflowTooltip: true }),
    },
    {
      field: 'joined', header: H('Joined'), width: 130, sortable: true,
      renderer: new DateRenderer({ format: 'MMM DD, YYYY', locale: 'en-US' }),
    },
    {
      field: 'active', header: H('Active'), width: 110, sortable: true,
      renderer: new CheckboxRenderer({ onChange: () => {}, className: 'sc-check' }),
    },
  ];
}
