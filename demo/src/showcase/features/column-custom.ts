import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { teamData } from '../data/datasets';
import type { PageBuild } from '../registry';
import type { HeaderRenderer, HeaderRenderParams } from '@zengrid/core';

const PICK = [1, 3, 4, 7]; // name, department, role, salary

/**
 * A custom two-line header: a title plus a muted caption, with a sort chip that
 * tracks the live sort direction. Demonstrates the full render/update/destroy
 * contract — update() runs on every sort/hover change and must be cheap.
 */
class TwoLineHeaderRenderer implements HeaderRenderer {
  render(element: HTMLElement, params: HeaderRenderParams): void {
    element.className = 'zg-header-cell sc-hdr-2line';
    element.style.width = `${params.width}px`;
    element.style.height = `${params.height}px`;
    element.style.flexShrink = '0';
    element.style.boxSizing = 'border-box';

    const wrap = document.createElement('div');
    wrap.className = 'sc-hdr-2line-wrap';

    const title = document.createElement('span');
    title.className = 'sc-hdr-2line-title';
    title.textContent = params.config.text;

    const caption = document.createElement('span');
    caption.className = 'sc-hdr-2line-caption';
    caption.textContent = this.caption(params);

    const chip = document.createElement('span');
    chip.className = 'sc-hdr-2line-chip';

    const top = document.createElement('div');
    top.className = 'sc-hdr-2line-top';
    top.append(title, chip);
    wrap.append(top, caption);
    element.replaceChildren(wrap);
    this.paintChip(chip, params);
  }

  update(element: HTMLElement, params: HeaderRenderParams): void {
    if (element.style.width !== `${params.width}px`) element.style.width = `${params.width}px`;
    const chip = element.querySelector('.sc-hdr-2line-chip') as HTMLElement | null;
    if (chip) this.paintChip(chip, params);
  }

  destroy(element: HTMLElement): void {
    element.replaceChildren();
  }

  private caption(params: HeaderRenderParams): string {
    return (params.config as any).rendererData?.caption ?? params.column.field;
  }

  private paintChip(chip: HTMLElement, params: HeaderRenderParams): void {
    const dir = params.sortDirection;
    chip.textContent = dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : '↕';
    chip.dataset['active'] = dir ? 'true' : 'false';
  }
}

export const build: PageBuild = (host) => {
  const columns = [
    { field: 'name', width: 200, renderer: 'text', sortable: true,
      header: { text: 'Employee', type: 'custom', renderer: 'two-line', rendererData: { caption: 'full name' } } },
    { field: 'department', width: 180, renderer: 'text', sortable: true,
      header: { text: 'Department', type: 'custom', renderer: 'two-line', rendererData: { caption: 'business unit' } } },
    { field: 'role', width: 150, renderer: 'text', sortable: true,
      header: { text: 'Role', type: 'custom', renderer: 'two-line', rendererData: { caption: 'seniority' } } },
    { field: 'salary', width: 150, renderer: 'number', sortable: true,
      header: { text: 'Salary', type: 'custom', renderer: 'two-line', rendererData: { caption: 'USD / year' } } },
  ];

  const b1 = addBlock(host, {
    title: 'Custom Header Components',
    desc:
      'When the built-in header types aren’t enough, register a HeaderRenderer and reference it ' +
      'by name from the column’s header config (type: "custom", renderer: "<name>"). A renderer ' +
      'owns three methods: render (build the DOM once), update (react cheaply to state like sort ' +
      'direction, hover, or width), and destroy (clean up). Here every header is a two-line ' +
      'component with a caption and a sort chip — click a header to see update() run.',
    usage:
      "class TwoLineHeaderRenderer implements HeaderRenderer {\n" +
      "  render(el, params) { /* build title + caption + chip */ }\n" +
      "  update(el, params) { /* repaint chip from params.sortDirection */ }\n" +
      "  destroy(el) { el.replaceChildren(); }\n" +
      "}\n" +
      "grid.registerHeaderRenderer('two-line', new TwoLineHeaderRenderer());\n" +
      "// column: { header: { text: 'Salary', type: 'custom', renderer: 'two-line' } }",
    height: 340,
  });

  const grid = createGrid(b1.demo, {
    columns,
    data: teamData(500).map((r) => PICK.map((i) => r[i])),
    overrides: { headerHeight: 56 },
  });
  grid.registerHeaderRenderer('two-line', new TwoLineHeaderRenderer());
  grid.refreshHeaders();

  return () => destroyGrid(grid);
};
