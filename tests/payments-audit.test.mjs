import assert from "node:assert/strict";
import test from "node:test";
import { catalogIssues, accountIssues } from "../scripts/payments/catalog-checks.mjs";
import { createPolarReader } from "../scripts/payments/polar-client.mjs";

const plan = { key: "solo", name: "Solo", seats: 1, amountUsd: 120 };
const expected = { productId: "product", checkoutLinkId: "link", benefitId: "note", retiredProductId: "old", checkoutUrl: "https://buy.polar.sh/polar_cl_solo" };
function fixture() {
  return {
    product: {
      id: "product", organization_id: "org", is_archived: false, is_recurring: true,
      recurring_interval: "year", recurring_interval_count: 1, trial_interval: null, trial_interval_count: null,
      prices: [{ amount_type: "fixed", price_amount: 12000, price_currency: "usd", tax_behavior: "exclusive", is_archived: false }],
      metadata: { developer_seats: 1, zengrid_plan: "solo" }, description: "1 developer seat",
      benefits: [{ id: "note" }],
    },
    link: {
      id: "link", organization_id: "org", url: expected.checkoutUrl, products: [{ id: "product" }],
      trial_interval: null, trial_interval_count: null, success_url: null,
      return_url: "https://zengrid.dev/buy/#solo", discount_id: null, allow_discount_codes: false,
    },
    benefit: { id: "note", organization_id: "org", type: "custom", properties: { note: "License delivery is separate from payment confirmation" } },
    retired: { id: "old", organization_id: "org", is_archived: true },
  };
}
const check = ({ product, link, benefit, retired }) => catalogIssues(plan, expected, "org", product, link, benefit, retired);

test("reviewed catalog matches the fixed annual bundle", () => assert.deepEqual(check(fixture()), []));

const regressions = [
  ["one-time billing", f => { f.product.is_recurring = false; }, /billing must recur/],
  ["seat-based price", f => { f.product.prices[0].amount_type = "seat_based"; }, /fixed USD bundle/],
  ["wrong amount", f => { f.product.prices[0].price_amount = 99900; }, /fixed USD bundle/],
  ["additional price", f => { f.product.prices.push(f.product.prices[0]); }, /fixed USD bundle/],
  ["product trial", f => { f.product.trial_interval = "day"; }, /product trial/],
  ["checkout trial", f => { f.link.trial_interval_count = 14; }, /checkout trial/],
  ["wrong developer seats", f => { f.product.metadata.developer_seats = 10; }, /seat entitlement/],
  ["wrong product in checkout", f => { f.link.products = [{ id: "old" }]; }, /intended product/],
  ["alternate checkout product", f => { f.link.products.push({ id: "old" }); }, /intended product/],
  ["redirect override", f => { f.link.success_url = "https://example.test"; }, /destination changed/],
  ["unintended discount", f => { f.link.discount_id = "discount"; }, /discount configuration/],
  ["missing delivery instructions", f => { f.product.benefits = []; }, /delivery instructions/],
  ["legacy product for sale", f => { f.retired.is_archived = false; }, /legacy product/],
];
for (const [name, change, message] of regressions) {
  test(`audit catches ${name}`, () => {
    const data = fixture(); change(data);
    assert(check(data).some(issue => message.test(issue)));
  });
}

test("account readiness fails closed for disabled or missing capabilities", () => {
  assert.equal(accountIssues({}).length, 7);
  assert.deepEqual(accountIssues({
    capabilities: { checkout_payments: true, subscription_renewals: true, payouts: true, refunds: true },
    details_submitted_at: "2026-09-05", payout_account_id: "configured", customer_email_settings: { order_confirmation: true },
  }), []);
});

test("audit credentials are sent only to the fixed Polar host with redirects disabled", async () => {
  const read = createPolarReader({ polar: "test-only-token" }, async (url, options) => {
    assert.equal(url, "https://api.polar.sh/v1/products/7bdcbfdf-5b86-41b1-8a31-cda850819a9b");
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error");
    assert.equal(options.headers.Authorization, "Bearer test-only-token");
    return { ok: true, json: async () => ({ id: "product" }) };
  });
  await assert.rejects(() => read("https://example.test", "id"), /Invalid Polar audit resource/);
  await assert.rejects(() => read("products", "../organizations"), /Invalid Polar audit resource/);
  assert.deepEqual(await read("products", "7bdcbfdf-5b86-41b1-8a31-cda850819a9b"), { id: "product" });
});

test("network and API errors cannot echo credentials or response bodies", async () => {
  const args = ["products", "7bdcbfdf-5b86-41b1-8a31-cda850819a9b"];
  const network = createPolarReader({ POLAR_ACCESS_TOKEN: "secret" }, async () => { throw new Error("secret"); });
  await assert.rejects(() => network(...args), { message: "Polar audit request failed; credentials and response data were not logged." });
  const denied = createPolarReader({ POLAR_ACCESS_TOKEN: "secret" }, async () => ({ ok: false, status: 403 }));
  await assert.rejects(() => denied(...args), { message: "Polar audit returned HTTP 403; check token scopes and account access." });
});
