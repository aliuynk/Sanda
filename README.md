# Sanda

> Topraktan sofraya, aracısız. Türkiye’nin bağımsız üreticilerini, sertifikalarıyla şeffafça, doğrudan alıcıya bağlayan pazar yeri.

Sanda is a farm-to-table marketplace for Turkey. Any producer — a single
farmer, a village cooperative, a small food business — can register, define
their own delivery rules, upload certifications for verification, optionally
open their farm to visitors, and sell directly to consumers. Transparency is
not a marketing claim: certificates are first-class entities with a
verification lifecycle, and orders carry harvest-batch traceability.

This repository is the entire product: the buyer/seller web app, the Expo
mobile app, the admin operations panel, the shared API, domain packages,
background workers, and local infrastructure.

---

## 1. Architecture at a glance

```
apps/
  web/        Next.js 15 — buyer + seller web (public marketing,
              catalog, product detail, cart, checkout, seller dashboard)
  admin/      Next.js 15 — internal operations panel
  mobile/     Expo (React Native) — buyer + seller app, role-aware tabs

packages/
  db/         Prisma schema, client, seed. PostgreSQL + PostGIS.
  validation/ Zod schemas used by both server and client.
  core/       Domain logic: money, commission, service-area matching,
              Turkey helpers (IBAN, TC Kimlik), logger, env parser.
  api/        tRPC routers (auth, catalog, sellers, cart, orders,
              certifications, geo) — consumed by all apps.
  i18n/       tr-TR + en-US dictionaries, dotted-key translator.
  ui-web/     shadcn-style component library for web apps.
  config-*/   Shared ESLint, TypeScript, and Tailwind presets.

services/
  worker/     BullMQ workers: OTP dispatch, certificate verification,
              payout scheduling, shipment tracking, search indexing.

infra/        Docker Compose: Postgres+PostGIS, Redis, Meilisearch,
              MinIO (S3), Mailhog.
```

### Principles

- **Types flow end-to-end.** A `Product` row is shaped by Prisma, validated
  by Zod, exposed via tRPC, and consumed by both the Next.js app and the
  Expo app with zero `any`.
- **Money is always integers.** Every amount is stored as kuruş
  (1 TRY = 100 kuruş). `@sanda/core/money` provides branded helpers so you
  cannot accidentally mix floats.
- **Geography is real.** Service areas, farm locations, and delivery radii
  are stored as PostGIS geometry. `matchServiceAreas()` in `@sanda/core`
  picks the best fulfillment rule with correct specificity ordering.
- **Certifications are first-class.** The verification lifecycle
  (`PENDING_REVIEW → VERIFIED | REJECTED → EXPIRED`) is explicit so the UI
  can never claim a seller is organic unless an admin (or a registry API)
  has confirmed it.
- **Multi-seller carts split at checkout.** Each seller gets their own
  `Order`, their own shipping, their own payout, their own dispute. Buyer
  sees this clearly in the UI.
- **Escrow payments.** Buyer pays the platform, the platform holds funds
  via iyzico submerchant, seller is released after delivery is confirmed.

---

## 2. Quickstart

### Prerequisites

- Node.js 20.11+ (see `.nvmrc`)
- pnpm 9 (`corepack enable` will install it)
- Docker + Docker Compose

### Install & boot

```bash
pnpm install
cp .env.example .env        # edit for your local secrets
pnpm infra:up               # Postgres, Redis, Meilisearch, MinIO, Mailhog
pnpm db:migrate             # applies checked-in Prisma migrations
pnpm db:seed                # creates demo producer + product
pnpm dev                    # runs all apps in parallel
```

Apps after `pnpm dev`:

| App       | URL                          |
| --------- | ---------------------------- |
| Web       | http://localhost:3000        |
| Admin     | http://localhost:3001        |
| MinIO UI  | http://localhost:9001        |
| Mailhog   | http://localhost:8025        |
| Meili UI  | http://localhost:7700        |

**Postgres host port:** the stack maps the database to **`localhost:5433`** (container still listens on 5432 internally). That avoids `Bind for 0.0.0.0:5432 failed: port is already allocated` when you already run Postgres on 5432 (Homebrew, another container, etc.). Ensure `DATABASE_URL` and `DIRECT_URL` in `.env` use port **5433**.

**Port conflicts:** if your machine already uses `3000`, `5433`, `9000`, or any other default port, change the matching values in `.env`. The repo supports configurable host ports for the web/admin apps (`WEB_PORT`, `ADMIN_PORT`) and Docker services (`POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`, `MEILI_HOST_PORT`, `MINIO_API_HOST_PORT`, `MINIO_CONSOLE_HOST_PORT`, `SMTP_HOST_PORT`, `MAILHOG_UI_HOST_PORT`). Keep the related URLs in sync when you change them.

