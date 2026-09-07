# Commercial launch — sequential handover

Updated: 8 September 2026 (Asia/Kolkata).

## Distribution decision

Community is public on npm. Enterprise and License must **never** be published
to any package registry, including private registries. Keep `private: true`.
Deliver versioned `.tgz` files privately; customers can install those files
locally with npm. Solo and Team receive the same commercial feature code.

Use offline Ed25519 signing, an encrypted backup of the private key, a public
verification key embedded in customer builds, signed SHA-256 checksums, and
authenticated private downloads with short-lived URLs. Signatures authenticate
keys/packages; downloaded JavaScript cannot provide absolute copy protection or
remote revocation. Refund termination and seat limits are contractual.

## Completed in this iteration

- [x] Published **`@zengrid/core@1.6.0`** to npm; verified npm reports `1.6.0`.
  `@zengrid/shared@1.3.0` was already published and remains unchanged.
  Community tarball SHA-256:
  `6063d960bc40468527da9dbe0e3a670e102416ea897b7705ca5370d91142c163`.
- [x] Updated this website's dependency/lockfile to Community `1.6.0`.
- [x] Replaced license wall-clock expiry with package release-date coverage in
  `../zengrid-enterprise/packages/license/src/license-manager.ts`.
  Covered releases keep working after cancellation. Newer releases require
  renewed coverage (`UPDATES_EXPIRED`). Legacy `expiresAt` is an updates cutoff.
- [x] Added schema 2 paid metadata: `updatesUntil`, plan, seats, and matching
  legacy cutoff. Missing/inconsistent paid metadata is rejected.
- [x] Locked production trust configuration, froze exposed state, rejected fake
  injected managers across paid feature gates, and excluded signing helpers
  from the customer runtime entry point. Development docs retain eval tooling.
- [x] Added `../zengrid-enterprise/scripts/private-release/` tooling. It requires
  an Ed25519 public PEM and an explicit release timestamp, creates exact-version
  packages with `private: true`, checksums, release metadata, and setup guidance.
- [x] Verified **test-only** `@zengrid/license@0.3.0` and
  `@zengrid/enterprise@0.3.0` archives in a fresh consumer project. Both local
  tarballs must be installed together; do not bundle a second license instance.
  Fixed the ExcelJS ESM import in the library. No commercial registry upload.
- [x] Updated EULA/refund behavior to explain continued use of covered versions
  and contractual termination on refund. Removed the false technical-revocation
  claim. Legal identity/jurisdiction placeholders still need the owner's answer.
- [x] Added a standalone offline issuer helper and private S3 delivery guide in
  `../zengrid-enterprise/PRIVATE-DISTRIBUTION.md`. The helper creates encrypted
  Ed25519 PEMs on the owner's offline device, not on this online build machine.
- [x] Replaced the unsafe Go prototype with a tested Cloud Run + Firestore
  intake service. It verifies Polar signatures, validates exact paid/refunded
  entitlements, and deduplicates by order ID without storing keys or payloads.
  It is deployed in `zengrid-dev-prod` at `asia-south1`, with Firestore delete
  protection and a dedicated runtime identity.
- [x] Registered the production Polar Raw webhook for only `order.paid` and
  `order.refunded`, stored its signing secret in Secret Manager version 2, and
  moved Cloud Run to that version. Bootstrap secret version 1 is disabled.

## Verification evidence

- Core: **2,078 tests** passed; Core and Angular type checks passed.
- License: **44 tests** passed; Enterprise: **521 tests** passed; both type checks passed.
- Private release-config checks passed, including rejection of private keys,
  missing dates, floating versions, and output paths inside the repository.
- Offline issuer helper: six safety tests and one real OpenSSL encrypted-key
  round-trip test passed using disposable TEST-ONLY credentials.
- Fresh Community tarball install: ESM/CJS exports, CSS, TypeScript passed.
- Fresh private tarball install: ESM/CJS, TypeScript, shared license instance,
  paid feature access, valid/tampered/wrong-signature keys, updates cutoff,
  renewal, injected-manager rejection, and CSS passed.
