import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { issueLicense } from "./issue-license";

/**
 * Polar `order.paid` webhook → mint + deliver a ZenGrid license key.
 *
 * Transport-agnostic core: hand it the RAW request body (string/Buffer, NOT
 * pre-parsed JSON — the signature is over the raw bytes) and the request
 * headers. Wire it to your platform below (an Express example ships at the
 * bottom; the same `handleWebhook` works on Vercel/Netlify/Cloudflare/Lambda).
 *
 * Required env:
 *   POLAR_WEBHOOK_SECRET        — from Polar → Settings → Webhooks
 *   ZENGRID_LICENSE_PRIVATE_KEY — Ed25519 private key (hex) from generateLicenseKeyPair()
 */

export type WebhookResult = { status: number; body?: string };

/** Swap this for your real email provider (Resend, Postmark, SES, …). */
async function deliverKey(email: string, name: string, key: string): Promise<void> {
  // TODO(email): send `key` to `email`. Until wired, log so nothing is silently lost.
  console.log(`[license] issued for ${name} <${email}>: ${key}`);
}

export async function handleWebhook(
  rawBody: string | Buffer,
  headers: Record<string, string>,
): Promise<WebhookResult> {
  const secret = process.env.POLAR_WEBHOOK_SECRET ?? "";
  const privateKey = process.env.ZENGRID_LICENSE_PRIVATE_KEY ?? "";
  if (!secret || !privateKey) {
    return { status: 500, body: "Issuer not configured" };
  }

  let event;
  try {
    event = validateEvent(rawBody, headers, secret);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return { status: 403, body: "Invalid signature" };
    }
    throw error;
  }

  // Only paid orders mint a key; ignore everything else (return 202 so Polar
  // stops retrying). Renewals fire order.paid again with a fresh period end,
  // which naturally re-issues a fresh-dated key.
  if (event.type !== "order.paid") {
    return { status: 202 };
  }

  const order = event.data;
  const customer = order.customer;
  const email = customer?.email;
  if (!email) {
    return { status: 422, body: "Order has no customer email" };
  }

  const licensee = customer?.name || order.billingName || email;
  const periodEnd = order.subscription?.currentPeriodEnd ?? null;

  const { key } = issueLicense(
    {
      productId: order.productId,
      licensee,
      expiresAt: periodEnd ? new Date(periodEnd).getTime() : null,
      issuedAt: Date.now(),
    },
    privateKey,
  );

  await deliverKey(email, licensee, key);
  return { status: 202 };
}

// --- Express adapter (delete if you deploy on a different platform) ----------
// import express from "express";
// const app = express();
// app.post(
//   "/webhook/polar",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const result = await handleWebhook(
//       req.body,
//       req.headers as Record<string, string>,
//     );
//     res.status(result.status).send(result.body ?? "");
//   },
// );
// app.listen(3000);
