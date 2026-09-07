import { createCheckoutConfig } from "./checkout-validation";

// Evaluated at build time. No Polar API credentials belong in the static site.
// Readiness is an operator assertion after the checks in PAYMENT-SETUP.md.
export const checkout = createCheckoutConfig({
  POLAR_SOLO_CHECKOUT_URL: import.meta.env.POLAR_SOLO_CHECKOUT_URL,
  POLAR_TEAM_CHECKOUT_URL: import.meta.env.POLAR_TEAM_CHECKOUT_URL,
  POLAR_PORTAL_URL: import.meta.env.POLAR_PORTAL_URL,
  POLAR_SOLO_READY: import.meta.env.POLAR_SOLO_READY,
  POLAR_TEAM_READY: import.meta.env.POLAR_TEAM_READY,
  ZENGRID_LICENSE_DELIVERY: import.meta.env.ZENGRID_LICENSE_DELIVERY,
});

export const licenseDelivery =
  "License delivery is separate from payment confirmation. We manually verify paid orders and deliver a signed ZenGrid license key within one business day. For delivery status or setup help, email hello@zengrid.dev from the address on your order.";
