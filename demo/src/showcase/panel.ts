import { el, clear } from './dom';
import type { NavCategory, PageCleanup, PageDef } from './registry';
import { createStatTiles } from './shell/stat-tiles';

const TAG_LABEL: Record<PageDef['tag'], string> = {
  available: 'Available',
  dev: 'In development',
  roadmap: 'Roadmap',
};

/** Render a documentation-style page into `main`; resolves to a cleanup fn. */
export async function renderPage(
  main: HTMLElement,
  page: PageDef,
  category: NavCategory
): Promise<() => void> {
  clear(main);

  const root = el('div', 'page');
  const head = el('header', 'page-head');
  head.append(el('div', 'page-eyebrow', category.label));

  const titleRow = el('div', 'page-title-row');
  titleRow.append(el('h1', 'page-title', page.title));
  const chip = el('span', 'chip', TAG_LABEL[page.tag]);
  chip.dataset['tag'] = page.tag;
  titleRow.append(chip);
  head.append(titleRow);
  head.append(el('p', 'page-desc', page.desc));
  root.append(head);

  root.append(createStatTiles());

  const content = el('div', 'page-content');
  root.append(content);
  main.append(root);
  main.scrollTop = 0;

  let cleanup: PageCleanup;
  if (page.load) {
    try {
      const mod = await page.load();
      cleanup = mod.build(content);
    } catch (err) {
      renderPlaceholder(content, page, String(err));
    }
  } else {
    renderPlaceholder(content, page);
  }

  return () => {
    if (typeof cleanup === 'function') cleanup();
  };
}

function renderPlaceholder(host: HTMLElement, page: PageDef, error?: string): void {
  const box = el('div', 'placeholder');
  const icon = page.tag === 'roadmap' ? '🗺️' : page.tag === 'dev' ? '🚧' : '🧩';
  box.append(el('div', 'placeholder-icon', icon));
  box.append(el('div', 'placeholder-title', error ? 'Could not load example' : `${page.title} — coming soon`));
  box.append(
    el(
      'div',
      'placeholder-text',
      error ??
        (page.tag === 'roadmap'
          ? 'This capability is on the ZenGrid roadmap and not yet in core.'
          : 'A live example for this page is being built. It will appear here.')
    )
  );
  host.append(box);
}
