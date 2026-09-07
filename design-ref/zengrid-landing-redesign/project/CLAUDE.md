# ZenGrid Design System (use for ALL designs in this project)

Playful-modern developer brand. Light theme is the default; every page ships a dark variant behind a `☾ Dark / ☀ Light` toggle. Live reference implementation: `ZenGrid Home v4.dc.html`.

## Color tokens (CSS custom properties)
Light:
--bg:#f8f5ef  --surface:#ffffff  --surface-2:#faf8f3
--border:#e6e0d5  --border-soft:#f0ece3  --row-line:#f5f1e9
--ink:#211d1a  --muted:#6b6258  --faint:#9a9184
--coral:#f2764e  --coral-sh:#d85a34 (button 3D shadow)
--teal:#57b6a6  --teal-ink:#3f9284  --logo-ink:#211d1a

Dark:
--bg:#1a1714  --surface:#232019  --surface-2:#2a261e
--border:#34302a  --border-soft:#2f2b24  --row-line:#2a261f
--ink:#f6f1e7  --muted:#b3a998  --faint:#8c8272
--coral:#f2764e  --coral-sh:#a34d2f  --teal-ink:#6fd0bf  --logo-ink:#f6f1e7

Accent inks (icon chips, stat numbers, group labels) — light / dark:
coral #e0603a / #f7906b · teal #3f9284 / #6fd0bf · amber #c9962a / #e3b354 · violet #7b5fc4 / #ad93e0
Soft accent tints (light): coral #fdeee7 · teal #e6f3f0 · amber #fbf1dc · violet #efe9f9
(dark): #331f18 · #1f302c · #322a16 · #2a2338

Status pills — light: Active #e3f5e9/#2f8f52, Trial #fbf1d6/#a67c1a, Churned #f7e3dd/#b04a34
dark: #16341f/#7fe6a0, #3a3113/#f0cf6b, #3a1f18/#f0a08c

## Typography
- Headings/display: **Manrope** 700–800, letter-spacing -0.03 to -0.035em. H1 56–66px, H2 32–40px.
- Body/UI: **Instrument Sans** 400–600, 14–17px, line-height 1.55–1.65.
- Code/labels/eyebrows: **JetBrains Mono** 11–13px; eyebrows uppercase, letter-spacing 0.08–0.12em, weight 700.
- Accent word in headlines: same weight, color var(--coral). NO italic serifs, NO Bricolage/Space Grotesk (user rejected as retro).

## Components & patterns
- Logo: rounded square (--logo-ink) with 2×2 grid of coral/amber/teal/violet squares + "ZenGrid" Manrope 800.
- Primary button: bg coral, white text, radius 13–14px, `box-shadow:0 5px 0 var(--coral-sh)` (playful 3D).
- Secondary: bg surface, 1px border, `0 5px 0 var(--border)` shadow. Dark CTA band: bg var(--ink), text var(--bg).
- Cards: bg surface, 1px var(--border), radius 18–22px; hover lift `translateY(-4px)` + accent border.
- Mac window chrome on tables/code/previews: #ff5f56 #ffbd2e #27c93f dots + mono filename.
- Code blocks: bg var(--ink), text var(--bg), syntax colors #c9a0e8 (keywords) #8fd6c8 (strings) #f2a583 (classes), copy button top-right (`copy` → `✓ copied`).
- Pills/chips: radius 999px. Eyebrow: pulsing 7px coral dot + mono uppercase label.
- Theme via CSS vars string on root element, swapped from component state; `white-space:nowrap` on toggle.
- Micro-animations only: zg-pulse (dot), zg-fadeup (staggered entrance), zg-blink (cursor). NO continuous background motion (user finds it disturbing). AVOID: inline mask-image, large infinite-scroll transform animations, holeless sc-for bodies — these hung the preview before.

## Voice
Confident, playful, dev-native. Short punchy headlines ("Your data is huge. Your DOM isn't." / "Kick the tires."). Mono captions as annotations ("↓ this one's real — click a column header").

## Site map (files)
Home: `ZenGrid Home v4.dc.html` · Features (live bento): `ZenGrid Features.dc.html` · Examples / Pricing / Docs / API: `ZenGrid <Name>.dc.html`. Nav order: Features, Examples, Pricing, Docs, API + theme toggle + "Get started". Pricing: Community $0 / Solo $10k / Team $50k·10 seats / Enterprise custom; per dev seat; premium support add-on.
