# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Logoviking SaaS Artifact

`artifacts/logoviking` is a production React+Vite SaaS frontend that hosts 26 creator/image/SEO tools, plus a 25-post blog, pricing, dashboard, auth, and full legal/marketing pages. It is paired with `artifacts/api-server`, which exposes the tool calculations, blog content, contact form, and auth endpoints under `/api/*`.

### Routing (wouter)

- `/` — landing page
- `/tools` — tool grid + category filter + search
- `/tools/:slug` — individual tool page (rendered through `components/tools/index.tsx` dispatcher → `ApiTools.tsx` for backend tools, `ImageTools.tsx` for client-side canvas tools)
- `/blog`, `/blog/:slug` — blog list and post detail (content from `/api/blog`)
- `/pricing`, `/dashboard`, `/login`, `/signup`
- `/about`, `/contact`, `/faq`
- `/privacy-policy`, `/terms-of-service`, `/cookie-policy`, `/disclaimer`, `/dmca` (share `_LegalLayout.tsx`)

### Tool layout

Every tool page uses `ToolPageLayout` (helmet meta + breadcrumb + ad slot + related tools sidebar). Result UI uses shared `ResultCard`, `CopyButton`, `CodeBlock`, `ListResult` from `components/tool/ResultParts.tsx`. Tool catalog + categories live in `lib/tools.ts`.

### API tools (backed by api-server)

Mutation hooks come from `@workspace/api-client-react` (orval-generated from `lib/api-spec/openapi.yaml`). Endpoints live at `artifacts/api-server/src/routes/{tools,blog,auth,user,contact,sitemap}.ts`. After editing `openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen`.

### Image tools (client-side)

Pure browser canvas operations (compress, resize, crop, convert, watermark, color picker, mock background remover). No upload — files stay local; output via `URL.createObjectURL`.

### Auth

Email + password and Google OAuth, server-side session cookie, surface via `components/auth/AuthContext.tsx` (`useGetCurrentUser`). DB schema in `lib/db/src/schema/index.ts` (`usersTable` with optional `passwordHash`, `googleId`, `avatarUrl`, `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`; `sessionsTable`, `usageHistoryTable`, `contactsTable`). Google OAuth flow lives in `artifacts/api-server/src/lib/auth.ts` and `routes/auth.ts` (`GET /api/auth/google` → consent; `GET /api/auth/google/callback` → exchange + find-or-link by `googleId` then email, then session, redirect to `/dashboard`). Requires secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; without them the button gracefully redirects to `/login?error=google_not_configured`. Login/signup pages render `components/auth/GoogleButton.tsx` and `OAuthErrorBanner.tsx`.

### Billing (Stripe)

Pro subscriptions are powered by the Replit Stripe integration plus `stripe-replit-sync`, which mirrors Stripe data into a local `stripe.*` schema. On startup the api-server runs `runMigrations()`, configures a managed webhook at `/api/stripe/webhook`, and kicks off `syncBackfill()`. The webhook route is registered BEFORE `express.json()` in `app.ts` so the raw Buffer reaches `WebhookHandlers.processWebhook`. Plan state is derived in `getUserFromRequest` by joining the user's `stripeCustomerId` against `stripe.subscriptions`; the result is cached back onto `usersTable` (`plan`, `subscriptionStatus`, `stripeSubscriptionId`). Endpoints live in `artifacts/api-server/src/routes/billing.ts`: `GET /api/billing/plans`, `POST /api/billing/checkout` (creates customer + Checkout Session), `POST /api/billing/portal` (Customer Portal). Frontend uses `useListBillingPlans`, `useCreateBillingCheckout` on `/pricing`, and `useCreateBillingPortal` on `/dashboard`. Seed Pro Plan + monthly $9 price with `pnpm --filter @workspace/scripts run seed-stripe`.

**To enable Stripe at launch:**

1. In the Integrations panel, connect the Stripe integration (the `stripe` connector). The user dismissed it during the initial build; calling `proposeIntegration("connector:ccfg_stripe_01K611P4YQR0SZM11XFRQJC44Y")` will re-prompt them.
2. Restart the api-server workflow. On boot, `initStripe()` will run `runMigrations()` (creates the `stripe.*` schema), register the managed webhook at `https://${REPLIT_DOMAINS}/api/stripe/webhook`, and start `syncBackfill()`.
3. Run `pnpm --filter @workspace/scripts run seed-stripe` once to create the Pro Plan product and monthly $9 USD price in Stripe (idempotent — safe to re-run).
4. Until Stripe is connected, `GET /api/billing/plans` returns `{ plans: [], configured: false }` and the pricing page renders a "Notify me when ready" CTA instead of "Upgrade to Pro" — no errors thrown, no broken flows.

### Theming

Viking gold/amber primary, defined in `artifacts/logoviking/src/index.css`. Light/dark via `next-themes`. Logo + open graph in `artifacts/logoviking/public/images/`.
