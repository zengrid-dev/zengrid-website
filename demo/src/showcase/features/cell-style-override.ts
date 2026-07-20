import { el, on } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamColumns, teamData } from '../data/datasets';
import type { Grid } from '@zengrid/core';

/** Unique scope so the override CSS only targets this playground grid. */
const DEMO_ID = 'zg-cell-style-playground';

interface StyleState {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  italic: boolean;
  color: string;
  align: '' | 'flex-start' | 'center' | 'flex-end';
}

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Sans', value: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)" },
  { label: 'Mono', value: "var(--font-mono, ui-monospace, monospace)" },
  { label: 'Serif', value: "Georgia, 'Times New Roman', serif" },
];
const WEIGHTS = [
  { label: 'Default', value: '' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
];
const ALIGN = [
  { label: 'Default', value: '' },
  { label: 'Left', value: 'flex-start' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'flex-end' },
];

function labeled(text: string, control: HTMLElement): HTMLElement {
  const field = el('label', 'field');
  field.append(el('span', 'field-label', text), control);
  return field;
}

function select(options: { label: string; value: string }[]): HTMLSelectElement {
  const sel = el('select', 'select') as HTMLSelectElement;
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    sel.append(opt);
  }
  return sel;
}

/** rgb(31, 41, 55) -> #1f2937, so the color input can seed from the live cell. */
function rgbToHex(rgb: string): string {
  const parts = rgb.match(/\d+/g);
  if (!parts || parts.length < 3) return '#1f2937';
  return '#' + parts.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

/**
 * Interactive "Cell Content Styling" playground: font, size, weight, italic,
 * colour, and alignment are written into a scoped stylesheet that targets
 * `#DEMO_ID .zg-cell`. Because that selector out-specifies ZenGrid's own
 * `.zg-cell` default, the overrides win with no `!important` — a live demo of
 * how consumers restyle cell content.
 */
export function addCellStyleOverride(host: HTMLElement): () => void {
  const { demo, bar } = addBlock(host, {
    title: 'Interactive Cell Styling',
    desc: 'Restyle the cell body live. Each control writes a scoped rule at `#playground .zg-cell`, which out-specifies ZenGrid’s default and overrides font, size, weight, colour, and alignment — no !important required.',
    usage: '#playground .zg-cell {\n  font-family: var(--font-mono);\n  font-size: 15px;\n  color: #2563eb;\n}',
    height: 380,
  });
  demo.id = DEMO_ID;

  const grid: Grid = createGrid(demo, { columns: teamColumns(), data: teamData(200), rowHeight: 40 });

  const styleEl = document.createElement('style');
  document.head.append(styleEl);

  const state: StyleState = {
    fontFamily: '', fontSize: 13, fontWeight: '', italic: false, color: '#1f2937', align: '',
  };

  // Controls
  const fontSel = select(FONTS);
  const sizeInput = el('input', 'input') as HTMLInputElement;
  sizeInput.type = 'range';
  sizeInput.min = '10'; sizeInput.max = '24'; sizeInput.step = '1';
  sizeInput.style.minWidth = '120px';
  const sizeVal = el('span', 'field-label');
  const weightSel = select(WEIGHTS);
  const italicBtn = el('button', 'btn', 'Italic') as HTMLButtonElement;
  italicBtn.type = 'button';
  const colorInput = el('input', 'input') as HTMLInputElement;
  colorInput.type = 'color';
  colorInput.style.minWidth = '44px';
  colorInput.style.padding = '2px';
  const alignSel = select(ALIGN);
  const resetBtn = el('button', 'btn', 'Reset') as HTMLButtonElement;
  resetBtn.type = 'button';

  const apply = () => {
    const lines: string[] = [];
    if (state.fontFamily) lines.push(`font-family: ${state.fontFamily};`);
    lines.push(`font-size: ${state.fontSize}px;`);
    if (state.fontWeight) lines.push(`font-weight: ${state.fontWeight};`);
    if (state.italic) lines.push('font-style: italic;');
    if (state.color) lines.push(`color: ${state.color};`);
    if (state.align) lines.push(`justify-content: ${state.align};`);
    styleEl.textContent = `#${DEMO_ID} .zg-cell {\n  ${lines.join('\n  ')}\n}`;
    sizeVal.textContent = `${state.fontSize}px`;
  };

  const syncControls = () => {
    fontSel.value = state.fontFamily;
    sizeInput.value = String(state.fontSize);
    weightSel.value = state.fontWeight;
    italicBtn.classList.toggle('is-on', state.italic);
    colorInput.value = state.color;
    alignSel.value = state.align;
    apply();
  };

  // Seed size + colour from the live cell so the playground opens as a no-op.
  requestAnimationFrame(() => {
    const cell = demo.querySelector<HTMLElement>('.zg-cell');
    if (cell) {
      const cs = getComputedStyle(cell);
      state.fontSize = Math.round(parseFloat(cs.fontSize)) || 13;
      state.color = rgbToHex(cs.color);
    }
    syncControls();
  });

  const offs = [
    on(fontSel, 'change', () => { state.fontFamily = fontSel.value; apply(); }),
    on(sizeInput, 'input', () => { state.fontSize = Number(sizeInput.value); apply(); }),
    on(weightSel, 'change', () => { state.fontWeight = weightSel.value; apply(); }),
    on(italicBtn, 'click', () => { state.italic = !state.italic; italicBtn.classList.toggle('is-on', state.italic); apply(); }),
    on(colorInput, 'input', () => { state.color = colorInput.value; apply(); }),
    on(alignSel, 'change', () => { state.align = alignSel.value as StyleState['align']; apply(); }),
    on(resetBtn, 'click', () => {
      state.fontFamily = ''; state.fontWeight = ''; state.italic = false; state.align = '';
      syncControls();
    }),
  ];

  bar.append(
    labeled('Font', fontSel),
    labeled('Size', sizeInput), sizeVal,
    labeled('Weight', weightSel),
    italicBtn,
    labeled('Color', colorInput),
    labeled('Align', alignSel),
    resetBtn,
  );

  return () => {
    offs.forEach((off) => off());
    styleEl.remove();
    destroyGrid(grid);
  };
}
