import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Run after npm run build with the committed production checkout configuration.
const read = (path) => readFileSync(new URL(`../dist/${path}/index.html`, import.meta.url), "utf8");
const buy = read("buy");
const billing = read("billing");

test("production static output uses the reviewed Polar checkout links", () => {
  assert.match(buy, /href="https:\/\/buy\.polar\.sh\/polar_cl_q5SjcnHkcgYReOxBTDOAU4Qa4E9TONsdZaw4t0ym1Ry"/);
  assert.match(buy, /href="https:\/\/buy\.polar\.sh\/polar_cl_N3Zgi1e254i0hMvduXrgYSbSmHIYWoCPfRhMC2RV8lg"/);
  assert.doesNotMatch(buy, /Online checkout unavailable/);
  assert.doesNotMatch(buy, /Contact us to buy/);
  assert.match(buy, /id="solo"/);
  assert.match(buy, /id="team"/);
  assert.match(buy, /Buy Solo →/);
  assert.match(buy, /Buy Team →/);
});

test("billing uses the unauthenticated hosted portal without collecting payment data", () => {
  assert.match(billing, /href="https:\/\/polar\.sh\/zengrid\/portal"/);
  assert.match(billing, /referrerpolicy="no-referrer"/);
  for (const html of [buy, billing]) {
    assert.doesNotMatch(html, /<(?:form|iframe)\b/i);
    assert.doesNotMatch(html, /customer_session_token|POLAR_ACCESS_TOKEN|ZENGRID_LICENSE_PRIVATE_KEY/);
    assert.doesNotMatch(html, /license in a minute|within a few minutes|Payment successful/);
  }
});

test("license delivery language is consistent with the terms", () => {
  const terms = read("legal/terms");
  for (const html of [buy, billing, terms]) {
    assert.match(html, /License delivery is separate from payment confirmation/);
  }
});
