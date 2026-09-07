package handlers

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	standardwebhooks "github.com/standard-webhooks/standard-webhooks/libraries/go"
	"github.com/zengrid/backend/fulfillment"
)

type fakeProcessor struct {
	called    bool
	webhookID string
	outcome   fulfillment.Outcome
	err       error
}

func (p *fakeProcessor) Process(_ context.Context, _ []byte, webhookID string) (fulfillment.Outcome, error) {
	p.called, p.webhookID = true, webhookID
	return p.outcome, p.err
}

type rejectingVerifier struct{}

func (rejectingVerifier) Verify([]byte, http.Header) error { return errors.New("bad signature") }

func TestPolarWebhookVerifiesPolarEncodedSecret(t *testing.T) {
	const secret = "polar_whs_test"
	payload := []byte(`{"type":"subscription.updated","timestamp":"2026-09-07T00:00:00Z","data":{}}`)
	signer, err := standardwebhooks.NewWebhook(base64.StdEncoding.EncodeToString([]byte(secret)))
	if err != nil {
		t.Fatal(err)
	}
	verifier, err := NewPolarVerifier(secret)
	if err != nil {
		t.Fatal(err)
	}
	processor := &fakeProcessor{outcome: fulfillment.Outcome{Kind: "ignored"}}
	handler := PolarWebhook(verifier, processor, discardLogger())

	now := time.Now()
	signature, err := signer.Sign("event_1", now, payload)
	if err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPost, "/webhooks/polar", strings.NewReader(string(payload)))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set(standardwebhooks.HeaderWebhookID, "event_1")
	request.Header.Set(standardwebhooks.HeaderWebhookTimestamp, fmt.Sprint(now.Unix()))
	request.Header.Set(standardwebhooks.HeaderWebhookSignature, signature)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)

	if response.Code != http.StatusAccepted || !processor.called || processor.webhookID != "event_1" {
		t.Fatalf("status=%d called=%v webhook=%q body=%s", response.Code, processor.called, processor.webhookID, response.Body)
	}
}

func TestPolarWebhookRejectsInvalidSignature(t *testing.T) {
	processor := &fakeProcessor{}
	handler := PolarWebhook(rejectingVerifier{}, processor, discardLogger())
	request := httptest.NewRequest(http.MethodPost, "/webhooks/polar", strings.NewReader("{}"))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	if response.Code != http.StatusForbidden || processor.called {
		t.Fatalf("status=%d processor_called=%v", response.Code, processor.called)
	}
}

func TestPolarWebhookMapsPermanentAndTemporaryFailures(t *testing.T) {
	for name, testCase := range map[string]struct {
		err  error
		code int
	}{
		"invalid":   {fmtInvalid(), http.StatusUnprocessableEntity},
		"temporary": {errors.New("database unavailable"), http.StatusInternalServerError},
	} {
		t.Run(name, func(t *testing.T) {
			processor := &fakeProcessor{err: testCase.err}
			handler := PolarWebhook(acceptingVerifier{}, processor, discardLogger())
			request := httptest.NewRequest(http.MethodPost, "/webhooks/polar", strings.NewReader("{}"))
			request.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, request)
			if response.Code != testCase.code {
				t.Fatalf("status=%d body=%s", response.Code, response.Body)
			}
		})
	}
}

type acceptingVerifier struct{}

func (acceptingVerifier) Verify([]byte, http.Header) error { return nil }

func fmtInvalid() error {
	return errors.Join(fulfillment.ErrInvalidEvent, errors.New("bad product"))
}

func discardLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}
