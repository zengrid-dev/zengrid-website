package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/zengrid/backend/config"
	"github.com/zengrid/backend/db"
	"github.com/zengrid/backend/fulfillment"
	"github.com/zengrid/backend/handlers"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	cfg, err := config.Load()
	if err != nil {
		logger.Error("invalid configuration", "error", err.Error())
		os.Exit(1)
	}

	ctx := context.Background()
	store, err := db.NewFirestore(ctx, cfg.ProjectID, cfg.Collection)
	if err != nil {
		logger.Error("Firestore initialization failed", "error", err.Error())
		os.Exit(1)
	}
	defer store.Close()

	verifier, err := handlers.NewPolarVerifier(cfg.WebhookSecret)
	if err != nil {
		logger.Error("webhook verifier initialization failed")
		os.Exit(1)
	}
	processor := fulfillment.NewProcessor(cfg.Catalog, store)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	mux.Handle("POST /webhooks/polar", handlers.PolarWebhook(verifier, processor, logger))

	server := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	stop, cancel := signal.NotifyContext(ctx, syscall.SIGINT, syscall.SIGTERM)
	defer cancel()
	go func() {
		<-stop.Done()
		shutdown, done := context.WithTimeout(context.Background(), 10*time.Second)
		defer done()
		_ = server.Shutdown(shutdown)
	}()

	logger.Info("fulfillment intake listening", "port", cfg.Port, "collection", cfg.Collection)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		logger.Error("server stopped", "error", err.Error())
		os.Exit(1)
	}
}
