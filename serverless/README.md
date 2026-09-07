# Payment backend

These directories are not part of the static website build. Use
[PAYMENT-SETUP.md](../PAYMENT-SETUP.md) for the current Polar-hosted checkout
and manual-fulfillment workflow.

- `backend/` is the reviewed Cloud Run + Firestore intake service. It validates
  signed `order.paid` and `order.refunded` events and durably deduplicates them.
  It does not contain the offline license signer or complete customer delivery.
- `polar-license-issuer/` remains a deferred prototype. Do not deploy it: its
  product mapping and delivery are unfinished, it can create incompatible
  licenses, and it logs issued keys and buyer identity.

Read [`backend/README.md`](backend/README.md) for deployment and verification.
Website builds must never load backend environment values or signing secrets.
