# Paynow Implementation Plan

> Status: **complete** — hosted/redirect flow implemented, all tests passing (567), pint/types/build clean.
> Goal: add Paynow as a first-class payment gateway, with BLIK, Apple Pay, Google Pay and PayPo/deferred payments exposed in checkout without making the UI depend on a single provider name.

## Why Paynow

Paynow is a good next gateway for this project because it is Polish-market focused, supports the payment methods customers expect, and is technically different enough from PayU/P24 to be useful as a learning integration.

Official references to verify before coding:

- Paynow API docs: `https://docs.paynow.pl/`
- API v3 payment creation: `https://docs.paynow.pl/pl/docs/reference/v3/send-payment-request`
- API v3 integration/signature rules: `https://docs.paynow.pl/pl/docs/v3/integration`
- Paynow payment methods FAQ: `https://faq.paynow.pl/vpl/docs/informacje-o-platnosciach-paynow`
- Paynow fees FAQ: `https://faq.paynow.pl/docs/paynow-oplaty-prowizje`

Use API v3 unless there is a documented blocker. API v3 matters for signatures and PayPo/deferred payments.

## Current Project State

Already implemented:

- `PaymentProviderEnum`: `p24`, `payu`, `stripe`, `cash_on_delivery`, `bank_transfer`
- Registered gateways in `EcommerceServiceProvider`: P24, PayU, cash on delivery, bank transfer
- Existing gateway pattern:
  - `app/Infrastructure/Payments/PayU/`
  - `app/Infrastructure/Payments/P24/`
  - `PaymentGatewayInterface`
  - `PaymentGatewayManager`
  - `ProcessPaymentWebhook`
  - `WebhookController`
- Checkout currently maps customer-facing methods to providers in `client/app/checkout/page.tsx`:
  - `blik` -> `payu`
  - `apple_pay` -> `payu`
  - `google_pay` -> `payu`
  - `p24` -> `p24`
  - manual methods stay manual

Target state:

- Add `paynow` to `PaymentProviderEnum`.
- Add `PaynowGateway`, `PaynowClient`, `PaynowSignatureService`, and optionally a small DTO/helper for payload building.
- Register Paynow in `EcommerceServiceProvider`.
- Add `POST /api/v1/webhooks/paynow`.
- Verify Paynow webhook signatures synchronously before queue dispatch.
- Expose Paynow credential status in `CheckoutController::paymentMethods()`.
- Allow checkout to route BLIK, Apple Pay, Google Pay and PayPo through Paynow when configured.
- Keep PayU/P24 available as fallback providers.

## Design Rule

The checkout should present customer-facing methods, not provider brands:

- BLIK
- Apple Pay
- Google Pay
- PayPo / deferred payments
- Fast transfer/card fallback
- Bank transfer
- Cash on delivery

Provider selection should be an internal mapping. If both PayU and Paynow are configured, prefer Paynow for new methods only after sandbox tests pass. Do not remove PayU/P24.

## Backend Scope

Files likely to change:

- `server/app/Enums/PaymentProviderEnum.php`
- `server/config/services.php`
- `server/app/Providers/EcommerceServiceProvider.php`
- `server/app/Http/Controllers/Api/V1/WebhookController.php`
- `server/routes/api/ecommerce.php`
- `server/app/Http/Controllers/Api/V1/CheckoutController.php`
- `server/app/Http/Requests/Api/V1/CheckoutRequest.php`
- `server/.env.example`
- `server/.env.production.example`
- `docs/deployment.md`
- `.ai/guide.md`
- `docs/backend.md`
- `server/docs/DEVELOPER_GUIDE.md`
- `server/docs/USER_GUIDE.md`

New files:

- `server/app/Infrastructure/Payments/Paynow/PaynowClient.php`
- `server/app/Infrastructure/Payments/Paynow/PaynowGateway.php`
- `server/app/Infrastructure/Payments/Paynow/PaynowSignatureService.php`
- `server/tests/Feature/Api/PaynowWebhookTest.php`
- `server/tests/Unit/PaynowSignatureServiceTest.php`

Config keys:

```env
PAYNOW_API_KEY=
PAYNOW_SIGNATURE_KEY=
PAYNOW_SANDBOX=true
PAYNOW_BASE_URL=https://api.sandbox.paynow.pl
```

Use production base URL only when `PAYNOW_SANDBOX=false`:

```env
PAYNOW_BASE_URL=https://api.paynow.pl
```

## Gateway Behavior

`PaynowGateway::createPayment()` should mirror PayU/P24:

- create `Payment` row
- provider: `PaymentProviderEnum::PAYNOW`
- status: `pending`
- amount: integer cents
- currency: uppercase ISO code, normally `PLN`
- store `payment_method` from checkout input

`PaynowGateway::processPayment()` should:

