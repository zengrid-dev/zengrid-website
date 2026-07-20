import { el } from '../dom';
import { addBlock } from '../example-block';
import { createGrid, destroyGrid } from '../grid-factory';
import { TextEditor, CheckboxEditor, DateEditor, DateRangeEditor, DropdownEditor } from '@zengrid/core';
import {
  STATUS, TIERS, asOptions, editorRows, pick,
  checkboxRenderer, dateRenderer, rangeRenderer,
} from './editors-support';
import type { PageBuild } from '../registry';
import type { Grid } from '@zengrid/core';

const HINT = 'Double-click a cell — or select it and press Enter — to edit. Enter commits, Esc cancels.';
const hint = (bar: HTMLElement) => bar.append(el('span', 'muted', HINT));

export const build: PageBuild = (host) => {
  const rows = editorRows(400);
  const grids: Grid[] = [];
  const mount = (demo: HTMLElement, columns: any[], cols: number[]): Grid => {
    const g = createGrid(demo, { columns, data: pick(rows, cols), rowHeight: 40 });
    grids.push(g);
    return g;
  };

  // 1 — Text & Number
  {
    const { demo, bar } = addBlock(host, {
      title: 'Text & Number Editors',
      desc: 'The text editor is a single-line input; the number editor is a numeric spinner with min/max/step. Text options are passed to the editor instance, while number options come from the column’s editorOptions.',
      usage:
        "{ field:'name', editable:true,\n  editor:new TextEditor({ placeholder:'Full name', selectAllOnFocus:true }) }\n{ field:'age', editable:true, editor:'number',\n  editorOptions:{ min:18, max:72, step:1 } }",
      height: 300,
    });
    mount(demo, [
      { field: 'name', header: 'Name', width: 220, renderer: 'text', editable: true,
        editor: new TextEditor({ placeholder: 'Full name', selectAllOnFocus: true }) },
      { field: 'age', header: 'Age', width: 120, renderer: 'number', editable: true,
        editor: 'number', editorOptions: { min: 18, max: 72, step: 1 } },
    ], [0, 1]);
    hint(bar);
  }

  // 2 — Checkbox
  {
    const { demo, bar } = addBlock(host, {
      title: 'Checkbox Editor',
      desc: 'For boolean cells the checkbox editor toggles the value in place. Configure it through the editor instance (label, indeterminate state, custom text).',
      usage: "{ field:'active', editable:true, editor:new CheckboxEditor({ label:'Enabled' }) }",
      height: 300,
    });
    mount(demo, [
      { field: 'name', header: 'Name', width: 220, renderer: 'text' },
      { field: 'active', header: 'Active', width: 120, renderer: checkboxRenderer(), editable: true,
        editor: new CheckboxEditor({ label: 'Enabled' }) },
    ], [0, 2]);
    hint(bar);
  }

  // 3 — Select & Dropdown
  {
    const { demo, bar } = addBlock(host, {
      title: 'Select & Dropdown Editors',
      desc: 'The select editor is a native dropdown driven by editorOptions.options. The dropdown editor is a richer, searchable menu configured on its instance — use it for longer option sets.',
      usage:
        "{ field:'status', editable:true, editor:'select',\n  editorOptions:{ options:[{value,label}], allowEmpty:false } }\n{ field:'tier', editable:true,\n  editor:new DropdownEditor({ options:[{value,label}], searchable:true }) }",
      height: 320,
    });
    mount(demo, [
      { field: 'name', header: 'Name', width: 200, renderer: 'text' },
      { field: 'status', header: 'Status', width: 150, renderer: 'text', editable: true,
        editor: 'select', editorOptions: { options: asOptions(STATUS), allowEmpty: false } },
      { field: 'tier', header: 'Tier', width: 160, renderer: 'text', editable: true,
        editor: new DropdownEditor({ options: asOptions(TIERS), searchable: true, placeholder: 'Choose tier' }) },
    ], [0, 3, 4]);
    hint(bar);
  }

  // 4 — Date & Date Range
  {
    const { demo, bar } = addBlock(host, {
      title: 'Date & Date Range Editors',
      desc: 'The date editor opens a calendar popup for a single date; the date range editor picks a start and end together. Both are instance-configured (format, min/max, theme). Time and DateTime editors ship as well for finer-grained values.',
      usage:
        "{ field:'joined', editable:true,\n  editor:new DateEditor({ format:'DD/MM/YYYY', useCalendarPopup:true }) }\n{ field:'duration', editable:true,\n  editor:new DateRangeEditor({ format:'DD/MM/YYYY' }) }",
      height: 340,
    });
    mount(demo, [
      { field: 'name', header: 'Name', width: 180, renderer: 'text' },
      { field: 'joined', header: 'Joined', width: 160, renderer: dateRenderer(), editable: true,
        editor: new DateEditor({ format: 'DD/MM/YYYY', useCalendarPopup: true }) },
      { field: 'duration', header: 'Duration', width: 220, renderer: rangeRenderer(), editable: true,
        editor: new DateRangeEditor({ format: 'DD/MM/YYYY' }) },
    ], [0, 5, 6]);
    hint(bar);
  }

  return () => grids.forEach(destroyGrid);
};
