// Client runtime for the docs DemoPlayground. Runs the reader's snippet against
// the real @zengrid/enterprise bundle (core grid API + enterprise features),
// swaps between per-feature variants (each its
// own snippet + hint + live controls), and drives the grid API from control
// buttons — all in the reader's browser, no iframe, no bundler. The engine +
// CodeMirror are dynamic-imported and mounted lazily on scroll, so nothing here
// weighs on initial page load.
import { generateRows, zenGridTheme } from '../../../config/demo-grid';
import { buildEditorTheme } from './editor-theme';
// Core + enterprise grid CSS, imported statically as one bundled asset so Vite
// reliably emits it (see the file's header for why the split imports fail).
import '../../../styles/zengrid.css';

/** A control button that acts on the live grid without editing the snippet. */
export interface DemoControl {
  label: string;
  /** JS run with (grid, zg, rows) in scope — e.g. `grid.sort.clear()`. */
  action: string;
}

/** One switchable example within a playground. */
export interface DemoVariant {
  id: string;
  label: string;
  /** Short, plain-text pointer at what to tweak for this variant. */
  hint?: string;
  /**
   * The editable snippet. In scope: Zengrid, mount, mountGrid, rows, currency,
   * chips, zg. `mountGrid(el, options)` builds a second grid the engine themes
   * and disposes alongside the primary one (for multi-grid demos like
   * grid-to-grid dragging).
   * Enterprise playgrounds (`enterprise` prop) also get `rowNumberColumn`,
   * `rowSpanning`, `rowPinning`, `RowPinManager`, `rowStyling`, `cellStyling`,
   * `RowDragManager`, `rowDragColumn`, `columnPinning`, `ColumnPinManager`,
   * `ColumnStateManager`, `columnGroups`, `autoGenerateColumns`,
   * `calculatedColumn`, `changeHighlight`, `cellNotes`, `fullWidthRows`,
   * `bigintFilter`, `setFilter`, `attachSetFilterUpdates`, `setFilterApi`,
   * `filterTheme`, `filterTemplates`, `FilterTemplateBar`, `numberEditor`,
   * `dateEditor`, `checkboxEditor`, `selectEditor`, `richSelectEditor`,
   * `popupEditor`, `undoRedo`, `fullRowEditing`, `cellValidation`,
   * `validationRules` and `rowGrouping`.
   */
  code: string;
  controls?: DemoControl[];
}

/**
 * Unlock the licensed `@zengrid/enterprise` features with an ephemeral, in-browser
 * evaluation license so they run in the docs demo. Memoised so the license is
 * minted and the LicenseManager configured exactly once per page (its verifier
 * seals on first configure). No private key ships — the demo self-issues the key
 * at runtime, exactly as the test suite does.
 */
let licensePromise: Promise<void> | null = null;
function ensureEvalLicense() {
  if (!licensePromise) {
    licensePromise = (async () => {
      const lic = await import('@zengrid/license');
      const keys = lic.generateLicenseKeyPair();
      lic.LicenseManager.instance.configure({ publicKey: keys.publicKey });
      lic.LicenseManager.instance.setLicenseKey(
        lic.encodeLicenseKey(
          {
            licensee: 'ZenGrid Docs (evaluation)',
            edition: 'enterprise',
            features: ['*'],
            issuedAt: Date.now() - 1000,
            expiresAt: null,
            keyVersion: 1,
          },
          keys.privateKey
        )
      );
    })();
  }
  return licensePromise;
}

// Smaller than the marketing demo so each re-run rebuilds instantly while still
// being far more rows than could ever sit in the DOM.
const PLAY_ROW_COUNT = 50_000;

const currentTheme = () =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

