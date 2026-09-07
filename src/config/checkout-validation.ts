import { polarCatalog } from "./polar-catalog.ts";

type Environment = Record<string, string | undefined>;
export type CheckoutPlan = "solo" | "team";

const defaults = {
  solo: polarCatalog.plans.solo.checkoutUrl,
  team: polarCatalog.plans.team.checkoutUrl,
  portal: polarCatalog.portalUrl,
};

/** Accept only permanent production links, without overrides or customer data. */
export function validatePolarUrl(value: string, kind: "checkout" | "portal"): string {
  const pattern = kind === "checkout"
    ? /^https:\/\/buy\.polar\.sh\/polar_cl_[A-Za-z0-9]+$/
    : /^https:\/\/polar\.sh\/[a-z0-9]+(?:-[a-z0-9]+)*\/portal$/;
  if (value !== value.trim() || !pattern.test(value)) {
    // Never echo invalid configuration: it could contain an accidentally pasted secret.
    throw new Error(`Invalid Polar ${kind} URL. Use a permanent production HTTPS link without query parameters.`);
  }
  return value;
}

function enabled(value: string | undefined, name: string): boolean {
  if (value === undefined || value === "false") return false;
  if (value === "true") return true;
  throw new Error(`${name} must be exactly true or false.`);
}

export function createCheckoutConfig(env: Environment) {
  const delivery = env.ZENGRID_LICENSE_DELIVERY ?? "disabled";
  if (delivery !== "disabled" && delivery !== "manual") {
    throw new Error("ZENGRID_LICENSE_DELIVERY must be disabled or manual.");
  }
  const urls = {
    solo: validatePolarUrl(env.POLAR_SOLO_CHECKOUT_URL ?? defaults.solo, "checkout"),
    team: validatePolarUrl(env.POLAR_TEAM_CHECKOUT_URL ?? defaults.team, "checkout"),
  };
  if (urls.solo === urls.team) throw new Error("Solo and Team require distinct checkout links.");
  const ready = {
    solo: enabled(env.POLAR_SOLO_READY, "POLAR_SOLO_READY"),
    team: enabled(env.POLAR_TEAM_READY, "POLAR_TEAM_READY"),
  };
  if ((ready.solo || ready.team) && delivery === "disabled") {
    throw new Error("Configure license delivery before enabling checkout.");
  }
  return {
    portalUrl: validatePolarUrl(env.POLAR_PORTAL_URL ?? defaults.portal, "portal"),
    delivery,
    plans: {
      solo: { href: ready.solo ? urls.solo : null },
      team: { href: ready.team ? urls.team : null },
    },
  };
}