- create a Paynow payment via API v3
- use `Idempotency-Key`, ideally derived from the local `Payment` id and current attempt
- send `continueUrl` to `/checkout/pending?payment={id}` or success URL, matching existing flow
- send notification/webhook URL: `{app.url}/api/v1/webhooks/paynow`
- store Paynow payment id/status URL/redirect URL in `provider_transaction_id` and `payload`
- return `redirect` for hosted/redirect flow
- return `wait` only if a confirmed Paynow BLIK white-label flow is implemented and tested

Start with redirect/hosted Paynow for safety. Native/white-label BLIK and wallet tokens can be a second iteration unless Paynow docs and sandbox confirm the exact request shape.

`PaynowGateway::handleWebhook()` should:

- locate payment by `provider_transaction_id` first, then fallback to local external id if Paynow sends it
- map Paynow paid/confirmed status to `PaymentStatusEnum::COMPLETED`
- update order status to `OrderStatusEnum::PAID`
- map rejected/expired/error/abandoned statuses to `FAILED`
- leave pending/new statuses unchanged
- be idempotent, so duplicate webhooks do not corrupt state

`refundPayment()` can initially return `false` with a TODO only if refund API scope is not implemented. Prefer implementing refund if Paynow API v3 docs are clear enough.

## Signature Rules

Do not improvise signature handling. Read the current Paynow API v3 docs immediately before coding.

Expected shape from docs as of this plan:

- requests require `Api-Key`, `Idempotency-Key`, and `Signature`
- signature uses HMAC SHA256 + Base64
- the signed object includes ordered headers, ordered parameters, and body string according to Paynow v3 docs
- webhook/response signatures must be verified with constant-time comparison

Implementation requirement:

- `PaynowSignatureService` owns all canonicalization/sign/verify logic
- tests cover stable canonicalization, request signature generation, invalid signature rejection, and timing-safe verification via `hash_equals`
- `WebhookController::paynow()` verifies signature before dispatching `ProcessPaymentWebhook`

## Frontend Scope

Files likely to change:

- `client/api/checkout.ts`
- `client/components/checkout/payment-step.types.ts`
- `client/components/checkout/payment-step.tsx`
- `client/app/checkout/page.tsx`
- translation files if checkout text is localized in the client

Rules:

- Do not add types/interfaces inside `.tsx` files.
- Keep the UI method-first: BLIK, Apple Pay, Google Pay, PayPo.
- Avoid a visible "Paynow" radio if the customer is choosing a payment method. Provider branding can appear in helper text only if necessary.
- If PayPo is added, add `paypo` or `deferred_payment` to `PaymentMethodValue`, validation, method defs, and checkout payload.
- If Paynow is the preferred provider for BLIK/wallets, update `providerMap` in `client/app/checkout/page.tsx`.

Suggested mapping after Paynow sandbox passes:

```ts
const providerMap: Record<PaymentMethodValue, string> = {
    blik: 'paynow',
    apple_pay: 'paynow',
    google_pay: 'paynow',
    paypo: 'paynow',
    p24: 'p24',
    cash_on_delivery: 'cash_on_delivery',
    bank_transfer: 'bank_transfer',
};
```

If Paynow sandbox is not ready, keep PayU for BLIK/wallets and add Paynow as an explicit optional method only behind config.

## Admin Settings

Current `EcommerceServiceProvider` can override payment config from DB settings. Add Paynow fields in the same style as PayU/P24:

- `paynow_api_key`
- `paynow_signature_key` encrypted
- `paynow_sandbox`

If the admin settings UI has payment credential fields, add Paynow there with translations in both `server/lang/en/admin.php` and `server/lang/pl/admin.php`.

## Tests

Minimum test coverage:

- `PaynowSignatureServiceTest` ✅
  - signs request payload according to docs
  - rejects modified body
  - rejects missing/empty signature
  - uses `hash_equals` (timing-safe)
  - deterministic signatures for identical inputs
  - sorts parameters alphabetically
- `PaynowTest` (feature) ✅
  - generates request and notification signatures
  - rejects paynow webhook with invalid signature (400)
  - accepts valid signature and dispatches `ProcessPaymentWebhook`
  - creates paynow payment and stores redirect payload
  - sends `paymentMethodId` when provided
  - marks payment completed idempotently from webhook
  - marks payment as failed for REJECTED, EXPIRED, ERROR, ABANDONED statuses
  - does not overwrite completed payment with failed status
  - leaves payment pending for NEW/PENDING statuses
  - handles API error without marking order paid
  - stores `provider_transaction_id` from webhook if missing
  - reports paynow/paypo configuration status in checkout methods

Run through Docker only:

```bash
docker compose exec php vendor/bin/pint --dirty
docker compose exec php php artisan test --compact --filter=Paynow
docker compose exec php php artisan test --compact
```

Before committing:

```bash
make fix
make check
```

## Implementation Prompts

Use these prompts one at a time. Do not ask one agent to do all phases blindly.

### Prompt 1: Research and Fit Check

