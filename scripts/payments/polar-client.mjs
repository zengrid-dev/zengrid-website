import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";

// Administration only: never import this module from src/ or a browser bundle.
export async function paymentEnvironment() {
  let local = {};
  try { local = parseEnv(await readFile(new URL("../../.env", import.meta.url), "utf8")); }
  catch (error) { if (error.code !== "ENOENT") throw new Error("Cannot read payment configuration."); }
  return { ...local, ...process.env };
}

export function createPolarReader(env, request = fetch) {
  // `polar` supports the existing local key name; new setups use POLAR_ACCESS_TOKEN.
  const token = env.POLAR_ACCESS_TOKEN || env.POLAR_API_KEY || env.polar;
  if (!token || token.trim() !== token) throw new Error("Configure POLAR_ACCESS_TOKEN for the private audit.");
  return async (resource, id) => {
    if (!["organizations", "products", "checkout-links", "benefits"].includes(resource)
      || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id)) {
      throw new Error("Invalid Polar audit resource.");
    }
    let response;
    try {
      response = await request(`https://api.polar.sh/v1/${resource}/${id}`, {
        method: "GET", redirect: "error", signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } catch { throw new Error("Polar audit request failed; credentials and response data were not logged."); }
    if (!response.ok) throw new Error(`Polar audit returned HTTP ${response.status}; check token scopes and account access.`);
    try { return await response.json(); }
    catch { throw new Error("Polar audit received an invalid JSON response."); }
  };
}
