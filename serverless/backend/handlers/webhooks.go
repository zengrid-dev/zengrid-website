package handlers

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strings"

	standardwebhooks "github.com/standard-webhooks/standard-webhooks/libraries/go"
	"github.com/zengrid/backend/fulfillment"
)

const maxWebhookBytes = 1 << 20

type Verifier interface {
	Verify([]byte, http.Header) error
}

type EventProcessor interface {
	Process(context.Context, []byte, string) (fulfillment.Outcome, error)
}

func NewPolarVerifier(secret string) (Verifier, error) {
	encoded := base64.StdEncoding.EncodeToString([]byte(secret))
	return standardwebhooks.NewWebhook(encoded)
}

func PolarWebhook(verifier Verifier, processor EventProcessor, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		mediaType := strings.ToLower(strings.TrimSpace(strings.Split(r.Header.Get("Content-Type"), ";")[0]))
		if mediaType != "application/json" {
			http.Error(w, "content type must be application/json", http.StatusUnsupportedMediaType)
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, maxWebhookBytes)
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "invalid request body", http.StatusBadRequest)
			return
		}
		if err := verifier.Verify(body, r.Header); err != nil {
			logger.Warn("rejected Polar webhook signature")
			http.Error(w, "invalid signature", http.StatusForbidden)
			return
		}

		outcome, err := processor.Process(r.Context(), body, r.Header.Get(standardwebhooks.HeaderWebhookID))
		if err != nil {
			if errors.Is(err, fulfillment.ErrInvalidEvent) {
				logger.Warn("rejected Polar webhook payload", "reason", err.Error())
				http.Error(w, "invalid event", http.StatusUnprocessableEntity)
				return
			}
			logger.Error("failed to persist Polar webhook", "error", err.Error())
			http.Error(w, "temporary processing failure", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusAccepted)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"accepted": true, "kind": outcome.Kind, "duplicate": outcome.Duplicate,
		})
	}
}
