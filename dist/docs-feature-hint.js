// Cross-version search hint.
//
// starlight-versions scopes Pagefind search to the version you're viewing, so a
// feature added in a newer version simply returns no results on an older one.
// This script fills that gap: when you're on an older version and search for a
// feature that only exists in a newer one, it surfaces a hint telling you which
// version introduced it and links you straight there — so you never conclude a
// feature "doesn't exist".

const CONTAINER_ID = 'starlight__search';
const HINT_CLASS = 'zg-version-hint';

/** Compare two semver-ish strings. Returns >0 if a is newer than b. */
function cmpSemver(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  }
  return 0;
}

async function init() {
  let index;
  try {
    const res = await fetch('/feature-index.json');
    index = await res.json();
  } catch {
    return; // No index → silently do nothing.
  }

  const search = document.querySelector('site-search');
  const viewedId = search?.dataset.version || 'current';

  // On the latest version every documented feature already exists, so there is
  // nothing newer to point at.
  if (viewedId === 'current') return;

  const viewed = index.versions.find((v) => v.id === viewedId);
  if (!viewed) return;

  // Features that were introduced *after* the version currently being viewed.
  const newer = index.features.filter((f) => cmpSemver(f.since, viewed.semver) > 0);
  if (newer.length === 0) return;

  const latest = index.versions.find((v) => v.id === 'current');
  const latestLabel = latest ? latest.label : 'the latest version';

  const render = (query) => {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    const existing = container.querySelector('.' + HINT_CLASS);
    const q = query.trim().toLowerCase();

    const matches =
      q.length >= 2
        ? newer.filter(
            (f) =>
              f.title.toLowerCase().includes(q) ||
              f.keywords.some((k) => k.toLowerCase().includes(q))
          )
        : [];

    if (matches.length === 0) {
      if (existing) existing.remove();
      return;
    }

    const items = matches
      .map(
        (f) =>
          `<li><strong>${f.title}</strong> — available in <strong>v${f.since}+</strong>. ` +
          `<a href="${f.url}">View in ${latestLabel} →</a></li>`
      )
      .join('');

    const html =
      `<span aria-hidden="true">🕒</span>` +
      `<div><div>Not in ${viewed.label}, but newer versions have it:</div>` +
      `<ul>${items}</ul></div>`;

    if (existing) {
      existing.innerHTML = html;
    } else {
      const el = document.createElement('div');
      el.className = HINT_CLASS;
      el.setAttribute('role', 'note');
      el.innerHTML = html;
      container.prepend(el);
    }
  };

  // Pagefind renders its input lazily inside the modal; listen via delegation.
  document.addEventListener('input', (event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.classList.contains('pagefind-ui__search-input')
    ) {
      render(target.value);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
