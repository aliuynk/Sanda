# Security & compliance notes

## 1. Data classification

| Class | Examples | Handling |
| ----- | -------- | -------- |
| **Public** | Product listings, seller profiles, certifications | Cacheable, indexable. |
| **Customer identifier** | Email, phone | Stored plaintext; redacted in logs. |
| **Strict PII** | TC Kimlik No, IBAN, card last-4 | Envelope-encrypted with KMS-wrapped DEK; never logged. |
| **Credentials** | Password hashes, refresh token IDs | Hashed/opaque; rotate on suspicion. |
| **Financial** | Payments, payouts, disputes | Access-controlled by role; full audit trail. |

## 2. Secrets management

- **Dev**: `.env` at the monorepo root, never committed.
- **Prod**: per-environment secret stores (Doppler / 1Password Secrets
  Automation / AWS Secrets Manager). Injected as env vars; never baked
  into images.
- **Rotation**: JWT signing keys rotate quarterly; iyzico keys on
  provider events; DEKs monthly.

## 3. Authentication

- Phone number in E.164 format is the unique identifier.
- OTP is 6 digits, TTL 5 minutes, 3 attempts before invalidation, max 3
  requests per minute per phone + per IP.
- Sessions: 15-minute access JWT + 30-day refresh token id; device list
  visible to the user; any session is revocable server-side.

## 4. Authorization

- Role flags are stored on `Account.roles` and checked in the tRPC
  `requireRole` middleware. Sellers can only touch their own data; admins
  are the only role with full reach.
- Row-level filters are enforced in queries, not in the UI.

## 5. Rate limiting

- OTP, auth, checkout, and message endpoints are rate-limited at the
  edge via a Redis bucket (see worker queues). Responses carry
  `Retry-After`.

## 6. Compliance

- **KVKK (6698)**: aydınlatma metni + açık rıza for optional marketing
  comms; a dedicated page per data subject's right to access, rectify,
  delete.
- **Mesafeli satış mevzuatı**: distance-sales agreement generated per
  order; ön bilgilendirme formu shown at checkout.
- **ETBİS**: platform registers as aracı hizmet sağlayıcı; seller-level
  ETBİS numbers are collected for those that cross legal thresholds.
- **KDV / müstahsil makbuzu**: individual farmers sell tax-free via
  müstahsil flow; other seller kinds collect KDV; rate mapping is in
  `@sanda/core/turkey`.

## 7. Incident response

- `AuditEvent` captures every admin action with `before/after` JSON.
- Sentry releases are tagged on every deploy; alert routing maps to a
  rotating on-call schedule.
- Post-incident: 5-whys doc in `docs/incidents/YYYY-MM-DD-slug.md`.
