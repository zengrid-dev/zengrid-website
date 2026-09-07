// Small post-render tweaks for the docs chrome (module, deferred → DOM ready).

// 1. Open GitHub / external header links in a new tab. Starlight's SocialIcons
//    render plain same-tab anchors; the marketing footer already opens external
//    links in a new tab, so this only needs the header social + any GitHub link.
for (const a of document.querySelectorAll(
  '.social-icons a[href^="http"], a[href*="github.com"]'
)) {
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
}
