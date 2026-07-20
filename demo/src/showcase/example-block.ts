import { el } from './dom';

export interface BlockOpts {
  title: string;
  desc: string;
  usage?: string;
  /** demo area height in px (default 380) */
  height?: number;
}

export interface BlockRefs {
  /** container to mount a grid into */
  demo: HTMLElement;
  /** control bar below the demo for buttons/inputs */
  bar: HTMLElement;
}

/** Append one documentation-style example block; returns its mount points. */
export function addBlock(host: HTMLElement, opts: BlockOpts): BlockRefs {
  const block = el('section', 'block');
  block.append(el('h3', 'block-title', opts.title));
  block.append(el('p', 'block-desc', opts.desc));

  if (opts.usage) {
    const wrap = el('div', 'usage-wrap');
    const usage = el('pre', 'usage');
    usage.textContent = opts.usage;
    const copyBtn = el('button', 'usage-copy', 'Copy');
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(opts.usage ?? '').then(() => {
        copyBtn.textContent = 'Copied';
        window.setTimeout(() => (copyBtn.textContent = 'Copy'), 1400);
      });
    });
    wrap.append(usage, copyBtn);
    block.append(wrap);
  }

  const demo = el('div', 'demo');
  if (opts.height) demo.style.height = `${opts.height}px`;
  block.append(demo);

  const bar = el('div', 'demo-bar');
  block.append(bar);

  host.append(block);
  return { demo, bar };
}
