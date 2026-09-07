# Payments without a user backend

Current implementation/progress: [COMMERCIAL-LAUNCH-HANDOVER.md](COMMERCIAL-LAUNCH-HANDOVER.md).
Community `1.6.0` is published. Enterprise/License must never be published to any
package registry; private archive and offline-signing instructions are in
`../zengrid-enterprise/OFFLINE-RELEASE.md`.

The Astro site is static. Customers choose a plan on `/buy/`, pay on Polar,
and manage billing through `/billing/` → Polar's email-code login.
Polar's hosted confirmation is the source of payment status. The site does
not collect card details, create API sessions, store customers, or issue keys.

## Live Polar corrections — 5 September 2026

The owner authorized direct API changes using the local `.env` credential.
Both permanent checkout URLs were preserved and now point to corrected products.

| Plan | Corrected live offer | Retired offer |
| --- | --- | --- |
| Solo | $120 USD/year total, one developer seat, no trial | Adjustable $120/seat/year with a 14-day trial |
| Team | $999 USD/year total, ten developer seats, no trial | $999 one-time payment |

Both new prices are fixed, tax-exclusive annual subscriptions. The previous
products are archived. There were **zero orders and zero subscriptions** at
migration time; no customer subscriptions were modified.

Each existing checkout link now offers exactly one corrected product, with
no preset discount or discount entry, no trial override, a return URL of
`https://zengrid.dev/buy/#solo` or `#team`, and no custom success redirect.
Polar continues to display its own confirmation after payment.

Each product has a custom benefit containing license delivery instructions.
This gives buyers a note in Polar's confirmation and portal; it **does not
generate a signed ZenGrid key or deliver the paid package**. The public
organization name is now `ZenGrid`, with the canonical website and existing
`hello@zengrid.dev` support address. Confirmation emails were already enabled.

Public organization, product, benefit, and checkout-link IDs are recorded in
[`src/config/polar-catalog.ts`](src/config/polar-catalog.ts).

## Accepted launch debt

On 8 September 2026, the owner directed production checkout to open with
one-business-day manual fulfillment while the production signer is completed.
The following work remains urgent even though checkout is enabled:

1. **Polar account/catalog verification:** the authenticated audit on
   6 September 2026 passed Solo and Team and reported no account capability
   blocker. Re-run it before launch; this does not prove customer fulfillment.
2. **Signed-license fulfillment:** no automated webhook endpoint is configured
   in Polar. The existing issuer prototypes are not production services.
   Manual delivery needs an operator, a stated delivery turnaround, an
   installable paid package, and a tested compatible signing tool.
3. **Production signing identity:** release-date-based entitlement is now
   implemented and tested in `../zengrid-enterprise`. Production archives still
   require the real offline issuer's public key and offline manifest signature.
   Tested archives use disposable keys and must not be delivered to customers.
4. **Business details in legal pages:** the Terms and EULA still contain
   `[Governing jurisdiction — to be completed]`. Supply the actual legal
   entity and jurisdiction before publishing finalized commercial terms.

A checkout page returning HTTP 200 does not establish that this account can
accept payments. No production charge or customer message was submitted.

## Private, read-only API audit

Keep the API token only in the local ignored `.env` or a private admin job's
environment. Prefer `POLAR_ACCESS_TOKEN`; `POLAR_API_KEY` and the existing
`polar` variable are also supported. Never use a `PUBLIC_` prefix. The static
website does not import the admin client or require the credential to build.

```sh
# Checks catalog correctness; still prints account/fulfillment blockers.
npm run payments:audit -- --catalog-only

# Exits nonzero for catalog errors or account/fulfillment launch blockers.
npm run payments:audit
```

The audit checks the website's actual prices against Polar, including annual
billing, fixed quantity, tax behavior, trials, correct products/links,
delivery instructions, and archived legacy offers. It rejects checkout URL
overrides that have not been recorded in the public catalog. It uses GET only,
the fixed `api.polar.sh` host, timeouts, and no redirects; it does not print
credentials, raw responses, orders, or customer data.

This is a configuration check. It cannot verify fulfillment, identity,
legal completeness, or the behavior of a shipped licensed application.

## License delivery for this phase

If choosing manual fulfillment, test a signed key against the verifier shipped
with the paid package first. Polar-generated UUID license keys are incompatible
with ZenGrid's offline Ed25519 payload format; do not attach a Polar license-key
benefit as a substitute. The configured custom benefits are instructions only.

For every initial purchase and paid renewal:

1. Open the paid order directly in the authenticated Polar dashboard. Verify
   product, amount/currency, payment status, email, and subscription period.
   A screenshot, redirect query, or `subscription.created` event is not proof.
2. Check a durable private fulfillment record by **order ID** to avoid duplicate
   delivery. Each paid renewal has a new order ID.
3. Issue the correct edition using the agreed, library-supported license
   semantics and verified entitlement dates. Never silently fall back to a
   perpetual key if subscription dates are missing.
4. Deliver the signed key and installation instructions to the verified order
   email. Record delivery, retry failures, and reconcile paid orders regularly.
5. Handle refunds and cancellations in Polar and update fulfillment records.
   The static website cannot remotely revoke an already-issued offline key.

Keep signing keys and customer records outside this repository and its build
environment. Never log license keys. See `serverless/README.md` for the deferred
issuer gaps, including its empty product map and nonfunctional email delivery.

## Production checkout activation

The public production values are committed in `.env.production`, while local
development remains fail-closed through `.env.example`. The permanent checkout
URLs point to the audited offers.

```dotenv
POLAR_PORTAL_URL=https://polar.sh/zengrid/portal
ZENGRID_LICENSE_DELIVERY=manual
POLAR_SOLO_READY=true
POLAR_TEAM_READY=true
```

Run the full API audit, rebuild, verify, and deploy. Readiness flags are
operator assertions; the website does not call Polar's API at runtime.
To pause sales, disable the plan flags and rebuild/deploy; also disable access
to the offers in Polar if already-shared checkout links must stop working.

```sh
npm run build
npm run test:payments
npm run dev -- --background
```

Build-output and deployment tests require both audited checkout links.
Configuration tests still cover disabled and partial handoffs. Use Polar's sandbox for actual payment and fulfillment tests;
production tests here only inspect hosted checkout pages without submitting.

Verification on 5 September 2026: both live catalogs passed the authenticated
audit; hosted checkout HTML showed the correct product IDs, fixed annual
amounts, no trials, and return URLs. The 232-page production build and all
42 payment tests passed. A scan of 526 generated files found no API token.
The full launch audit exits nonzero for the documented account/fulfillment
blockers. No actual payment or signed-license delivery has been tested.

## Backend status

`serverless/backend/` now contains a tested Cloud Run + Firestore intake
service. It signature-verifies raw Polar webhooks, accepts only reviewed
`order.paid` and `order.refunded` entitlements, validates catalog/amount/
period data, and deduplicates by order ID in a Firestore transaction.

It intentionally does not hold the offline signing key or claim that an offline
license can be remotely revoked. Operator alerting, offline signing, private
package delivery, and reconciliation remain manual launch work. See
`serverless/backend/README.md`.

## References

- [Polar checkout links](https://polar.sh/docs/features/checkout/links)
- [Product configuration and immutable billing models](https://polar.sh/docs/features/products)
- [Custom benefits for delivery instructions](https://polar.sh/docs/features/benefits/custom)
- [Polar account reviews and owner verification](https://polar.sh/docs/merchant-of-record/account-reviews)
- [Polar license keys and their validation API](https://polar.sh/docs/features/benefits/license-keys)
