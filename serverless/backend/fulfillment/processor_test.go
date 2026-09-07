package fulfillment

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"
)

const (
	testOrg     = "org_test"
	testProduct = "prod_solo"
)

type memoryStore struct {
	paid    map[string]OrderRecord
	refunds map[string]OrderRecord
	err     error
}

func newMemoryStore() *memoryStore {
	return &memoryStore{paid: map[string]OrderRecord{}, refunds: map[string]OrderRecord{}}
}

func (s *memoryStore) RecordPaid(_ context.Context, record OrderRecord) (bool, error) {
	if s.err != nil {
		return false, s.err
	}
	if _, exists := s.paid[record.OrderID]; exists {
		return false, nil
	}
	s.paid[record.OrderID] = record
	return true, nil
}

func (s *memoryStore) RecordRefund(_ context.Context, record OrderRecord) (bool, error) {
	if s.err != nil {
		return false, s.err
	}
	if _, exists := s.refunds[record.OrderID]; exists {
		return false, nil
	}
	s.refunds[record.OrderID] = record
	return true, nil
}

func TestPaidOrderCreatesIdempotentFulfillmentRecord(t *testing.T) {
	store := newMemoryStore()
	processor := testProcessor(store)
	payload := eventPayload(t, "order.paid", validOrder())

	first, err := processor.Process(context.Background(), payload, "event_1")
	if err != nil {
		t.Fatal(err)
	}
	second, err := processor.Process(context.Background(), payload, "event_1")
	if err != nil {
		t.Fatal(err)
	}
	if first.Duplicate || !second.Duplicate || len(store.paid) != 1 {
		t.Fatalf("unexpected outcomes: first=%+v second=%+v records=%d", first, second, len(store.paid))
	}
	record := store.paid["order_1"]
	if record.Status != "pending_signing" || record.Plan != "solo" || record.Seats != 1 {
		t.Fatalf("unexpected record: %+v", record)
	}
	if !record.UpdatesUntil.Equal(time.Date(2027, 9, 7, 0, 0, 0, 0, time.UTC)) {
		t.Fatalf("unexpected updates cutoff: %s", record.UpdatesUntil)
	}
}

func TestPaidOrderRejectsUnsafeCatalogVariants(t *testing.T) {
	tests := map[string]func(*Order){
		"unknown product": func(o *Order) {
			o.ProductID, o.Product.ID, o.Subscription.ProductID = "unknown", "unknown", "unknown"
		},
		"wrong organization": func(o *Order) { o.Customer.OrganizationID = "other" },
		"wrong amount":       func(o *Order) { o.SubtotalAmount = 11999 },
		"discount": func(o *Order) {
			id := "discount"
			o.DiscountID, o.DiscountAmount = &id, 1
		},
		"proration":      func(o *Order) { o.Items[0].Proration = true },
		"missing period": func(o *Order) { o.Subscription.CurrentPeriodEnd = time.Time{} },
		"unpaid":         func(o *Order) { o.Paid = false },
	}
	for name, mutate := range tests {
		t.Run(name, func(t *testing.T) {
			order := validOrder()
			mutate(&order)
			_, err := testProcessor(newMemoryStore()).Process(
				context.Background(), eventPayload(t, "order.paid", order), "event_1",
			)
			if !errors.Is(err, ErrInvalidEvent) {
				t.Fatalf("expected invalid event, got %v", err)
			}
		})
	}
}

func TestRefundCreatesReviewRecord(t *testing.T) {
	store := newMemoryStore()
	order := validOrder()
	order.Status = "refunded"
	order.RefundedAmount = 12000
	result, err := testProcessor(store).Process(
		context.Background(), eventPayload(t, "order.refunded", order), "event_refund",
	)
	if err != nil {
		t.Fatal(err)
	}
	if result.Kind != "order.refunded" || store.refunds["order_1"].Status != "refund_review" {
		t.Fatalf("unexpected refund result: %+v", result)
	}
}

func TestUnknownEventIsIgnoredWithoutStoreWrite(t *testing.T) {
	store := newMemoryStore()
	result, err := testProcessor(store).Process(
		context.Background(), eventPayload(t, "subscription.updated", validOrder()), "event_ignored",
	)
	if err != nil || result.Kind != "ignored" || len(store.paid)+len(store.refunds) != 0 {
		t.Fatalf("unexpected result: %+v err=%v", result, err)
	}
}

func testProcessor(store Store) *Processor {
	processor := NewProcessor(Catalog{
		OrganizationID: testOrg,
		Plans: map[string]Plan{
			testProduct: {Key: "solo", AmountCents: 12000, Seats: 1},
		},
	}, store)
	processor.now = func() time.Time { return time.Date(2026, 9, 7, 1, 0, 0, 0, time.UTC) }
	return processor
}

func eventPayload(t *testing.T, eventType string, order Order) []byte {
	t.Helper()
	data, err := json.Marshal(Envelope{
		Type: eventType, Timestamp: time.Date(2026, 9, 7, 0, 0, 0, 0, time.UTC), Data: mustJSON(t, order),
	})
	if err != nil {
		t.Fatal(err)
	}
	return data
}

func mustJSON(t *testing.T, value any) json.RawMessage {
	t.Helper()
	data, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return data
}

func validOrder() Order {
	start := time.Date(2026, 9, 7, 0, 0, 0, 0, time.UTC)
	return Order{
		ID: "order_1", CreatedAt: start, Status: "paid", Paid: true,
		SubtotalAmount: 12000, NetAmount: 12000, TotalAmount: 12000,
		Currency: "usd", BillingReason: "subscription_create",
		ProductID: testProduct, SubscriptionID: "sub_1", CustomerID: "customer_1",
		Customer: &Customer{ID: "customer_1", Email: "buyer@example.com", OrganizationID: testOrg},
		Product:  &Product{ID: testProduct, OrganizationID: testOrg},
		Subscription: &Subscription{
			ID: "sub_1", ProductID: testProduct, Amount: 12000, Currency: "usd",
			RecurringInterval: "year", RecurringIntervalCount: 1,
			CurrentPeriodStart: start, CurrentPeriodEnd: start.AddDate(1, 0, 0),
		},
		Items: []OrderItem{{Amount: 12000, ProductPriceID: "price_1"}},
	}
}
