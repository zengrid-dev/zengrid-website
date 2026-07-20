import { el } from './dom';
import { createTopBar } from './shell/top-bar';
import { createSidebar } from './shell/sidebar-nav';
import { renderPage } from './panel';
import { findPage, firstPage } from './registry';
import { getSettings, onSettings } from './settings';
import { applyThemeToLiveGrids } from './grid-factory';

export function mountApp(root: HTMLElement): void {
  const app = el('div', 'app');
  app.dataset['rail'] = 'expanded';

  const topbar = createTopBar({
    onToggleRail: () => {
      app.dataset['rail'] = app.dataset['rail'] === 'collapsed' ? 'expanded' : 'collapsed';
    },
  });
  const main = el('main', 'main');
  const sidebar = createSidebar({ onSelect: (id) => (location.hash = id) });

  app.append(topbar.element, sidebar.element, main);
  root.append(app);
  root.removeAttribute('aria-busy');

  let lastTheme = getSettings().gridTheme;
  onSettings((s) => {
    if (s.gridTheme !== lastTheme) {
      lastTheme = s.gridTheme;
      applyThemeToLiveGrids(s.gridTheme);
    }
  });

  let cleanup: (() => void) | null = null;
  let token = 0;

  async function route(): Promise<void> {
    const id = location.hash.slice(1) || firstPage().id;
    const found = findPage(id);
    if (!found) {
      location.hash = firstPage().id;
      return;
    }
    const current = ++token;
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    sidebar.setActive(found.page.id);
    topbar.setCrumb(found.category.label, found.page.title);
    const done = await renderPage(main, found.page, found.category);
    if (current === token) cleanup = done;
    else done();
  }

  window.addEventListener('hashchange', () => void route());
  void route();
}