- Website payment tests passed; website production build passed (232 pages).
- Production-build browser smoke test passed: Community row sorting and
  Enterprise row numbers rendered with working variants and no page errors.
  The refund wording is present.
- Authenticated Polar catalog audit passed for Solo ($120/year, 1 seat) and
  Team ($999/year, 10 seats). No account capability blocker was reported.
  Fulfillment remains the reported launch blocker. This was a read-only audit.
- Cloud Run revision `zengrid-fulfillment-00003-sjs` serves 100% of traffic and
  passed its public health check. It accepted a signed non-writing smoke event
  and rejected an unsigned request. Polar reports exactly one matching enabled
  Raw endpoint with the two intended order events. The earlier signed-order
  test persisted and deduplicated a record, then returned the queue to empty.

## Next action — production signing identity (required)

Production checkout was enabled on 8 September 2026 at the owner's direction,
with a public one-business-day manual delivery promise. Complete this signer
before the first fulfillment is due. The owner was asked for the existing **public** key/path, or to generate the
keypair on an offline device. No production keypair was generated here.
Only disposable test signers were generated; their private keys were not logged.
Follow [`../zengrid-enterprise/OFFLINE-RELEASE.md`](../zengrid-enterprise/OFFLINE-RELEASE.md).
Never paste a private key into chat or place one on the online build machine.
Copy `scripts/private-release/generate-offline-issuer.mjs` from the Enterprise
repository to a trusted offline device and follow the runbook. Transfer only its
public PEM to the proposed build path `/home/balaji/zengrid-release/issuer-public.pem`.
That production public PEM does not exist yet. A private S3 bucket is recommended,
but no bucket has been created, selected, or uploaded to. Presigned links are
forwardable bearer credentials, not authenticated customer sessions.

- [ ] Receive the issuer's public PEM, choose the fixed first release timestamp,
  build production `0.3.0` archives, and sign their checksums on the offline device.
- [ ] Confirm a trusted channel for the public key/fingerprint and private delivery.
- [ ] Repeat the delivered-package test with a real signed evaluation key from
  that issuer before sending anything to a customer.

## Remaining steps, in order

1. Create a separate Polar Sandbox organization token, products, endpoint, and
   Cloud Run sandbox service; then exercise it before accepting production
   checkout. Implement the operator step that moves a validated `pending_signing` order through
   offline signing and private delivery. Record signed, delivered, and failed
   states without placing keys or private download URLs in Firestore or logs.
2. Complete Terms, EULA, privacy, and refund documents using the owner's exact
   legal name/entity and governing jurisdiction. Confirm a one-business-day
   manual delivery target. These identity details were requested but not supplied.
3. Test the **real Polar Sandbox** lifecycle: purchase, duplicate handling,
   renewal, cancellation, refund, invalid product, and failed delivery. Local
   cryptographic tests do not count as these external lifecycle tests.
4. Re-run the full authenticated audit after fulfillment is proven. If manual
   delivery cannot meet the published turnaround, set both readiness flags to
   `false`, rebuild, and deploy to pause new orders.

Production checkout flags are enabled in the reviewed website artifact. No
customer delivery was sent. The TypeScript issuer remains a prototype.
The Go intake is deployed at
`https://zengrid-fulfillment-524657803620.asia-south1.run.app`; its production
Polar endpoint and signing secret are connected. The local organization token
is intentionally limited to webhook administration.

## Temporary verification artifacts

Community archive: `/tmp/zengrid-commercial.6PpItr/community-artifacts/`.
Final test-only commercial archives: `/tmp/zengrid-TEST-ONLY-X569E5/archives/`.
Fresh private consumer: `/tmp/zengrid-commercial.6PpItr/private-consumer-final/`.
Temporary files are not durable customer fulfillment records or production keys.

## References

- [npm local tarball installation](https://docs.npmjs.com/cli/install/)
- [npm private publication guard](https://docs.npmjs.com/files/package.json/)
- [Polar Sandbox](https://polar.sh/docs/integrate/sandbox)
- [Polar orders and paid events](https://polar.sh/docs/features/orders)
