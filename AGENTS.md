## Docs iteration playbook

When the user says **"proceed for next one"** (typically after clearing context),
read **`DOCS-HANDOVER.md`** and follow it: complete the **next unchecked feature
in sidebar order**, one at a time, end-to-end (correct tier, prose, multiple
variants, live editable demo), verify, tick it off in that file's Progress Log,
and stop. Lib gaps/mislabels get fixed in the library (`../zengrid`) or enterprise
(`../zengrid-enterprise`) — never papered over in the site — and reported to the
user. That file is the source of truth for what's done and what's next.

## Development

Start the dev server through the npm script (background mode), never the bare
`astro dev` binary:

```
npm run dev -- --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Why `npm run dev` and not `astro dev`

`npm run dev` / `npm run build` fire `predev` / `prebuild`, which do
`rm -rf .astro` — a **fresh content-collection cache on every start**.

This is a permanent fix for a recurring failure:

```
The slug "getting-started" specified in the Starlight sidebar config does not exist.
```

Root cause: Starlight + `starlight-versions` persist a content index in `.astro/`.
Whenever docs are renamed/moved or the sidebar is reshaped, that cache desyncs and
Starlight's sidebar `slug` validation reads the stale index — so a slug that *does*
exist on disk is reported missing. Clearing `.astro` rebuilds the index. The npm
`pre*` hooks make that automatic, so **do not** run `astro dev`/`astro build`
directly (they skip the clear and the error comes back).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Docs authoring conventions

These are project-wide rules. Adhere to them for every docs page — always.

### Page layout

- **No right-hand "On this page" panel** anywhere. It is disabled globally via
  `tableOfContents: false` in `astro.config.mjs`. Do not re-enable it per page.
- Every feature doc embeds a **live, editable demo inline** in the page body —
  the same pattern as the Getting Started page (`<Playground />`), with live
  code editing (the user edits code and the grid re-renders).
- The prose **above** the demo explains the feature and how to change/customize
  it. Inside the demo, add a short **hint** pointing at what to tweak.

### Demos

- Each doc has its **own** live example that demonstrates *that* feature. Never
  reuse the same example across pages.
- Every demo must surface **all** of that feature's customization: options,
  styles, and variants. Show the variants, don't just describe them.

### Components

- Build **reusable components shared across modules** (demo shell, editor,
  hint, variant switcher, etc.). Do not copy-paste per page.
- **No file exceeds 200 lines.** Split by feature into smaller files.

### Library vs. site (important)

- If a feature needs a **workaround or hack**, it belongs in the **library**
  (`../zengrid`), **not** in this site.
- When you hit such a case, **stop and inform the user** with the specifics so a
  lib release can be planned. Do not paper over it in the site.
  See also: the lib-DX recommendation practice in project memory.
