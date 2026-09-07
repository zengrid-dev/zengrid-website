# Polar license issuer

> **Deferred prototype — not active or production-ready.** The product map and
> email delivery are unfinished. Follow [PAYMENT-SETUP.md](../../PAYMENT-SETUP.md)
> for the current website flow and [../README.md](../README.md) for known gaps.

The one piece of custom glue behind ZenGrid checkout. Polar (our Merchant of
Record) handles payment, tax, subscriptions, and the customer portal; this
function turns a **paid order** into a **signed ZenGrid license key** and emails
it to the buyer.

> This is **not** part of the website. The site (`../../`) is a static Astro
> build with no server. Deploy this separately as a serverless function
> (Vercel / Netlify / Cloudflare Workers / AWS Lambda) or a tiny Node service.

## How it fits together

```
Buy Solo/Team (site /buy)
  → Polar hosted checkout  (tax + subscription created by Polar)
  → Polar fires `order.paid` webhook  ──▶  THIS FUNCTION
        1. validateEvent()  verifies the webhook signature
        2. issueLicense()   maps product → entitlement, signs an Ed25519 key
        3. deliverKey()     emails the key to the customer
Yearly renewal → order.paid fires again → fresh-dated key re-issued
```

The key is verified **offline** inside the grid via `@zengrid/license`
(`createEd25519Verifier`) — there is no license server to run and no phone-home.

## One-time setup

1. **Generate the keypair** (once, offline):

   ```ts
   import { generateLicenseKeyPair } from "@zengrid/license";
   console.log(generateLicenseKeyPair()); // { publicKey, privateKey }
   ```

   - Embed **`publicKey`** in the shipped grid build (it verifies keys).
   - Store **`privateKey`** as the secret `ZENGRID_LICENSE_PRIVATE_KEY` here.
     It signs every license — never commit it, never ship it to a client.

2. **Create products in Polar** (Solo yearly, Team yearly, Enterprise). Copy
   each product id into `PRODUCTS` in `issue-license.ts`, mapping it to an
   edition + features.

3. **Configure the website** using `../../.env.example` and the review steps
   in `../../PAYMENT-SETUP.md`. Checkout URLs and readiness are configured at
   build time; adding links alone does not enable sales.

4. **Create the webhook** in Polar → Settings → Webhooks, pointed at this
   function's URL, subscribed to `order.paid`. Copy the signing secret into
   `POLAR_WEBHOOK_SECRET`.

5. **Wire email** — replace the `deliverKey()` stub in `handler.ts` with your
   provider (Resend / Postmark / SES).

## Environment variables

| Var | Source |
| --- | --- |
| `POLAR_WEBHOOK_SECRET` | Polar → Settings → Webhooks |
| `ZENGRID_LICENSE_PRIVATE_KEY` | `generateLicenseKeyPair().privateKey` (hex) |

## Files

- `handler.ts` — transport-agnostic webhook handler (`handleWebhook`) + Express adapter.
- `issue-license.ts` — pure key-minting: product map + `issueLicense()`.

## Notes

- `@zengrid/license` is currently unpublished; until it's on npm, install it
  from the local build (`file:../../../zengrid-enterprise/packages/license`) or
  vendor the four small files it needs.
- The license payload has **no seat field** — Solo (1) / Team (10) seats are
  contractual, enforced by plan not by the key.
- Always feed `handleWebhook` the **raw** request body; the signature is over
  the raw bytes, so a pre-parsed JSON body will fail verification.
