package config

import "testing"

func TestProductionCatalogCannotBeOverridden(t *testing.T) {
	values := map[string]string{
		"GCP_PROJECT_ID":        "zengrid-test",
		"POLAR_WEBHOOK_SECRET":  "test-secret",
		"POLAR_SOLO_PRODUCT_ID": "attacker-product",
	}
	cfg, err := load(func(key string) string { return values[key] })
	if err != nil {
		t.Fatal(err)
	}
	if _, exists := cfg.Catalog.Plans[productionSoloProduct]; !exists {
		t.Fatal("production Solo product changed")
	}
	if _, exists := cfg.Catalog.Plans["attacker-product"]; exists {
		t.Fatal("production catalog accepted an environment override")
	}
}

func TestSandboxRequiresAllCatalogIDs(t *testing.T) {
	values := map[string]string{
		"GCP_PROJECT_ID":       "zengrid-test",
		"POLAR_WEBHOOK_SECRET": "test-secret",
		"POLAR_ENVIRONMENT":    "sandbox",
	}
	if _, err := load(func(key string) string { return values[key] }); err == nil {
		t.Fatal("expected incomplete sandbox catalog to fail")
	}

	values["POLAR_ORGANIZATION_ID"] = "sandbox-org"
	values["POLAR_SOLO_PRODUCT_ID"] = "sandbox-solo"
	values["POLAR_TEAM_PRODUCT_ID"] = "sandbox-team"
	cfg, err := load(func(key string) string { return values[key] })
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Collection != "sandbox_fulfillment_orders" {
		t.Fatalf("unexpected collection %q", cfg.Collection)
	}
}
