# Docs Feature Completion — Iteration Handover

This is the **playbook** for bringing ZenGrid's feature docs up to standard, **one
feature at a time**. When the user says *"proceed for next one"* (usually right
after clearing context), read this file, pick the **next unchecked feature in
sidebar order**, complete it end-to-end, tick it off here, and stop.

Do **one** feature per turn. Never batch several features together.

---

## The loop (what "proceed for next one" means)

1. **Pick the next feature.** Walk the sidebar in `astro.config.mjs`
   (`sidebar:`) top-to-bottom. The next feature is the first one **after the last
   one checked in the Progress Log below** that isn't already conformant. Skip
   pages that already embed a live `<DemoPlayground>` and are correctly tiered.
2. **Determine the real tier on the fly** (core vs enterprise) — see *Tiering*.
   **Do not trust the page's existing label**; docs have mislabeled features.
3. **Verify lib support before building** (see *Lib-gap rule*). Read the actual
   source, not `node_modules`:
   - Core: `../zengrid/packages/core/src`
   - Enterprise: `../zengrid-enterprise/packages/enterprise/src`
4. **If there's a gap or a mislabel**, fix it in the **library**, not the site
   (see *Lib-gap rule*). Rebuild the lib dist.
5. **Write the doc** to the *Definition of done* below.
6. **Verify** headlessly (see *Verification*).
7. **Update the Progress Log**, note anything the user must decide (releases,
   publishes), and **stop** — one feature per turn.

---

## Rule: every demo is built with `@zengrid/enterprise`

**All** live demos — community *and* enterprise pages — are created with the
`@zengrid/enterprise` package. Its `/grid` bundle re-exports the full core API, so
`Zengrid`, the renderers, and every enterprise helper come from one place. **Never
import `@zengrid/core` in site/demo source** (it stays only as a transitive
external + vite alias). All demo runtimes already do this — engine, `Playground`,
`GridDemo`, `LiveGrid` — so any new demo just follows suit.

- Community pages: import surface is enterprise; no license needed.
- Enterprise pages: add the `enterprise` prop to `<DemoPlayground>` — the engine
  mints the ephemeral eval license and exposes the licensed helpers to snippets.

## Definition of done (every feature page)

- **Correct tier badge** via `<FeatureMeta tier="community|enterprise" />`
  (`src/components/docs/FeatureMeta.astro`). Set `tier: …` in frontmatter too.
- **Prose above the demo** explains the feature and how to customize it.
- **One live, editable `<DemoPlayground>`** unique to this feature — never reuse
  another page's example.
- **Multiple variants** that surface **all** of the feature's customization
  (options, styles, variants) — show them, don't just describe. Each variant has
  a short `hint`; add `controls` when a live API call illustrates the point.
- **Enterprise pages**: pass the `enterprise` prop to `<DemoPlayground>` so the
  engine mints the in-browser eval license and exposes the enterprise helpers to
  snippets.
