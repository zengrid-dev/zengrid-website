import { paidPlans } from "../../src/config/plans.ts";
import { polarCatalog } from "../../src/config/polar-catalog.ts";
import { createCheckoutConfig } from "../../src/config/checkout-validation.ts";
import { catalogIssues, accountIssues } from "./catalog-checks.mjs";
import { createPolarReader, paymentEnvironment } from "./polar-client.mjs";

async function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== "--catalog-only")) throw new Error("Usage: npm run payments:audit -- [--catalog-only]");
  const env = await paymentEnvironment();
  const configured = createCheckoutConfig(env);
  const read = createPolarReader(env);
  const organization = await read("organizations", polarCatalog.organizationId);
  if (organization.id !== polarCatalog.organizationId || organization.slug !== polarCatalog.slug) {
    throw new Error("The API key did not resolve the expected ZenGrid organization.");
  }
  const errors = [];
  for (const plan of paidPlans) {
    const expected = polarCatalog.plans[plan.key];
    const [product, link, benefit, retired] = await Promise.all([
      read("products", expected.productId), read("checkout-links", expected.checkoutLinkId),
      read("benefits", expected.benefitId), read("products", expected.retiredProductId),
    ]);
    const issues = catalogIssues(plan, expected, organization.id, product, link, benefit, retired);
    const override = env[`POLAR_${plan.key.toUpperCase()}_CHECKOUT_URL`];
    if (override && override !== expected.checkoutUrl) issues.push(`${plan.name}: configured checkout URL differs from the audited link`);
    errors.push(...issues);
    console.log(`${plan.name}: ${issues.length ? "FAIL" : "PASS"} — $${plan.amountUsd} USD/year, ${plan.seats} developer seat(s).`);
  }
  if (configured.portalUrl !== polarCatalog.portalUrl) errors.push("Configured portal differs from the audited organization.");
  const blockers = accountIssues(organization);
  if (configured.delivery !== "manual") blockers.push("License fulfillment has not been enabled and tested by an operator.");
  for (const issue of errors) console.log(`Catalog issue: ${issue}`);
  for (const blocker of blockers) console.log(`Launch blocker: ${blocker}`);
  console.log("Read-only audit complete. No orders, customers, API keys, or private response data logged.");
  console.log("This verifies configuration, not payment processing or signed-license delivery.");
  process.exitCode = errors.length || (!args.includes("--catalog-only") && blockers.length) ? 1 : 0;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
