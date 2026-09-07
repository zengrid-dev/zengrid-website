// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';
import starlightVersions from 'starlight-versions';

// Custom Expressive Code theme matching the marketing design system's code
// blocks (design-ref/…/CLAUDE.md → "Code blocks"): warm dark ink slab with the
// exact syntax triplet — violet keywords, teal strings, salmon class/function
// names — plus amber numbers and muted comments.
const zengridInk = {
  name: 'zengrid-ink',
  type: 'dark',
  colors: {
    'editor.background': '#1e1a15',
    'editor.foreground': '#f1ece1'
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#8c8272', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'variable.language'], settings: { foreground: '#c9a0e8' } },
    { scope: ['string', 'string.quoted', 'punctuation.definition.string', 'constant.other.symbol'], settings: { foreground: '#8fd6c8' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type', 'entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#f2a583' } },
    { scope: ['constant.numeric', 'constant.language.boolean', 'constant.language'], settings: { foreground: '#e3b354' } },
    { scope: ['meta.object-literal.key', 'support.type.property-name', 'variable.other.property'], settings: { foreground: '#cfc7b8' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#b3a998' } }
  ]
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.zengrid.dev',

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        // The demo site consumes the grid through @zengrid/enterprise (its /grid
        // bundle re-exports the core API + enterprise features). @zengrid/core is
        // a transitive external of that bundle — resolved from the published npm
        // package (installed via package.json), not from local source. Enterprise
        // and license stay aliased to their local builds (both unpublished). Core
        // ships the base grid CSS; enterprise ships its own feature CSS (row-drag
        // indicator/handle, …). Demos load both stylesheets.
        { find: '@zengrid/enterprise/styles.css', replacement: '/home/balaji/workspace/personal/dev-tool/zengrid-enterprise/packages/enterprise/dist/enterprise.css' },
        { find: /^@zengrid\/enterprise$/, replacement: '/home/balaji/workspace/personal/dev-tool/zengrid-enterprise/packages/enterprise/dist/grid.esm.js' },
        { find: /^@zengrid\/license$/, replacement: '/home/balaji/workspace/personal/dev-tool/zengrid-enterprise/packages/license/dist/index.esm.js' },
        // DEV-ONLY (unpublished core): point @zengrid/core (external of the
        // enterprise bundle) + its stylesheet at the local build so unreleased
        // core changes (e.g. filterParams.caseSensitive) run in the demos.
        // Remove once core is published and the site dep is bumped.
        { find: '@zengrid/core/dist/styles.css', replacement: '/home/balaji/workspace/personal/dev-tool/zengrid/packages/core/dist/src/styles.css' },
        { find: /^@zengrid\/core$/, replacement: '/home/balaji/workspace/personal/dev-tool/zengrid/packages/core/dist/index.esm.js' }
      ]
    }
  },

  integrations: [
    starlight({
      title: 'ZenGrid',
      description: 'Documentation for ZenGrid — the performance-first virtual grid for the web.',
      // No right-hand "On this page" panel anywhere. Feature docs put a live,
      // editable demo inline (like the Getting Started page), not a ToC rail.
      tableOfContents: false,
      // Code blocks follow the marketing design system: a single always-dark
      // warm-ink slab (never the inverted-cream light variant), JetBrains Mono,
      // rounded 14px corners, and the terminal-style frame + copy button that
      // Expressive Code ships. See design-ref/.../CLAUDE.md → "Code blocks".
      expressiveCode: {
        themes: [zengridInk],
        useStarlightDarkModeSwitch: false,
        styleOverrides: {
          borderRadius: '14px',
          borderColor: 'transparent',
          codeFontFamily: '"JetBrains Mono Variable", ui-monospace, monospace',
          codeFontSize: '0.84rem',
          codeLineHeight: '1.7',
          codeBackground: '#1e1a15',
          frames: {
            editorTabBarBackground: '#171410',
            editorActiveTabBackground: '#1e1a15',
            editorActiveTabIndicatorBottomColor: '#f2764e',
            editorTabBarBorderBottomColor: '#ffffff1a',
            terminalTitlebarBackground: '#171410',
            terminalTitlebarBorderBottomColor: '#ffffff1a',
            terminalBackground: '#1e1a15'
          }
        }
      },
      // Reuse the marketing site's Logo and Footer; leave every other Starlight
      // component intact so the versions plugin can own Search / the version
      // dropdown / the theme toggle and keep versioning working.
      components: {
        SiteTitle: './src/components/docs/SiteTitle.astro',
        Footer: './src/components/docs/Footer.astro'
      },
      customCss: [
        '@fontsource-variable/manrope',
        '@fontsource-variable/instrument-sans',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/docs.css'
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/zengrid-dev/zengrid' }
      ],
      // Client script that adds the cross-version "available in vX.Y+" search hint.
      head: [
        {
          tag: 'script',
          attrs: { type: 'module', src: '/docs-feature-hint.js', defer: true }
        },
        {
          tag: 'script',
          attrs: { type: 'module', src: '/docs-enhance.js', defer: true }
        }
      ],
      sidebar: [
        { label: 'Start Here', items: [{ label: 'Getting Started', slug: 'getting-started' }] },
        {
          label: 'Features',
          items: [
            { label: 'Virtual Scrolling', slug: 'features/virtual-scrolling' },
            {
              label: 'Rows',
              items: [
                { label: 'Row Data', slug: 'features/rows/row-data' },
                { label: 'Row Sorting', slug: 'features/rows/row-sorting' },
                { label: 'Row Numbers', slug: 'features/rows/row-numbers' },
                { label: 'Row Spanning', slug: 'features/row-spanning' },
                { label: 'Row Pinning', slug: 'features/rows/row-pinning' },
                { label: 'Row Height', slug: 'features/rows/row-height' },
                { label: 'Styling Rows', slug: 'features/rows/styling-rows' },
                { label: 'Row Pagination', slug: 'features/rows/row-pagination' },
                { label: 'Accessing Rows', slug: 'features/rows/accessing-rows' },
                {
                  label: 'Row Dragging',
                  items: [
                    { label: 'Managed Row Dragging', slug: 'features/rows/row-dragging/managed' },
                    { label: 'Unmanaged Row Dragging', slug: 'features/rows/row-dragging/unmanaged' },
                    { label: 'Row Dragging Customisation', slug: 'features/rows/row-dragging/customisation' },
                    { label: 'External DropZone', slug: 'features/rows/row-dragging/external-dropzone' },
                    { label: 'Grid to Grid', slug: 'features/rows/row-dragging/grid-to-grid' }
                  ]
                },
                { label: 'Full-Row Cells', slug: 'features/rows/full-row-cells' }
              ]
            },
            {
              label: 'Columns',
              items: [
                {
                  label: 'Basics',
                  items: [
                    { label: 'Configuration', slug: 'features/columns/configuration' },
                    { label: 'Column Definitions', slug: 'features/columns/column-definitions' }
                  ]
                },
                {
                  label: 'Display',
                  items: [
                    { label: 'Headers', slug: 'features/columns/column-headers' },
                    { label: 'Sizing & Resizing', slug: 'features/columns/column-sizing' },
                    { label: 'Custom Cell Components', slug: 'features/columns/custom-components' },
                    { label: 'Column Spanning', slug: 'features/columns/column-spanning' }
                  ]
                },
                {
                  label: 'Interaction',
                  items: [
                    { label: 'Column Moving', slug: 'features/columns/column-moving' },
                    { label: 'Column Pinning', slug: 'features/columns/column-pinning' },
                    { label: 'Column State', slug: 'features/columns/column-state' }
                  ]
                },
                {
                  label: 'Advanced',
                  items: [
                    { label: 'Column Groups', slug: 'features/columns/column-groups' },
                    { label: 'Auto-Generate Columns', slug: 'features/columns/auto-generate-columns' },
                    { label: 'Calculated Columns', slug: 'features/columns/calculated-columns' }
                  ]
                }
              ]
            },
            {
              label: 'Cells',
              items: [
                {
                  label: 'Cell Content',
                  items: [
                    { label: 'Getting Values', slug: 'features/cells/getting-values' },
                    { label: 'Text Formatting', slug: 'features/cells/text-formatting' },
                    { label: 'Cell Components', slug: 'features/cells/cell-components' }
                  ]
                },
                { label: 'Notes', slug: 'features/cells/notes' },
                { label: 'Styling Cells', slug: 'features/cells/styling-cells' },
                { label: 'Highlighting Changes', slug: 'features/cells/highlighting-changes' },
                { label: 'Tooltips', slug: 'features/cells/tooltips' },
                { label: 'Expressions', slug: 'features/cells/expressions' },
                { label: 'View Refresh', slug: 'features/cells/view-refresh' }
              ]
            },
            {
              label: 'Filters',
              items: [
                { label: 'Overview', slug: 'features/filters/overview' },
                { label: 'Column Filters', slug: 'features/filters/column-filters' },
                { label: 'Text Filter', slug: 'features/filters/text-filter' },
                { label: 'Number Filter', slug: 'features/filters/number-filter' },
                { label: 'BigInt Filter', slug: 'features/filters/bigint-filter' },
                { label: 'Date Filter', slug: 'features/filters/date-filter' },
                { label: 'List Filter', slug: 'features/filters/list-filter' },
                { label: 'Value List', slug: 'features/filters/value-list' },
                { label: 'Data Updates', slug: 'features/filters/data-updates' },
                { label: 'Hierarchical Values', slug: 'features/filters/hierarchical-values' },
                { label: 'Filter Search', slug: 'features/filters/filter-search' },
                { label: 'Selection Mode', slug: 'features/filters/selection-mode' },
                { label: 'List Filter API', slug: 'features/filters/list-filter-api' },
                { label: 'Filter Styling', slug: 'features/filters/filter-styling' },
                { label: 'Filter Templates', slug: 'features/filters/filter-templates' }
              ]
            },
            {
              label: 'Selection',
              items: [
                { label: 'Overview', slug: 'features/selection/overview' },
                { label: 'Row Selection', slug: 'features/selection/row-selection' },
                { label: 'Single Row Selection', slug: 'features/selection/single-row' },
                { label: 'Multi-Row Selection', slug: 'features/selection/multi-row' },
                { label: 'Cell Selection', slug: 'features/selection/cell-selection' },
                { label: 'Column Selection', slug: 'features/selection/column-selection' },
                { label: 'Range Selection', slug: 'features/selection/range-handle' },
                { label: 'Fill Handle', slug: 'features/selection/fill-handle' },
                { label: 'API Reference', slug: 'features/selection/row-api' }
              ]
            },
            {
              label: 'Editing',
              items: [
                { label: 'Overview', slug: 'features/editing/overview' },
                { label: 'Start / Stop Editing', slug: 'features/editing/start-stop' },
                { label: 'Parsing Values', slug: 'features/editing/parsing-values' },
                { label: 'Saving Values', slug: 'features/editing/saving-values' },
                { label: 'Edit Components', slug: 'features/editing/edit-components' },
                {
                  label: 'Provided Cell Editors',
                  items: [
                    { label: 'Text Editor', slug: 'features/editing/provided/text' },
                    { label: 'Large Text Editor', slug: 'features/editing/provided/large-text' },
                    { label: 'Number Editor', slug: 'features/editing/provided/number' },
                    { label: 'Date Editors', slug: 'features/editing/provided/date' },
                    { label: 'Checkbox Editor', slug: 'features/editing/provided/checkbox' },
                    { label: 'Select Editor', slug: 'features/editing/provided/select' },
                    { label: 'Search Select Editor', slug: 'features/editing/provided/search-select' }
                  ]
                },
                { label: 'Customisation', slug: 'features/editing/customisation' },
                { label: 'Async Values', slug: 'features/editing/async-values' },
                { label: 'Undo / Redo Edits', slug: 'features/editing/undo-redo' },
                { label: 'Full Row', slug: 'features/editing/full-row' },
                { label: 'Validation', slug: 'features/editing/validation' },
                { label: 'Batch Editing', slug: 'features/editing/batch/row-data' }
              ]
            },
            {
              label: 'Interactivity',
              items: [
                { label: 'Keyboard Navigation', slug: 'features/interactivity/keyboard-navigation' },
                { label: 'Accessibility (ARIA)', slug: 'features/interactivity/accessibility' }
              ]
            },
            {
              label: 'Row Grouping',
              items: [
                { label: 'Overview', slug: 'features/row-grouping/overview' },
                { label: 'Grouping Data', slug: 'features/row-grouping/grouping-data' },
                { label: 'Group Display Types', slug: 'features/row-grouping/group-display-types' },
                { label: 'Single Column', slug: 'features/row-grouping/single-column' },
                { label: 'Multiple Columns', slug: 'features/row-grouping/multiple-columns' },
                { label: 'Group Rows', slug: 'features/row-grouping/group-rows' },
                { label: 'Grouping Toolbar', slug: 'features/row-grouping/grouping-toolbar' },
                { label: 'Expanding Groups', slug: 'features/row-grouping/expanding-groups' }
              ]
            }
          ]
        },
        {
          label: 'Reference',
          items: [
            { label: 'Feature Matrix', slug: 'feature-matrix' },
            { label: 'Release Notes', slug: 'release-notes' }
          ]
        }
      ],
      plugins: [
        starlightVersions({
          current: { label: 'v1.4 (Latest)' },
          versions: [{ slug: '1.3', label: 'v1.3' }]
        })
      ]
    }),
    mdx(),
    sitemap()
  ]
});
