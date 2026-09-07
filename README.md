# ZenGrid website

Static Astro marketing pages and versioned Starlight documentation.

## Development

```sh
npm install
npm run dev -- --background
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

Always start through the npm script: its pre-hook clears the Astro content
cache. The build uses local ZenGrid enterprise/license bundles configured in
`astro.config.mjs`.

## Build and verify

```sh
npm run build
npm run test:payments
npm run preview
```

Payment build-output tests expect the default disabled checkout configuration.
The configuration tests also cover enabling individual reviewed plans.

## Payments

See [PAYMENT-SETUP.md](PAYMENT-SETUP.md) for the corrected live Polar catalog,
remaining account/fulfillment blockers, and the later backend work.

- `/buy/`: shared plan prices, checkout availability, delivery and order help.
- `/billing/`: Polar's hosted customer portal for invoices and subscriptions.
- `.env.example`: public checkout destinations and per-plan readiness flags.
- `src/config/plans.ts`: canonical Solo/Team pricing and seat counts.
- `src/config/checkout-validation.ts`: validates links and fulfillment readiness.
- `src/config/polar-catalog.ts`: public IDs of the reviewed live Polar offers.
- `npm run payments:audit`: private, read-only API check of pricing and account capabilities.

Checkout is disabled until the sandbox lifecycle and license delivery are ready.
A local `.env` API token can run the admin audit; it is never imported by the
static site. Signing secrets belong outside this repository. The fulfillment
backend under `serverless/backend/` is deployed separately to Cloud Run.

## Production cutover

See [SITE-CUTOVER-PLAN.md](SITE-CUTOVER-PLAN.md) for replacing the existing
Vercel deployment while preserving the production domains, legacy URLs, private
commercial dependencies, and rollback path.

Vercel serves the reviewed `dist/` artifact committed to Git. It does not rebuild
the Astro source because the Enterprise and license demo packages are unpublished.
Prepare every production update on a trusted checkout before committing it:

```sh
npm ci
npm run deploy:prepare
git add dist
```

The Git-triggered Vercel build runs `npm run deploy:verify` and rejects an absent,
incomplete, or checkout-enabled artifact.

## Documentation work

Follow [AGENTS.md](AGENTS.md) and [DOCS-HANDOVER.md](DOCS-HANDOVER.md) for feature
documentation iterations.
