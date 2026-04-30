# Sanda architecture

This document explains the *why* behind the structural choices. If you only
need to run the project, read the top-level `README.md`. If you need to
change something load-bearing (payments, service areas, identity), read on.

---

## 1. Why a monorepo?

We intentionally ship web, admin, mobile, workers, and shared domain code in
a single Turborepo repo. The alternative — a polyrepo with a published SDK —
would make end-to-end type safety impossible: a small rename in the Prisma
schema would require cutting a release in N repos before any consumer could
upgrade. Given how small the team is and how interconnected the code is, the
monorepo is the lower-friction choice.

Turborepo gives us:

- **Cached, topologically-ordered builds** — `pnpm build` only rebuilds what
  changed since the last green CI run.
- **Per-package task graphs** — `@sanda/api` only needs `@sanda/db` to
  generate Prisma types; Turbo does not rebuild the world.
- **Remote cache readiness** — when traffic grows we can flip on remote
  caching with one config change.

## 2. End-to-end types with tRPC

The API is tRPC v11. The server router lives in `packages/api/src/root.ts`
and is consumed as a typed React hook in both Next.js and Expo. We use
superjson as the transformer so that `Decimal`, `Date`, and `BigInt` survive
the wire intact.

Why tRPC and not REST/OpenAPI?

- Our clients are first-party (web, admin, mobile). We own both ends.
- End-to-end types catch schema drift on refactor — the compile step is our
  contract test.
- When we need third-party integrations (restaurant POS, kargo aggregators)
  we will expose a *thin* REST facade on top of the same domain functions.

## 3. Why Prisma + PostGIS?

Prisma is the pragmatic choice for this team size — readable schema, solid
migrations, great TypeScript ergonomics. Its single weakness is geospatial
data: the `Unsupported(...)` escape hatch is workable but you lose type
safety on those columns. We mitigate it with:

- A thin raw-SQL layer in `@sanda/core/service-area` that handles queries
  involving `ST_Contains`, `ST_DWithin`, and `ST_Transform`.
- The application pre-computes `polygonContainsDestination` and
  `withinRadiusOfFarm` booleans in the query path and passes plain data
  into the pure matcher.

Drizzle was considered. We picked Prisma for migration ergonomics and the
familiarity of its client in Next.js Server Components.

## 4. Identity & sessions

- Primary auth: **SMS OTP** via NetGSM/İletimerkezi, because Turkish users
  trust it more than email.
- Optional: Google/Apple OAuth (scaffolded in `AuthLink`).
- Sessions use a **dual-token** model: a 15-minute HS256 JWT access token
  and a 30-day opaque refresh token whose ID is stored in the `Session`
  table so that we can revoke server-side. The refresh rotation endpoint
  runs behind the Next.js middleware.
- PII (TC Kimlik, IBAN) is envelope-encrypted with a KMS-wrapped DEK; the
  DEK is never in application logs.

## 5. Money & commission

- All money is integer kuruş, branded via the `Kurus` type in
  `@sanda/core/money`.
- Commission is basis points on the merchandise subtotal, **not** on
  shipping, because we want sellers to be transparent about shipping cost.
- `computeCommission()` supports optional cap and floor, so that the
  platform fee behaves well on both small jam jars and large olive-oil
  wholesales.
- Banker's rounding (`applyBps`) avoids the classic "1 kuruş lost per
  line" bug at scale.

## 6. Multi-seller checkout

A cart can contain items from N sellers. At checkout we split into N
`Order` rows, each with its own:

- Shipping address (same physical destination, but billed to that seller's
  kargo account separately)
- Payment → settled via iyzico submerchant
- Dispute and refund lifecycle

The buyer UI makes this split visible, so expectations around multiple
deliveries are set before payment.

## 7. Service-area matching

This is one of Sanda's differentiators. A seller configures rules with:

- Covered provinces (il codes) and/or districts (ilçe ids)
- Optional polygon (`MultiPolygon, 4326`) for custom zones
- Optional radius around the farm (`ST_DWithin`)
- Carrier, shipping fee, ETA range, minimum order amount, free-shipping
  threshold

`matchServiceAreas()` returns all matching rules, sorted by
`(meetsMinimum, specificity, cheapestFee)`. The UI shows the winner but
keeps the runners-up available for a "more options" drawer.

## 8. Certifications

A certification is a row with:

- Type (organic EU / organic TR / İyi Tarım / ...), issuer, certificate
  number, issue and expiry dates
- The uploaded PDF URL plus its SHA-256 checksum
- A `status` with an explicit transition graph: `PENDING_REVIEW → VERIFIED`
  (with method: manual/registry/QR/api) or `REJECTED`; later `EXPIRED` or
  `REVOKED`.
- A join to products so a single certificate can cover an entire scope.

The admin panel is the review surface. Future work is to auto-verify a
subset against the Tarım Bakanlığı registry.

## 9. Workers & queues

BullMQ on Redis. Queues:

- `notifications` — OTP dispatch, order status push/SMS
- `cert-verify` — async verification pipeline
- `payouts` — schedule and execute iyzico submerchant settlements
- `shipment-tracking` — carrier polling
- `search-index` — Meilisearch sync

Workers live in `services/worker`. Every job is idempotent; every failure
is retried with exponential backoff and ultimately surfaced in the admin
panel's "dead letters" view.

## 10. Mobile trade-offs

- **Expo (React Native)** with `expo-router`, not Ionic. Production
  marketplaces benefit from native-grade list performance and camera flows.
- **One app, role toggle** — seller mode is a client-side preference held
  in MMKV. Server-side RBAC is what actually enforces permissions.
- **Offline-first for the seller side** — upcoming work is an outbox on
  MMKV so that a farmer in a weak-coverage village can mark an order as
  shipped and sync later without losing data.

## 11. What we explicitly did NOT do

- **No serverless functions as primary runtime.** Next.js API routes run on
  a long-lived Node.js process. The background worker is its own process.
  This keeps connection pooling sane and avoids Prisma cold-start pain.
- **No Next.js server actions for writes.** tRPC routers are the single
  write surface; server components only consume via the server caller.
  Uniform shape everywhere.
- **No GraphQL.** It would buy us nothing in an all-first-party client
  situation.

## 12. Roadmap milestones

1. **MVP (web)** — buyer discovery, seller onboarding, catalog, cart,
   PSP-marketplace checkout, seller dashboard, certifications, basic admin
   review.
2. **Operations** — kargo integrations, cert registry auto-verification,
   payout automation, dispute workflow.
3. **Mobile seller app** — orders, one-tap mark-shipped, in-field camera
   capture for products and certificates.
4. **Mobile buyer app** — the same UX as web, optimised for mobile.
5. **Subscription boxes, B2B, CSA** — feature-flagged, off by default.
