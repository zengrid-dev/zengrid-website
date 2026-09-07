import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { coreVersionLabel, currentDocsVersionLabel } from "../../src/config/core-version.mjs";

const root = new URL("../../dist/", import.meta.url);
const repository = new URL("../../", import.meta.url);

function filesBelow(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? filesBelow(child) : [child];
  });
}

for (const path of ["index.html", "404.html", "sitemap-index.xml", "robots.txt"]) {
  assert(existsSync(new URL(path, root)), `Missing prebuilt deployment file: ${path}`);
}

const files = filesBelow(root.pathname);
const htmlCount = files.filter((path) => path.endsWith(".html")).length;
assert(htmlCount >= 200, `Incomplete prebuilt site: found only ${htmlCount} HTML files`);

const buy = readFileSync(new URL("buy/index.html", root), "utf8");
assert.match(buy, /href="https:\/\/buy\.polar\.sh\/polar_cl_q5SjcnHkcgYReOxBTDOAU4Qa4E9TONsdZaw4t0ym1Ry"/,
  "The production artifact is missing the reviewed Solo checkout link");
assert.match(buy, /href="https:\/\/buy\.polar\.sh\/polar_cl_N3Zgi1e254i0hMvduXrgYSbSmHIYWoCPfRhMC2RV8lg"/,
  "The production artifact is missing the reviewed Team checkout link");
assert.doesNotMatch(buy, /Online checkout unavailable/,
  "The production artifact still contains the retired checkout message");
assert.doesNotMatch(buy, /Contact us to buy/,
  "The production artifact still contains the checkout fallback");
assert.equal((buy.match(/Continue to Polar →/g) ?? []).length, 2,
  "The production artifact must contain both Polar purchase actions");

const home = readFileSync(new URL("index.html", root), "utf8");
const gettingStarted = readFileSync(new URL("getting-started/index.html", root), "utf8");
assert(home.includes(`${coreVersionLabel} · fresh on npm`),
  "The homepage version does not match @zengrid/core");
assert(gettingStarted.includes(currentDocsVersionLabel),
  "The docs version does not match @zengrid/core");

const config = JSON.parse(readFileSync(new URL("vercel.json", repository), "utf8"));
const csvRows = readFileSync(new URL("vercel-redirects.csv", repository), "utf8")
  .trim().split(/\r?\n/).slice(1).map((line) => line.split(","));
const configured = new Map(config.redirects.map((redirect) => [
  `${redirect.source}\0${redirect.destination}`,
  redirect.permanent,
]));
for (const [source, destination, status] of csvRows) {
  assert.equal(status, "308", `Legacy redirect must be permanent: ${source}`);
  assert.equal(configured.get(`${source}\0${destination}`), true,
    `Missing Vercel redirect: ${source}`);
}

console.log(
  `Verified prebuilt ZenGrid site: ${htmlCount} HTML files, ${csvRows.length} redirects, both Polar checkout links enabled.`,
);
