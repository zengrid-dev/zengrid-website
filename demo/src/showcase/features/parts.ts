import { el } from '../dom';

/** Wrap a control with a mono label into a `.field`. */
export function field(label: string, control: HTMLElement): HTMLElement {
  const wrap = el('label', 'field');
  wrap.append(el('span', 'field-label', label), control);
  return wrap;
}

/** A <select> populated from label/value options. */
export function select(options: Array<{ label: string; value: string }>): HTMLSelectElement {
  const s = el('select', 'select');
  for (const o of options) {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.label;
    s.append(opt);
  }
  return s;
}

export interface Readout {
  node: HTMLElement;
  /** Replace contents with a single line. */
  set(text: string): void;
  /** Prepend a line, keeping the most recent `max` (default 6). */
  push(text: string, max?: number): void;
}

/** A mono output area for value/event demos. */
export function readout(placeholder = 'Interact with the grid…'): Readout {
  const node = el('div', 'readout');
  const ph = el('span', 'muted', placeholder);
  node.append(ph);
  return {
    node,
    set(text) {
      node.replaceChildren(el('span', 'readout-line', text));
    },
    push(text, max = 6) {
      if (node.firstChild === ph) node.replaceChildren();
      node.prepend(el('span', 'readout-line', text));
      while (node.childElementCount > max) node.lastElementChild?.remove();
    },
  };
}
