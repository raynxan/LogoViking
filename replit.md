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

Email + password and Google OAuth, server-side session cookie, surface via `components/auth/AuthContext.tsx` (`useGetCurrentUser`). DB schema in `lib/db/src/schema/index.ts` (`usersTable` with optional `passwordHash`, `googleId`, `avatarUrl`; `sessionsTable`, `usageHistoryTable`, `contactsTable`). Google OAuth flow lives in `artifacts/api-server/src/lib/auth.ts` and `routes/auth.ts` (`GET /api/auth/google` → consent; `GET /api/auth/google/callback` → exchange + find-or-link by `googleId` then email, then session, redirect to `/dashboard`). Requires secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; without them the button gracefully redirects to `/login?error=google_not_configured`. Login/signup pages render `components/auth/GoogleButton.tsx` and `OAuthErrorBanner.tsx`.

### Theming

Viking gold/amber primary, defined in `artifacts/logoviking/src/index.css`. Light/dark via `next-themes`. Logo + open graph in `artifacts/logoviking/public/images/`.
