# ADR 003: Payment Gateway and Webhook Security

## Status

Accepted

## Context

Seniman Kamera processes online payments for photography and videography bookings via the **DOKU Payment Gateway**. Payment integrity is mission-critical:
1. **Webhook Signature Bypass Risks:** Accepting unverified or loosely verified HTTP callbacks in notification endpoints allows malicious actors to simulate fake successful payments, unlocking calendar dates and confirming bookings without actual funds.
2. **Double Processing & Race Conditions:** Network retries from payment gateways can trigger duplicate booking updates, duplicate customer emails, or duplicate Telegram admin alerts.
3. **Split Payment Complexity:** Photography services operate on a **Two-Step Payment Model** (Down Payment / DP to lock the date slot, followed by a Balance Payment / Pelunasan prior to the shoot or deliverable release).

## Decision

We establish strict security, idempotency, and lifecycle rules for payment processing:

### 1. Mandatory HMAC-SHA256 Signature Verification
- All incoming DOKU notification webhooks (`/api/payment/notification` or `/api/doku/notification`) must verify the request signature before parsing or processing the body.
- Signatures must be computed using:
  - Client ID (`DOKU_CLIENT_ID`)
  - Request ID / Timestamp
  - Target Path
  - Digest of the raw request payload (SHA-256)
  - Shared Secret Key (`DOKU_SECRET_KEY`)
- Any request with a missing, invalid, or mismatched signature must immediately be rejected with HTTP `401 Unauthorized` or `400 Bad Request`. Bypassing signature checks in production is strictly banned.

### 2. Two-Step Payment Lifecycle Architecture
Payments are categorized into two explicit stages:
1. **Down Payment (DP - 50% or fixed nominal):**
   - Initiated from the public booking checkout flow.
   - Upon successful DP payment:
     - Booking status updates: `PENDING` -> `APPROVED`.
     - Payment status updates: `PENDING` -> `DP_PAID`.
     - The corresponding `CalendarSlot` is locked (`APPROVED` / booked).
     - Automated Telegram alert sent to studio crew.
     - Automated booking confirmation email sent to the client.
2. **Balance Payment (Pelunasan - remaining amount):**
   - Initiated by the client on the dedicated order tracking page or via payment link.
   - Upon successful Balance payment:
     - Payment status updates: `DP_PAID` -> `LUNAS` / `PAID`.
     - `CalendarSlot` status updates to `LUNAS`.
     - Download links for deliverables (photo/video galleries) are unlocked.

### 3. Idempotent Transaction Logging
- Every successful payment callback must be recorded in the `PaymentTransaction` table using a deterministic unique key:
  - `{bookingId}-DP` for down payment.
  - `{bookingId}-FULL` for full upfront payment.
  - `{bookingId}-BALANCE` for subsequent balance payment.
- If a webhook retry arrives for an already recorded transaction key, the system must recognize it as duplicate, log the event, and return HTTP `200 OK` immediately without re-executing status updates or notifications.

### 4. Background Notification Deduplication
- Telegram and Email notification dispatch must be decoupled from the synchronous HTTP webhook response.
- Deduplication flags or cache keys prevent redundant Telegram pings in serverless execution environments.

## Consequences

### Positive
- **Tamper-Proof Transactions:** Impossible to forge fake payment confirmations.
- **Auditable Financial Ledger:** Every transaction is tracked with its unique key and exact nominal in `PaymentTransaction`.
- **Accurate Booking State:** Clean separation between DP lock and final balance clearance.

### Constraints & Trade-offs
- Webhook endpoints require raw request body access to compute valid SHA-256 digests; body parsing middleware must preserve raw byte payloads.
- Local development requires tunneling tools (e.g., ngrok or localtunnel) to receive test webhooks from DOKU Sandbox.
