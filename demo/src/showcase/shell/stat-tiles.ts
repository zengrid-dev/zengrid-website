import { el } from '../dom';
import { allPages } from '../registry';

/** Honest, suite-level KPI tiles shown under the Analytics skin. */
export function createStatTiles(): HTMLElement {
  const pages = allPages();
  const count = (t: string) => pages.filter((p) => p.tag === t).length;

  const tiles = el('div', 'stat-tiles');
  const data: [string, string, string][] = [
    ['Feature pages', String(pages.length), 'across the suite'],
    ['Available', String(count('available')), 'ready to use'],
    ['In development', String(count('dev')), 'partial / internal'],
    ['Roadmap', String(count('roadmap')), 'planned'],
  ];

  data.forEach(([label, value, sub]) => {
    const tile = el('div', 'tile');
    tile.append(
      el('div', 'tile-label', label),
      el('div', 'tile-value', value),
      el('div', 'tile-sub', sub)
    );
    tiles.append(tile);
  });

  return tiles;
}
