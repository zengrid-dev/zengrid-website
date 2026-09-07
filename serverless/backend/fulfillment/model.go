package fulfillment

import (
	"encoding/json"
	"time"
)

type Plan struct {
	Key         string
	AmountCents int64
	Seats       int
}

type Catalog struct {
	OrganizationID string
	Plans          map[string]Plan
}

type Envelope struct {
	Type      string          `json:"type"`
	Timestamp time.Time       `json:"timestamp"`
	Data      json.RawMessage `json:"data"`
}

type Order struct {
	ID                string        `json:"id"`
	CreatedAt         time.Time     `json:"created_at"`
	Status            string        `json:"status"`
	Paid              bool          `json:"paid"`
	SubtotalAmount    int64         `json:"subtotal_amount"`
	DiscountAmount    int64         `json:"discount_amount"`
	NetAmount         int64         `json:"net_amount"`
	TaxAmount         int64         `json:"tax_amount"`
	TotalAmount       int64         `json:"total_amount"`
	DueAmount         int64         `json:"due_amount"`
	RefundedAmount    int64         `json:"refunded_amount"`
	RefundedTaxAmount int64         `json:"refunded_tax_amount"`
	Currency          string        `json:"currency"`
	BillingReason     string        `json:"billing_reason"`
	ProductID         string        `json:"product_id"`
	SubscriptionID    string        `json:"subscription_id"`
	CustomerID        string        `json:"customer_id"`
	DiscountID        *string       `json:"discount_id"`
	Customer          *Customer     `json:"customer"`
	Product           *Product      `json:"product"`
	Subscription      *Subscription `json:"subscription"`
	Items             []OrderItem   `json:"items"`
}

type Customer struct {
	ID             string `json:"id"`
	Email          string `json:"email"`
	OrganizationID string `json:"organization_id"`
}

type Product struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organization_id"`
}

type Subscription struct {
	ID                     string    `json:"id"`
	ProductID              string    `json:"product_id"`
	Amount                 int64     `json:"amount"`
	Currency               string    `json:"currency"`
	RecurringInterval      string    `json:"recurring_interval"`
	RecurringIntervalCount int       `json:"recurring_interval_count"`
	CurrentPeriodStart     time.Time `json:"current_period_start"`
	CurrentPeriodEnd       time.Time `json:"current_period_end"`
}

type OrderItem struct {
	Amount         int64  `json:"amount"`
	Proration      bool   `json:"proration"`
	ProductPriceID string `json:"product_price_id"`
}

type OrderRecord struct {
	OrderID        string    `firestore:"order_id"`
	WebhookID      string    `firestore:"webhook_id"`
	CustomerID     string    `firestore:"customer_id"`
	CustomerEmail  string    `firestore:"customer_email"`
	SubscriptionID string    `firestore:"subscription_id"`
	ProductID      string    `firestore:"product_id"`
	Plan           string    `firestore:"plan"`
	Seats          int       `firestore:"seats"`
	SubtotalAmount int64     `firestore:"subtotal_amount"`
	Currency       string    `firestore:"currency"`
	BillingReason  string    `firestore:"billing_reason"`
	PeriodStart    time.Time `firestore:"period_start"`
	UpdatesUntil   time.Time `firestore:"updates_until"`
	OrderCreatedAt time.Time `firestore:"order_created_at"`
	ReceivedAt     time.Time `firestore:"received_at"`
	UpdatedAt      time.Time `firestore:"updated_at"`
	Status         string    `firestore:"status"`
	RefundedAmount int64     `firestore:"refunded_amount,omitempty"`
	RefundedTax    int64     `firestore:"refunded_tax_amount,omitempty"`
}
