import assert from "node:assert/strict";
import test from "node:test";
import { createCheckoutConfig, validatePolarUrl } from "../src/config/checkout-validation.ts";

test("unreviewed plans expose no checkout destination", () => {
  const config = createCheckoutConfig({});
  assert.equal(config.plans.solo.href, null);
  assert.equal(config.plans.team.href, null);
  assert.equal(config.delivery, "disabled");
  assert.equal(config.portalUrl, "https://polar.sh/zengrid/portal");
});

test("manual fulfillment alone does not enable sales", () => {
  const config = createCheckoutConfig({ ZENGRID_LICENSE_DELIVERY: "manual" });
  assert.equal(config.plans.solo.href, null);
  assert.equal(config.plans.team.href, null);
});

test("only the reviewed plan is enabled", () => {
  const config = createCheckoutConfig({ ZENGRID_LICENSE_DELIVERY: "manual", POLAR_SOLO_READY: "true" });
  assert.match(config.plans.solo.href, /^https:\/\/buy\.polar\.sh\/polar_cl_/);
  assert.equal(config.plans.team.href, null);
});

test("readiness requires fulfillment and exact boolean values", () => {
  assert.throws(() => createCheckoutConfig({ POLAR_TEAM_READY: "true" }), /delivery/);
  assert.throws(() => createCheckoutConfig({ POLAR_SOLO_READY: "yes" }), /true or false/);
  assert.throws(() => createCheckoutConfig({ ZENGRID_LICENSE_DELIVERY: "automatic" }), /disabled or manual/);
});

const unsafe = [
  "http://buy.polar.sh/polar_cl_test", "javascript:alert(1)",
  "https://buy.polar.sh.attacker.test/polar_cl_test",
  "https://buy.polar.sh@attacker.test/polar_cl_test",
  "https://attacker@buy.polar.sh/polar_cl_test",
  "https://buy.polar.sh:444/polar_cl_test",
  "https://sandbox.polar.sh/polar_cl_test",
  "https://polar.sh/checkout/polar_c_temporary",
  "https://buy.polar.sh/polar_cl_test?customer_email=private@example.test",
  "https://buy.polar.sh/polar_cl_test?amount=1",
  "https://buy.polar.sh/polar_cl_test#redirect",
  "https://buy.polar.sh/polar_cl_test/../checkout",
  "https://buy.polar.sh/polar_cl_%74est",
  "https://buy.polar.sh/polar_cl_test\n", "", " ",
];

for (const [index, value] of unsafe.entries()) {
  test(`reject unsafe checkout destination ${index + 1} without logging its value`, () => {
    assert.throws(() => validatePolarUrl(value, "checkout"), {
      message: "Invalid Polar checkout URL. Use a permanent production HTTPS link without query parameters.",
    });
  });
}

test("invalid portal links fail before rendering", () => {
  assert.throws(() => createCheckoutConfig({ POLAR_PORTAL_URL: "https://polar.sh.attacker.test/zengrid/portal" }));
  assert.throws(() => createCheckoutConfig({ POLAR_PORTAL_URL: "https://polar.sh/zengrid/portal?customer_session_token=secret" }));
});

test("both enabled plans keep distinct permanent destinations", () => {
  const config = createCheckoutConfig({
    ZENGRID_LICENSE_DELIVERY: "manual", POLAR_SOLO_READY: "true", POLAR_TEAM_READY: "true",
    POLAR_SOLO_CHECKOUT_URL: "https://buy.polar.sh/polar_cl_soloTest",
    POLAR_TEAM_CHECKOUT_URL: "https://buy.polar.sh/polar_cl_teamTest",
  });
  assert.equal(config.plans.solo.href, "https://buy.polar.sh/polar_cl_soloTest");
  assert.equal(config.plans.team.href, "https://buy.polar.sh/polar_cl_teamTest");
  assert.throws(() => createCheckoutConfig({
    POLAR_SOLO_CHECKOUT_URL: config.plans.solo.href,
    POLAR_TEAM_CHECKOUT_URL: config.plans.solo.href,
  }), /distinct/);
});