If you change the Prisma schema locally and need a new migration, run `pnpm db:migrate:dev` instead of `pnpm db:migrate`.

On **Apple Silicon**, Docker may warn that some images are `linux/amd64`; they usually run under emulation. If a service fails to start, try `docker compose pull` again or pin a multi-arch image.

### Mobile

```bash
pnpm --filter @sanda/mobile dev
```

Press `i` for iOS simulator or `a` for Android. The app defaults to
`http://localhost:3000/api/trpc` — override via the `EXPO_PUBLIC_API_URL`
environment variable.

---

## 3. Monorepo commands

```bash
pnpm dev                     # all apps in parallel
pnpm build                   # production build, topologically ordered
pnpm lint                    # ESLint across all workspaces
pnpm typecheck               # TSC across all workspaces
pnpm test                    # Vitest across packages
pnpm format                  # Prettier write

pnpm db:generate             # prisma generate
pnpm db:migrate              # prisma migrate deploy
pnpm db:migrate:dev          # prisma migrate dev (create a new migration)
pnpm db:seed                 # development seed
pnpm db:studio               # prisma studio
pnpm db:reset                # drop + remigrate + reseed

pnpm infra:up                # docker compose up -d
pnpm infra:down              # docker compose down
pnpm infra:reset             # wipe volumes
```

---

## 4. Environment & configuration

Environment variables are declared in `.env.example` and parsed via Zod in
`@sanda/core/env`. The apps call `getServerEnv()` at boot so any missing
variable fails the process early and loudly — we never ship with implicit
defaults in production.

Sensitive material (TC Kimlik, IBAN) is envelope-encrypted at the
application layer before hitting Postgres. That is stubbed in the seed data
but enforced by the real write path; never persist PII in plaintext.

---

## 5. Turkey-specific concerns

This is a Turkish marketplace, and the code reflects that:

- **ETBİS registration** (aracı hizmet sağlayıcı) is required to operate;
  admin app surfaces the obligations that apply at each GMV threshold.
- **TC Kimlik No + IBAN** are validated with their official checksums
  (`isValidTcKimlik`, `isValidIbanMod97` in `@sanda/validation/common`).
- **Seller kinds** branch the onboarding flow: individual farmers
  (exempt from regular VAT) use ÇKS no + müstahsil makbuzu; esnaf and
  company flows collect MERSİS / trade registry accordingly.
- **Kargo** is abstracted behind `ShippingCarrier` enum; integrations for
  Yurtiçi, MNG, Aras, PTT, Sürat, HepsiJet, Sendeo, Kolay Gelsin live in
  `services/worker/src/providers/shipping/*` (pending).
- **Organic certification** honours the TR-BIO code space (ETKO, CERES,
  IMO, ECOCERT, BCS). The verification queue will cross-check the Tarım
  Bakanlığı registry when the integration is enabled.

---

## 6. Observability

- **Errors**: Sentry (web + admin + mobile + worker) wired through
  `SENTRY_DSN`.
- **Product analytics**: PostHog, hosted in EU by default.
- **Logs**: Pino JSON logs in production; redact list is in
  `@sanda/core/logger` and covers `authorization`, `cookie`, `iban`,
  `tcKimlik`, card data.
- **Tracing**: OpenTelemetry is not wired yet; the `x-request-id` header is
  propagated end-to-end so ad-hoc correlation is already possible.

---

## 7. Testing strategy

- **Unit** (Vitest): `@sanda/core` and `@sanda/validation` have full
  coverage targets for money, commission, IBAN/TC checks, and service-area
  matching.
- **Integration** (Vitest + Prisma test DB): tRPC routers run against a
  disposable Postgres instance spun up in CI.
- **E2E** (Playwright, planned): buyer → seller → admin happy paths.
- **Mobile** (Detox or Maestro, planned): key seller flows (order receipt
  → mark shipped → upload certificate) because that is where offline-first
  correctness matters most.

---

## 8. Contributing

Code style is enforced by Prettier + ESLint; commits are shaped by
Conventional Commits. Branches are merged via squash to keep `main` linear.

### Pull request checklist

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] New migrations have been applied locally (`pnpm db:migrate`)
- [ ] Any user-facing string added to `@sanda/i18n` in both `tr` and `en`
- [ ] No plaintext PII in code, tests, or fixtures

---

## 9. Licence

© Sanda. All rights reserved. No open-source licence granted at this stage.
