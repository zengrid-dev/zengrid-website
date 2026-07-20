import { el, on } from '../dom';
import { getSettings, setSettings, onSettings } from '../settings';
import { GRID_THEMES } from '../skins';

export interface TopBar {
  element: HTMLElement;
  setCrumb: (category: string, title: string) => void;
}

const MARK =
  '<svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<defs><linearGradient id="zg-mark" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#4ecca3"/><stop offset="1" stop-color="#3db892"/></linearGradient></defs>' +
  '<rect x="0" y="0" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".55"/>' +
  '<rect x="14.3" y="0" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".7"/>' +
  '<rect x="28.6" y="0" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".55"/>' +
  '<rect x="0" y="14.3" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".7"/>' +
  '<rect x="14.3" y="14.3" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)"/>' +
  '<rect x="28.6" y="14.3" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".7"/>' +
  '<rect x="0" y="28.6" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".45"/>' +
  '<rect x="14.3" y="28.6" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".55"/>' +
  '<rect x="28.6" y="28.6" width="11.3" height="11.3" rx="2" fill="url(#zg-mark)" opacity=".45"/></svg>';

export function createTopBar(opts: { onToggleRail: () => void }): TopBar {
  const bar = el('header', 'topbar');

  const brand = el('div', 'brand');
  const toggle = el('button', 'rail-toggle');
  toggle.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  toggle.title = 'Toggle sidebar';
  on(toggle, 'click', opts.onToggleRail);
  const mark = el('span', 'brand-mark');
  mark.innerHTML = MARK;
  brand.append(toggle, mark, el('span', 'brand-name', 'ZenGrid'), el('span', 'brand-tag', 'SHOWCASE'));

  const crumb = el('nav', 'crumb');
  const crumbCat = el('span', undefined, '');
  const crumbTitle = el('b', undefined, '');
  crumb.append(crumbCat, el('span', 'sep', '/'), crumbTitle);

  const right = el('div', 'topbar-right');

  const theme = el('select', 'field');
  GRID_THEMES.forEach((t) => {
    const o = el('option', undefined, t.label);
    o.value = t.id;
    theme.append(o);
  });
  on(theme, 'change', () => setSettings({ gridTheme: theme.value as never }));

  const rm = el('div', 'switch');
  rm.setAttribute('role', 'switch');
  rm.tabIndex = 0;
  rm.append(el('span', undefined, 'Roadmap'), el('span', 'switch-track'));
  const toggleRoadmap = () => setSettings({ showRoadmap: !getSettings().showRoadmap });
  on(rm, 'click', toggleRoadmap);
  on(rm, 'keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRoadmap(); }
  });

  right.append(theme, rm);
  bar.append(brand, crumb, right);

  const sync = () => {
    const s = getSettings();
    theme.value = s.gridTheme;
    rm.setAttribute('aria-checked', String(s.showRoadmap));
  };
  onSettings(sync);
  sync();

  return {
    element: bar,
    setCrumb: (category, title) => {
      crumbCat.textContent = category;
      crumbTitle.textContent = title;
    },
  };
}
