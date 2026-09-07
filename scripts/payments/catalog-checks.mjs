// Pure checks: callers may print these fixed messages, never raw API responses.
export function catalogIssues(plan, expected, organizationId, product, link, benefit, retired) {
  const issues = [];
  const check = (valid, message) => { if (!valid) issues.push(`${plan.name}: ${message}`); };
  check(product.id === expected.productId && product.organization_id === organizationId,
    "unexpected product or organization");
  check(product.is_archived === false, "product is archived");
  check(product.is_recurring === true && product.recurring_interval === "year"
    && product.recurring_interval_count === 1, "billing must recur every year");
  check(product.trial_interval === null && product.trial_interval_count === null, "product trial must be disabled");
  const prices = product.prices ?? [];
  check(prices.length === 1 && prices.every(price => price.amount_type === "fixed"
    && price.price_currency === "usd" && price.price_amount === plan.amountUsd * 100
    && price.tax_behavior === "exclusive" && price.is_archived === false),
  "price must match the advertised fixed USD bundle before tax");
  check(product.metadata?.developer_seats === plan.seats && product.metadata?.zengrid_plan === plan.key,
    "developer seat entitlement does not match the website");
  check(product.description?.includes(`${plan.seats} developer ${plan.seats === 1 ? "seat" : "seats"}`),
    "checkout description is missing the seat entitlement");
  check(link.id === expected.checkoutLinkId && link.organization_id === organizationId
    && link.url === expected.checkoutUrl, "unexpected checkout link");
  check(link.products?.length === 1 && link.products[0].id === product.id,
    "checkout must offer only the intended product");
  check(link.trial_interval === null && link.trial_interval_count === null, "checkout trial must be disabled");
  check(link.success_url === null && link.return_url === `https://zengrid.dev/buy/#${plan.key}`,
    "checkout confirmation or return destination changed");
  check(link.discount_id === null && link.allow_discount_codes === false, "checkout discount configuration changed");
  check(benefit.id === expected.benefitId && benefit.organization_id === organizationId && benefit.type === "custom"
    && product.benefits?.some(item => item.id === benefit.id)
    && benefit.properties?.note?.includes("License delivery is separate from payment confirmation"),
  "license delivery instructions are missing");
  check(retired.id === expected.retiredProductId && retired.organization_id === organizationId
    && retired.is_archived === true, "incorrect legacy product is available for purchase");
  return issues;
}

export function accountIssues(organization) {
  const issues = [];
  for (const capability of ["checkout_payments", "subscription_renewals", "payouts", "refunds"]) {
    if (organization.capabilities?.[capability] !== true) issues.push(`Polar capability disabled: ${capability}`);
  }
  if (!organization.details_submitted_at) issues.push("Business details have not been submitted to Polar.");
  if (!organization.payout_account_id) issues.push("No payout account is connected.");
  if (organization.customer_email_settings?.order_confirmation !== true) issues.push("Order confirmation emails are disabled.");
  return issues;
}