- **No right-hand ToC** (globally off — don't re-enable).
- Verified rendering in dev **and** a passing `npm run build`.

Reference implementations (copy the pattern, don't reinvent): `row-data.mdx`,
`row-sorting.mdx`, `row-pagination.mdx` (community), `row-numbers.mdx`
(enterprise).

---

## Tiering — identify on the fly

The page label may be wrong. Decide by what the **library** actually provides:

- Buildable from **core** (`../zengrid/packages/core/src`) with a public API →
  **community**. Demo imports run against `@zengrid/enterprise` too (it re-exports
  core), so `Zengrid` + renderers are always in scope.
- Requires a **premium/licensed** manager (spanning, freezing, outline/grouping,
  conditional formatting, row numbers, formulas, query, export) → **enterprise**.
  These live in `../zengrid-enterprise` and are license-gated.
- If a feature *should* be premium but the doc calls it core (or vice-versa),
  **flag it to the user** and set the correct tier.

The site consumes the grid **only** through `@zengrid/enterprise` (its `/grid`
bundle re-exports the core API). Do **not** add new `@zengrid/core` imports in
site source — import from `@zengrid/enterprise`. (`@zengrid/core` remains only a
transitive external + vite alias.)

---

## Lib-gap rule (hard rule)

If a feature needs a workaround/hack, or is missing, or is mis-tiered, the fix
belongs in the **library**, never papered over in the site:

- Core behavior/bug/missing API → fix in `../zengrid`; rebuild `npx nx build core`.
- Premium feature → build it in `../zengrid-enterprise` (headless, license-gated
  manager + a thin renderer/column helper if it needs rendering wiring), add
  tests, rebuild `npx nx build enterprise`.
- **Always tell the user** the specifics so a lib release can be planned, and
  **record it** as a lib-DX recommendation (see project memory
  `output-lib-dx-recommendations`).

**Found a better way while developing?** Tell the user. If it's feasible and
belongs in the lib, propose adding it there rather than to the site.

---

## Reusable components & where things live

Build/extend **shared** components — never copy-paste per page. No file > 200
lines; split by concern. Performance first (lazy mount, dynamic imports).

- `src/components/docs/DemoPlayground.astro` — the demo shell (variant tabs,
  editor, grid, controls, hint). Props: `variants`, `height`, `view`,
  `enterprise`.
- `src/components/docs/playground/engine.ts` — client runtime. Snippet scope:
  `Zengrid, mount, rows, currency, chips, zg` (+ `rowNumberColumn` and future
  enterprise helpers on `enterprise` pages). Lazy-mounts on scroll.
- `src/components/docs/FeatureMeta.astro` — Since/tier/deprecated badges.
- `src/config/demo-grid.ts` — shared row generator + theme.
- Enterprise plumbing (already wired): site imports `@zengrid/enterprise` +
  `@zengrid/enterprise/styles.css`; the engine mints an ephemeral eval license
  (`ensureEvalLicense`, memoized once per page). Add each new enterprise helper
  to the engine's snippet scope the same way `rowNumberColumn` was added.

When a variant needs a new bit of runtime in scope, add it to the engine once and
reuse it across pages.

---

## Verification (headless)

Use the project's headless workflow (see memory `headless-verify-workflow`):
Playwright from the npx cache + system Chrome, driven from `/tmp`.

- Dev server: `npm run dev -- --background` (never bare `astro dev`; predev clears
  `.astro`). Manage with `npx astro dev stop|status|logs`. Note the printed port.
- Load the page, switch to the Demo/Split view, click through every variant,
  screenshot each, and assert the grid rendered (status `ok`, cells present, no
  real console errors). A transient `504 Outdated Optimize Dep` or the Astro
  **dev-toolbar** 504 is benign.
- Finish with `npm run build` (must complete cleanly).

---

## Dev-only wiring caveats (before shipping)

The site points `@zengrid/core`, `@zengrid/enterprise`, `@zengrid/license` at
local `dist` via `astro.config.mjs` vite aliases. These are **dev-only**. Before
shipping: publish the changed packages, add real site deps, remove the aliases.
Any further lib source edit needs a rebuild (`npx nx build core|enterprise`) since
aliases target `dist`. See memory `pagination-bar-not-wired`,
`row-numbers-enterprise`.

---

## Progress Log (source of truth for "next one")

Order follows the sidebar in `astro.config.mjs`. Tick when a page meets the
*Definition of done*. Some early pages predate this doc.

**Features → Rows**
- [x] Row Data — community, live demo
- [x] Row Sorting — community, live demo
- [x] Row Numbers — **enterprise** (built `RowNumberManager` + `rowNumberColumn`
      in `../zengrid-enterprise`; `@zengrid/enterprise/grid` subpath)
- [x] Row Spanning — **enterprise** (built core `spanProvider` render-hook +
      enterprise-gated `rowSpanning()` provider; live demo w/ 3 variants; verified
      headless + prod build). Release: publish core 1.4.0 + drop enterprise
      tsconfig path.
- [x] Row Pinning — **enterprise** (built core `pinProvider` mechanism +
      enterprise `RowPinManager`/`rowPinning`; identity-based pins + standalone
      `topRowData`/`bottomRowData` summary rows; live demo w/ 3 variants, verified
      headless + prod build). Release: publish core + bump enterprise core dep.
- [x] Row Height — **community** (fully core-supported, no lib change needed).
      Verified real support: `rowHeight` number → `UniformHeightProvider`,
      `rowHeight` number[] → `VariableHeightProvider`, and measured modes
      `rowHeightMode: 'auto' | 'content-aware'` via `RowHeightManager` +
      `CellPositioner` two-phase RAF measurement — a column only grows a row when
      it's marked `autoHeight: true` **and** wraps (`overflow: { mode: 'wrap' }`,
      backed by bundled `cell-overflow.css`). `rowHeightConfig` clamps min/max.
      Rewrote the stub (fictional-API page) into 4 live variants (uniform,
      per-row array, auto-fit, content-aware); verified headless (heights: uniform
      40, per-row 76/38, auto & content-aware grow long rows to 63) + prod build.
      Lib-DX nit to report: `column.ts` `autoHeight` doc-comment still says mode
      `'hybrid'` which doesn't exist (real modes are `fixed|auto|content-aware`).
- [x] Styling Rows — **enterprise** (no core `rowClass`/`rowStyle` existed; built
      core render hook `rowStyleProvider` + `RowStyleProvider` interface in
      `../zengrid` — cell-pooled grid stamps row class/style onto every cell — and
      license-gated `rowStyling()` provider in `../zengrid-enterprise` (static +
      callback `rowClass`/`rowStyle`, camelCase→kebab). Wired `getRowData` into the
      rendering plugin's positioner callbacks so callbacks receive row data. Live
      demo w/ 3 variants (zebra, data-driven, class hooks); verified headless +
      prod build. Release: publish core + enterprise, bump enterprise core dep.)
- [x] Row Pagination — community, live demo (done out of order)
- [x] Accessing Rows — **community** (the stub's claim that `getData` matches the
      screen was wrong: `grid.getData(row,col)` reads the *source* accessor with no
      viewIndices/column-order mapping. Built a proper public `grid.rows` API in
      **core** (`grid/api/rows-api.ts`): source-stable reads (`getSourceValue`,
      `getSourceRow`, `getSourceRowCount`) + display-aware reads that follow
      sort/filter and visible column order (`getDisplayedValue`, `getDisplayedRow`,
      `getDisplayedRowData`, `getDisplayedRowCount`, `forEachDisplayedRow`) + index
      mappers (`toSourceIndex`/`toDisplayedIndex`). Also fixed a core normalization
      gap — `colCount` now derives from `columns.length` when omitted, so filtering
      works without a redundant `colCount` (grid-setup.ts). 4 new specs; 1923 core
      tests pass. Live demo w/ 3 variants (source vs displayed, whole rows/objects,
      index mapping under a filter); verified headless + prod build. Release:
      **publish core** (new `grid.rows` API + colCount fix); enterprise needs no
      change — core is external there and re-exported through `/grid`.)
- Row Dragging → Managed / Unmanaged / Customisation / External DropZone /
      Grid to Grid
  - [x] **Managed Row Dragging** — **enterprise** (no row-drag existed in either
        lib; per the user's steer, built it in `../zengrid-enterprise`). New
        `RowDragManager` (license-gated `row-dragging`): owns the pointer
        interaction (whole-row or `{ handle: true }`), renders a drop-line
        indicator, and on drop reorders the grid's data via its own `setData`
        + `refresh` so the order sticks. Pure, tested helpers `planReorder`
        (display→source splice, no-op detection) + `moveRow`. Handle column
        helper `rowDragColumn()` (grip glyph + `zg-row-drag-handle` marker,
        configurable glyph/width/header). `onChange(fn)` reports each reorder
        (fromRow/toRow/fromSource/toSource). No core change needed — cells
        already expose `data-row`, and reorder rides `grid.setData` + `grid.rows`.
        Styles self-injected once (no enterprise CSS bundle). Engine exposes
        `RowDragManager`/`rowDragColumn` to enterprise snippets. Live demo w/ 3
        variants (whole-row, handle, custom grip + onChange); verified headless
        (real Playwright drag reorders rows + drop indicator renders) + prod
        build; 8 new specs (175 enterprise tests pass). **Release: publish
        enterprise** (new `row-dragging` API); core unchanged.
  - [x] **Unmanaged Row Dragging** — **enterprise** (extended the existing
        `RowDragManager` in `../zengrid-enterprise` rather than a new manager). Added
        an unmanaged mode: `new RowDragManager({ managed: false })` runs the pointer
        gesture + drop indicator but leaves the data untouched. New `onDrag(fn)`
        subscription fires a `RowDragEvent` on every phase (`start`/`move`/`drop`)
        with `fromRow/fromSource/overRow/insertBeforeRow` and, on `drop`, the same
        `ReorderPlan` managed would apply (`null` for a no-op) — the app applies it
        (`moveRow`), vetoes it, or routes it elsewhere. Refactored the drop path into
        pure `planFor` + `applyReorder`; managed still commits via `applyReorder`
        (`onChange` unchanged, backward-compatible; default `managed: true`). Exported
        `RowDragEvent`/`RowDragPhase`. Live demo w/ 3 variants (events-only/no-reorder,
        app owns the commit, custom drop rule that locks the top row); verified
        headless (variant 0 drags but does NOT reorder; variant 1 reorders via app
        code; variant 2 reorders yet vetoes moving the locked row) + prod build; 2 new
        specs (node-env: config accept + onDrag unsubscribe). **Release: publish
        enterprise** (new `managed`/`onDrag` API); core unchanged.
  - [x] **Row Dragging Customisation** — **enterprise** (extended the existing
        `RowDragManager` in `../zengrid-enterprise` — no new manager). The page is
        about *how the drag looks/feels*, so added three presentation options to
        `RowDragManagerConfig`: `dropIndicatorClass` (extra class on the built-in
        `zg-row-drop-indicator` line, additive), `draggingRowClass` (stamped onto
        the source row's cells for the duration of the drag, auto-removed on
        cleanup), and `ghost?: boolean | RowDragGhostConfig` — a floating preview
        appended to `document.body` that tracks the pointer (`showGhost`/`moveGhost`),
        defaulting its label to the dragged row's first non-handle cell text
        (`defaultGhostText`) or a custom `label({fromRow,fromSource})`, with
        `className`/`offset`. New `.zg-row-drag-ghost` section in enterprise
        `styles.css`. Handle customisation already existed via `rowDragColumn()`
        (glyph/width/header/className) — demoed, not re-built. Exported
        `RowDragGhostConfig`/`RowDragGhostContext` from `grid/index.ts`. Engine
        needed no change (options ride the already-scoped `RowDragManager`). Live
        demo w/ 3 variants (custom grip, drag ghost, styled drop line + faded
        origin row — each injects its own demo CSS once); verified headless (real
        Playwright drag: grip color #7c3aed, ghost pill "Moving row 2" bg #7c3aed,
        drop line 4px/#7c3aed, origin opacity 0.4) + prod build. 1 new spec (230
        enterprise tests pass). **Release: publish enterprise** (new
        `dropIndicatorClass`/`draggingRowClass`/`ghost` API); core unchanged.
  - [x] **External DropZone** — **enterprise** (extended the existing
        `RowDragManager` in `../zengrid-enterprise`; no new manager, **no core
        change**). Rows can now be dragged *out* of the grid onto any external
        element. New `addRowDropZone(zone)` / `removeRowDropZone(zone)` register a
        `RowDropZone` (`getContainer` + optional `onDragEnter`/`onDragging`/
        `onDragLeave`/`onDrop`, each handed `RowDropZoneParams`:
        `fromRow`/`fromSource`/`rowData` (a copied source-cell snapshot)/`container`/
        `event`). During a drag the manager hit-tests zones by pointer clientX/Y
        (rect containment, independent of the ghost/elementFromPoint), suppresses
        its in-grid drop indicator (`hideIndicator`) while over a zone, toggles a
        default `zg-row-drop-zone-active` class (new base rule in enterprise
        `styles.css`), and fires the hooks. An external drop **never** reorders the
        grid — in managed *or* unmanaged mode `handleUp` hands off to the zone's
        `onDrop` and returns before `applyReorder` — so one manager supports both
        in-grid reorder and drag-out at once. Exported `RowDropZone`/
        `RowDropZoneParams` from `grid/index.ts`; engine needs no change (options
        ride the already-scoped `RowDragManager`). Live demo w/ 3 variants (drop to
        remove w/ `managed:false`; shortlist w/ `managed:true` + in-grid reorder
        still works; two zones + live `onDragging` status). 2 node-safe specs
        (addRowDropZone unsubscribe + removeRowDropZone no-op); 263 enterprise green.
        Verified headless (real handle→zone PointerEvent drag: trash removes a row
        8→7 w/ indicator suppressed + zone-active toggled; shortlist keeps 8 rows +
        collects the name; two-zone routes "✓ Approve: Kenji Okafor"; 0 console
        errors) + clean `npm run build`. **Release: publish enterprise** (new
        `addRowDropZone`/`removeRowDropZone` + `RowDropZone`/`RowDropZoneParams` API
        + `zg-row-drop-zone-active` CSS); core unchanged.
  - [x] **Grid to Grid** — **enterprise** (extended the existing `RowDragManager`
        in `../zengrid-enterprise`; **no core change**). New
        `getRowDropZone(options?)` returns a `RowDropZone` bound to *its* grid that
        **receives** a row from another grid: while a row from grid A hovers grid B
        it shows an in-grid drop line (its own `incomingIndicator`, independent of
        the source drag) + the `zg-row-drop-zone-active` outline, and on release
        inserts the dragged source-row snapshot at the hovered display position
        (`insertIncoming` → new pure `insertRow` helper). Wire it with
        `gridAManager.addRowDropZone(gridBManager.getRowDropZone())`; do both
        directions for two-way. Default is a **move**: added `removeSource: () =>
        void` to `RowDropZoneParams` (source manager closure that splices its own
        row out) and `getRowDropZone({ removeSource })` (default `true`) calls it —
        `false` = copy. `onDrop(GridRowDropParams)` fires after insert
        (`rowData`/`insertBeforeRow`/`toSource`/`grid`/`event`). In-grid reorder
        and cross-grid transfer coexist on the same managers (handleUp checks the
        active zone before `applyReorder`). Exported `insertRow` +
        `GridRowDropParams`/`GridRowDropZoneOptions` from `grid/index.ts`. 5 new
        specs (273 enterprise green). **Engine:** added `mountGrid(el, options)` to
        the snippet scope — builds a *second* grid the engine themes (light/dark)
        and destroys alongside the primary, so multi-grid demos don't leak or need
        `zenGridTheme`. Rewrote the ComingSoon stub into 3 live variants (two-way
        move, copy-only palette `removeSource:false`, one-way Inbox→Done with a live
        `onDrop` count + console log); whole-row drag (no handle) to keep the
        positional data aligned. Verified headless (real Playwright pointer drag
        across grids: move removes from A + inserts into B at the drop row; copy
        keeps A + duplicates into B; onDrop moves to the empty Done grid, updates
        "Done (1)", logs `completed Aria Vaskov {insertBeforeRow:0,toSource:0}`; 0
        console errors) + clean `npm run build`. **Release: publish enterprise**
        (new `getRowDropZone`/`insertRow` + `removeSource` on `RowDropZoneParams`);
        core unchanged. **Lib-DX to report:** a *leading* no-data column
        (`rowDragColumn()` at index 0) shifts every data column by one under
        positional array data — `column-model` assigns `dataIndex = array index`,
        so the managed/handle/customisation demos actually render Name-column=Role,
        etc. A `field`→data-key mapping (or an explicit `dataIndex`/`valueGetter`
        on the grip column) would fix it; for now this demo uses whole-row drag to
        avoid the shift.
- [x] **Full Width Rows** — **split tier** (no full-width mechanism existed in
      either lib). **Core (community hook):** new render hook `fullWidthProvider`
      + `FullWidthRowProvider`/`FullWidthRowContext`/`FullWidthRowResult` in
      `../zengrid` (`rendering/full-width/full-width.ts`). The cell-positioner now
      computes which visible rows are full-width each pass, **skips their
      per-column cells** (body loop, `refresh`, and the pinned-column loop) and
      draws **one** cell spanning the whole content width (col 0's left edge →
      last col's right edge) in the scrolling cells container with the provider's
      renderer/classes/style — rides the canvas so ordinary scroll needs no
      per-frame JS. Wired through `GridOptions`, positioner interface,
      rendering-plugin (`subscribe→refresh` + teardown). Base CSS
      `.zg-cell-full-width` in `styles/grid.css`. 4 core specs (spans full width,
      skips per-column cells, applies classes/style, no-op without provider); core
      **1969** green. **Enterprise (advanced):** license-gated `fullWidthRows()`
      (`full-width-rows` feature) in
      `../zengrid-enterprise/.../grid/full-width-rows.ts` — `isFullWidth`
      predicate + `render` (string **or** `HTMLElement`) + static/callback
      `cellClass`/`cellStyle`; one shared `FullWidthCellRenderer` (cacheable:false)
      so recycling never churns renderer instances. `.zg-full-width-cell` inner
      wrapper CSS in enterprise `styles.css`. 8 enterprise specs; enterprise
      **276** green. **Site:** rewrote the ComingSoon stub into an enterprise
      `<DemoPlayground enterprise>` w/ 3 variants (group headers via sentinel row +
      string render; taller detail panels via `HTMLElement` render + `rowHeight`
      array; data-driven per-row `cellStyle`/`cellClass` category tinting); added
      `fullWidthRows` to the engine snippet scope. Verified headless (all 3 ok, 3
      full-width cells each spanning the 580px content width, correct banner text +
      inline bar + tinted section headers, survive vertical scroll, 0 console
      errors) + clean `npm run build`. **Release: publish core** (new
      `fullWidthProvider` hook + `.zg-cell-full-width` CSS) **and enterprise**
      (`fullWidthRows`), bump enterprise core dep, then keep/remove the dev-only
      `@zengrid/core`→local-dist alias per the publish state. **Lib-DX to report:**
      the provider reads the grid's *source* row (`state.data[row]`), so a
      full-width marker must live in the row array itself; with positional array
      data that means the marker rides slot 0 (demos use a `'__group__'`/`'detail'`
      sentinel that full-width rows carry and normal rows don't). A dedicated
      `rowKind`/metadata channel (or object-row `field` mapping) would remove the
      sentinel-in-slot-0 convention.

**Features → Cells** (done out of sidebar order, per user request)
- [x] Notes — **enterprise** (no cell-note feature existed in either lib). Built in
      `../zengrid-enterprise` with **no core change**: `cellNotes()` (license
      `cell-notes`) is a `CellStyleProvider` that also `attach()`es to the grid.
      `getCellStyle` stamps `zg-cell-has-note` (+ optional `--zg-note-marker-color`)
      onto cells carrying a note → CSS `::after` corner triangle; `attach()` binds a
      floating `.zg-cell-note-popup` to the viewport (hover or click trigger) and, with
      `editable: true`, a double-click opens an inline textarea editor
      (Enter saves / empty clears / Escape cancels). API in display coords:
      `setNote/getNote/removeNote/getNotes/clearNotes`; notes keyed positionally by
      default or by record identity via `getRowId` (render-safe keying off `ctx`
      data, app-context mapping via `grid.rows` — same pattern as `changeHighlight`).
      **Gotcha fixed:** the blur commit synchronously triggered a grid re-render mid
      blur-dispatch → a DOM `remove` reentrancy pageerror; fixed by a single-commit
      guard that closes the popup *before* writing and defers the blur commit with
      `setTimeout(0)`. Marker/popup CSS in enterprise `styles.css`. 6 new specs (267
      enterprise green). Live demo w/ 3 variants (hover-to-read, editable double-click,
      click-trigger + API controls); added `cellNotes` to the engine snippet scope.
      Verified headless (3 markers + hover popup text; editable dblclick adds a marker;
      click API seeds→adds→popup→clears; 0 real console errors) + clean `npm run build`.
      **Release: publish enterprise** (new `cellNotes` API + `zg-cell-note-popup` /
      `zg-cell-has-note` CSS); core unchanged.
- [x] Styling Cells — **split tier** (built the whole feature; core had no
      declarative cell styling, only renderer-level `getCellClass`). **Core
      (community):** per-column `cellClass`/`cellStyle` on `ColumnDef` (static or
      `(params: CellStyleParams) => value`) + a grid-wide `cellStyleProvider` hook
      + `CellStyleProvider`/`Context`/`Result`/`Params` interfaces and shared
      `toCellClasses`/`toCellStyle` helpers in
      `../zengrid/.../rendering/cell-style/cell-style.ts`. `CellPositioner`
      `applyCellStyle()` stamps the merged column-level + provider classes/styles
      onto the single cell (WeakMap strips prior-cell styling on recycle), called
      in both render + cache-hit paths; wired through GridOptions, positioner
      interface, rendering-plugin (subscribe→refresh). **Enterprise (advanced):**
      license-gated `cellStyling()` (`cell-styling` feature) in
      `../zengrid-enterprise/.../grid/cell-style-provider.ts` — grid-wide
      `cellClass`/`cellStyle` (static/callback) + `cellClassRules` (class↔predicate
      conditional formatting); self-contained normalization helpers (does not
      import core runtime values). 2 core specs + 6 enterprise specs; core 1933 +
      enterprise 238 green. **Site:** rewrote the ComingSoon stub into two live
      demos — a Community `<DemoPlayground>` (per-column: inline/class/mixed) and
      an Enterprise `<DemoPlayground enterprise>` (rules/heatmap/cross-column),
      each with its own `<FeatureMeta>` badge; added `cellStyling` to the engine
      snippet scope. Verified headless (all 9 style assertions applied, 0 console
      errors) + clean `npm run build`. **Release: publish core** (new
      `cellStyleProvider` hook + column `cellClass`/`cellStyle`) **and enterprise**
      (`cellStyling`), bump enterprise core dep, then remove the dev-only
      `@zengrid/core` → local-dist alias re-added in `astro.config.mjs`.
- [x] Highlighting Changes — **enterprise** (no change-flash existed in either lib).
      Built in `../zengrid-enterprise` with **no core change**: `changeHighlight()`
      (license `change-highlight`) is a `CellStyleProvider` that also `attach()`es to
      the grid, wrapping `setData` to snapshot + diff rows and flag changed cells.
      `getCellStyle` returns the flash while active; per-key `setTimeout` clears it and
      `subscribe→refresh` repaints. Config: `flashClass`/`flashStyle`/`duration`,
      `directionClasses` (numeric up/down), `getRowId` (identity across moves),
      `changed` predicate; `flashCells()` for the in-place-edit + `updateCells` path.
      Bundled `@keyframes zg-cell-flash-fade` + `.zg-cell-flash` in enterprise
      `styles.css`. **Gotcha fixed:** `getCellStyle` runs in the phase-guarded render,
      so it must not read the store — the default row identity keys off the display
      index (positional, like the other cell providers), not `grid.rows.toSourceIndex`
      (which threw a phase violation); `toSourceIndex` is only used from `flashCells`
      (app context). 6 new specs (245 enterprise green). Live demo w/ 3 variants
      (auto-on-setData, up/down direction, manual flashCells+flashStyle); verified
      headless (auto flash=240, direction up=140/down=100, manual flash+bold=72, 0
      console errors) + clean `npm run build`. **Release: publish enterprise** (new
      `changeHighlight` API + `zg-cell-flash` CSS); core unchanged.

**Features → Filters**
- [x] Overview (Filtering Overview) — **community** (core already ships the whole
      baseline: `filterable: true` grows a header funnel → type-aware filter popup,
      an active-filter chip bar, a grid-wide quick filter, and the `grid.filter.*`
      API + grid shorthands). **Lib gap fixed in core:** the filter popup's operator
      set/input is driven by `filterIndicator.dropdownType`, but `filterable: true`
      hardcoded it to `'text'` — a filterable **number/date** column could only get
      the right operators via a verbose `header.filterIndicator` object. Added a
      column-level `filterType?: 'text' | 'number' | 'date'` (`types/column.ts`) and
      wired it through both header-shorthand and object paths of
      `header-config-resolver.ts` (`dropdownType: column.filterType ?? 'text'`;
      explicit `header.filterIndicator` still wins). 4 new resolver specs. Rewrote the
      ComingSoon stub into 3 live variants (column filters text+number, quick filter
      controls, filter API controls); verified headless — Revenue popup shows numeric
      operators (Greater than/Between), Name popup text operators, quick 'Engineer'
      leaves only Engineer roles, 0 real console errors — + clean `npm run build`.
      **Release: publish core** (new `column.filterType`); enterprise unchanged
      (core external, re-exported through `/grid`).
- [x] Column Filters — **community** (core owns the per-column popup end to end).
      **Lib gap fixed in core:** the popup's operator list was hardwired to the
      `filterType` set with no per-column control. Added `ColumnDef.filterParams`
      (`ColumnFilterParams`) with `filterOptions?: FilterOperator[]` (restrict +
      reorder the dropdown; unknown ops dropped, empty result falls back to the
      full set so a typo can't render an operator-less popup) and
      `defaultOption?: FilterOperator` (the operator a fresh condition opens on —
      validated against the offered set). Wired in `filter-ui-operators.ts`
      (`restrictOperators`) + `filter-popup.ts` (applied to both the initial and
      Add-condition rows). Also fixed a pre-existing broken spec from the Overview
      work: `header-config-resolver.spec.ts` imported from `vitest` (core runs
      Jest) → suite failed to run; removed the import. 4 new operator specs; 92
      suites / 1948 core tests green. Rewrote the ComingSoon stub into 3 live
      variants (enable & type — MRR omits `filterable` so it has no funnel; stack
      conditions with AND/OR + blank ops; tailor operators via `filterParams`).
      Verified headless (MRR funnel count 0; Name/Revenue full op sets; Add
      condition shows the match control + 2 rows; tailored Name = Equals/Contains
      opening on Equals, Revenue = Between/Greater than opening on Between; only a
      benign 504 Optimize Dep) + clean `npm run build`. **Release: publish core**
      (new `column.filterParams`); enterprise unchanged (core external, re-exported
      through `/grid`).
- [x] Text Filter — **community** (core owns the text filter end to end). **Lib
      gap fixed in core:** text matching was inconsistent — `contains` /
      `startsWith` / `endsWith` / `notContains` folded case, but `equals` /
      `notEquals` used strict `===` (case-sensitive), and there was no way to
      control it. Added `caseSensitive?: boolean` to `FilterCondition`
      (`types/filter.ts`) and to `ColumnFilterParams` (`types/column.ts`), made
      **all** text operators case-insensitive by default and consistent
      (`filter-compiler.ts` — string `equals`/`notEquals` now case-fold like
      `contains`; numbers/dates keep strict identity; cache key includes the
      flag), and threaded the column's `filterParams.caseSensitive` into the
      condition at both execution paths: the AST path
      (`filter-ast-compiler.ts`, keeps `columns`) **and** the runtime `'column'`
      path (`filter-core.ts` `createColumnFilter` → new `applyColumnCaseSensitivity`
      choke point — this is the path a live single-column popup/`grid.filter.set`
      actually uses; the AST path alone left the demo case-insensitive). 3
      compiler specs + 2 ast-compiler specs + 3 filter-manager specs; 95 suites /
      1965 core tests green. Rewrote the ComingSoon stub into 3 live variants
      (the eight operators; case sensitivity — Region sets `caseSensitive: true`,
      with API buttons proving `Region ~ "apac"` → 0 rows and `"APAC"` → 16;
      tailor operators via `filterParams.filterOptions`/`defaultOption`).
      Verified headless against the prod build/preview (Name folds case → 16
      "Aria" rows; Region case-sensitive apac=0 / APAC=16; Name popup lists all 8
      text operators; tailored Name = Starts with/Contains, Role = Equals/Not
      equals; 0 real console errors) + clean `npm run build`. **Release: publish
      core** (new `caseSensitive` on `FilterCondition` + `ColumnFilterParams`,
      and the equals/notEquals default-casing change); enterprise unchanged (core
      external, re-exported through `/grid`). Re-added the **DEV-ONLY**
      `@zengrid/core` → local-dist JS+CSS aliases in `astro.config.mjs` (the
      site's core is the published npm package, which lacks this change) — remove
      once core is published and the site dep is bumped.
- [x] BigInt Filter — **split tier** (built the whole feature; a plain number
      filter runs comparisons through `Number()`, which collides any integer past
      `2^53 − 1`). **Core (community primitive):** made `FilterCompiler`
      arbitrary-precision — `equals`/`notEquals`/`greaterThan`/`…OrEqual`/
      `between` now compare via a `compareBigInt` helper when the filter value is
      a `bigint` (or a bigint bound in a `between` array), coercing bigint/integer-
      number/integer-string cells so IDs stored any of those three ways match
      without rounding; floats/`number` filtering unchanged. Fixed the compile
      cache key (`JSON.stringify` throws on `bigint` → a `123n`-token replacer).
      Added `filterType: 'bigint'` (`types/column.ts` + `header.ts` `dropdownType`):
      `getOperatorsForType('bigint')` → the numeric set, popup renders a **text**
      input (`inputmode=numeric`; a native number input would itself round) that
      `parseInputValue` parses to `BigInt` (tolerant of `1,234`/`1234n`/sign, raw
      string on failure). Both exec paths (`column` via `ColumnFilter` + `ast` via
      `FilterAstCompiler`) delegate to `FilterCompiler`, so one change covers both;
      `stable-hash` already handled `bigint` for the filter signature. 6 compiler
      specs + 5 operator specs; core **1981** green. **Enterprise (licensed
      `bigintFilter()`):** `../zengrid-enterprise/.../grid/bigint-filter.ts`
      (`bigint-filter` feature) — a `calculatedColumn`-style column helper that
      asserts the license and returns a `ColumnDef` with `filterable` defaulted
      true, `filterType: 'bigint'`, merged `filterOptions`/`defaultOption` →
      `filterParams`, and an optional `format` (`true` = thousands grouping via a
      pure cacheable renderer, or `(v: bigint) => string`) that styles **display
      only** (the filter still reads the raw integer). 9 enterprise specs (node-safe
      element stub); enterprise **285** green. **Site:** rewrote the ComingSoon stub
      into an enterprise `<DemoPlayground enterprise>` w/ 3 variants (precise equals
      distinguishing the `2^53`/`2^53+1` pair via API buttons; ranges & the API with
      `bigint` literals incl. `between [min,max]`; tailor operators + custom `#`
      format); added `bigintFilter` to the engine snippet scope. Verified headless
      (equals `…993` → only Northwind, `…992` sibling hidden — proving no `Number()`
      collision; `>2^53`, `between`, `≤2^53` ranges correct; `#`-prefixed format;
      grouped `9,007,199,254,740,993` display; 0 console errors) + clean
      `npm run build`. **Release: publish core** (new `filterType: 'bigint'` +
      bigint-safe compiler) **and enterprise** (`bigintFilter`), bump enterprise
      core dep. **Tiering note for the user:** the core primitive alone makes a
      bigint column filter precisely, so this *could* be pure community like the
      other filter types; per the "push value to enterprise" steer the polished
      one-call helper (grouped display + presets + license gate) is the
      enterprise-fronted feature, backed by the community primitive.
- [x] Number Filter — **community** (core owns the numeric popup end to end; **no
      lib change**). `filterType: 'number'` swaps the operator list to the nine
      numeric comparisons (`equals`/`notEquals`/`greaterThan`/`greaterThanOrEqual`/
      `lessThan`/`lessThanOrEqual`/`between`/`blank`/`notBlank`) and renders
      `<input type="number">`; comparisons run on `Number(cellValue)` so non-numeric
      cells are excluded, not thrown. `filterParams.filterOptions`/`defaultOption`
      restrict/reorder/pre-select (same seam as text). Rewrote the ComingSoon stub
      into 3 live variants over the shared numeric columns Revenue(col 3)/MRR(col 4):
      the operators; ranges & API (`grid.filter.set` incl. `between` `[min,max]`
      controls); tailor operators (range-only / threshold-only columns). Verified
      headless — popup lists all 9 operators + number input; controls filter (>150k,
      100k–200k, MRR≤5k, Clear); all variants ok — + clean `npm run build`. Release:
      none for this page (core `filterType` already covered by the Overview work).
- [x] Date Filter — **community** (core owns the date popup end to end; **no lib
      change**). `filterType: 'date'` swaps to the six date operators
      (`equals`/`greaterThan`=After/`lessThan`=Before/`between`/`blank`/`notBlank`)
      and renders `<input type="date">`; the popup parses the picked date to a
      timestamp (`Date.parse`) and the compiler compares `Number(cellValue)`, so
      **store dates as timestamps** (or `Date`) and display them with core's
      re-exported `zg.DateRenderer` (`format: 'DD MMM YYYY'`). Data uses local-midnight
      timestamps + local-time DateRenderer so display and popup After/Before/Between
      agree regardless of timezone. Rewrote the ComingSoon stub into 3 live variants
      over Joined(col 2)/Renewal(col 3): the operators (native picker); ranges & API
      (`grid.filter.set` with timestamps, `between` `[from,to]`); tailor operators
      (After/Before-only). Verified headless — date popup lists Equals/After/Before/
      Between + date input; controls: Joined-after-2024=8, Joined-in-2024=5,
      Renewal-before-2026=4 (isolated) with cells rendered "15 Oct 2025", Clear=12;
      0 real console errors — + clean `npm run build`. Release: none for this page.
      **Lib-DX recommendations to report** (not blockers; demo works as-is):
      (1) date `equals` requires an **exact-ms** match (generic strict `===`), so a
      `Date` object never equals the popup's parsed timestamp and a same-calendar-day
      match isn't offered — a day-granular date equals would make the operator
      "just work"; (2) `DateRenderer.formatDate` uses **local-time** getters with no
      UTC/timezone option, so UTC-midnight data can display off-by-one in non-UTC
      zones (worked around here by storing local-midnight); (3) the popup's
      `parseInputValue` for dates uses `Date.parse('YYYY-MM-DD')` (**UTC** midnight)
      while display is local — a shared timezone policy across parse+render+compare
      would remove the mismatch class entirely.

- [x] Set Filter — **split tier** (built the whole feature). **Core (community
      primitive):** a custom filter-body seam — `ColumnDef.filterComponent`
      (`FilterComponentFactory`/`Context`/`Instance` in `types/column.ts`). When a
      column sets it, `openFilterPopup` (`plugins/filter-ui/filter-popup.ts`)
      swaps the default condition rows for the factory's `element` while keeping
      the popup header + Apply/Clear footer; Apply reads the body's
      `getConditions()` (returns `null`/`[]` → clear, else `setColumnFilter(col,
      conds, 'OR')`). The body gets the column's raw values via a new
      `getColumnValues(dataCol)` threaded FilterUIPlugin → GridFilterUI →
      FilterPopupOptions (reads `store.get('rows.raw')`). 3 new `filter-ui.spec`
      cases; core **1984** green. **Enterprise (licensed `setFilter()`):**
      `../zengrid-enterprise/.../grid/set-filter.ts` (`set-filter` feature) — a
      column helper returning a `ColumnDef` with a `filterComponent` that renders a
      checkbox value list (Select-all tri-state over the visible rows + a mini
      search box). Options: `values` (array or `(derived)=>list`),
      `valueFormatter`, `comparator`, `miniFilter`, `selectAll`, `showCount`; blank
      values shown as `(Blanks)`. All decision logic lives in a DOM-free
      `SetFilterModel` (derive uniques+counts, checked/visible state, `getConditions`
      → `in` condition, `null` when all checked) so the node-env enterprise suite
      tests it without jsdom; the DOM `buildBody` is a thin view. `.zg-set-filter*`
      CSS in enterprise `styles.css` (themes off the popup's `--zg-filter-*`
      tokens). 13 new specs (incl. a DOM-free model + license assertion); enterprise
      **297** green. **Site:** rewrote the ComingSoon stub into an enterprise
      `<DemoPlayground enterprise>` w/ 3 variants (pick-from-list + API `in`
      controls; search + occurrence counts on Role/Region; custom values/labels/
      order + `miniFilter:false` on Status); added `setFilter` to the engine snippet
      scope. Verified headless (Region funnel → 8 sorted regions w/ search +
      select-all; Role → 10 roles w/ counts 5000 each; Region curated to 3 EU-only
      via `values()`; Status uppercased ACTIVE/TRIAL/CHURNED in custom order, no
      search; "Keep APAC + EU-West" control → every visible Region cell is
      APAC/EU-West, badCount 0; 0 console errors) + clean `npm run build`. The
      dev-only `@zengrid/core`→local-dist alias in `astro.config.mjs` was already in
      place (unpublished core). **Release: publish core** (new
      `ColumnDef.filterComponent` seam + `getColumnValues` popup wiring) **and
      enterprise** (`setFilter`), bump enterprise core dep, keep/remove the dev-only
      core alias per publish state. **Tiering note for the user:** the core seam
      alone lets anyone hand-roll a set-filter body, so a bare version *could* be
      community; per the "push value to enterprise" steer the polished one-call
      helper (select-all, search, counts, formatter/comparator, license gate) is the
      enterprise-fronted feature, backed by the community seam. **Lib-DX to report:**
      `getColumnValues` reads `store.get('rows.raw')[row][dataCol]`, which matches
      the `in` compiler's default value path but would diverge for a `DataAccessor`
      (object rows / field mapping) — routing it through the same accessor the
      FilterManager uses would make set filters exact under every data mode.

- [x] Filter List — **enterprise** (a Set Filter deep-dive on the *value list*;
      extended the existing `setFilter()` in `../zengrid-enterprise`, **no core
      change**). New **asynchronous value supply**: `values` now accepts
      `(derived, success) => void` (a `SetFilterValuesGetter`; array + synchronous
      `(derived) => list` still supported and back-compat). Refactored the DOM body
      into `createView()` which builds empty and either mounts a model immediately
      (sync/array) or shows a **`Loading…`** placeholder (`.zg-set-filter__loading`,
      new enterprise CSS) until an async supplier calls `success(list)` and
      `setModel()` populates it. `setFilter` branches on `values`: an array →
      sync; a function → call `fn(distinct(raw), success)`, use its array return
      synchronously or, if it returns `void`, show loading until `success`. Also
      added **`defaultToNothingSelected`** (start every row unchecked → `in []` /
      no rows until a value is picked; restores an active selection normally) via a
      `ModelOptions` flag on `SetFilterModel`. Exported
      `SetFilterValuesGetter`/`SetFilterValuesParams`. Engine needed no change
      (`setFilter` already in scope). 5 new specs incl. a node-safe DOM stub that
      drives the sync/async supply branch + `getConditions` (302 enterprise green).
      Rewrote the ComingSoon stub into an enterprise `<DemoPlayground enterprise>`
      w/ 3 variants (supplying values — hardcoded array incl. `ANZ` absent from the
      data showing count 0; async server-style load + `defaultToNothingSelected`;
      sorting via `comparator` + labels via `valueFormatter` + counts). Verified
      headless (supply: 9 items, `ANZ` count 0; async: `Loading…` → 10 role items,
      none checked; sort-format: `ACTIVE/TRIAL/CHURNED` upper-cased in workflow
      order; "Active only" control filters; 0 page errors) + clean `npm run build`.
      **Release: publish enterprise** (new `values` async form +
      `defaultToNothingSelected` + `zg-set-filter__loading` CSS), bump enterprise
      core dep; keep/remove the dev-only `@zengrid/core`→local-dist alias per
      publish state. **Lib-DX to report:** the Set Filter has **no complex-object
      `keyCreator`** — `getValues()`/the `in` compiler compare raw cell values by
      identity (`value.includes(val)`), so object-valued columns can't group or
      match by a derived key. A core **`filterValueGetter`** (read the cell's filter
      value through a projection in `getColumnValues` **and** both the `column` and
      `ast` match paths) would let `setFilter({ keyCreator })` handle complex
      objects; deferred here to avoid multi-path core surgery in a single turn.

- [x] Data Updates — **enterprise** (a Set Filter deep-dive on how the filter
      reacts when the grid's data changes; extended `setFilter()` in
      `../zengrid-enterprise`). **Core (community bug fixed):** `grid.setData()`
      silently **dropped every active filter** — `setData` calls `filter:init` to
      rebind the FilterManager to the new data accessor, and that action destroyed
      + recreated the manager without preserving its filter model (so a filtered
      grid showed *all* rows after any data update, for **every** filter type, not
      just set filters). Fixed in `plugins/filter-plugin.ts` `filter:init`:
      snapshot `getFilterState()` + `getFieldFilterState()` before the re-create and
      restore them onto the fresh manager (field-state form as-is, else re-apply the
      per-column conditions), then `applyFilter()` — so an active filter **survives
      and re-runs** against the new rows. 1 new spec; core **1985** green. (Note: an
      earlier attempt reapplied from `core:setData` in `core-plugin.ts`, but
      `setData` re-inits the manager *after* that, wiping it — the real fix had to
      live in `filter:init`; the `core-plugin` change was reverted.) **Enterprise
      (new `newRowsAction`):** added `newRowsAction?: 'keep' | 'clear' | 'select'`
      to `SetFilterConfig` and a small manager
      `../zengrid-enterprise/.../grid/set-filter-updates.ts` —
      `attachSetFilterUpdates(grid, columns)` (license-gated `set-filter`) wraps
      `setData` and, after each data change, reconciles each `setFilter` column's
      active `in` selection per its policy: `keep` (default — untouched; rides core's
      re-apply), `clear` (drop the column filter), `select` (extend the selection to
      include brand-new distinct values so their rows stay visible; skipped for
      supplied-value lists whose options are data-decoupled). `setFilter` stamps a
      non-enumerable marker (`markSetFilterColumn`) the manager reads; the manager
      seeds a per-column distinct-value baseline at attach and diffs it each update.
      Widened the enterprise `GridHandle` with an optional `filter` slice
      (getState/setColumn/clearColumn). 8 new specs (node-safe FakeGrid); enterprise
      **310** green. **Site:** rewrote the ComingSoon stub into an enterprise
      `<DemoPlayground enterprise>` w/ 3 variants (keep — filter re-applies to new
      data, list follows the data on reopen; select — a new region auto-joins the
      selection; clear — a data change resets the filter); added
      `attachSetFilterUpdates` to the engine snippet scope. Demos mutate a
      fixed-size dataset in place (unfiltered row count reads `options.rowCount`, so
      growing the array wouldn't render without a filter active). Verified headless
      (keep: APAC+EU-West 7 → 8 after mutate, still only APAC/EU-West, MEA rows
      hidden; select: APAC 4 → 6 with ANTARCTICA auto-included; clear: APAC 4 → 12
      all regions after mutate; 0 console errors) + clean `npm run build`.
      **Release: publish core** (filter:init preserves the filter model on setData)
      **and enterprise** (`newRowsAction` + `attachSetFilterUpdates`), bump
      enterprise core dep; the dev-only `@zengrid/core`→local-dist alias is already
      in `astro.config.mjs` — keep/remove per publish state. **Lib-DX to report:**
      (1) the core `setData`-drops-filters bug is now fixed for column + field-state
      filters, but **sort has the identical shape** — `setData` calls `sort:init`
      which recreates the sort manager; a sorted grid likely loses its sort on a
      data update too. Worth auditing `sort:init` for the same preserve-across-rebind
      treatment. (2) The set-filter data reconciliation lives in the enterprise
      manager because `setFilter` is a pure `ColumnDef` with no grid-attach seam; a
      core column-lifecycle hook (`onGridReady`/data-change callback on `ColumnDef`)
      would let the value list + selection self-reconcile without the app calling
      `attachSetFilterUpdates`.

- [x] Tree List — **enterprise** (a Set Filter deep-dive on rendering the value
      list as a **collapsible hierarchy**; extended `setFilter()` in
      `../zengrid-enterprise`, **no core change**). New pure `SetFilterTree` module
      (`grid/set-filter-tree.ts`): `buildSetFilterTree(items, pathOf, formatter)`
      turns the flat `SetFilterModel.items` into a node tree (a value's
      `treeListPathGetter` path becomes a branch; the final segment is a leaf bound
      to the model item index; group nodes aggregate counts), and the DOM-free
      `SetFilterTree` class owns per-group **expand** state + answers
      checked/visibility/tri-state by reading the model — so **leaf selection still
      flows through the same `checked[]`** the popup projects to an `in` condition
      (the tree is purely a view; `getConditions()` unchanged, fully
      back-compatible). Ticking a **group** toggles its visible leaves; search
      auto-opens matching groups (`effectiveExpanded`). A companion DOM strategy
      `createTreeListView()` renders the collapsible checkbox tree with twisties +
      indent. `setFilter` gained `treeList`, `treeListPathGetter`,
      `treeListFormatter`, `treeListExpandDepth` (on `SetFilterConfig`); refactored
      `createView` to pick a **flat** (`createFlatListView`) or **tree** list
      strategy behind the shared search / select-all / loading shell, so both drive
      the same model identically. `.zg-set-filter__twisty`/`__node` CSS in
      enterprise `styles.css`. Exported `SetFilterTree`/`buildSetFilterTree` +
      `SetFilterTreeNode`/`TreeListPathGetter`/`TreeListFormatter`/`…Params` from
      `grid/index.ts`. 11 new node-safe specs (structure, counts, formatter,
      fallback, tri-state, group toggle→`in`, search visibility, forced-open,
      expandDepth); enterprise **321** green. Engine needed no change (`setFilter`
      already in scope; tree rides its config). Rewrote the ComingSoon stub into an
      enterprise `<DemoPlayground enterprise>` w/ 3 variants (Region by continent —
      EU-*/US-* fold under renamed "Europe"/"Americas", APAC/LATAM/MEA stay
      top-level; Dates Year › Month › Day with `treeListExpandDepth: 1` + timestamp
      `comparator`; custom discipline groups from a lookup, `treeListExpandDepth: 0`
      collapsed). Verified headless (region tree groups w/ aggregated counts
      18750/12500; date tree opens years, month twisty reveals days 9 & 22; custom
      tree collapsed→expand reveals Analyst; **group toggle proven end-to-end via
      an exposed grid: unchecking "Europe" → `grid.rows.getDisplayedRowCount()`
      50000 → 31250, and the selection restores on reopen**; search "north" →
      Europe › North only; 0 console errors) + clean `npm run build`. **Release:
      publish enterprise** (new `treeList*` options on `setFilter` + `SetFilterTree`
      export + `zg-set-filter__twisty`/`__node` CSS); core unchanged; the dev-only
      `@zengrid/core`→local-dist alias is already in `astro.config.mjs`. **Lib-DX to
      report:** verifying the demo surfaced again the **positional array-data
      gotcha** — column `dataIndex = array position`, not `field`, so a `setFilter`
      column must sit at the array slot matching its data (region at index 2 filters
      correctly; a shifted layout silently filters the wrong column). A `field`→data
      mapping / explicit `dataIndex` would remove the footgun (same recommendation
      as `leading-nodata-column-shifts-data`).

- [x] Mini Filter — **enterprise** (a Set Filter deep-dive on the **search box**
      above the value list; extended `setFilter()` in `../zengrid-enterprise`, **no
      core change**). `miniFilter` widened from `boolean` to
      `boolean | MiniFilterConfig`: `placeholder`, `caseSensitive` (default
      case-insensitive substring), `matcher: ({value,label,query}) => boolean`
      (replaces the substring test — match a different field / prefix / fuzzy;
      overrides `caseSensitive`), `debounceMs` (wait-then-filter for long lists),
      and `selectVisibleOnEnter` (Enter checks the matches + unchecks the rest, then
      the popup's own Enter applies — type-and-Enter to isolate; default `true`).
      All logic lives in the DOM-free `SetFilterModel` (new `caseSensitive`/`matcher`
      match options on `isVisible`, new `selectOnlyVisible()`) so the node-env suite
      covers it; `createView` reads a normalized `MiniFilterOptions` (`normalizeMiniFilter`,
      `false` → no box) for the placeholder, debounce timer, and Enter keydown. Both
      the flat and tree list strategies delegate visibility to the same model, so the
      box narrows either identically. Exported `MiniFilterConfig`/`MiniFilterMatcherParams`
      from `grid/index.ts`. Engine needed no change (`setFilter` already in scope; the
      config rides it). 4 new specs (case-insensitive default, caseSensitive, custom
      matcher, selectOnlyVisible→`in`); enterprise **327** green. Rewrote the
      ComingSoon stub into an enterprise `<DemoPlayground enterprise>` w/ 3 variants
      (search & isolate — custom placeholder + Enter; case & custom match — Region
      caseSensitive + Role startsWith matcher; debounce & off — 250ms debounce +
      `selectVisibleOnEnter:false` + Region `miniFilter:false`). Verified headless
      (placeholder "Find a region…"; type "EU" → 3 EU regions, Enter isolates and
      **applies to the grid** 8 regions → EU-North/South/West; case-sensitive Region
      "eu"→0 / "EU"→3; Role startsWith "S"→Solutions Eng/SRE/Staff SWE, mid-word
      "ng"→0; debounced Role immediate=all 10 / after 400ms=Analyst; Region
      `miniFilter:false` → 0 search boxes; 0 page errors) + clean `npm run build`.
      **Release: publish enterprise** (`miniFilter` object form: `placeholder`/
      `caseSensitive`/`matcher`/`debounceMs`/`selectVisibleOnEnter` +
      `MiniFilterConfig`/`MiniFilterMatcherParams` exports); core unchanged; the
      dev-only `@zengrid/core`→local-dist alias is already in `astro.config.mjs`.

- [x] Excel Mode — **enterprise** (a Set Filter deep-dive making the value list
      behave like Excel's AutoFilter; extended `setFilter()` in
      `../zengrid-enterprise`, **no core change**). New `excelMode?: 'windows' |
      'mac'` on `SetFilterConfig`, driving two behaviours: (1) **you can't apply
      an empty filter** — a fully-deselected list is treated as *no filter* (all
      rows) instead of `in []`, via a new `emptyMeansAll` flag on the DOM-free
      `SetFilterModel.getConditions` (returns `null` on zero-checked too), so
      deselect-all + Apply shows every row and reopening shows all ticked; and
      (2) an **"Add current selection to filter"** checkbox (new
      `set-filter-excel.ts`: `ExcelMode`/`ExcelModeOptions`/`normalizeExcelMode`/
      `createExcelControls`) that appears only while searching and controls
      whether Enter / "(Select all search results)" **unions** the matches into
      the selection (`setAllVisible(true)`) or **replaces** it
      (`selectOnlyVisible()`). Windows defaults the checkbox off (replace); Mac
      defaults on (union → combines across searches). The `(Select all)` row
      relabels to `(Select all search results)` while searching.
      `defaultToNothingSelected` is ignored when `excelMode` is set (Excel always
      opens fully selected). Wired into `createView` (excel row inserted after
      select-all, `reflectSearching` toggles it + relabels, Enter branches on the
      checkbox). Exported `ExcelMode`/`ExcelModeOptions` from `grid/index.ts`;
      `.zg-set-filter__excel-add` CSS in enterprise `styles.css`. Engine needed no
      change (`setFilter` already in scope). 3 new `emptyMeansAll` model specs + 5
      `set-filter-excel` specs (normalizeExcelMode windows/mac defaults +
      createExcelControls via a node DOM stub); enterprise **331** green. Rewrote
      the ComingSoon stub into an enterprise `<DemoPlayground enterprise>` w/ 3
      variants (Windows — empty-apply keeps all rows + Enter replaces; Mac —
      union across searches; Excel vs. default — `defaultToNothingSelected`
      honoured on a plain setFilter, ignored under `excelMode`). Verified headless
      (empty-apply → 50000 rows unfiltered + reopen all-checked; excel-add row
      hidden→shown + select-all relabel; windows default off / mac default on;
      **decisive union-vs-replace: pre-tick US + search EU + Enter → Windows
      18750 (EU only, replace) vs Mac 31250 (US+EU, union)**; default Role opens
      unchecked / excel Region opens all-checked; 0 real console errors) + clean
      `npm run build`. **Release: publish enterprise** (new `excelMode` +
      `ExcelMode`/`ExcelModeOptions` exports + `zg-set-filter__excel-add` CSS);
      core unchanged; the dev-only `@zengrid/core`→local-dist alias is already in
      `astro.config.mjs`. **Lib-DX to report:** Mac Excel Mode's *live-apply*
      (500ms debounce, no Apply button, popup stays open) isn't implemented — our
      set filter rides core's Apply/Clear popup, which has no apply-on-change
      seam; a core `FilterPopupOptions.applyMode: 'immediate'` (or an
      `onChange`-to-apply hook) would let Mac mode apply as you tick, matching
      Excel exactly. Deferred to avoid core popup surgery this turn.

- [x] API (Set Filter API) — **enterprise** (a programmatic handle on a
      `setFilter()` column; extended `../zengrid-enterprise` with **no core
      change**). New `grid/set-filter-api.ts`: `setFilterApi(grid, columns,
      column)` (license-gated `set-filter`) returns a `SetFilterApi` that reads and
      drives the column's selection in terms of **values**, not raw conditions,
      without opening the popup — all on top of the existing enterprise
      `GridHandle.filter` (`getState`/`setColumn`/`clearColumn`) + `grid.rows`
      source reads. Methods: `getValues()` (distinct value list, re-derived from
      live data so it follows `setData`), `getModel()`/`setModel()` in a plain
      `{ values } | null` shape (`SetFilterApiModel`), `selectAll`/`deselectAll`,
      `selectValue`/`deselectValue`, `isValueSelected`. Model↔`in` mapping mirrors
      the popup exactly: all values selected → `clearColumn` (no filter), `null` →
      clear, `[]` → `in []` (no rows) — implemented by **reusing the tested
      `SetFilterModel`** (`getConditions()` returns null when everything's checked)
      so the API and popup can't drift. The value list honours the column's
      `values`/`comparator`/`valueFormatter`: `setFilter()` now stamps those onto
      the `ColumnDef` via a new non-enumerable `markSetFilterApiColumn` (same
      pattern as `markSetFilterColumn`), and `setFilterApi` reads them from
      `columns[column]` so `getValues()` matches what the popup shows. Exported
      `setFilterApi` + `SetFilterApi`/`SetFilterApiModel` from `grid/index.ts`. 14
      new node-safe specs (FakeGrid `GridHandle`, mirroring `set-filter-updates`):
      license assert, value order + supplied/comparator, model round-trip,
      all-selected→clear, null→clear, deselectAll→`in []`, select/deselect one,
      isValueSelected, values-follow-`setData`; enterprise **345** green. **Site:**
      rewrote the ComingSoon stub into an enterprise `<DemoPlayground enterprise>`
      w/ 3 variants (read & set the model; toggle individual values; the API
      mirrors a curated/ordered/formatted `values()` list) — each control drives
      the grid purely through `setFilterApi()` and writes read-method results into
      a small readout node the snippet inserts above the grid (no component
      change). Added `setFilterApi` to the engine snippet scope. Verified headless
      (getValues lists all 8 regions sorted / the curated 4 in ORDER; setModel →
      subset rows; getModel round-trips `["APAC","EU-West"]`; selectAll → all rows,
      filter cleared; deselectValue hides APAC + isValueSelected false, selectValue
      restores + true; deselectAll → 0 rows; 0 real console errors) + clean
      `npm run build`. **Release: publish enterprise** (new `setFilterApi` +
      `SetFilterApi`/`SetFilterApiModel` exports + the `setFilter` meta stamp),
      bump enterprise core dep; the dev-only `@zengrid/core`→local-dist alias is
      already in `astro.config.mjs`. **Lib-DX to report:** (1) `setFilterApi` has
      **no `getMiniFilterText`/`setMiniFilterText`** — the mini search box lives in
      the ephemeral popup DOM, not a persistent per-column controller, so there's
      nothing to read/drive when the popup is closed; a persistent set-filter
      controller (model + mini-filter state owned outside the popup, the popup
      binding to it) would enable the full AG-Grid-style instance API. (2) The API
      takes `(grid, columns, column)` and reads value-derivation off the stamped
      `ColumnDef`; a first-class `grid.getColumnFilterInstance(colKey)` core seam
      (column-keyed lookup) would remove the need to re-pass `columns` + the index.

**Features → Selection** (whole module done in one pass, per user request)
- [x] Overview — **community** (core ships selection end to end via the
      `selection` plugin + `grid.selection` facade: `selectionType`
      `cell`/`row`/`column`/`range`, `enableMultiSelection`, click/shift-click/
      ctrl-click, `.zg-cell-selected` render, `onSelectionChange`, select-all
      checkbox header `type:'checkbox'`; source-coordinate model). Live demo w/ 3
      variants (cell, row, multi-range); verified headless + prod. No lib change.
- [x] Row Selection — **community** (`selectionType:'row'` + checkbox header). 3
      variants (single, multi ctrl/shift, select-all checkbox); verified. No lib change.
- [x] Single Row Selection — **community** (default single mode). 3 variants
      (click-to-toggle, programmatic selectRows replaces, single cell); verified.
- [x] Multi-Row Selection — **community** (`enableMultiSelection`). 3 variants
      (ctrl/shift, additive selectRows API, select-all); verified.
- [x] Cell Selection — **community** (`selectionType:'cell'`/`'range'`). 3 variants
      (single cell, rectangular range, several ranges via additive); verified.
- [x] **Range Selection** (range-handle) — **enterprise** (NEW; no drag handle
      existed in either lib — core only had shift-click/API range selection). Built
      in `../zengrid-enterprise` with **no core change**: shared
      `SelectionHandleManager` (`grid/selection-handle.ts`) + `rangeHandle()` helper
      (license `range-selection`). Attaches to a `selectionType:'range'` grid, owns a
      `.zg-selection-handle` square anchored to the primary range's bottom-right
      corner (repositioned on `selection:change`, core `render:end`, and viewport
      scroll — reads the rendered corner cell's offset box inside `.zg-cells`), and
      a pointer drag resizes the range (`resizeRect`: anchor stays, opposite corner
      follows the pointer cell). Pure geometry in `selection-handle-utils.ts`
      (node-tested). Widened `GridHandle` (grid-handle.ts): `selectRange`/
      `isSelected`/`hasSelection` on the selection slice (all optional), `on`/`off`
      event subscription, `rows.toDisplayedIndex` (all optional so existing test
      grids still typecheck). `.zg-selection-handle` CSS in enterprise `styles.css`.
      Live demo w/ 3 variants (resize a range, grow from a single cell, styled
      handle via `handleClass`); `view="demo"` (the split-view grid is only ~360px,
      so the corner handle for a mid-grid column is clipped by the viewport — demo
      view gives ~718px so all 5 columns + the handle are visible). Verified headless
      (real Playwright pointer drag grows the selection 9→28 cells; 0 console errors)
      + prod build. **Release: publish enterprise** (`rangeHandle` +
      `SelectionHandleManager` + `zg-selection-handle` CSS); core unchanged.
- [x] **Fill Handle** — **enterprise** (NEW; same `SelectionHandleManager`,
      `fillHandle()` helper, license `fill-handle`). `mode:'fill'` runs the same
      corner-drag but on drop **copy-fills** the source range's values across the
      swept cells: `fillRect` constrains the fill to the dominant drag axis
      (Excel-style), `tileSource` repeats the source pattern (wrapped modulo, so
      up/left fills tile too), and `applyFill` reads all source rows, writes the
      target cells, `setData`+`refresh`, and re-selects the union. `onFill(range)`
      callback. Live demo w/ 3 variants (fill down a value, tiled 2-row pattern,
      `onFill` logging); `view="demo"`, seeds/fills in the left (visible) columns.
      Verified headless (real drag copies row-0 Role "Data Engineer" down into row 4;
      0 console errors) + prod build. 15 new specs (geometry + licensing + safe
      attach); enterprise **521** green. **Release: publish enterprise** (`fillHandle`
      + `SelectionHandleManager`); core unchanged. **Lib-DX to report:** (1) the
      handle positions/writes by **visual** column index (`data-col`), which equals
      `dataIndex` only without column reordering — a reorder would misplace the
      handle/fill; routing through the column model's `dataIndex` would fix it.
      (2) The fill writes whole `setData` snapshots (fine for the demo's 300 rows,
      heavier at scale) — a core cell-range write API would let it patch in place.
      (3) `fillRect` does copy-fill only; a `fillSeries` hook (detect numeric/date
      series and increment) would match spreadsheets' smart fill.
- [x] API Reference (row-api) — **community** (full `grid.selection` surface:
      getRanges/getActive/isSelected/isRowSelected/hasSelection + selectCell/
      toggleCell/selectRange/selectRows/selectColumns/selectAll/setActive/clear,
      all source-coordinate, additive arg = ctrl-click). 3 variants (read the model,
      drive the selection, toggle & test) with a control per method; verified. No
      lib change.

**Features → Editing**
- [x] Overview (Editing Overview) — **community** (core owns cell editing end to
      end: `editable` + `editor` on a `ColumnDef` opens a provided editor;
      double-click / Enter starts, Enter/Tab/click-away commits, Escape cancels;
      built-in editors text/number/select/date/checkbox via `editorOptions`;
      `editing.invalidEditMode` on `GridOptions`; `edit:start/commit/cancel/end`
      events). **Lib gap fixed in core:** the documented programmatic editing API
      was **unreachable** — the editing plugin does `api.register('editing', …)`
      (startEdit/commitEdit/cancelEdit/getActive/isEditing) but, unlike
      sort/filter/rows, nothing attached it to the grid facade, so `grid.editing`
      didn't exist. Added `grid/api/editing-api.ts` (`createEditingApi` +
      `EditingApi`) mirroring the other namespaced APIs (plugin-presence guarded,
      delegates via `gridApi.getMethod('editing', …)`), wired `this.editing =
      createEditingApi(ctx)` into `grid-core.ts`, exported from `grid/api/index.ts`
      + core `index.ts`. 4 new specs (`grid/__tests__/editing-api.spec.ts`, mock
      manager bound via `grid.getStore().exec('editing:bind', …)`); core **1989**
      green. Rewrote the ComingSoon stub into a community `<DemoPlayground>` w/ 3
      variants (enable editing — Region left read-only; editor types — text/select
      w/ `editorOptions.options` + number w/ `min`/`step`; API & events —
      `grid.editing.*` controls + `grid.on('edit:*')` readout). Verified headless
      (dblclick opens editor → type + Enter commits "Edited Name"; select editor 10
      role options + number editor open; `startEdit`→`edit:start`, type+`commitEdit`
      → `edit:commit "Edited Name"→"Api Edited"` + cell updates, `isEditing()`
      false/`getActive()` null, start+cancel keeps the value + fires `edit:cancel`;
      only benign 504 Optimize Dep) + clean `npm run build`. **Release: publish
      core** (new `grid.editing` API); enterprise unchanged (core external,
      re-exported through `/grid`). The dev-only `@zengrid/core`→local-dist alias is
      already in `astro.config.mjs` — keep/remove per publish state. **Lib-DX to
      report:** the EditorManager commits on document `mousedown` (click-outside),
      which **beats a programmatic `grid.editing.cancelEdit()` invoked from a click**
      — clicking any external "Cancel" button commits the open editor before the
      button's handler runs, so external UI can't cancel an in-progress edit (only
      the Escape key can). A cancel-aware pointer path (or a config to make
      click-outside cancel/no-op instead of commit) would let app chrome drive
      cancel. Worked around in the demo with a self-contained start+cancel control.
- [x] Start / Stop Editing — **community** (core owns start/stop; the existing
      surface was too thin — only `editing.invalidEditMode` — so **built real
      start/stop configuration in core**). Added four `EditingConfig` knobs
      (`types/grid.ts`): `singleClick` (open on one click), `enterStartsEditing`
      (default true; Enter opens the active cell's editor), `typeToEdit` (typing a
      printable char on the active cell opens the editor **seeded** with that char),
      and `stopEditingWhenCellsLoseFocus` (default true; `false` keeps the editor
      open on blur — only Enter/Tab/Escape close it). Wiring: the editing plugin
      (`plugins/editing/editing-plugin.ts`) gained a single-click handler, a
      type-to-edit branch + `enterStartsEditing` gate in the keydown handler, and
      threads a seed value through `editing:startEdit(cell, initialValue?)` →
      `EditorManager.startEdit(cell, initialValue?)`. **Two gotchas fixed:**
      (1) the editor's own **blur commit** (TextEditor/CheckboxEditor) bypassed the
      manager's click-outside guard, so `stopEditingWhenCellsLoseFocus:false` alone
      didn't keep the editor open — added `EditorParams.stopEditingOnBlur` (set from
      the flag) and gated both editors' blur commit on it. (2) The keydown handler
      read `state.activeCell`, which **only keyboard nav sets** — a plain mouse
      click sets `store.get('selection.active')` instead, so Enter/type after a
      click missed the clicked cell; the handler now resolves
      `selection.active ?? state.activeCell` (fixes type-to-edit **and** the
      pre-existing Enter-after-click gap). Also added `EditorParams.initialSelection`
      (`'all' | 'end'`): a seeded value opens with the caret at the **end** (append),
      a normal open selects all (replace) — honored in `TextEditor`
      (guarded `setSelectionRange` for non-selectable input types). Threaded the seed
      through the `grid.editing.startEdit(cell, initialValue?)` facade too. 3 new
      specs (plugin seed-forward; TextEditor caret-at-end + no-blur-commit); core
      **1993** green. Rewrote the ComingSoon stub into a community
      `<DemoPlayground>` w/ 4 variants (single-click; type-to-edit +
      `enterStartsEditing:false`; keep-editor-open; start/stop from the API with a
      lifecycle readout). Verified headless (single-click opens+commits+closes;
      type-to-edit: click/Enter do **not** open, typing "A" opens seeded then
      appends to "Acme", commits; keep-open stays open on click-away + uncommitted,
      Enter then commits; API seed/commit/cancel/isEditing all correct; 0 console
      errors) + clean `npm run build` (225 pages). **Release: publish core** (new
      `EditingConfig` start/stop knobs + `EditorParams.initialSelection`/
      `stopEditingOnBlur` + seeded `startEdit`); enterprise unchanged (core external,
      re-exported through `/grid`). The dev-only `@zengrid/core`→local-dist alias is
      already in `astro.config.mjs` — keep/remove per publish state. **Lib-DX to
      report:** `typeToEdit` only reaches the built-in editors that read
      `initialSelection`/seed value — `TextEditor` appends correctly, but `select`/
      `date`/`checkbox` editors ignore the seed (they don't take a free-typed
      character), and `Tab` still only commits (the `// TODO: move to next editable
      cell` in `EditorManager.handleEditorKeyDown` is unimplemented), so Tab does not
      advance the selection after committing.
- [x] Parsing Values — **community** (core had no value-parse seam on commit; the
      editor's raw value was written straight to the row). **Built in core:** a new
      per-column `valueParser?: (params: ValueParserParams) => unknown` on
      `ColumnDef` (`types/column.ts`) + the `ValueParserParams` interface
      (`row`/`field`/`newValue`/`oldValue`/`data`). `EditorManager.commitEdit`
      (`editing/editor-manager/editor-manager.ts`) now, after validation passes and
      before `setValue`, resolves the column via the existing `getColumn(col)`
      callback and — if it has a `valueParser` — replaces `newValue` with the parsed
      result, so the parsed value is what's stored **and** what rides `edit:commit`
      + the undo/redo `onCommit` (returning `oldValue` rejects the edit: no change,
      no undo entry). No wiring change in the editing plugin (it already threads
      `getColumn`/`getRowData` into the manager). 5 new jsdom specs
      (`editing/__tests__/editor-manager-value-parser.spec.ts`: parse-to-number,
      params shape, parsed value as commit `newValue`, no-parser passthrough,
      reject-via-oldValue); full editing suite 292 green. Rewrote the ComingSoon stub
      into a community `<DemoPlayground>` w/ 3 variants (parse formatted money →
      Number via a text editor + `currency` renderer; normalise text — trim + Title
      Case names, uppercase region codes; clamp/reject/derive — MRR clamped to
      0…50k, non-numeric + blank-name rejected to `oldValue`, live `edit:commit`
      readout). **Gotcha caught in verify:** stripping non-digits from `'abc'` yields
      `''` and `Number('')` is `0` (finite), so the naive guard stored 0 instead of
      rejecting — the demo parsers now reject on `cleaned === ''` too. Verified
      headless on the dev server (`£1,250`→`$1,250`; `  aria vaskov  `→`Aria Vaskov`;
      `emea`→`EMEA`; MRR `999999`→`$50,000`; MRR `abc`→kept `$15,645`; blank name
      kept; readout proves the stored value is the parsed one; only benign 504
      Optimize Dep) + clean `npm run build` (225 pages). Rebuilt core dist
      (`NX_DAEMON=false npx nx build core`); the dev-only `@zengrid/core`→local-dist
      alias is already in `astro.config.mjs`. **Release: publish core** (new
      `ColumnDef.valueParser` + `ValueParserParams`); enterprise unchanged (core
      external, re-exported through `/grid`).
- [x] Saving Values — **community** (core wrote the committed value back
      positionally with no seam to intercept, and object rows weren't writable at
      all). **Built in core:** a new per-column `valueSetter?: (params:
      ValueSetterParams) => boolean | void` on `ColumnDef` (`types/column.ts`) +
      `ValueSetterParams` (`row`/`field`/`newValue`/`oldValue`/`data` + a
      `setValue(field, value)` sibling-write helper). Extracted the editing plugin's
      inline save into a pure, tested helper `plugins/editing/apply-cell-write.ts`
      (`applyCellWrite` → `CellWriteMode` `'cell' | 'refresh' | 'skip'`): when the
      column has a `valueSetter` it hands over the save (the setter mutates the row
      or writes siblings via `setValue`, which maps `field` → column index and
      writes the array); returns `'refresh'` when a **sibling** column was touched
      (repaint), `'cell'` for a same-column write, `'skip'` when the setter returns
      `false`. `editing-plugin.ts` `setCellValue` now calls the helper (reading
      `oldValue` from the data accessor only when a `valueSetter` exists) and maps
      the mode to `rendering:refresh` / `rendering:updateCells` / no-op. Default
      (no setter) path unchanged — positional array write + single-cell refresh. 6
      new node specs (`__tests__/apply-cell-write.spec.ts`: default write, setter
      params/data, sibling-write→refresh, `false`→skip, unknown-field no-op) plus
      the existing editing-plugin/value-parser suites; 22 green together. Rewrote the
      ComingSoon stub into a community `<DemoPlayground>` w/ 3 variants (default save
      + `edit:commit` persist readout logging a fake PATCH; own-the-write
      `valueSetter` that PUTs a side effect + returns `false` on an unchanged commit;
      update-sibling — editing annual Revenue derives monthly MRR = revenue/12 via
      `setValue('mrr', …)`, both cells repaint). Verified headless on the dev server
      (name edit → `PATCH row 0 { name: "Zeta Corp" } (was "Aria Vaskov")`;
      `£240,000` → `$240,000` + `PUT /accounts revenue 18000 → 240000`, unchanged
      commit → `no change — nothing saved`; Revenue `120000` → MRR `$10,000`; only
      benign 504 Optimize Dep) + clean `npm run build` (225 pages). Rebuilt core dist
      (`NX_DAEMON=false npx nx build core`); the dev-only `@zengrid/core`→local-dist
      alias is already in `astro.config.mjs`. **Release: publish core** (new
      `ColumnDef.valueSetter` + `ValueSetterParams`); enterprise unchanged (core
      external, re-exported through `/grid`). **Lib-DX to report:** the `valueSetter`
      sibling-write helper (`setValue`) and the default save path both assume
      **positional array rows** (write by array index; object rows still aren't
      written by the default path) — the same `field`→`dataIndex` gap as the filter
      pages. A first-class object-row `DataAccessor` write path (or a `field`-keyed
      write) would let `valueSetter`/default saves work uniformly under object data.
- [x] Edit Components — **community** (core supported a built-in-editor **string**
      or a ready-made editor **instance**, but a `CellEditor` **class** wasn't
      supported — a function fell through to the string branch → registry miss →
      TextEditor fallback, so the natural "supply your own component" API didn't
      work, and the instance path shares one editor across cells). **Built in core:**
      widened `ColumnDef.editor` to `string | CellEditor | (new () => CellEditor)`
      (`types/column.ts`) and taught `EditorManager.startEdit`
      (`editing/editor-manager/editor-manager.ts`) a third branch — when `editor` is
      a **function**, `new (editor)()` a **fresh** instance per edit (instance +
      string paths unchanged). The rest of the custom-editor contract already
      existed (init/getValue/focus/destroy/isValid, `params.onComplete`/`options`/
      `registerPopup`, manager-level Enter/Tab-commit + Escape-cancel + click-away).
      3 new jsdom specs (`editing/__tests__/editor-manager-custom-editor.spec.ts`:
      class instantiated + value committed, fresh instance per edit, instance still
      reused); full editing suite 300 green. Rewrote the ComingSoon stub into a
      community `<DemoPlayground>` w/ 3 variants (segmented Status picker — a
      no-input click-to-commit editor via `onComplete`, options from
      `editorOptions.values`; a −/+ Stepper reading `step`/`min`/`max` from
      `editorOptions`; a validated Name editor implementing `isValid()` under
      `editing.invalidEditMode:'block'`). Verified headless on the dev server in the
      full-width Demo view (segment: 3 buttons, Active → Trial commits to the real
      Status column; stepper: reads MRR $400, +3×500 → $1,900, editorOptions applied;
      validation: "ab" blocked — editor stays open, cell unchanged — "Zephyr Quinn"
      commits and closes; only benign 504 Optimize Dep) + clean `npm run build` (225
      pages). Rebuilt core dist (`NX_DAEMON=false npx nx build core`); the dev-only
      `@zengrid/core`→local-dist alias is already in `astro.config.mjs`. **Release:
      publish core** (new `ColumnDef.editor` constructor form); enterprise unchanged
      (core external, re-exported through `/grid`). **Positional-data gotcha caught
      in verify (fixed in the demo, not the lib):** `dataIndex` = the column's array
      position and is **not** configurable on `ColumnDef` — so an editable column
      only reads/writes the data slot at its own index. Variant 1 initially dropped
      the MRR column, which silently shifted the `status` column onto the `mrr` slot
      (Status rendered "400" and the segment editor wrote to the wrong slot); fixed
      by keeping all six columns in array order so `status` stays at index 5. Same
      family as `leading-nodata-column-shifts-data`; a configurable
      `dataIndex`/`field`-mapping on `ColumnDef` would let a demo show a subset of
      columns without the shift (also forces the editable column to be the 6th, hence
      the wider Demo view for it to be on-screen).
- Provided Cell Editors → Text / Large Text / Number / Date / Checkbox / Select /
      Rich Select
  - [x] **Text Editor** — **community** (the built-in single-line editor is fully
        core; **lib gap fixed in core**). The declarative `editor: 'text'` +
        `editorOptions` path was **dead for the text editor**: the string-registry
        branch of `EditorManager.startEdit` does `new EditorClass()` (no ctor args)
        and passes the column's `editorOptions` via `params.options`, but unlike its
        siblings (`NumberEditor`/`SelectEditor`/`CheckboxEditor` all read
        `params.options` in `init`), **`TextEditor` read its options only from the
        constructor** and never looked at `params.options` — so `editor: 'text'` +
        `editorOptions: { placeholder, maxLength, type, pattern, required, … }` was
        silently ignored (only the instance form `editor: new TextEditor({…})`
        configured it, and that shares one editor across cells). **Fixed in core**
        (`editing/text/text-editor.ts`): `init()` now merges `params.options` over the
        constructor-resolved options via a new `applyDeclarativeOptions()` (only
        defined keys override, so the instance/constructor form is unchanged and
        fully back-compatible). 4 new jsdom specs in `text-editor.spec.ts` (apply
        from `params.options`; params override ctor; ignore `undefined` keys; pattern
        + number min/max from options); 77 text-editor tests green. Rewrote the
        ComingSoon stub into a community `<DemoPlayground>` w/ 3 variants (enable &
        configure — `placeholder`/`maxLength`/`selectAllOnFocus`; input type —
        `type:'number'` + `min`/`max` validated on commit; validation — `pattern`
        (Name letters-only)/`required` (Region)/`validator` (MRR ≥ 1000) under
        `editing.invalidEditMode:'block'`). Documented the full `editorOptions`
        surface (`type`/`placeholder`/`maxLength`/`min`/`max`/`pattern`/`required`/
        `validator`/`selectAllOnFocus`/`className`/`stopOnBlur`). Verified headless on
        the dev server (placeholder "Enter a name…", maxLength caps at 24;
        `type:'number'` input with min 0/max 50000 → 999999 blocked (editor stays
        open, cell unchanged), 12345 commits → $12,345; pattern blocks "99" then
        "Zeta Corp" commits, required blocks empty Region, validator blocks 500 then
        2500 → $2,500; **0 console errors**) + clean `npm run build` (225 pages).
        Rebuilt core dist (`NX_DAEMON=false npx nx build core`); the dev-only
        `@zengrid/core`→local-dist alias is already in `astro.config.mjs`. **Release:
        publish core** (TextEditor now honours declarative `editorOptions`);
        enterprise unchanged (core external, re-exported through `/grid`). **Verify
        gotcha (fixed in the demo, not the lib):** the browser compiles the native
        `input.pattern` **attribute** with the regex `v` flag, which rejects a bare or
        even escaped hyphen inside a character class (`^[…-…]+$` → console
        SyntaxError, though our own `new RegExp(pattern)` `isValid` still works) — so
        the pattern demo uses a hyphen-free class (`^[A-Za-z ]+$` on Name). A core
        tweak to compile `input.pattern` without the `v` flag (or skip setting the
        native attribute since `isValid` already enforces it) would remove that
        browser console warning for hyphenated patterns.
  - [x] **Large Text Editor** — **community** (no multi-line/popup editor existed
        in either lib; **built it in core** as a new provided editor). New
        `LargeTextEditor` (`../zengrid/.../editing/large-text/large-text-editor.ts`)
        — a floating `<textarea>` panel that opens over the cell for long,
        multi-line values. Registered in `EditorManager` as `editor: 'largeText'`
        (sibling to `text`/`number`/`select`/`date`/`checkbox`), exported from
        `editing/index.ts` + core `index.ts`. Reads declarative `editorOptions`
        via `applyDeclarativeOptions` (same merge as the fixed `TextEditor`):
        `rows`/`width`/`height`/`placeholder`/`maxLength`/`showCharCount`
        (live `n / max` counter)/`required`/`validator`/`selectAllOnFocus`/
        `className`/`stopOnBlur`/`autoFocus`. **Key behavior:** plain/Shift+Enter
        inserts a newline (the textarea `keydown` handler `stopPropagation`s Enter
        so it never reaches the manager's Enter-commits handler, and does NOT
        `preventDefault` so the newline is native); **Ctrl/⌘+Enter**, Tab, or
        click-outside commit; Escape cancels. The panel is a child of the
        manager's cell-sized editor container (`overflow: visible`, high z-index),
        so click-outside/keydown/teardown all flow through the manager unchanged;
        a post-mount `reposition()` flips it left/up when the cell sits near the
        scroll viewport's right/bottom edge. Theme-aware via `--zg-*` tokens.
        8 new jsdom specs (`editing/__tests__/large-text-editor.spec.ts`: renders
        + value verbatim w/ newlines, declarative options merge, char counter,
        Enter-newline vs Ctrl+Enter-commit, required+validator, factory, destroy);
        core **2018** green. Rewrote the ComingSoon stub into a community
        `<DemoPlayground>` (no engine change — `editor: 'largeText'` is declarative)
        w/ 3 variants (enable & edit multi-line notes; size the panel
        `width:420`/`rows:8` + `showCharCount` counter w/ `maxLength:180`; required
        + ≥20-char `validator` under `invalidEditMode:'block'`). Each variant builds
        its own small positional dataset with a long-text column. Verified headless
        on the dev server (textarea opens w/ `aria-multiline`, initial newline
        preserved; Enter adds a 3rd line without committing, Ctrl+Enter commits +
        cell updated; rows=8/maxLength=180, counter `65 / 180`→`70 / 180`, panel
        width 420px; short value blocked/editor stays open/cell unchanged, valid
        value commits + closes; **0 console errors**) + clean `npm run build`.
        Rebuilt core dist (`NX_DAEMON=false npx nx build core`); the dev-only
        `@zengrid/core`→local-dist alias is already in `astro.config.mjs`.
        **Release: publish core** (new `LargeTextEditor` + `'largeText'` registry
        entry); enterprise unchanged (core external, re-exported through `/grid`).
        **Tiering note for the user:** kept **community** — it's a provided
        built-in editor, sibling to Text/Number/Date/Checkbox/Select which are all
        core; per the "push value to enterprise" steer, the value-add of a
        premium provided editor lands on **Rich Select** (next in this sub-list),
        the natural enterprise-fronted one.
  - [x] **Number Editor** — **split tier** (per the user's "push value to
        enterprise" steer). **Core (community):** the built-in `editor: 'number'`
        is a real provided editor and already reads declarative `editorOptions`
        (unlike the old TextEditor bug). Its one **sibling gap fixed in core**:
        `NumberEditor` had no `validator` hook that `TextEditor`/`LargeTextEditor`
        both expose — added `validator?: (value: number) => boolean | string` to
        `NumberEditorOptions` (`../zengrid/.../editing/number/number-editor.ts`),
        enforced last in `isValid()` after the built-in NaN/negative/min/max checks
        (returns `{valid:false, message}`; a string result supplies the message).
        5 new jsdom specs (`editing/__tests__/number-editor.spec.ts`: declarative
        options, min/max reject, custom validator pass/fail, generic-message on
        `false`, built-in checks run before the validator); core **2023** green.
        **Enterprise (premium `numberEditor()`):**
        `../zengrid-enterprise/.../grid/number-editor.ts` (`number-editor` feature)
        — a license-gated column helper returning a `ColumnDef` wired to a new
        `NumberFormatEditor` **class** (rides the `ColumnDef.editor` constructor
        form added by Edit Components, so a fresh instance per edit). The editor
        **live-formats as you type**: thousands grouping, a currency `prefix`, a
        unit `suffix`, fixed `precision`, custom `thousandSeparator`/
        `decimalSeparator`, optional `−`/`+` `stepper` buttons (Arrow keys too),
        `min`/`max`/`allowNegative`/`step`/`placeholder`/`validator`. By default it
        also formats the cell **display** with the same options (`formatDisplay`,
        default true → a shared cacheable text renderer), so reading and editing
        match. All formatting logic is in DOM-free exported helpers
        (`formatNumber`/`parseFormattedNumber`/`groupTypedNumber` — the last groups
        a *partially typed* string in place so live grouping never eats an
        in-progress decimal) tested node-safe; the DOM class is a thin view.
        `.zg-number-format-editor*` CSS in enterprise `styles.css` (stepper wrapper +
        buttons, theme tokens). 24 new specs (format/parse/group round-trips,
        license assertion, config wiring, display renderer on/off); enterprise
        **366** green. **Site:** rewrote the ComingSoon stub into a **community**
        `<DemoPlayground>` (enable & configure min/max/step; precision & step;
        min/max + custom validator) **and** an **enterprise**
        `<DemoPlayground enterprise>` (currency `$1,234,000`; percent + stepper
        `99.9%`; EU custom format `1.234.567,00 €` + validator), each with its own
        `<FeatureMeta>` badge; added `numberEditor` to the engine snippet scope.
        Verified headless on the dev server: all 6 variants render (status
        "running"); enterprise currency cells read `$1,234,000` and the editor opens
        with `$1,234,000`; typing `1234567` groups **live** to `1,234,567`; a commit
        round-trips (`987654` → cell `$987,654`); the stepper clamps to `max`
        (99.9% + steps → `100.0%`); percent/EU displays correct; **0 console
        errors** + clean `npm run build` (225 pages). Rebuilt both dists
        (`NX_DAEMON=false npx nx build core|enterprise`); dev-only
        `@zengrid/core`/`@zengrid/enterprise`→local-dist aliases already in
        `astro.config.mjs`. **Release: publish core** (new
        `NumberEditorOptions.validator`) **and enterprise** (`numberEditor` +
        `NumberFormatEditor` + `.zg-number-format-editor` CSS), bump enterprise core
        dep, keep/remove the dev-only core alias per publish state. **Tiering note
        for the user:** the plain provided `editor: 'number'` stays community (a
        core built-in, sibling to Text/Large Text); the *formatted* editor
        (live masking + stepper + matching display, one call, license gate) is the
        enterprise-fronted value, per your steer. Next in sub-list = **Date
        Editors**.
  - [x] **Date Editor** — **split tier** (per the "push value to enterprise"
        steer). **Core (community):** the built-in `editor: 'date'` is a real
        provided editor (calendar-popup picker via `vanilla-calendar-pro`, or the
        native browser control with `useCalendarPopup: false`). Its **sibling gap
        fixed in core**: `DateEditor` ignored declarative `editorOptions` — like the
        old TextEditor bug, it read its options **only** from the constructor, so
        `editor: 'date'` + `editorOptions: { format, minDate, … }` silently did
        nothing (the manager instantiates string editors with `new DateEditor()`, no
        ctor args). Fixed `init()` to merge `params.options` over the constructor
        options and **re-resolve** (`../zengrid/.../datetime/date-editor/date-editor.ts`
        — stored `ctorOptions`, extracted `applyTheme()`; only defined keys override,
        min/max re-parsed, theme re-applied). 5 new jsdom specs (format/required/
        native-type+min/max/override/validate-min via `params.options`); core **2028**
        green. **Enterprise (premium `dateEditor()`):**
        `../zengrid-enterprise/.../grid/date-editor.ts` (`date-editor` feature) — a
        license-gated column helper returning a `ColumnDef` wired to the community
        `editor: 'date'` + `editorOptions`, whose premium value is (a) a **matching
        formatted display** (`formatDisplay`, default true → a shared cacheable text
        renderer using a self-contained `formatDateForDisplay`, so the column reads
        and edits in one `format` — no hand-wired renderer) and (b) a **`disabledDates`
        predicate** (block weekends/holidays), folded into the editor `validator`
        (checked before the caller's `validator`). Kept the formatter/parser
        **self-contained** (no `@zengrid/core` runtime import — a value import bundled
        a 2nd core copy) mirroring `numberEditor`/`cellStyling`. Exports
        `dateEditor`/`createDateDisplayRenderer`/`buildDateValidator` +
        `DateEditorConfig`/`DateFormatEditorOptions`/`DateEditorInputType`. 16 new
        node-safe specs (formatter round-trips, disabled/validator composition,
        license assertion, config wiring, display on/off/custom-renderer); enterprise
        **382** green. **Site:** rewrote the ComingSoon stub into a **community**
        `<DemoPlayground>` (calendar & format via `zg.DateRenderer`; native picker +
        min/max bounds; required + weekday `validator` under `invalidEditMode:'block'`)
        **and** an **enterprise** `<DemoPlayground enterprise>` (formatted column in
        one call; bounds + `disabledDates` weekends; native picker + ISO
        `YYYY-MM-DD` display), each with its own `<FeatureMeta>` badge; added
        `dateEditor` to the engine snippet scope. Verified headless on the dev server:
        all 6 variants render (status "running", 10 cells); community + enterprise
        formatted cells read `15 Mar 2021`, ISO variant reads `2024-08-20`; the
        calendar popup opens on double-click (editor value `15 Mar 2021`); the
        community native variant opens `<input type="date">` with `min=2023-01-01`
        `max=2024-12-31`; **only a benign 504 Optimize Dep** + clean `npm run build`
        (225 pages). Rebuilt both dists (`NX_DAEMON=false npx nx build core|enterprise`);
        dev-only `@zengrid/core`/`@zengrid/enterprise`→local-dist aliases already in
        `astro.config.mjs`. **Release: publish core** (DateEditor now honours
        declarative `editorOptions`) **and enterprise** (`dateEditor`), bump enterprise
        core dep, keep/remove the dev-only core alias per publish state. **Tiering note
        for the user:** the plain provided `editor: 'date'` stays community (a core
        built-in, sibling to Text/Number); the packaged column (matching display +
        `disabledDates` + one call + license gate) is the enterprise-fronted value.
        Next in sub-list = **Checkbox Editor**.
  - [x] **Checkbox Editor** — **split tier** (per the "push value to enterprise"
        steer). **Core (community):** two fixes. (1) `CheckboxEditor` ignored
        declarative `editorOptions` — same bug as the old TextEditor/DateEditor: it
        read options **only** from the constructor, so `editor: 'checkbox'` +
        `editorOptions: { label, allowIndeterminate, validator, … }` was silently
        dropped (the manager instantiates string editors with `new CheckboxEditor()`,
        no ctor args). Fixed `init()` to merge `params.options` over the ctor options
        via `applyDeclarativeOptions` (mutates the shared options object in place, so
        `CheckboxState` + the DOM/event helpers all see it); placed **before**
        `normalizeValue` so `allowIndeterminate` is honoured for the initial value.
        (2) **Real rendering bug found in verify + fixed in core:** `CheckboxRenderer`
        rendered every cell **unchecked** in a live grid regardless of value. Root
        cause = the `CellPositioner` HTML-string cache (`cell-positioner.ts` ~L544–660):
        on a cache hit it restores `element.innerHTML = cached.html`, but a checkbox's
        `checked`/`indeterminate` are **DOM properties** that don't serialize into
        `innerHTML`, so cached checkboxes come back unchecked (proven with an isolated
        dist probe: renderer set `checked=true`, final visible node was a *different*
        node with `checked=false`). The positioner already documents that stateful
        renderers must set `cacheable !== false` to skip this cache (dropdown does);
        `CheckboxRenderer` didn't. Fixed: `readonly cacheable = false` on
        `CheckboxRenderer`. 6 checkbox-editor specs + 1 checkbox-renderer spec; core
        **2035** green. **Enterprise (premium `checkboxEditor()`):**
        `../zengrid-enterprise/.../grid/checkbox-editor.ts` (`checkbox-editor` feature)
        — a one-call column helper (license-gated) whose premium value is a **matching
        cell display** (`display: 'checkbox' | 'label' | 'icon'` — a centered
        read-only checkbox, `trueLabel`/`falseLabel`/`indeterminateLabel` text, or
        `checkedIcon`/`uncheckedIcon`/`indeterminateIcon` glyphs), **arbitrary value
        encodings** (`checkedValue`/`uncheckedValue`/`indeterminateValue` — store
        `0`/`1`, `'Yes'`/`'No'`, and keep that shape: a generated `valueParser`
        re-encodes the boolean the editor commits), and **tri-state** (`tristate`).
        Pure `classifyCheckboxValue`/`encodeCheckboxValue` helpers (node-tested); the
        checkbox display renderer is also `cacheable: false`. `.zg-checkbox-cell*` CSS
        in enterprise `styles.css`. 14 new node-safe specs; enterprise **396** green.
        **Site:** rewrote the ComingSoon stub into a **community** `<DemoPlayground>`
        (enable & toggle w/ `zg.CheckboxRenderer` display; tri-state; required
        `validator` under `invalidEditMode:'block'`) **and** an **enterprise**
        `<DemoPlayground enterprise>` (matching display + `'Yes'/'No'` & `1/0`
        encodings; label & icon modes; tri-state `'yes'/'no'/null` + validator), each
        with its own `<FeatureMeta>` badge; added `checkboxEditor` to the engine
        snippet scope. Verified headless on the fresh dev server: all 6 variants
        render (status ok), the encoded columns show **correct** checked states
        (Active Yes/No + Beta 1/0 match the data), label (Active/Inactive) + icon
        (✔/✘) + tri-state (✔/•/✘) render, a live edit round-trips (editor opens with
        the right initial state for `'Yes'`→checked, Space+Enter commits, display
        updates 6→5 checked with no cache staleness), **0 console errors** + clean
        `npm run build` (225 pages). Rebuilt both dists. **Release: publish core**
        (CheckboxEditor declarative `editorOptions` + `CheckboxRenderer.cacheable=false`)
        **and enterprise** (`checkboxEditor`), bump enterprise core dep, keep/remove
        the dev-only `@zengrid/core`→local-dist alias per publish state. **Tiering
        note for the user:** the plain provided `editor: 'checkbox'` stays community
        (a core built-in, sibling to Text/Number/Date); the packaged column (matching
        display + value encoding + tri-state + one call + license gate) is the
        enterprise-fronted value. **Lib-DX to report:** (1) the `CheckboxRenderer`
        cache bug likely affects **any** stateful DOM renderer that keeps state in a
        JS property (e.g. `SelectRenderer`, and any custom input renderer) — worth an
        audit that every such core renderer sets `cacheable = false`, or that the
        positioner detects live form controls. (2) The core `CheckboxEditor` reads its
        **initial** state through `normalizeValue`, which only understands truthy
        keyword encodings (`true`/`false`/`1`/`0`/`'yes'`/`'no'`/`'on'`/`'off'` + null
        for indeterminate) — so an arbitrary string encoding (`'approved'`/`'rejected'`)
        opens the editor with the wrong checked state. Adding `checkedValue`/
        `uncheckedValue` to `CheckboxEditorOptions` (read in `normalizeValue`/`getValue`)
        would let `checkboxEditor()` support fully arbitrary encodings end to end;
        deferred, and the demo uses keyword-friendly encodings that read correctly.
        Next in sub-list = **Select Editor**.
  - [x] **Select Editor** — **split tier** (per the "push value to enterprise"
        steer). **Core (community):** the built-in `'select'` editor already reads
        declarative `editorOptions` (`options`/`allowEmpty`/`placeholder`) — no
        declarative-options bug (unlike Text/Date/Checkbox). Its one **sibling gap
        fixed in core:** `SelectEditor` had no `validator` hook while its siblings
        (`Number`/`Text`/`Checkbox`) do — `isValid()` was hardcoded `return true`.
        Added `validator?: (value) => boolean | string` to `SelectEditorOptions`
        (`../zengrid/.../editing/select/select-editor.ts`) and implemented
        `isValid()` to run it (lets a select with `allowEmpty` still require a
        non-empty pick under `invalidEditMode`). New `select-editor.spec.ts` (5
        cases); core **2048** green. **Enterprise (premium `selectEditor()`):**
        `../zengrid-enterprise/.../grid/select-editor.ts` (`select-editor` feature)
        — a `checkboxEditor`-style column helper that wires `editor: 'select'` to a
        **matching cell display**: the committed value renders as its human
        **label** (`display: 'text'`, default) or a **colored badge**
        (`display: 'badge'`) instead of the raw stored code. Options accept
        `string | number | { value, label, color }`; a badge without a `color` gets
        one from a built-in 8-color palette (assigned in order). Pure helpers
        `normalizeSelectOptions` (fills labels+colors) + `matchSelectOption` (exact
        then string-coerced match); `formatDisplay:false`/an explicit `renderer`
        opts out. Badge renderer is `cacheable:false` (color rides a
        `--zg-select-badge-color` custom property, not innerHTML). `.zg-select-badge`
        pill CSS (tinted via `color-mix`) in enterprise `styles.css`. Exported
        `selectEditor`/`normalizeSelectOptions`/`matchSelectOption` +
        `SelectEditorConfig`/`SelectEditorFormatOptions`/`SelectOptionInput`/
        `SelectDisplayMode`/`NormalizedSelectOption` from `grid/index.ts`. 12 new
        specs (node-safe; pure fns + label renderer via a fake element, badge DOM
        covered headlessly); enterprise **409** green. **Site:** rewrote the
        ComingSoon stub into a Community `<DemoPlayground>` (fixed list; labels &
        allow-empty; required validator) + an Enterprise `<DemoPlayground enterprise>`
        (label display; colored badges; auto palette + required), each with its own
        `<FeatureMeta>` badge; added `selectEditor` to the engine snippet scope.
        Verified headless on the dev server (community: 3 variants ok/100 cells,
        editor dropdown opens with `active/inactive/pending`; enterprise: label
        variant shows `Engineer` not raw `engineer`, badges render colored pills
        Active=green/Trial=amber/Churned=red, auto palette assigns distinct colors;
        0 console errors) + clean `npm run build`. **Release: publish core**
        (new `SelectEditorOptions.validator`) **and enterprise** (`selectEditor` +
        `.zg-select-badge` CSS), bump enterprise core dep, keep/remove the dev-only
        `@zengrid/core`→local-dist alias per publish state. **Tiering note for the
        user:** the community select editor alone covers the whole editing surface
        (options/allow-empty/placeholder/validation); per the "push value to
        enterprise" steer the polished one-call helper (label/badge matching
        display + color palette + license gate) is the enterprise-fronted feature,
        backed by the community editor. Next in sub-list = **Rich Select**.
  - [x] **Rich Select Editor** — **enterprise** (no rich/searchable select existed
        in either lib; per the "push value to enterprise" steer, built entirely in
        `../zengrid-enterprise` with **no core change**). Core already lets a column
        supply its own editor via `column.editor` (instance / **constructor class** /
        string) — the same seam `numberEditor()` rides — so the premium
        `RichSelectEditor` drops in as `editor: RichSelectEditor` with config on
        `editorOptions`, no registry hook needed. New
        `../zengrid-enterprise/.../grid/rich-select-editor.ts` (`rich-select-editor`
        feature): `RichSelectEditor` implements `CellEditor` — a floating,
        **searchable** popup of richly-rendered rows (color **swatch** or **glyph** +
        label + **description**), keyboard-navigable (↑/↓ move a highlight, Enter/click
        picks, Escape cancels via the manager's bubbled keydown), repositions to stay
        in the scroll viewport, and reads its config from `params.options`. Config:
        `options` (`string|number|{value,label?,color?,icon?,description?}`),
        `searchable`/`searchPlaceholder`/`filter` (custom matcher, default
        case-insensitive over label+description), `allowEmpty`/`emptyLabel` (adds a
        clear row → `null`), `width`/`maxListHeight`, `validator`. The one-call helper
        `richSelectEditor(config)` (license-gated) returns a `ColumnDef` wiring the
        editor **and** a matching cell display — glyph+**label** (`display:'text'`,
        default) or a **colored badge** (`display:'badge'`, reusing `.zg-select-badge`);
        `formatDisplay:false`/an explicit `renderer` opts out. Pure, tested helpers
        `normalizeRichOptions` (palette-fills colors) + `matchRichOption` (exact then
        string-coerced) + `richOptionMatchesQuery`; both display renderers are
        `cacheable:false` (glyph/color ride DOM props, not innerHTML). New
        `.zg-rich-select*` popup CSS themed off the shared `--zg-filter-*` tokens (+
        `.zg-rich-select-value` for the text display) in enterprise `styles.css`.
        Exported `richSelectEditor`/`RichSelectEditor`/`normalizeRichOptions`/
        `matchRichOption`/`richOptionMatchesQuery` + the config/option types from
        `grid/index.ts`. 11 new specs (node-safe: pure fns + config plumbing + display
        renderers via a fake element); enterprise **420** green. **Site:** rewrote the
        ComingSoon stub into an enterprise `<DemoPlayground enterprise>` w/ 3 variants
        (searchable + descriptions; glyphs + colored badges; plain list
        `searchable:false` + `allowEmpty` + required validator); added `richSelectEditor`
        to the engine snippet scope. Verified headless on the dev server (all 3 ok/10
        cells; variant 0 popup: 6 options + search + 6 swatches + 6 descriptions, filter
        "ja" → only Japan, ↑/↓+Enter commits "Japan"; variant 1 badges render 🟢/🟡/🔵/🔴
        tinted #22c55e/#f59e0b/#6366f1/#ef4444; variant 2 no search box, `(unassigned)`
        clear row + 4 owners, picking `(unassigned)` blocks the commit w/ an invalid
        marker; 0 console errors) + clean `npm run build`. **Release: publish
        enterprise** (new `richSelectEditor`/`RichSelectEditor` API + `.zg-rich-select*`
        CSS); core unchanged (the editor rides the existing `column.editor` seam, which
        `@zengrid/enterprise` re-exports through `/grid`). This closes the **Provided
        Cell Editors** sub-list (Text / Large Text / Number / Date / Checkbox / Select /
        Rich Select all ✓).
- [x] **Customisation** — **split tier** (built the whole feature; the editor was
      always clamped to the cell box with no lifecycle veto seam). **Core
      (community):** two editor-system customisation primitives. (1) **Popup
      editors** — `ColumnDef.editorPopup?: boolean` + `editorPopupPosition?: 'over'
      | 'under'` (`types/column.ts`), or an editor opting in itself via new
      `CellEditor.isPopup?()` / `getPopupPosition?()` (`cell-editor.interface.ts`).
      A popup floats and **sizes to its own content** (minWidth = cell width, width/
      height `auto`) instead of being clamped, positioned over/under the cell and
      flipped above when `'under'` would overflow the viewport — removes the reason
      `LargeTextEditor` hand-rolls its own floating panel. (2) **Lifecycle veto
      hooks** — new `CellEditor.isCancelBeforeStart?()` (called after `init`; `true`
      destroys the editor + fires no `edit:start`) and `isCancelAfterEnd?()` (called
      on commit after validation + `getValue`; `true` reverts like Escape). Wired in
      `EditorManager` (`editing/editor-manager/editor-manager.ts`): reordered
      `startEdit` to create the editor before positioning, popup branch in
      `positionEditorContainer` (+ post-append rAF reposition for the flip), veto
      checks in `startEdit`/`commitEdit`, reset in `endEdit`. Base CSS
      `.zg-editor-container--popup` (card chrome + shadow) in `styles/grid.css`. 5
      new jsdom specs (`__tests__/editor-manager-customisation.spec.ts`); core
      **2053** green. **Enterprise (premium `popupEditor()`):**
      `../zengrid-enterprise/.../grid/popup-editor.ts` (`popup-editor` feature) — a
      one-call column helper that wraps **any** editor (instance / class / factory,
      via a pure `resolveInnerEditor`) in a polished dialog: `PopupCellEditor`
      (`isPopup()=>true`) builds a title header + Save/Cancel footer around the inner
      editor's UI and **delegates** getValue/isValid/onKeyDown/isCancelAfterEnd to it
      (so the inner editor's own Enter-commit/Escape + `invalidEditMode` still flow).
      Config: `editor`/`title`/`position`/`width`/`buttons`/`saveLabel`/`cancelLabel`/
      `className`. `.zg-popup-editor*` CSS in enterprise `styles.css`. 11 new
      node-safe specs (pure resolver + ColumnDef plumbing + license assertion +
      delegation via a fake inner editor); enterprise **431** green. **Site:** rewrote
      the ComingSoon stub into a **community** `<DemoPlayground>` (popup swatch picker;
      position under + viewport flip; `isCancelBeforeStart`/`isCancelAfterEnd` veto)
      **and** an **enterprise** `<DemoPlayground enterprise>` (dialog wrapper; position
      & custom labels; validation in the dialog), each with its own `<FeatureMeta>`
      badge; added `popupEditor` to the engine snippet scope. Verified headless on the
      dev server (popup floats auto-sized w/ 6 swatches; locked row won't open + empty
      commit reverts; dialog shows "Edit notes" header + Cancel/Save + 360px textarea,
      Save commits "Edited via dialog"; validation Save<3 keeps dialog open, valid Save
      commits+closes; `'under'` popup sits at the cell bottom, tall dialog flips up; 0
      real console errors, only benign 504) + clean `npm run build` (225 pages). Rebuilt
      both dists; dev-only `@zengrid/core`/`@zengrid/enterprise`→local-dist aliases
      already in `astro.config.mjs`. **Release: publish core** (new
      `ColumnDef.editorPopup`/`editorPopupPosition` + `CellEditor.isPopup`/
      `getPopupPosition`/`isCancelBeforeStart`/`isCancelAfterEnd` + `.zg-editor-container--popup`
      CSS) **and enterprise** (`popupEditor` + `.zg-popup-editor*` CSS), bump enterprise
      core dep, keep/remove the dev-only core alias per publish state. **Tiering note
      for the user:** the popup/veto primitives are base editor plumbing (community,
      like Start/Stop, Parsing, Saving); per the "push value to enterprise" steer the
      polished one-call dialog wrapper (`popupEditor`) is the enterprise-fronted value.
      **Lib-DX to report:** `LargeTextEditor` predates this and still hand-rolls its own
      floating panel inside the (now `overflow:visible`) cell container — it could be
      simplified to `isPopup()`+`getPopupPosition()` and drop its bespoke
      `reposition()`. Next in sub-list order = **Async Values**
      (`features/editing/async-values`).
- [x] **Async Values** — **enterprise** (populate a cell editor's choices from an
      async source; extended the existing premium `richSelectEditor()` /
      `RichSelectEditor` in `../zengrid-enterprise`, **no core change** — the editor
      owns its own lifecycle, so async init needs nothing from the EditorManager).
      `RichSelectEditorOptions.options` now accepts a `RichSelectValuesGetter`
      (`(params, success) => list | Promise<list> | void`) as well as a static array,
      so choices load **when the editor opens** — the dropdown shows a `Loading…`
      placeholder (`.zg-rich-select__loading`, new enterprise CSS, off the popup's
      `--zg-filter-*` tokens) until the list arrives, then repopulates + re-measures
      (flip/clip). New pure `resolveRichSelectValues(source, params)` normalizes all
      three return forms to `{sync}|{async:Promise}` (node-testable, no DOM). The
      getter's `params` = `{value, rowData, column}` so lists can be **row-dependent**.
      Helper additions: `displayOptions` (static labels/colors used only to render
      committed values in the cell, since the async list is unknown at column-build
      time), `loadingLabel`, and `cacheValues` (default `true`) — `withValueCache()`
      memoizes the first resolved list so reopening is instant. **Gotcha caught in
      verification:** the cache is **per-column** (lives in the helper closure), so a
      row-dependent getter must set `cacheValues:false` or the first row's list is
      reused for every row — demo variant 2 does exactly this and the prose/table call
      it out. Exported `resolveRichSelectValues` + `RichSelectOptionsInput`/
      `RichSelectValuesGetter`/`RichSelectValuesParams`/`RichSelectValuesSuccess` from
      `grid/index.ts`. Engine needed no change (`richSelectEditor` already in scope). 9
      new node-safe specs (resolver forms + cache on/off + displayOptions mapping);
      enterprise **440** green. **Site:** rewrote the ComingSoon stub into an enterprise
      `<DemoPlayground enterprise>` w/ 3 variants (Promise values w/ Loading… → 5
      teammates; callback + row-dependent Owner list keyed off the row's Team,
      `cacheValues:false`; caching — one column cached (1 fetch / 2 opens) vs a
      `cacheValues:false` column (Loading… + fetch on every open, `fetch #` climbs in
      the console)). Verified headless (real Playwright: V0 loading placeholder seen
      then 5 options; V1 Platform row → Ada/Linus, Growth row → Grace/Katherine; V2
      cached=1 fetch, uncached=2 fetches + loading each open; only a benign 504
      Optimize Dep) + clean `npm run build` (225 pages). Rebuilt enterprise dist;
      dev-only `@zengrid/enterprise`→local-dist alias already in `astro.config.mjs`.
      **Release: publish enterprise** (new async `options` getter +
      `displayOptions`/`loadingLabel`/`cacheValues` + `.zg-rich-select__loading` CSS),
      bump enterprise core dep; core unchanged (no core alias needed for this page).
      **Tiering note for the user:** async values only exist on the premium
      `richSelectEditor`, so this page is purely enterprise. Next in sub-list order =
      **Undo / Redo Edits** (`features/editing/undo-redo`).
- [x] **Undo / Redo Edits** — **split tier** (core already had a working undo/redo
      primitive but it was **unreachable, unconfigurable, and had a correctness
      bug**; the polished keyboard/toolbar layer is the enterprise-fronted helper).
      **Core (community, made usable):** (1) new public `grid.undoRedo` facade
      (`grid/api/undo-redo-api.ts` → `createUndoRedoApi`, mirrors `grid.editing`) —
      `undo/redo/canUndo/canRedo/clear/getUndoCount/getRedoCount/onChange`; the
      history was fully wired (default `undoRedoPlugin` records every committed cell
      edit via the editing plugin's `onCommit`) but had **no public surface** (same
      reachability gap `grid.editing` had). Widened the plugin's `api.register` with
      `getUndoCount`/`getRedoCount`. (2) Threaded `GridOptions.undoRedo`
      (`UndoRedoOptions`: `maxHistorySize`/`enableCommandGrouping`/`groupingTimeWindow`)
      into `createUndoRedoPlugin` at `grid-setup.ts` — it was previously constructed
      with hardcoded defaults, so history was **not tunable at all**. (3) **Bug fix**
      in `UndoRedoManager.undo()`: with command grouping on (the default), an edit made
      inside the 1s window sat in a *pending batch* not yet on the stack, and `undo()`
      **dropped the batch without reverting** (edit stayed visible, undo did nothing) —
      now it flushes the pending batch into a command (via a stored `pendingSetValue`)
      before undoing, so a quick undo actually reverts. 1 new plugin spec (quick-undo)
      + 2 registered-method assertions; core **2054** green. **Enterprise (licensed
      `undo-redo`):** `../zengrid-enterprise/.../grid/undo-redo.ts` — `undoRedo(grid,
      config?)` asserts the `undo-redo` feature and adds the batteries the app usually
      hand-wires: **keyboard shortcuts** (Ctrl/⌘+Z undo, Ctrl+Y / Ctrl/⌘+Shift+Z redo)
      + a single **`onChange`** toolbar hook (fires on every history change *and* once
      at attach). Returns a handle (`undo/redo/canUndo/canRedo/clear/getState/onChange/
      destroy`). Config: `keyboard` (default true), `target`, `onChange`. **Focus
      gotcha (caught in headless verify):** the core keyboard plugin makes the grid
      **container** focusable and focuses *it* on cell-click, so binding keydown on the
      viewport (a child) never received the bubbling event — `resolveTarget()` walks up
      from `dom.viewport` to the nearest `tabindex` ancestor (the container) and binds
      there; skips while `editing.active` (the editor owns Ctrl+Z). 6 new node-safe
      specs (license assert, delegation, onChange seed+fire, Ctrl+Z/Y/Shift+Z, editor
      guard, destroy unbind); enterprise **446** green. **Site:** rewrote the ComingSoon
      stub into an enterprise `<DemoPlayground enterprise>` w/ 3 variants (keyboard +
      injected onChange toolbar; grouped-vs-discrete via `undoRedo:{
      enableCommandGrouping:false }` GridOptions + live count; programmatic community
      `grid.undoRedo` API w/ `keyboard:false` + getState readout); added `undoRedo` to
      the engine snippet scope. Name-collision note: core now exports
      `UndoRedoOptions` (the GridOptions config), so the enterprise helper's config type
      is exported as **`UndoRedoConfig`**. Verified headless (real Playwright: V0 edit→
      Undo btn + Ctrl+Z revert + Ctrl+Y/Redo — incl. the quick-undo fix, count shows
      "0 undo" while the grouped batch is pending yet Undo still reverts; V1 two discrete
      undos revert both edits; V2 community `grid.undoRedo.undo()` reverts + getState
      `canUndo:false canRedo:true`; live keyboard Ctrl+Z/Ctrl+Y both revert/replay; 0
      console errors) + clean `npm run build` (225 pages). Rebuilt core + enterprise
      dist; dev-only `@zengrid/core` + `@zengrid/enterprise`→local-dist aliases already
      in `astro.config.mjs`. **Release: publish core** (new `grid.undoRedo` facade +
      `GridOptions.undoRedo` config + `UndoRedoManager` quick-undo fix + plugin count
      methods) **and enterprise** (`undoRedo` helper), bump enterprise core dep, then
      keep/remove the dev-only aliases per publish state. **Tiering note for the user:**
      the history + the `grid.undoRedo` API are **community** (build your own toolbar/
      keys); per the "push value to enterprise" steer, the one-call helper (keyboard +
      toolbar `onChange`) is the enterprise-fronted layer. **Lib-DX to report:**
      (1) undo/redo replays writes in **view coordinates**, so changing sort/filter
      between an edit and its undo lands the revert on whatever occupies that display
      cell now — a source-stable command (record by source row/col + `grid.rows`
      mapping) would make undo robust under reordering; (2) **flash-on-undo** isn't
      possible without core reporting which cell a command reverted — the undo path
      calls `setValue(row,col)` but neither `undo-redo:change` nor the manager surface
      the affected cells, so the enterprise helper can't highlight them; an
      `undo-redo:apply { cells }` event (or cells returned from `undo()`/`redo()`) would
      unlock flash feedback; (3) command grouping is time-window based only — there's no
      explicit `beginBatch()`/`endBatch()` to group a known multi-cell operation (e.g. a
      paste) into one step regardless of timing.
- [x] **Full Row** — **split tier** (no full-row editing existed; core is strictly
      single-cell). **Core (community primitive):** new `editing.editType: 'cell' |
      'fullRow'` (`types/grid.ts`) + a new `RowEditorManager`
      (`../zengrid/.../editing/row-editor-manager/`) — the multi-editor engine that
      opens an editor over **every editable cell in a row at once** and commits/cancels
      them together. Reuses the editing plugin's cell callbacks verbatim (so
      `valueParser`/`valueSetter`, provided editors, undo `onCommit` all still apply):
      Enter/Save commits the row, Escape cancels, Tab cycles between the row's editors;
      a single invalid cell (block mode) or a `RowValidator` veto keeps the row open.
      New events `edit:rowStart`/`edit:rowCommit`/`edit:rowCancel` and `grid.editing`
      surface `startRowEdit`/`stopRowEdit`/`isEditingRow`/`getEditingRow`/
      `setRowValidator`. Editing plugin (`plugins/editing/editing-plugin.ts`) builds the
      RowEditorManager instead of the single-cell one when `editType:'fullRow'` and
      routes start/commit/cancel to it. Base CSS `.zg-row-editor-cell` accent in
      `styles/grid.css`. **Core bug fixed along the way:** `editing:commitEdit` cleared
      `editing.active` **unconditionally**, so after a *blocked* full-row commit (invalid
      cell / vetoing validator) the row stayed open but `editing.active` went null → the
      next Save/programmatic commit hit the `if (!editing.active) return` guard and was a
      dead no-op (Enter worked because it calls `commitRowEdit()` directly). Now only
      clears when the manager actually closed (`!rowManager.isEditing()`); same guard
      added to `stopRowEdit`. 6 new `RowEditorManager` specs (opens only editable cols,
      commit-together, cancel-discards, changed-only onCommit, validator veto+retry, row
      events); core **2060** green. **Enterprise (licensed `fullRowEditing()`):**
      `../zengrid-enterprise/.../grid/full-row-editing.ts` (`full-row-editing` feature) —
      the polished layer on a grid built with `editType:'fullRow'`: a floating **Save /
      Cancel** action bar anchored to the editing row (mousedown-driven so it beats the
      row's click-outside commit), a row-level `validate({row,values,rowData}) => true |
      string` veto wired through `grid.editing.setRowValidator` (gates **every** commit
      path), and an `onRowValueChanged({row,changes})` hook off `edit:rowCommit`. Returns
      `{ save, cancel, destroy }`. `.zg-row-edit-actions` CSS in enterprise `styles.css`.
      5 node-safe specs (license assert, validator wiring, save/cancel delegation,
      onRowValueChanged, destroy-unbinds); enterprise **451** green. **Site:** rewrote the
      ComingSoon stub into an enterprise `<DemoPlayground enterprise>` w/ 3 variants
      (edit-the-whole-row w/ text/select/number editors + action bar; cross-field
      row validation w/ `stopEditingWhenCellsLoseFocus:false`; events + programmatic
      `startRowEdit`/`stopRowEdit` API w/ `onRowValueChanged` log); added `fullRowEditing`
      to the engine snippet scope. Verified headless (V0: dblclick opens 4 editors + bar,
      Save commits name+seats, editors close; V1: invalid Save blocked "Enterprise needs
      at least 25 seats", fix→Save commits Enterprise/40; V2: control `startRowEdit(0)`
      opens the row, Save logs `onRowValueChanged → row 0: name=CHANGED NAME`; 0 console
      errors) + clean `npm run build` (225 pages). Rebuilt core + enterprise dist; dev-only
      local-dist aliases already in `astro.config.mjs`. **Release: publish core** (new
      `editing.editType` + `RowEditorManager` + row events + `grid.editing` row API +
      the `editing:commitEdit` blocked-commit fix) **and enterprise** (`fullRowEditing`),
      bump enterprise core dep, keep/remove the dev-only aliases per publish state.
      **Tiering note for the user:** `editType:'fullRow'` alone is a complete community
      full-row editor (open the row, Enter/Escape, `grid.editing` API); per the "push
      value to enterprise" steer the one-call polished helper (Save/Cancel bar +
      row-level `validate` + `onRowValueChanged`) is the enterprise-fronted layer, backed
      by the community primitive. **Lib-DX to report:** (1) the `RowValidator` hands the
      app `values` keyed by **view column index** (positional), not by `field` — a
      field-keyed map (or the pending rowData) would make cross-field rules read
      naturally regardless of column order; (2) full-row edit reuses each column's
      configured `editor`, so a column with no `editor` is skipped (read-only in the
      row) — there's no way yet to force a display-only cell into the row's editor set.

- [x] **Validation** — **split tier** (core had all the *machinery* — per-editor
      `isValid()`, three `invalidEditMode`s, `.zg-cell-invalid`/`.zg-editor-error`,
      a full-row `RowValidator` — but **no declarative, editor-agnostic cell
      validator**: each editor's `validator` option only sees the raw `value`, is
      per-editor-type, and gives no row context). **Core (community primitive):**
      new `ColumnDef.validator?: CellValidator` + `CellValidatorParams`
      (`value`/`oldValue`/`row`/`col`/`field`/`data`) + `CellValidatorResult` in
      `../zengrid/.../types/column.ts`. `EditorManager.commitEdit()` runs it as a
      **second gate** after `valueParser` (so it validates the final *stored*
      value, editor-agnostic, with the whole row in scope) and independently of
      the editor's own `isValid()`; rejection rides the existing `invalidEditMode`
      block/revert/commit machinery (`markInvalid` inline message on block,
      `cancelEdit` on revert, `flagInvalidCell` `.zg-cell-invalid` on commit). The
      editor gate stays first so `isCancelAfterEnd`'s "after validation passes"
      contract is preserved. 7 core specs; core **2067** green. **Enterprise
      (licensed `cellValidation()`):**
      `../zengrid-enterprise/.../grid/cell-validation.ts` (`cell-validation`
      feature) — a column helper returning a `ColumnDef` whose `validator`
      composes a **rule library** `validationRules` (`required`/`minLength`/
      `maxLength`/`min`/`max`/`pattern`/`email`/`oneOf`/`custom`, each a pure
      `(params)=>true|string`, every rule but `required` passing empties) plus an
      optional cross-field `validate`; pure `composeValidators` (first failing
      message wins) is DOM-free and exported for reuse/tests. **Type collision
      fixed:** the new core `ColumnDef.validator` clashed with the value-level
      `validator` on five enterprise editor configs (number/date/checkbox/select/
      rich-select) that extend `Omit<ColumnDef,…>` **and** an options interface
      declaring `validator` (TS2320) — added `'validator'` to each config's `Omit`
      so the editor's value-level validator wins there. 12 enterprise specs;
      enterprise **461** green. **Site:** rewrote the ComingSoon stub into an
      enterprise `<DemoPlayground enterprise>` w/ 3 variants (rule library in the
      default `block` mode — required/minLength/email/min/max/pattern; cross-field
      `validate` reading `data` — min≤max + discount-only-on-Enterprise;
      `invalidEditMode:'commit'` — bad value written but cell flagged red); added
      `cellValidation` + `validationRules` to the engine snippet scope. Verified
      headless (real Playwright edits: bad email blocked "Enter a valid email" +
      editor stays open + uncommitted, fix→commits; seats 0 blocked "Must be at
      least 1"; code "ab" → "Three uppercase letters"; cross-field min 999 →
      "Min cannot exceed Max", discount 20 on Growth → "Discount only on
      Enterprise", valid min 40 commits; commit-mode seats 0 written + cell
      `.zg-cell-invalid`; 0 console errors) + clean `npm run build` (225 pages).
      Rebuilt core + enterprise dist; dev-only local-dist aliases already in
      `astro.config.mjs`. **Release: publish core** (new `ColumnDef.validator`
      primitive + commitEdit second gate) **and enterprise** (`cellValidation` +
      `validationRules`), bump enterprise core dep, keep/remove the dev-only
      `@zengrid/core`→local-dist alias per publish state. **Tiering note for the
      user:** the core `ColumnDef.validator` alone is a complete hand-rolled cell
      validator (community), so a bare version *could* be community; per the "push
      value to enterprise" steer the polished one-call helper (composable rule
      library + cross-field `validate` + license gate) is the enterprise-fronted
      layer, backed by the community primitive. **Lib-DX to report:** (1) the five
      provided editors' own `validator(value)` option is value-only and
      per-editor — folding them onto the new context-rich `ColumnDef.validator`
      (or handing the editor validators the same `CellValidatorParams`) would give
      one validation contract instead of two; (2) validation has no *async*
      escape hatch (server-side uniqueness checks) — commit is synchronous, so a
      remote check needs an app-owned `edit:commit` round-trip today.

- Batch Editing → Row Data / Single Row / Cell / Transactions / High Frequency
  - [x] **Row Data** — **split tier** (updating the grid by supplying a whole new
        row-data array). **Core (community, made usable):** `grid.setData(rows)`
        already replaces the entire dataset in one batch (and, since the Data
        Updates work, preserves the filter/sort model), but the **selection had no
        public facade** — the `Zengrid` class exposed `sort/filter/…/editing/
        undoRedo` yet the fully-wired selection plugin (`api.register('selection',
        …)`) was **unreachable** from app code (same reachability gap that was
        fixed for `editing`/`undoRedo`). Added a public `grid.selection`
        `SelectionApi` facade (`../zengrid/.../grid/api/selection-api.ts` →
        `createSelectionApi`, wired into `grid-core.ts` + `index.ts`): `getRanges/
        getActive/selectCell/toggleCell/selectRange/selectRows/selectColumns/
        selectAll/setActive/clear/isSelected/isRowSelected/hasSelection`, all in
        **source (data) coordinates** (matches how ranges are stored so a stored
        selection survives sort/filter — differs from `editing`'s view coords);
        `selectAll()` defaults to the source row count. Guarded by
        `pluginHost.has('selection')` so it no-ops when `enableSelection:false`. 5
        new specs; core **2072** green. **Enterprise (premium `batchRowData()`):**
        `../zengrid-enterprise/.../grid/batch-row-data.ts` (`batch-row-data`
        feature) — wraps `grid.setData` so every swap becomes an **identity-aware
        delta**: diffs old vs new rows by `getRowId`, keeps the **selection pinned
        to the same records** as they move (snapshot ranges/active → id → new
        source index → re-select; clamps the whole-row `endCol` sentinel so it
        never enumerates `MAX_SAFE_INTEGER` cols — a hang bug caught in headless
        verify), **preserves scroll**, and reports a `BatchRowDataDelta`
        (`added/removed/updated/moved/unchanged` + ids + `updatedRows`) via
        `onDataChanged` / `getLastDelta()` / `apply()`. `preserveSelection`/
        `preserveScroll`/`changed` knobs; `destroy()` restores the plain `setData`.
        No CSS; flashing is left to `changeHighlight()` (composes) to avoid
        duplication. Widened `GridHandle` with an optional `selection` slice
        (`GridSelectionApi`/`GridSelectionRange`) the manager reads/writes. 7
        node-safe specs (FakeGrid: license assert, delta-by-identity, selection
        follows a reorder, drop-on-remove, `apply` return, detach restores setData,
        opt-out); enterprise **491** green. **Site:** rewrote the ComingSoon stub
        into an enterprise `<DemoPlayground enterprise>` w/ 3 variants (community
        `setData` — selection stays by POSITION; `batchRowData` — selection follows
        the RECORD by id; delta report via `onDataChanged` into a live readout);
        added `batchRowData` to the engine snippet scope. Verified headless (real
        Playwright control clicks: V0 select row1=Globex→Reverse leaves row1
        selected now showing Soylent; V1 same reverse moves the selection to row4,
        still Globex; V2 churn → `Δ added:1 removed:1 updated:1 moved:3
        unchanged:0`; 0 console errors) on **both** dev and the prod preview +
        clean `npm run build` (225 pages). Rebuilt core + enterprise dist; dev-only
        `@zengrid/core` + `@zengrid/enterprise`→local-dist aliases already in
        `astro.config.mjs`. **Release: publish core** (new `grid.selection` facade)
        **and enterprise** (`batchRowData`), bump enterprise core dep, then
        keep/remove the dev-only aliases per publish state. **Tiering note for the
        user:** `grid.setData` + the new `grid.selection` facade make a hand-rolled
        preserve-across-swap fully community; per the "push value to enterprise"
        steer, the one-call identity-aware helper (delta + auto selection/scroll
        preservation) is the enterprise-fronted layer, backed by the community
        primitives. **Lib-DX to report:** (1) selection had a complete plugin API
        but **no public facade** for years — worth auditing which other plugin APIs
        are similarly unreachable from `Zengrid`; (2) `selectRows`/`selectColumns`
        encode "whole row/column" as `endCol/endRow = Number.MAX_SAFE_INTEGER`,
        which any consumer iterating a range must know to clamp — a dedicated
        `type: 'row' | 'column' | 'cell'` on the stored range (or clamped bounds)
        would be safer than the sentinel; (3) `batchRowData` re-selects cell-by-cell
        because the selection API has no bulk "set these ranges" call — a
        `setRanges(ranges)` would make selection restore atomic and cheaper.

**Features → Row Grouping** (started here per user request — jumped ahead of
Selection)
- [x] **Overview** — **enterprise** (no value-based row grouping existed in either
      lib; per the "push value to enterprise" steer, built the whole engine in
      `../zengrid-enterprise`, **no core change** — it rides the existing core
      `fullWidthProvider` hook). New pure DOM-free model
      `grid/row-grouping-model.ts` (`buildGroupTree` buckets rows by one/many
      source columns into an aggregated node tree with ordered sibling keys;
      `flattenDisplay` interleaves a group-header sentinel row before each group
      and, when expanded, its child groups (recursively) or leaf rows;
      `computeAgg` sum/avg/min/max/count/first/custom; `collectPaths` for
      expand/collapse-all). Manager `grid/row-grouping.ts` (`rowGrouping()`,
      license `row-grouping`): builds a `FullWidthRowProvider` that renders a
      **group header row** (indent-by-level chevron + label + `(count)` +
      optional aggregate summary) for sentinel rows and `undefined` for leaves;
      `attach(grid)` + `setData(source)` take over the grid's displayed rows
      (owns the flat→grouped transform, pushes it via `grid.setData`); click a
      header (delegated on the header element) toggles it; API
      `expandAll`/`collapseAll`/`setExpanded`/`toggle`/`isExpanded`/`getGroupCount`;
      config `groupBy` (indices or `{col,comparator}`), `aggregations`,
      `aggLabel`, `groupLabel`, `expandedByDefault`, `onExpandedChanged`. Group
      header CSS (`.zg-group-row`/`-cell`/`-chevron`/`-label`/`-count`/`-agg`,
      theming off `--zg-*` tokens) appended to enterprise `styles.css`. **Naming
      collision fixed:** core already exports a `GroupNode`, so the model's tree
      node is exported as `RowGroupNode` (avoids the `entries/grid.ts`
      `export *` ambiguity). 10 new specs (model tree/agg/flatten + manager
      setData/toggle/collapseAll/expandedByDefault/onExpandedChanged, node-safe
      FakeGrid); enterprise **471** green. **Site:** rewrote the ComingSoon stub
      into an enterprise `<DemoPlayground enterprise>` w/ 3 variants (group by one
      column; aggregations w/ currency `aggLabel`; nested Region→Status starting
      collapsed) + Expand/Collapse-all controls (snippet stashes the manager on
      `grid.__grouping` so the control buttons, scoped to `grid` only, can reach
      it); added `rowGrouping` to the engine snippet scope. Verified headless
      (basic: 208 display rows = 200 leaves + 8 headers, collapse-all → 8 header
      rows, single-header chevron ▾→▸ toggle; aggregates header
      "Revenue $3,522,525 · Avg MRR $10,545"; nested starts collapsed at 8 region
      headers; only the benign 504 Optimize-Dep console noise) + clean
      `npm run build` (225 pages). Rebuilt enterprise dist; dev-only local-dist
      aliases already in `astro.config.mjs`. **Release: publish enterprise** (new
      `rowGrouping`/`RowGroupingManager` + model exports + `.zg-group-*` CSS);
      core unchanged. **Tiering note for the user:** this is enterprise-fronted
      but backed *only* by the community core `fullWidthProvider` hook — a
      hand-rolled grouping is possible in community; the licensed value is the
      one-call manager (tree + aggregates + expand/collapse + nesting). **Lib-DX
      to report:** (1) grouping owns `grid.setData`, so it currently **conflicts
      with the app's own sort/filter** (those pipeline phases would operate on the
      augmented header+leaf list). A first-class core **row-model / display-row
      injection** (synthetic non-source rows in `rows.viewIndices`, which today is
      a flat `number[]` of source indices only) would let grouping sit *inside*
      the sort/filter/pagination pipeline instead of replacing the data — the
      right long-term foundation for the rest of this section
      (single/multiple-column display types, group-level sorting, group editing,
      row-group panel). (2) Group headers ride the full-width sentinel-row
      convention (an object row among array rows); a dedicated `rowKind`/metadata
      channel would remove the sentinel object. Flag these to the user before the
      deeper Row-Grouping pages, since they may warrant the core row-model work.

- [x] **Grouping Data** — **enterprise** (extended the existing `rowGrouping()` in
      `../zengrid-enterprise`, **no core change** — the page is about *what you group
      by* and *changing it live*, not a new render mechanism). **Runtime re-grouping
      API** on `RowGroupingManager`: `getGroupBy()` (reports the current levels —
      plain index for a bare column, a `{ col, … }` spec when it carries a
      comparator/keyGetter), `setGroupBy(cols)` (replace the grouping wholesale; `[]`
      flattens back to the ungrouped source rows), `addGroup(col)`/`removeGroup(col)`
      (idempotent add/drop of a nesting level). Made `specs` mutable; each mutator
      clears expand state + `rebuild()`s. **`render()` ungrouped fast-path:** with
      no specs, `buildGroupTree` returns `[]` and `flattenDisplay` would blank the
      grid — so it now pushes `this.source` unchanged, making `setGroupBy([])` a real
      "ungroup". **Derived group keys:** added `keyGetter?: (row) => unknown` to
      `GroupSpec` (`row-grouping-model.ts`) — `buildGroupTree` buckets by
      `keyGetter(row)` when present (else `row[col]`), so a level can group by a
      computed band/first-letter/month while `col` still drives the aggregate label.
      4 new specs (setGroupBy/getGroupBy round-trip incl. ungroup→flat, add/remove
      idempotency, keyGetter banding); enterprise **474** green; rebuilt dist.
      **Site:** rewrote the ComingSoon stub into an enterprise `<DemoPlayground
      enterprise>` w/ 3 variants (choose columns — buttons call `setGroupBy([1|2|5])`
      + Ungroup live; add/remove levels — `addGroup(5)`/`removeGroup(2)` nest/unnest
      in place; derived keys — revenue bands via `{ col, keyGetter, comparator }`);
      `rowGrouping` was already in the engine snippet scope. Verified headless (choose:
      Region→APAC, Role→Analyst, Status→Active, Ungroup→0 headers, back to Region;
      add/remove: +Status nests to 3 visible headers, −Region regroups to Status;
      derived: "SMB (under $100k) (67)" band header ordered SMB→Enterprise via the
      comparator; only the benign 504 Optimize-Dep) + clean `npm run build` (225
      pages). **Release: publish enterprise** (new `getGroupBy`/`setGroupBy`/
      `addGroup`/`removeGroup` + `GroupSpec.keyGetter`), bump enterprise core dep;
      dev-only local-dist aliases already in `astro.config.mjs`. **Lib-DX (unchanged
      from Overview):** grouping still owns `grid.setData`, so runtime re-grouping
      replaces the displayed data rather than sitting inside sort/filter/pagination —
      the core row-model / display-row-injection work flagged on the Overview row is
      still the right long-term foundation before the pipeline-coupled pages
      (Sorting, Editing Groups, Row Group Panel).

- [x] **Group Display Types** — **enterprise** (extended `rowGrouping()` in
      `../zengrid-enterprise`, **no core change** — rides the existing core
      `fullWidthProvider` hook + positional `valueGetter`-free reshaping). Added a
      `displayType?: 'groupRows' | 'singleColumn' | 'multipleColumns'` option
      (default `groupRows` = the existing full-width header rows). The two **column
      display types** turn group headers into *normal* rows whose hierarchy lives in
      leading **group column(s)**: new pure module `grid/row-grouping-display.ts`
      (`presentDisplayRows(rows, mode, groupCols, dataWidth)`) reshapes each
      flattened display row — a leaf blanks the leading group slot(s) and shifts its
      cells right; a header drops its sentinel into one group column (col 0 for
      `singleColumn`, the level's column for `multipleColumns`) and places each
      configured aggregate in its own **shifted data column** (formatted by that
      column's own `renderer`, not `aggLabel`). New `getGroupColumns()` returns the
      `ColumnDef[]` the app spreads ahead of its data columns
      (`columns: [...grouping.getGroupColumns(), ...dataColumns]`);
      `singleColumn` → 1 indent-by-depth column, `multipleColumns` → one per
      `groupBy` level (count fixed at construction). New `GroupCellRenderer`
      (cacheable:false) draws chevron+label+count in a normal cell and toggles on
      click; reuses the existing `.zg-group-*` CSS (no new styles). Options
      `groupColumnLabel(index, spec)` / `groupColumnWidth`. `render()` now always
      routes through `presentDisplayRows` (groupRows passes through untouched);
      `setData` captures `dataWidth`. Exported `GroupDisplayType` +
      `presentDisplayRows` from `grid/index.ts`. 8 new specs (reshape passthrough/
      singleColumn/multipleColumns placement + manager getGroupColumns/displayType);
      enterprise **480** green; rebuilt dist. **Site:** rewrote the ComingSoon stub
      into an enterprise `<DemoPlayground enterprise>` w/ 3 variants (same
      Region→Status grouping shown three ways: group rows, single column, multiple
      columns) + Expand/Collapse-all controls; `rowGrouping` already in the engine
      snippet scope (no engine change — `getGroupColumns` is a method on the
      instance). Verified headless (groupRows: full-width headers + "Revenue
      $3,522,525" summary; singleColumn: "Region / Status" column with "APAC (25)" /
      indented "Active (15)", data aligned Name/Role/Region, revenue aggregate in the
      Revenue column; multipleColumns: separate Region + Status columns, level-0
      header in Region col / level-1 in Status col; collapse-all → 8 top-level group
      rows; only the benign 504 Optimize-Dep) + clean `npm run build` (225 pages).
      **Release: publish enterprise** (new `displayType` + `getGroupColumns()` +
      `groupColumnLabel`/`groupColumnWidth` + `presentDisplayRows`/`GroupDisplayType`
      exports), bump enterprise core dep; dev-only local-dist aliases already in
      `astro.config.mjs`. **Lib-DX to report:** the column modes rely on the manager
      reshaping the data with **leading blank slots**, so the app's data columns must
      stay **contiguous from source index 0** (the group column(s) own the leading
      slots) and a grouped column is shown twice if you also list it as a data column
      — the same positional-array limitation flagged on Overview. A core **row-model /
      display-row injection** (synthetic non-source rows + a group-value channel so a
      group column could read a header's key without occupying a positional slot)
      would remove the reshape/contiguity constraint and let the group column hide the
      grouped source column automatically — still the right long-term foundation for
      the remaining pages (Single Column, Multiple Columns, Group Rows, Row Group
      Panel).

- [x] **Single Column** — **enterprise** (a deep dive on `displayType:
      'singleColumn'`; extended `rowGrouping()` in `../zengrid-enterprise`, **no core
      change** — rides the existing group-column reshaping). Group Display Types
      shipped the one-column layout at a surface level; this page is about
      **customising that one column**, so added three options to
      `RowGroupingOptions`: `indentPerLevel?: number` (per-nesting-level indent px
      in the single column; the previously hardcoded `INDENT_PER_LEVEL = 18` is now
      the default and read via a `manager.indentPerLevel` getter),
      `suppressCount?: boolean` (hide the `(N)` leaf-count suffix in group-column
      cells), and `groupCellRenderer?: (params: GroupCellParams) => string |
      HTMLElement` (draw the group cell's inner content yourself — placed after the
      chevron, replacing the default label+count; the cell still applies indent +
      click-to-toggle). New `GroupCellParams` interface (`{ key, label, col, count,
      level, expanded, aggs }`) exported from `grid/index.ts`. `GroupCellRenderer`
      now reads `manager.indentPerLevel`, `manager.suppressCount` and
      `manager.groupCellContent(header)` (returns the custom string/HTMLElement or
      `null` → default). 4 new specs (indent default+override, suppressCount,
      groupCellContent null + resolved-label/params passthrough); enterprise **484**
      green; rebuilt dist. **Site:** rewrote the ComingSoon stub into an enterprise
      `<DemoPlayground enterprise>` w/ 3 variants (default one-column w/ Revenue
      aggregate in its own column; `indentPerLevel: 30` + `suppressCount`; custom
      `groupCellRenderer` w/ per-level glyph + coloured count pill) + Expand/Collapse
      controls; `rowGrouping` already in the engine snippet scope (options ride the
      manager — no engine change). Verified headless (Split view, Run each variant:
      one-column = 3 group rows + counts + 18px indent; indent&count = counts
      suppressed + 30px indent; custom = `.zg-group-custom` content "👥 Churned" +
      pill "5" + 26px indent; only the benign 504 Optimize-Dep) + clean
      `npm run build` (225 pages). **Release: publish enterprise** (new
      `indentPerLevel`/`suppressCount`/`groupCellRenderer` + `GroupCellParams`
      export), bump enterprise core dep; dev-only local-dist aliases already in
      `astro.config.mjs`. Core unchanged.

- [x] **Multiple Columns** — **enterprise** (a deep dive on `displayType:
      'multipleColumns'`; extended `rowGrouping()` in `../zengrid-enterprise`, **no
      core change** — rides the existing per-level group-column reshaping). Group
      Display Types shipped the one-column-per-level layout at a surface level; this
      page is about **customising each of those columns independently**. Genuine gap
      filled: `groupColumnWidth` was a single uniform number for every group column —
      widened it to `number | ((index, spec) => number)` so each level's column can
      be sized independently (the natural fit for multipleColumns: a wide Region
      column, a narrow Status one). `getGroupColumns()` now resolves width per column
      via that function (falls back to the number/200 default); `groupColumnLabel(index,
      spec)` (already per-index) titles each column after its source column;
      `suppressCount` + `groupCellRenderer(params)` (runs for **every** group column
      — branch on `params.level`) round out the per-column customisation. 3 new specs
      (uniform-number width, per-level function width, groupColumnLabel index+spec
      passthrough); enterprise **497** green; rebuilt dist. **Site:** rewrote the
      ComingSoon stub into an enterprise `<DemoPlayground enterprise>` w/ 3 variants
      (default a-column-per-level w/ Group 1/Group 2 headers + Revenue aggregate in
      its own column; name & size — `groupColumnLabel`/function `groupColumnWidth`
      Region 220 / Status 140; per-level cell — `groupCellRenderer` globe+bold for
      Region, coloured pill for Status, `suppressCount`) + Expand/Collapse controls;
      `rowGrouping` already in the engine snippet scope (options ride the manager — no
      engine change). Verified headless (Split view, Run each: basic = Group 1/Group 2
      headers + 3 group rows w/ chevrons; named-sized = Region/Status headers, Region
      col wider; per-level = 3 custom cells, `🌐 APAC` level-0 globe + status pills, no
      count; 0 console errors) + clean `npm run build` (225 pages). **Release: publish
      enterprise** (new `groupColumnWidth` function form), bump enterprise core dep;
      dev-only local-dist aliases already in `astro.config.mjs`. Core unchanged.

- [x] **Group Rows** — **enterprise** (a deep dive on the default
      `displayType: 'groupRows'` full-width header layout; extended `rowGrouping()`
      in `../zengrid-enterprise`, **no core change** — the full-width group-header
      renderer is entirely enterprise). Two genuine gaps in the full-width header
      filled: (1) `indentPerLevel` was **ignored** by `groupRows` (the
      `GroupHeaderRenderer` hard-coded the `INDENT_PER_LEVEL=18` constant) — it now
      reads `manager.indentPerLevel`, so nested banners step right per level (same
      knob single-column already honoured); (2) there was **no custom renderer** for
      the full-width banner — `groupCellRenderer` only wired the column display
      types' `GroupCellRenderer`. Added `groupRowRenderer?(params: GroupCellParams)
      => string | HTMLElement` (mirrors `groupCellRenderer`) + a
      `manager.groupRowContent()` accessor; `GroupHeaderRenderer.render` now renders
      the custom content (replacing label+count+summary) after the chevron/indent,
      keeping click-to-toggle wired. Refactored the shared `GroupCellParams` build
      into a private `groupParams(header)`. Updated the `indentPerLevel` JSDoc
      (no longer "ignored by groupRows"). 2 new specs (groupRowContent null default +
      passes resolved label/count/aggs to the renderer); enterprise **498** green;
      rebuilt dist. **Site:** rewrote the ComingSoon stub into an enterprise
      `<DemoPlayground enterprise>` w/ 3 variants (aggregate summaries — sum Revenue
      + avg MRR via `aggLabel`; nested Region→Status w/ `indentPerLevel:28` +
      `groupLabel`; fully custom banner via `groupRowRenderer` — Region badge +
      count + revenue bar) + Expand/Collapse controls; `rowGrouping` already in the
      engine snippet scope (options ride the manager — no engine change). Verified
      headless (Split view, Run each: summaries banner `▾APAC(25)Revenue $3,522,525
      · Avg MRR $10,545`; nested banners paddingLeft 28px for Status vs 0px for
      Region — proving indent now applies; custom `.zg-group-custom` badge+count+bar
      rendered; only a benign 504 Optimize Dep) + clean `npm run build` (225 pages).
      **Release: publish enterprise** (new `groupRowRenderer` + `indentPerLevel` now
      applies to `groupRows`), bump enterprise core dep; dev-only local-dist aliases
      already in `astro.config.mjs`. Core unchanged.

- [x] **Row Group Panel** — **enterprise** (an interactive grouping toolbar; new
      manager `grid/row-group-panel.ts` in `../zengrid-enterprise`, **no core
      change** — it drives the existing `rowGrouping()` manager). `rowGroupPanel({
      grouping, columns })` builds a chips toolbar (`panel.element`, mount above the
      grid) that is a **pure view over the manager**: chips render from
      `grouping.getGroupBy()`, a chip `×` calls `removeGroup`, the "Group by +" menu
      (auto-filtered to ungrouped `columns`) calls `addGroup`, and native
      drag-and-drop between chips calls `setGroupBy` with the re-ordered *entries*
      (preserving per-level `comparator`/`keyGetter`, not just the col). To keep it
      in sync with **programmatic** re-grouping, added a public
      `RowGroupingManager.onGroupByChanged(cb)` subscription fired from `setGroupBy`
      (so `addGroup`/`removeGroup` ride it too); the panel subscribes and re-renders,
      so chips and grid can never disagree. Options: `allowRemove`/`allowReorder`/
      `allowAdd` (all default true), `addLabel`, `placeholder`, `chipLabel({col,
      label,index})`, `onChange(groupBy)`; plus `refresh()`/`destroy()` (unsub +
      detach). Pure exported helper `reorderGroupBy(arr,from,to)` (clamps, copies)
      backs the drag. New `.zg-row-group-panel*` CSS in enterprise `styles.css`
      (chips, drag/drop states, add menu; themes off `--zg-*` tokens). Exported
      `rowGroupPanel`/`RowGroupPanel`/`reorderGroupBy` + option types from
      `grid/index.ts`. 11 new specs (reorder helper, onGroupByChanged fire/unsub,
      panel chip render + add-menu filter + remove/add drive the manager + programmatic
      re-render + destroy-unsub, node-safe DOM stub); enterprise **507** green; rebuilt
      dist. **Site:** rewrote the ComingSoon stub into an enterprise `<DemoPlayground
      enterprise>` w/ 3 variants (chips + add menu; reorder = re-nest w/ a
      programmatic `setGroupBy` sync control; custom placeholder/addLabel/chipLabel +
      `allowReorder:false`); added `rowGroupPanel` to the engine snippet scope and a
      one-line run-cleanup that removes any `.zg-row-group-panel` sibling before
      re-run (the panel mounts outside `gridEl` via `mount.before(...)`, so it would
      otherwise stack across runs). Verified headless (basic: 1 Region chip, add-menu
      [Role,Status], add Status → 2 chips, remove first → [Status], grid regroups;
      reorder: Region/Status chips + `setGroupBy([5,2])` control re-orders chips to
      Status/Region and back — bidirectional sync; custom: placeholder text,
      "+ Add grouping" button, chips "1. REGION"/"2. ROLE" via chipLabel; 0 console
      errors) + clean `npm run build` (225 pages). **Release: publish enterprise**
      (new `rowGroupPanel` API + `onGroupByChanged` on the grouping manager +
      `.zg-row-group-panel*` CSS), bump enterprise core dep; dev-only local-dist
      aliases already in `astro.config.mjs`. Core unchanged. **Lib-DX to report:** a
      real AG-Grid-style row group panel also accepts **column headers dragged into
      it** (and drags columns back out to ungroup). That needs a core header
      drag-source that emits the column being dragged; ZenGrid core exposes no such
      header-drag event, so this panel uses an explicit add menu + in-panel chip
      reorder instead. A core `column:dragstart`/drop-target seam would let the panel
      (and a future column tool panel) support header-drag grouping.

- [x] **Expanding Groups** — **enterprise** (extended the existing `rowGrouping()`
      in `../zengrid-enterprise`, **no core change**). The manager already owned
      the per-group expand/collapse infra (`setExpanded`/`toggle`/`isExpanded`/
      `expandAll`/`collapseAll`/`onExpandedChanged` + boolean `expandedByDefault`);
      this page needed the **depth + persistence** surface, so added: (1)
      **`groupDefaultExpanded?: number`** config — open the first N nesting levels
      (`-1` all, `0` none, `1` outermost only), overriding `expandedByDefault`; a
      group at 0-based `level` opens its children when `level <
      groupDefaultExpanded`. (2) **`expandToLevel(n)`** — the same depth control
      applied live. (3) **`getCollapsedPaths(): string[]`** /
      **`setCollapsedPaths(paths)`** — serialisable snapshot + restore of the exact
      open/closed set (save to storage/URL, reinstate later). Refactored the
      default-expansion logic in `rebuild()` into a shared `setExpandedToLevel` +
      `defaultExpandedLevel` (so `expandToLevel`/`groupDefaultExpanded`/
      `expandedByDefault` all route through one level-collapse pass). New pure model
      helper `collectPathLevels(nodes)` (path + 0-based level) in
      `row-grouping-model.ts`. 5 new specs (groupDefaultExpanded N/0/-1, overrides
      expandedByDefault, expandToLevel depths, get/setCollapsedPaths round-trip);
      enterprise **512** green; rebuilt dist. **Site:** rewrote the ComingSoon stub
      into an enterprise `<DemoPlayground enterprise>` w/ 3 variants (default &
      expand-to-level over a 3-level Region→Role→Status tree w/
      `groupDefaultExpanded:1` + `expandToLevel(1/2/3/0)` controls; expand from the
      API — `setExpanded`/`toggle`/`expandAll`/`collapseAll` by path +
      `onExpandedChanged` console log; save & restore via
      `getCollapsedPaths`/`setCollapsedPaths` stashed on the grid). `rowGrouping`
      was already in the engine snippet scope (methods ride the manager — no engine
      change). Verified headless (default groupDefaultExpanded:1 shows Region+Role
      banners; **`expandToLevel(0)` → exactly 8 Region banners**, level-2 adds Status
      banners, level-3 reveals leaf rows; API: collapse-all → 8, Open EU-West →
      chevron ▾; save→expand-all→restore round-trips the collapsed set; only a benign
      504 Optimize Dep) + clean `npm run build` (225 pages). **Release: publish
      enterprise** (new `groupDefaultExpanded`/`expandToLevel`/`getCollapsedPaths`/
      `setCollapsedPaths` + `collectPathLevels`), bump enterprise core dep; dev-only
      local-dist aliases already in `astro.config.mjs`. Core unchanged.

**After Rows**, continue in sidebar order: **Columns → Cells → Filters →
Editing → Selection → Row Grouping → Aggregation → Pivoting → Tree Data →
Master/Detail → Import/Export → Server-Side → Performance → Interactivity →
Formulas → Accessories**. Re-read `astro.config.mjs` each time for the exact next
slug; append newly-completed items here.
