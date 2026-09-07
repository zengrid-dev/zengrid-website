package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/zengrid/backend/fulfillment"
)

const (
	productionOrganization = "2b7fc36e-76bc-406e-86e5-2ffc02994b6d"
	productionSoloProduct  = "7bdcbfdf-5b86-41b1-8a31-cda850819a9b"
	productionTeamProduct  = "4ee19b27-e799-4214-883f-982b0d9bc29a"
)

type Config struct {
	Port          string
	ProjectID     string
	Collection    string
	WebhookSecret string
	Catalog       fulfillment.Catalog
}

func Load() (Config, error) {
	return load(os.Getenv)
}

func load(getenv func(string) string) (Config, error) {
	environment := value(getenv, "POLAR_ENVIRONMENT", "production")
	if environment != "production" && environment != "sandbox" {
		return Config{}, fmt.Errorf("POLAR_ENVIRONMENT must be production or sandbox")
	}

	projectID := first(getenv("GCP_PROJECT_ID"), getenv("GOOGLE_CLOUD_PROJECT"))
	if projectID == "" {
		return Config{}, fmt.Errorf("GCP_PROJECT_ID is required")
	}
	secret := strings.TrimSpace(getenv("POLAR_WEBHOOK_SECRET"))
	if secret == "" {
		return Config{}, fmt.Errorf("POLAR_WEBHOOK_SECRET is required")
	}

	orgID := productionOrganization
	soloID := productionSoloProduct
	teamID := productionTeamProduct
	collection := "fulfillment_orders"
	if environment == "sandbox" {
		orgID = strings.TrimSpace(getenv("POLAR_ORGANIZATION_ID"))
		soloID = strings.TrimSpace(getenv("POLAR_SOLO_PRODUCT_ID"))
		teamID = strings.TrimSpace(getenv("POLAR_TEAM_PRODUCT_ID"))
		collection = "sandbox_fulfillment_orders"
		if orgID == "" || soloID == "" || teamID == "" {
			return Config{}, fmt.Errorf("sandbox Polar organization and product IDs are required")
		}
	}

	return Config{
		Port:          value(getenv, "PORT", "8080"),
		ProjectID:     projectID,
		Collection:    value(getenv, "FIRESTORE_COLLECTION", collection),
		WebhookSecret: secret,
		Catalog: fulfillment.Catalog{
			OrganizationID: orgID,
			Plans: map[string]fulfillment.Plan{
				soloID: {Key: "solo", AmountCents: 12000, Seats: 1},
				teamID: {Key: "team", AmountCents: 99900, Seats: 10},
			},
		},
	}, nil
}

func first(values ...string) string {
	for _, candidate := range values {
		if candidate = strings.TrimSpace(candidate); candidate != "" {
			return candidate
		}
	}
	return ""
}

func value(getenv func(string) string, key, fallback string) string {
	if result := strings.TrimSpace(getenv(key)); result != "" {
		return result
	}
	return fallback
}
