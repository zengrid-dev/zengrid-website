import { Grid } from '@zengrid/core';
import { getSettings } from './settings';

const live = new Set<Grid>();

export interface GridSpec {
  columns: any[];
  data: any[][];
  rowHeight?: number;
  overrides?: Record<string, unknown>;
}

/** Create a themed grid inside `container` and track it for live re-theming. */
export function createGrid(container: HTMLElement, spec: GridSpec): Grid {
  const { columns, data, rowHeight = 40, overrides = {} } = spec;
  const config = {
    rowCount: data.length,
    colCount: columns.length,
    rowHeight,
    colWidth: columns.map((c) => c.width ?? 140),
    columns,
    enableSelection: true,
    enableKeyboardNavigation: true,
    overscanRows: 6,
    overscanCols: 2,
    rendererCache: { enabled: true, capacity: 1000, trackStats: false },
    enableColumnResize: true,
    hideLastColumnBorder: true,
    ...overrides,
  };
  const grid = new Grid(container, config as never);
  grid.setData(data);
  grid.setTheme(getSettings().gridTheme);
  grid.render();
  fitToContentWidth(container, config.colWidth, grid);
  live.add(grid);
  return grid;
}

/**
 * Cap the demo box at the grid's own content width so columns that don't fill
 * the panel don't leave a trailing gap. Uses max-width so narrow screens still
 * shrink the grid (and scroll horizontally) instead of overflowing.
 */
function fitToContentWidth(container: HTMLElement, colWidth: number[], grid: Grid): void {
  const total = colWidth.reduce((sum, w) => sum + w, 0);
  const sc = container.querySelector('.zg-scroll-container') as HTMLElement | null;
  const scrollbar = sc ? sc.offsetWidth - sc.clientWidth : 0;
  // +2 accounts for the demo box's 1px border on each side (border-box sizing).
  container.style.maxWidth = `${total + scrollbar + 2}px`;
  grid.refresh();
}

export function destroyGrid(grid: Grid): void {
  live.delete(grid);
  try {
    grid.destroy();
  } catch {
    /* already disposed */
  }
}

export function applyThemeToLiveGrids(theme: string): void {
  live.forEach((g) => {
    try {
      g.setTheme(theme);
    } catch {
      /* ignore grids mid-teardown */
    }
  });
}