```text
Read AGENTS.md, .ai/guide.md, .ai/rules.md, docs/PAYNOW_IMPLEMENTATION_PLAN.md, and the existing PayU/P24 payment code.

Then verify current Paynow API v3 docs from official docs.paynow.pl only:
- payment creation endpoint
- required headers
- signature generation and verification rules
- webhook payload/signature rules
- status values
- PayPo/deferred payment requirements

Return a short implementation note with:
1. exact Paynow docs URLs used,
2. signature algorithm summary,
3. status mapping proposal,
4. whether PayPo can be included in the first pass,
5. any uncertainty that needs a sandbox account.

Do not modify code yet.
```

### Prompt 2: Backend Gateway

```text
Implement Paynow backend gateway using docs/PAYNOW_IMPLEMENTATION_PLAN.md and the existing PayU/P24 patterns.

Scope:
- add PaymentProviderEnum::PAYNOW
- add services.paynow config and env examples
- create PaynowClient, PaynowSignatureService, PaynowGateway
- register Paynow in EcommerceServiceProvider
- add gateway tests with Http::fake()
- update docs touched by the new gateway

Constraints:
- strict PHP types and explicit return types
- no inline validation
- no env() outside config
- integer cents only
- synchronous signature verification helpers must be unit-tested
- all commands through Docker

Run:
- docker compose exec php vendor/bin/pint --dirty
- docker compose exec php php artisan test --compact --filter=Paynow
```

### Prompt 3: Webhook

```text
Add Paynow webhook handling.

Scope:
- add POST /api/v1/webhooks/paynow in the e-commerce API routes
- add WebhookController::paynow()
- verify Paynow signature synchronously before dispatching ProcessPaymentWebhook
- ensure ProcessPaymentWebhook can route provider "paynow"
- implement PaynowGateway::handleWebhook() status mapping
- add feature tests for invalid signature, valid dispatch, completed payment, duplicate webhook

Follow the existing PayU/P24 webhook style, but use Paynow's official signature rules.

Run:
- docker compose exec php vendor/bin/pint --dirty
- docker compose exec php php artisan test --compact --filter=PaynowWebhook
```

### Prompt 4: Checkout Methods

```text
Expose Paynow in checkout without making the customer choose a provider brand.

Scope:
- update CheckoutController::paymentMethods() to expose Paynow configuration state and missing env names
- update CheckoutRequest payment_method validation if adding PayPo/deferred payment
- update client checkout types outside TSX files
- update payment-step method definitions
- update providerMap in client/app/checkout/page.tsx
- keep PayU/P24 fallback paths intact

Preferred UX:
- show BLIK, Apple Pay, Google Pay, PayPo/deferred payment, Przelewy24, bank transfer, COD
- route BLIK/wallets/PayPo to Paynow only if Paynow is configured and sandbox-tested
- do not remove existing PayU/P24 options

Run:
- docker compose exec node npm run types
- docker compose exec node npm run lint
```

### Prompt 5: Admin Settings and Docs

```text
Add Paynow credential management to admin settings and update documentation.

Scope:
- add Paynow payment settings fields matching the existing PayU/P24 settings pattern
- encrypt Signature-Key
- clear settings cache on save
- add admin translations in both server/lang/en/admin.php and server/lang/pl/admin.php
- update .ai/guide.md, docs/backend.md, docs/deployment.md, server/docs/DEVELOPER_GUIDE.md, server/docs/USER_GUIDE.md

Run:
- docker compose exec php php artisan cache:clear
- docker compose exec php vendor/bin/pint --dirty
```

### Prompt 6: Final QA

```text
Review the Paynow implementation as a staff engineer.

Check:
- signature verification happens before queue dispatch
- webhook handling is idempotent
- status mapping cannot mark wrong payments as paid
- idempotency keys are stable and <= Paynow's documented limit
- checkout still works when Paynow env vars are missing
- PayU/P24/manual methods still work
- docs match the actual code

Run:
- docker compose exec php php artisan test --compact
- docker compose exec node npm run build
- make fix
- make check

Return findings first if there are issues. If clean, summarize changed files and remaining sandbox/manual-test steps.
```

## Manual Sandbox Checklist

Before enabling Paynow in production:

- create sandbox credentials in Paynow Merchant Panel
- configure `PAYNOW_API_KEY`, `PAYNOW_SIGNATURE_KEY`, `PAYNOW_SANDBOX=true`
- create a low-value order and complete redirect payment
- test failed/cancelled payment
- test webhook delivery from Paynow sandbox
- test duplicate webhook delivery
- test BLIK redirect or white-label flow depending on implemented mode
- test Apple Pay and Google Pay only on supported browsers/devices
- test PayPo only after Merchant Panel activation and required buyer address/GDPR clause handling

## Production Rollout

Recommended rollout:

1. Deploy Paynow code with checkout still preferring PayU/P24.
2. Add production env vars and verify `checkout/payment-methods` reports Paynow configured.
3. Enable Paynow for a hidden/test product or staging domain first.
4. Switch BLIK/Apple Pay/Google Pay/PayPo mapping to Paynow after successful real low-value tests.
5. Keep PayU and P24 active as fallback providers.
