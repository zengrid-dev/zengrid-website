# ZenGrid website v2 cutover

Updated: 8 September 2026 (Asia/Kolkata).

## Decision

Replace the deployment currently served by `www.zengrid.dev` with this v2 site.
Keep the existing Vercel project, `www.zengrid.dev` production domain, and the
permanent `zengrid.dev` to `www.zengrid.dev` redirect. A project reuse avoids a
DNS or certificate migration and keeps Vercel rollback available.

The Git deployment serves a reviewed `dist/` artifact produced on the trusted
local checkout. Vercel verifies that artifact and does not rebuild the Astro
source, so unpublished Enterprise and license packages remain outside the public
repository and Vercel builder.

## Verified starting point

- The live domain is hosted by Vercel; the apex returns a permanent redirect to
  `www.zengrid.dev`.
- The current public repository remote is `zengrid-dev/zengrid-website`, with
  `main` at `00aab634bbe8169f591eab211fbd1d8b4eed60bf` during this audit.
- This v2 production build passes and generates 232 pages in a 21 MB `dist/`.
- Payment configuration tests pass. The authenticated Polar audit passed for
  Solo and Team, while license fulfillment remains disabled.
- The live sitemap has 67 URLs. The 66 non-home URLs are absent from v2 under
  their old paths. `vercel-redirects.csv` now maps every one of them.
- The v2 docs contain 223 MDX pages; 128 currently render `ComingSoon`. These
  pages should remain visible only when that product presentation is accepted.
- `vercel-redirects.csv` contains 67 unique reviewed legacy routes: the 66
  non-home sitemap URLs plus the legacy `/api/` route.
- A clean checkout of `zengrid-dev/zengrid-website` is used for the replacement;
  the dirty sibling worktree is not involved.

## Launch gates

The site cutover can proceed with paid checkout disabled. Before enabling either
paid plan:

1. **Commercial fulfillment:** finish the production signing identity, manual
   order verification, private package delivery, and real Polar Sandbox tests
   in `COMMERCIAL-LAUNCH-HANDOVER.md`.
2. **Legal identity:** replace the legal-name and governing-jurisdiction
   placeholders and approve the one-business-day manual delivery promise.
3. **Docs presentation:** review the 128 `ComingSoon` pages. Complete the legacy
   topics linked by the redirect map, or explicitly accept their current target.
   Hide unfinished pages from production navigation/search if they should not be
   public at launch. Four live topics currently land on unfinished v2 pages:
   accessibility, reactive state, CSV export, and infinite row loading. The 17
   old API/plugin routes currently fall back to the public GitHub repository;
   replace those redirects when equivalent v2 reference pages exist.
4. **Self-contained build:** run the build on a trusted machine with Core and
   Enterprise at reviewed versions. Commit only the static artifact; never upload
   private packages, signing keys, or customer data to the public repository.

## Staged deployment

1. Build and verify the site on the trusted local checkout.
2. Overlay the v2 source and reviewed `dist/` artifact onto a clean checkout of
   the existing Git repository.
3. Confirm no `.env`, access token, webhook secret, signing key, or customer data
   is staged.
4. Push the replacement commit to `main`; the existing Vercel Git integration
   verifies `dist/` and promotes it to the production domain.
5. After the separate fulfillment gates pass, set checkout readiness:
   `ZENGRID_LICENSE_DELIVERY=manual`, `POLAR_SOLO_READY=true`, and
   `POLAR_TEAM_READY=true`.
6. Rebuild and verify that checkout-enabled artifact on the trusted checkout.
7. Smoke-test the deployment: homepage, navigation, search, editable Community
   and Enterprise demos, version selector, legal pages, billing portal, both
   checkouts, return URLs, sitemap, robots, and representative legacy redirects.
8. Confirm the apex redirect, canonical
   URLs, SSL, and the checkout lifecycle on `www.zengrid.dev`.
9. Watch Vercel errors, Polar orders, and delivery records during the first day.

## Rollback

If routing, demos, checkout, or delivery fails, promote the recorded old Vercel
deployment. Then set the three checkout readiness values back to their disabled
state before attempting another v2 deployment. The domain and DNS stay attached
to the same Vercel project throughout.

## Completion evidence

The cutover is complete when all old sitemap URLs return either 200 or the
reviewed 308 destination, every v2 sitemap URL returns 200, both paid plans can
complete a sandbox lifecycle, one controlled live purchase is delivered, and a
rollback drill can restore the old deployment.
