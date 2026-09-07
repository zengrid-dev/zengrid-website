package db

import (
	"context"
	"fmt"

	"cloud.google.com/go/firestore"
	"github.com/zengrid/backend/fulfillment"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type FirestoreStore struct {
	client     *firestore.Client
	collection string
}

func NewFirestore(ctx context.Context, projectID, collection string) (*FirestoreStore, error) {
	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		return nil, fmt.Errorf("create Firestore client: %w", err)
	}
	return &FirestoreStore{client: client, collection: collection}, nil
}

func (s *FirestoreStore) Close() error {
	return s.client.Close()
}

func (s *FirestoreStore) RecordPaid(ctx context.Context, record fulfillment.OrderRecord) (bool, error) {
	created := false
	ref := s.client.Collection(s.collection).Doc(record.OrderID)
	err := s.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		created = false
		snapshot, err := tx.Get(ref)
		if status.Code(err) == codes.NotFound {
			created = true
			return tx.Create(ref, record)
		}
		if err != nil {
			return err
		}
		var existing fulfillment.OrderRecord
		if err := snapshot.DataTo(&existing); err != nil {
			return err
		}
		if !sameOrder(existing, record) {
			return fmt.Errorf("order ID already exists with different immutable fields")
		}
		return nil
	})
	return created, err
}

func (s *FirestoreStore) RecordRefund(ctx context.Context, record fulfillment.OrderRecord) (bool, error) {
	created := false
	ref := s.client.Collection(s.collection).Doc(record.OrderID)
	err := s.client.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		created = false
		snapshot, err := tx.Get(ref)
		if status.Code(err) == codes.NotFound {
			created = true
			return tx.Create(ref, record)
		}
		if err != nil {
			return err
		}
		var existing fulfillment.OrderRecord
		if err := snapshot.DataTo(&existing); err != nil {
			return err
		}
		if !sameOrder(existing, record) {
			return fmt.Errorf("refund does not match stored order")
		}
		return tx.Update(ref, []firestore.Update{
			{Path: "status", Value: "refund_review"},
			{Path: "refunded_amount", Value: record.RefundedAmount},
			{Path: "refunded_tax_amount", Value: record.RefundedTax},
			{Path: "updated_at", Value: record.UpdatedAt},
			{Path: "webhook_id", Value: record.WebhookID},
		})
	})
	return created, err
}

func sameOrder(left, right fulfillment.OrderRecord) bool {
	return left.OrderID == right.OrderID &&
		left.CustomerID == right.CustomerID &&
		left.CustomerEmail == right.CustomerEmail &&
		left.SubscriptionID == right.SubscriptionID &&
		left.ProductID == right.ProductID &&
		left.Plan == right.Plan &&
		left.Seats == right.Seats &&
		left.SubtotalAmount == right.SubtotalAmount &&
		left.Currency == right.Currency &&
		left.BillingReason == right.BillingReason &&
		left.PeriodStart.Equal(right.PeriodStart) &&
		left.UpdatesUntil.Equal(right.UpdatesUntil)
}
