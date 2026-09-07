# ZenGrid fulfillment intake

Deploy this service to Google Cloud Run with a Firestore Standard database in
the same region. It accepts Polar's signed raw webhooks and creates one durable
fulfillment record per paid order.

The service deliberately does not hold the ZenGrid signing key or emit license
keys. An operator signs on the offline issuer and records delivery separately.
This preserves the private-key boundary in
`../../../zengrid-enterprise/OFFLINE-RELEASE.md`.

## Accepted events

- `order.paid`: validates the production organization, known Solo/Team product,
  paid state, USD amount, absence of a discount or proration, annual subscription
  terms, customer relationships, and coverage period. A valid order becomes
  `pending_signing`.
- `order.refunded`: validates the same entitlement and changes the record to
  `refund_review`. Offline licenses cannot be remotely revoked.
- Other signed events return `202` without writing.

Firestore document IDs are Polar order IDs. Transactions make Polar retries
idempotent and reject a reused ID whose customer, product, subscription, amount,
or coverage differs. Records contain the delivery email and entitlement fields,
but never raw webhook bodies, billing addresses, license keys, private keys, or
download URLs.

## Local verification

```sh
GOCACHE=/tmp/zengrid-go-cache \
GOMODCACHE=/tmp/zengrid-go-mod \
go test ./...
```

Runtime configuration:

| Variable | Meaning |
| --- | --- |
| `GCP_PROJECT_ID` | Project containing the default Firestore database |
| `POLAR_WEBHOOK_SECRET` | Secret for the exact Polar endpoint |
| `POLAR_ENVIRONMENT` | `production` by default; may be `sandbox` |
| `FIRESTORE_COLLECTION` | Optional collection override |

`POLAR_ACCESS_TOKEN` is a local webhook-administration credential only. Keep it
in the ignored `.env` file when creating or auditing the Polar endpoint; never
add it to Cloud Run. The running service authenticates deliveries with the
endpoint-specific `POLAR_WEBHOOK_SECRET` from Secret Manager.

Production IDs and amounts are compiled from the reviewed website catalog and
cannot be overridden by environment variables. Sandbox additionally requires
`POLAR_ORGANIZATION_ID`, `POLAR_SOLO_PRODUCT_ID`, and
`POLAR_TEAM_PRODUCT_ID`; it writes to `sandbox_fulfillment_orders`.

## Google Cloud setup

Use `asia-south1` for both services unless the owner selects another data
location. Firestore location cannot be changed after creation.

```sh
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com firestore.googleapis.com \
  secretmanager.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

gcloud firestore databases create --database='(default)' \
  --location=asia-south1 --type=firestore-native \
  --edition=standard --delete-protection

gcloud iam service-accounts create zengrid-fulfillment \
  --display-name='ZenGrid fulfillment intake'
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member='serviceAccount:zengrid-fulfillment@PROJECT_ID.iam.gserviceaccount.com' \
  --role='roles/datastore.user'

gcloud secrets create POLAR_WEBHOOK_SECRET --replication-policy=automatic
gcloud secrets versions add POLAR_WEBHOOK_SECRET \
  --data-file=/SECURE/LOCAL/PATH/polar-webhook-secret.txt
gcloud secrets add-iam-policy-binding POLAR_WEBHOOK_SECRET \
  --member='serviceAccount:zengrid-fulfillment@PROJECT_ID.iam.gserviceaccount.com' \
  --role='roles/secretmanager.secretAccessor'
```

Deploy from this directory. The service is public because Polar cannot present
Google IAM credentials; the webhook signature protects the write path.

```sh
gcloud run deploy zengrid-fulfillment --source=. \
  --region=asia-south1 \
  --service-account=zengrid-fulfillment@PROJECT_ID.iam.gserviceaccount.com \
  --allow-unauthenticated --ingress=all --min=0 --max=3 \
  --cpu=1 --memory=256Mi --concurrency=20 --timeout=10s \
  --set-env-vars=GCP_PROJECT_ID=PROJECT_ID,POLAR_ENVIRONMENT=production \
  --set-secrets=POLAR_WEBHOOK_SECRET=POLAR_WEBHOOK_SECRET:1
```

Verify `GET SERVICE_URL/health`, then create a Polar **Raw** webhook endpoint
at `SERVICE_URL/webhooks/polar` subscribed only to `order.paid` and
`order.refunded`. Store its secret in Secret Manager before sending a test.
Use Polar Sandbox and its separate product IDs first.

Do not enable website checkout from this deployment alone. Complete offline
signing, private package delivery, operator monitoring, legal details, and the
full Sandbox purchase/refund/retry lifecycle first.
