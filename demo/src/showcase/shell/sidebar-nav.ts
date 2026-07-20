import { el, on } from '../dom';
import { NAV } from '../registry';
import { getSettings, onSettings } from '../settings';

export interface SidebarNav {
  element: HTMLElement;
  setActive: (id: string) => void;
}

export function createSidebar(opts: { onSelect: (id: string) => void }): SidebarNav {
  const rail = el('nav', 'rail');
  rail.setAttribute('aria-label', 'Features');
  const items = new Map<string, HTMLButtonElement>();

  NAV.forEach((cat) => {
    const catEl = el('div', 'nav-cat');
    catEl.dataset['open'] = 'true';

    const label = el('div', 'nav-cat-label');
    label.append(el('span', undefined, cat.label));
    const chev = el('span', 'chev', '▾');
    label.append(chev);
    on(label, 'click', () => {
      catEl.dataset['open'] = catEl.dataset['open'] === 'true' ? 'false' : 'true';
    });

    const list = el('div', 'nav-list');
    cat.pages.forEach((page) => {
      const item = el('button', 'nav-item');
      item.dataset['tag'] = page.tag;
      item.append(el('span', 'nav-item-label', page.title));
      on(item, 'click', () => opts.onSelect(page.id));
      items.set(page.id, item);
      list.append(item);
    });

    catEl.append(label, list);
    rail.append(catEl);
  });

  const applyFilter = () => {
    const show = getSettings().showRoadmap;
    items.forEach((item) => {
      const hidden = !show && item.dataset['tag'] !== 'available';
      item.style.display = hidden ? 'none' : '';
    });
    rail.querySelectorAll<HTMLElement>('.nav-cat').forEach((cat) => {
      const visible = [...cat.querySelectorAll<HTMLElement>('.nav-item')].some(
        (i) => i.style.display !== 'none'
      );
      cat.style.display = visible ? '' : 'none';
    });
  };
  onSettings(applyFilter);
  applyFilter();

  return {
    element: rail,
    setActive: (id) => {
      items.forEach((item, pid) => {
        if (pid === id) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    },
  };
}
