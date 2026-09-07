package fulfillment

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"
)

var ErrInvalidEvent = errors.New("invalid webhook event")

type Store interface {
	RecordPaid(context.Context, OrderRecord) (bool, error)
	RecordRefund(context.Context, OrderRecord) (bool, error)
}

type Outcome struct {
	Kind      string
	OrderID   string
	Duplicate bool
}

type Processor struct {
	catalog Catalog
	store   Store
	now     func() time.Time
}

func NewProcessor(catalog Catalog, store Store) *Processor {
	return &Processor{catalog: catalog, store: store, now: time.Now}
}

func (p *Processor) Process(ctx context.Context, payload []byte, webhookID string) (Outcome, error) {
	var envelope Envelope
	if err := json.Unmarshal(payload, &envelope); err != nil {
		return Outcome{}, fmt.Errorf("%w: malformed JSON", ErrInvalidEvent)
	}
	if envelope.Type != "order.paid" && envelope.Type != "order.refunded" {
		return Outcome{Kind: "ignored"}, nil
	}
	if envelope.Timestamp.IsZero() || len(envelope.Data) == 0 {
		return Outcome{}, fmt.Errorf("%w: missing envelope fields", ErrInvalidEvent)
	}

	var order Order
	if err := json.Unmarshal(envelope.Data, &order); err != nil {
		return Outcome{}, fmt.Errorf("%w: malformed order", ErrInvalidEvent)
	}
	record, err := p.record(order, webhookID)
	if err != nil {
		return Outcome{}, err
	}

	var created bool
	if envelope.Type == "order.paid" {
		if err := p.validatePaid(order); err != nil {
			return Outcome{}, err
		}
		record.Status = "pending_signing"
		created, err = p.store.RecordPaid(ctx, record)
	} else {
		if err := p.validateRefund(order); err != nil {
			return Outcome{}, err
		}
		record.Status = "refund_review"
		record.RefundedAmount = order.RefundedAmount
		record.RefundedTax = order.RefundedTaxAmount
		created, err = p.store.RecordRefund(ctx, record)
	}
	if err != nil {
		return Outcome{}, fmt.Errorf("store fulfillment order: %w", err)
	}
	return Outcome{Kind: envelope.Type, OrderID: order.ID, Duplicate: !created}, nil
}

func (p *Processor) record(order Order, webhookID string) (OrderRecord, error) {
	plan, exists := p.catalog.Plans[order.ProductID]
	if !exists {
		return OrderRecord{}, fmt.Errorf("%w: unknown product", ErrInvalidEvent)
	}
	if order.ID == "" || webhookID == "" || order.CreatedAt.IsZero() ||
		order.Customer == nil || order.Product == nil || order.Subscription == nil {
		return OrderRecord{}, fmt.Errorf("%w: missing order relationships", ErrInvalidEvent)
	}
	if order.Customer.OrganizationID != p.catalog.OrganizationID || order.Product.OrganizationID != p.catalog.OrganizationID {
		return OrderRecord{}, fmt.Errorf("%w: organization mismatch", ErrInvalidEvent)
	}
	address, err := mail.ParseAddress(strings.TrimSpace(order.Customer.Email))
	if err != nil || address.Address != strings.TrimSpace(order.Customer.Email) {
		return OrderRecord{}, fmt.Errorf("%w: invalid customer email", ErrInvalidEvent)
	}
	if order.Customer.ID != order.CustomerID || order.Product.ID != order.ProductID || order.Subscription.ID != order.SubscriptionID {
		return OrderRecord{}, fmt.Errorf("%w: inconsistent relationship IDs", ErrInvalidEvent)
	}
	if order.Subscription.ProductID != order.ProductID {
		return OrderRecord{}, fmt.Errorf("%w: inconsistent subscription product", ErrInvalidEvent)
	}
	if order.Subscription.CurrentPeriodStart.IsZero() || !order.Subscription.CurrentPeriodEnd.After(order.Subscription.CurrentPeriodStart) {
		return OrderRecord{}, fmt.Errorf("%w: invalid subscription period", ErrInvalidEvent)
	}
	if err := validateEntitlement(order, plan); err != nil {
		return OrderRecord{}, err
	}
	now := p.now().UTC()
	return OrderRecord{
		OrderID: order.ID, WebhookID: webhookID, CustomerID: order.CustomerID,
		CustomerEmail: address.Address, SubscriptionID: order.SubscriptionID,
		ProductID: order.ProductID, Plan: plan.Key, Seats: plan.Seats,
		SubtotalAmount: order.SubtotalAmount, Currency: order.Currency,
		BillingReason: order.BillingReason, PeriodStart: order.Subscription.CurrentPeriodStart.UTC(),
		UpdatesUntil: order.Subscription.CurrentPeriodEnd.UTC(), OrderCreatedAt: order.CreatedAt.UTC(),
		ReceivedAt: now, UpdatedAt: now,
	}, nil
}

func (p *Processor) validatePaid(order Order) error {
	if !order.Paid || order.Status != "paid" || order.DueAmount != 0 || order.RefundedAmount != 0 {
		return fmt.Errorf("%w: order is not fully paid", ErrInvalidEvent)
	}
	if order.DiscountAmount != 0 || order.DiscountID != nil {
		return fmt.Errorf("%w: discounted order requires review", ErrInvalidEvent)
	}
	return nil
}

func (p *Processor) validateRefund(order Order) error {
	if order.Status != "refunded" && order.Status != "partially_refunded" {
		return fmt.Errorf("%w: invalid refund status", ErrInvalidEvent)
	}
	if order.RefundedAmount <= 0 || order.RefundedAmount > order.NetAmount ||
		order.RefundedTaxAmount < 0 || order.RefundedTaxAmount > order.TaxAmount {
		return fmt.Errorf("%w: invalid refund amount", ErrInvalidEvent)
	}
	return nil
}

func validateEntitlement(order Order, plan Plan) error {
	if order.Currency != "usd" || order.SubtotalAmount != plan.AmountCents ||
		order.NetAmount != plan.AmountCents || order.TaxAmount < 0 ||
		order.TotalAmount != order.NetAmount+order.TaxAmount {
		return fmt.Errorf("%w: unexpected order amount", ErrInvalidEvent)
	}
	if order.BillingReason != "subscription_create" && order.BillingReason != "subscription_cycle" {
		return fmt.Errorf("%w: unsupported billing reason", ErrInvalidEvent)
	}
	sub := order.Subscription
	if sub.Currency != "usd" || sub.Amount != plan.AmountCents ||
		sub.RecurringInterval != "year" || sub.RecurringIntervalCount != 1 {
		return fmt.Errorf("%w: unexpected subscription terms", ErrInvalidEvent)
	}
	if len(order.Items) != 1 || order.Items[0].Proration ||
		order.Items[0].Amount != plan.AmountCents || order.Items[0].ProductPriceID == "" {
		return fmt.Errorf("%w: unexpected order items", ErrInvalidEvent)
	}
	return nil
}