async function mount(host: HTMLElement) {
  if (host.dataset.mounted) return;
  host.dataset.mounted = '1';

  const variants: DemoVariant[] = JSON.parse(host.dataset.variants ?? '[]');
  if (!variants.length) return;

  const editorEl = host.querySelector<HTMLElement>('[data-zg-editor]')!;
  const gridEl = host.querySelector<HTMLElement>('[data-zg-grid]')!;
  const statusEl = host.querySelector<HTMLElement>('[data-zg-status]')!;
  const hintEl = host.querySelector<HTMLElement>('[data-zg-hint]')!;
  const ctrlEl = host.querySelector<HTMLElement>('[data-zg-controls]')!;
  const runBtn = host.querySelector<HTMLButtonElement>('[data-zg-run]')!;
  const resetBtn = host.querySelector<HTMLButtonElement>('[data-zg-reset]')!;
  const viewBtns = host.querySelectorAll<HTMLButtonElement>('[data-view-btn]');
  const tabBtns = host.querySelectorAll<HTMLButtonElement>('[data-variant-btn]');

  const [
    { EditorView, basicSetup },
    { keymap },
    { javascript },
    langMod,
    highlightMod,
    zg,
  ] = await Promise.all([
    import('codemirror'),
    import('@codemirror/view'),
    import('@codemirror/lang-javascript'),
    import('@codemirror/language'),
    import('@lezer/highlight'),
    import('@zengrid/enterprise'),
  ]);
  const { Zengrid, NumberRenderer, ChipRenderer } = zg;
  const editorTheme = buildEditorTheme({
    EditorView,
    HighlightStyle: langMod.HighlightStyle,
    syntaxHighlighting: langMod.syntaxHighlighting,
    tags: highlightMod.tags,
  });

  // Status chips read the site's pill CSS variables, so they re-colour with the
  // theme on every render — identical to the marketing demo.
  const chips = new ChipRenderer({
    size: 'small',
    chips: (params: { value: unknown }) => {
      const key = String(params.value).toLowerCase();
      const cs = getComputedStyle(document.documentElement);
      return [
        {
          label: String(params.value),
          color: cs.getPropertyValue(`--pill-${key}-bg`).trim() || '#eee',
          textColor: cs.getPropertyValue(`--pill-${key}-ink`).trim() || '#333',
        },
      ];
    },
  });
  const currency = new NumberRenderer({ style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  // Enterprise pages mint an eval license so licensed helpers run, then expose
  // them (from the enterprise bundle already loaded as `zg`) to snippets; other
  // pages skip the license and leave them undefined.
  let rowNumberColumn: unknown;
  let rowSpanning: unknown;
  let rowPinning: unknown;
  let RowPinManager: unknown;
  let rowStyling: unknown;
  let cellStyling: unknown;
  let RowDragManager: unknown;
  let rowDragColumn: unknown;
  let columnPinning: unknown;
  let ColumnPinManager: unknown;
  let ColumnStateManager: unknown;
  let columnGroups: unknown;
  let autoGenerateColumns: unknown;
  let calculatedColumn: unknown;
  let changeHighlight: unknown;
  let cellNotes: unknown;
  let fullWidthRows: unknown;
  let bigintFilter: unknown;
  let setFilter: unknown;
  let attachSetFilterUpdates: unknown;
  let setFilterApi: unknown;
  let filterTheme: unknown;
  let filterTemplates: unknown;
  let FilterTemplateBar: unknown;
  let numberEditor: unknown;
  let dateEditor: unknown;
  let checkboxEditor: unknown;
  let selectEditor: unknown;
  let richSelectEditor: unknown;
  let popupEditor: unknown;
  let undoRedo: unknown;
  let fullRowEditing: unknown;
  let cellValidation: unknown;
  let validationRules: unknown;
  let rowGrouping: unknown;
  let rowGroupPanel: unknown;
  let batchRowData: unknown;
  let rangeHandle: unknown;
  let fillHandle: unknown;
  if (host.dataset.enterprise) {
    await ensureEvalLicense();
    rowNumberColumn = zg.rowNumberColumn;
    rowSpanning = zg.rowSpanning;
    rowPinning = zg.rowPinning;
    RowPinManager = zg.RowPinManager;
    rowStyling = zg.rowStyling;
    cellStyling = zg.cellStyling;
    RowDragManager = zg.RowDragManager;
    rowDragColumn = zg.rowDragColumn;
    columnPinning = zg.columnPinning;
    ColumnPinManager = zg.ColumnPinManager;
    ColumnStateManager = zg.ColumnStateManager;
    columnGroups = zg.columnGroups;
    autoGenerateColumns = zg.autoGenerateColumns;
    calculatedColumn = zg.calculatedColumn;
    changeHighlight = zg.changeHighlight;
    cellNotes = zg.cellNotes;
    fullWidthRows = zg.fullWidthRows;
    bigintFilter = zg.bigintFilter;
    setFilter = zg.setFilter;
    attachSetFilterUpdates = zg.attachSetFilterUpdates;
    setFilterApi = zg.setFilterApi;
    filterTheme = zg.filterTheme;
    filterTemplates = zg.filterTemplates;
    FilterTemplateBar = zg.FilterTemplateBar;
    numberEditor = zg.numberEditor;
    dateEditor = zg.dateEditor;
    checkboxEditor = zg.checkboxEditor;
    selectEditor = zg.selectEditor;
    richSelectEditor = zg.richSelectEditor;
    popupEditor = zg.popupEditor;
    undoRedo = zg.undoRedo;
    fullRowEditing = zg.fullRowEditing;
    cellValidation = zg.cellValidation;
    validationRules = zg.validationRules;
    rowGrouping = zg.rowGrouping;
    rowGroupPanel = zg.rowGroupPanel;
    batchRowData = zg.batchRowData;
    rangeHandle = zg.rangeHandle;
    fillHandle = zg.fillHandle;
  }

  const rows = generateRows(PLAY_ROW_COUNT);
  let grid: any = null;
  let active = 0;

  // Secondary grids a snippet builds itself (e.g. the grid-to-grid demo). The
  // engine themes and destroys them alongside the primary grid, so multi-grid
  // demos don't have to reach for `currentTheme`/`zenGridTheme` or leak instances
  // across re-runs. `mountGrid(el, options)` constructs one, tracks it, and hands
  // it back for the snippet to `setData`/wire.
  const extraGrids: any[] = [];
  const mountGrid = (el: HTMLElement, options: unknown) => {
    const g = new Zengrid(el, options as any);
    extraGrids.push(g);
    return g;
  };
  const themeAll = () => {
    const theme = zenGridTheme(currentTheme());
    for (const g of extraGrids) { try { g.setTheme(theme); g.refresh(); } catch { /* gone */ } }
  };
  const destroyExtras = () => {
    for (const g of extraGrids) { try { g.destroy(); } catch { /* already gone */ } }
    extraGrids.length = 0;
  };

  const setStatus = (state: 'ok' | 'err', msg: string) => {
    statusEl.textContent = msg;
    statusEl.dataset.state = state;
    statusEl.hidden = false;
  };

  const run = () => {
    if (grid) {
      try { grid.destroy(); } catch { /* already gone */ }
      grid = null;
    }
    destroyExtras();
    // Toolbars a snippet inserts as a grid sibling (e.g. the row group panel) live
    // outside gridEl, so clear them here too or re-runs would stack them.
    for (const el of host.querySelectorAll('.zg-row-group-panel')) el.remove();
    gridEl.replaceChildren();
    const code = view.state.doc.toString();
    try {
      const factory = new Function(
        'Zengrid', 'mount', 'mountGrid', 'rows', 'currency', 'chips', 'zg', 'rowNumberColumn', 'rowSpanning', 'rowPinning', 'RowPinManager', 'rowStyling', 'cellStyling', 'RowDragManager', 'rowDragColumn', 'columnPinning', 'ColumnPinManager', 'ColumnStateManager', 'columnGroups', 'autoGenerateColumns', 'calculatedColumn', 'changeHighlight', 'cellNotes', 'fullWidthRows', 'bigintFilter', 'setFilter', 'attachSetFilterUpdates', 'setFilterApi', 'filterTheme', 'filterTemplates', 'FilterTemplateBar', 'numberEditor', 'dateEditor', 'checkboxEditor', 'selectEditor', 'richSelectEditor', 'popupEditor', 'undoRedo', 'fullRowEditing', 'cellValidation', 'validationRules', 'rowGrouping', 'rowGroupPanel', 'batchRowData', 'rangeHandle', 'fillHandle',
        `${code}\n;return typeof grid !== 'undefined' ? grid : null;`
      );
      grid = factory(Zengrid, gridEl, mountGrid, rows, currency, chips, zg, rowNumberColumn, rowSpanning, rowPinning, RowPinManager, rowStyling, cellStyling, RowDragManager, rowDragColumn, columnPinning, ColumnPinManager, ColumnStateManager, columnGroups, autoGenerateColumns, calculatedColumn, changeHighlight, cellNotes, fullWidthRows, bigintFilter, setFilter, attachSetFilterUpdates, setFilterApi, filterTheme, filterTemplates, FilterTemplateBar, numberEditor, dateEditor, checkboxEditor, selectEditor, richSelectEditor, popupEditor, undoRedo, fullRowEditing, cellValidation, validationRules, rowGrouping, rowGroupPanel, batchRowData, rangeHandle, fillHandle);
      if (!grid || typeof grid.setTheme !== 'function') {
        throw new Error('Assign your grid to a `grid` variable.');
      }
      grid.setTheme(zenGridTheme(currentTheme()));
      grid.refresh();
      themeAll();
      // Report the grid's real row count, not the constant — snippets that
      // `setData` their own rows (row spanning, pinning, …) have far fewer than
      // the 50k pool, so the constant would lie.
      let count = PLAY_ROW_COUNT;
      try {
        const actual = grid.getStore?.().get('rows.count');
        if (typeof actual === 'number' && actual > 0) count = actual;
      } catch { /* fall back to the pool size */ }
      setStatus('ok', `${count.toLocaleString('en-US')} rows · running`);
    } catch (err) {
      setStatus('err', err instanceof Error ? err.message : String(err));
    }
  };

  let debounce: number | undefined;
  const scheduleRun = () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(run, 550);
  };

  const view = new EditorView({
    doc: variants[active].code,
    parent: editorEl,
    extensions: [
      basicSetup,
      javascript(),
      ...editorTheme,
      EditorView.lineWrapping,
      keymap.of([{ key: 'Mod-Enter', run: () => { run(); return true; } }]),
      EditorView.updateListener.of((u) => { if (u.docChanged) scheduleRun(); }),
    ],
  });

  // Live control buttons act on the running grid instance without touching the
  // snippet — the reader still sees the code, the button just calls the API.
  const runControl = (act: string) => {
    if (!grid) return;
    try {
      new Function('grid', 'zg', 'rows', act)(grid, zg, rows);
      grid.refresh();
    } catch (err) {
      setStatus('err', err instanceof Error ? err.message : String(err));
    }
  };

  const renderControls = () => {
    ctrlEl.replaceChildren();
    const controls = variants[active].controls ?? [];
    ctrlEl.hidden = controls.length === 0;
    for (const c of controls) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'zg-play__ctrl';
      b.textContent = c.label;
      b.addEventListener('click', () => runControl(c.action));
      ctrlEl.appendChild(b);
    }
  };

  const selectVariant = (i: number) => {
    active = i;
    tabBtns.forEach((b, idx) => b.setAttribute('aria-pressed', String(idx === i)));
    hintEl.textContent = variants[i].hint ?? '';
    hintEl.hidden = !variants[i].hint;
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: variants[i].code } });
    renderControls();
    run();
  };
  tabBtns.forEach((b, idx) => b.addEventListener('click', () => selectVariant(idx)));

  // Code / Demo / Split toggle — mirror the simple Playground's re-measure/refit.
  const setView = (mode: string) => {
    host.dataset.view = mode;
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewBtn === mode)));
    if (mode === 'code' || mode === 'split') view.requestMeasure();
    if (mode === 'demo' || mode === 'split') requestAnimationFrame(() => grid?.refresh());
  };
  viewBtns.forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewBtn!)));
  setView(host.dataset.view || 'split');

  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', () => {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: variants[active].code } });
    run();
  });

  new MutationObserver(() => {
    if (grid) {
      grid.setTheme(zenGridTheme(currentTheme()));
      grid.refresh();
    }
    themeAll();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  selectVariant(active);
}

export function observePlaygrounds(selector: string) {
  for (const host of document.querySelectorAll<HTMLElement>(selector)) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              obs.disconnect();
              mount(host);
            }
          }
        },
        { rootMargin: '250px' }
      );
      io.observe(host);
    } else {
      mount(host);
    }
  }
}
