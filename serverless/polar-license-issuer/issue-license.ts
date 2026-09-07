import {
  encodeLicenseKey,
  ALL_FEATURES,
  type LicensePayload,
  type LicenseEdition,
} from "@zengrid/license";

/**
 * Maps a Polar product id to the entitlement it grants. Fill in the product ids
 * you create in the Polar dashboard (Products → <plan> → copy the product id).
 * `features: [ALL_FEATURES]` grants every feature for that edition; scope it to
 * specific feature ids if a plan should unlock only a subset.
 */
export type PlanEntitlement = {
  edition: LicenseEdition; // 'pro' | 'enterprise'
  features: string[];
};

export type ProductMap = Record<string, PlanEntitlement>;

export const PRODUCTS: ProductMap = {
  // "prod_xxxxxxxxxxxx": { edition: "pro", features: [ALL_FEATURES] },   // Solo
  // "prod_yyyyyyyyyyyy": { edition: "pro", features: [ALL_FEATURES] },   // Team
  // "prod_zzzzzzzzzzzz": { edition: "enterprise", features: [ALL_FEATURES] }, // Enterprise
};

export type IssueInput = {
  productId: string;
  /** Licensee shown inside the key — org or customer name, falling back to email. */
  licensee: string;
  /** Subscription period end (ms epoch) → key expiry. null = perpetual. */
  expiresAt: number | null;
  /** ms epoch the key was minted; pass from the runtime clock. */
  issuedAt: number;
};

export type IssueResult = {
  key: string;
  payload: LicensePayload;
};

/**
 * Build and sign a ZenGrid license key for a paid order. Pure and offline: it
 * only needs the Ed25519 private key (hex). Throws if the product id is unmapped
 * so an unknown order surfaces loudly instead of minting an empty license.
 */
export function issueLicense(
  input: IssueInput,
  privateKeyHex: string,
): IssueResult {
  const entitlement = PRODUCTS[input.productId];
  if (!entitlement) {
    throw new Error(`No entitlement mapped for Polar product ${input.productId}`);
  }

  const payload: LicensePayload = {
    licensee: input.licensee,
    edition: entitlement.edition,
    features: entitlement.features,
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    keyVersion: 1,
  };

  return { key: encodeLicenseKey(payload, privateKeyHex), payload };
}
