# Implementation Log

> Record of every implementation decision, architecture change, bug fix, trade-off, and performance improvement.

---

## Session 1 — 2026-07-15: Planning & Documentation

### Decisions Made

#### D1: No Authentication in v1
- **Decision:** Pass `createdBy` in request body; no JWT/session/auth middleware.
- **Rationale:** Reduces scope for demo project. API designed so auth can be added as middleware later without changing service layer.
- **Trade-off:** Anyone can impersonate any user. Documented as known limitation.

#### D2: Status Machine as Dedicated Service
- **Decision:** `StatusMachineService` as a standalone service, not inline in `TicketService`.
- **Rationale:** Single responsibility, independently testable, reusable if workflow expands.
- **Alternative rejected:** Inline validation in ticket service (harder to test all transitions).

#### D3: No Separate Activity/Audit Log Collection
- **Decision:** Activity timeline derived from ticket `updatedAt`, status field, assignment changes, and comments.
- **Rationale:** YAGNI for v1. Avoids extra collection and sync complexity.
- **Alternative rejected:** Embedded `activities[]` array on ticket (would grow unbounded).

#### D4: MongoDB Text Indexes for Search
- **Decision:** Use MongoDB text indexes on `title`, `description`, and `message` fields.
- **Rationale:** Sufficient for internal tool scale (< 100K tickets). No Elasticsearch dependency.
- **Alternative rejected:** Regex search (poor performance at scale).

#### D5: Monorepo with Two Apps
- **Decision:** Single repository with `frontend/` and `backend/` directories.
- **Rationale:** Simpler local development, shared documentation, single Docker Compose.
- **Alternative rejected:** Separate repos (unnecessary complexity for this scope).

#### D6: Frontend Status Transitions Mirror Backend
- **Decision:** Duplicate transition map in `frontend/src/lib/status-transitions.ts`.
- **Rationale:** Backend returns `allowedTransitions` in detail response; frontend mirror used for dropdown filtering before fetch.
- **Trade-off:** Must keep in sync. Mitigated by backend being source of truth and returning allowed transitions.

#### D7: URL-Synced Filters on Ticket List
- **Decision:** Store filter/search/pagination state in URL `searchParams`.
- **Rationale:** Shareable URLs, browser back/forward works, no global state needed.

#### D8: Pagination Default and Max
- **Decision:** Default `limit=20`, max `limit=100`.
- **Rationale:** Balance between performance and usability.

#### D9: Priority Sort Order
- **Decision:** Critical > High > Medium > Low (custom sort, not alphabetical).
- **Rationale:** Industry standard priority ordering.

#### D10: Seed Script Idempotency
- **Decision:** Seed checks for existing users by email before insert. Fails on duplicate.
- **Rationale:** Safe to run on every Docker startup without duplicating data.

#### D11: DTOs at API Boundary
- **Decision:** Map Mongoose documents to plain DTOs before sending responses.
- **Rationale:** Decouples API contract from database schema. Prevents leaking internal fields.

#### D12: AppError Class for Domain Errors
- **Decision:** Custom `AppError` with `code`, `message`, `statusCode`, `details`.
- **Rationale:** Consistent error handling, type-safe error codes, middleware can format uniformly.

#### D13: Test Database Isolation
- **Decision:** Use separate test database (`support-tickets-test`). Clean collections between test suites.
- **Rationale:** Prevents test pollution, parallel-safe.

#### D14: Docker Multi-Stage Builds
- **Decision:** Both Dockerfiles use multi-stage builds (build → production).
- **Rationale:** Smaller production images, no dev dependencies in runtime.

#### D15: ShadCN UI for Component Library
- **Decision:** Use ShadCN UI (not Material UI, Chakra, etc.).
- **Rationale:** Specified in requirements. Copy-paste components, full Tailwind control, accessible.

---

#### D16: Two Roles Only — Admin and Employee
- **Decision:** Reduce user roles from three (`employee`, `agent`, `admin`) to two (`employee`, `admin`).
- **Rationale:** Simpler role model for v1. Admins cover ticket management duties previously assigned to the `agent` role.
- **Alternative rejected:** Keeping a separate `agent` role (unnecessary distinction for internal tool scope).
- **Impact:** Seed data updated — former `agent` users (Bob, Carol) are now `admin`. No RBAC enforcement in v1; roles are display/metadata only.

#### D17: Docker Compose Profiles for Incremental Setup
- **Decision:** Backend and frontend services use Docker Compose `profiles: [full]`; MongoDB runs without a profile.
- **Rationale:** During early tasks (A2–C12), Dockerfiles do not exist yet. MongoDB can run standalone; full stack activates in Task D1 via `docker compose --profile full up`.
- **Alternative rejected:** Commenting out services entirely (profiles keep structure visible and valid).

### Task A1 — Repository Structure (2026-07-15)
- Created `frontend/`, `backend/`, root `.gitignore`, and skeleton `docker-compose.yml`.
- Traces to **AC-1.1** (monorepo layout per `spec.md` §PROJECT STRUCTURE).

### Task A2 — Backend Project Init (2026-07-15)
- Initialized Express/TypeScript backend with strict `tsconfig`, Vitest, ESLint, Prettier.
- Created full folder structure per `project-context.md` §4.2.
- Added `tsconfig.eslint.json` to lint `tests/` separately from build `rootDir`.
- Traces to **AC-1.2**, **AC-1.3**, **AC-17.6** (`.env.example`).

### Task A3 — Frontend Project Init (2026-07-15)
- Scaffolded Next.js 16 (App Router) with TypeScript, Tailwind v4, ESLint.
- Installed react-hook-form, zod, TanStack Query, axios, lucide-react.
- Initialized ShadCN UI (base-nova style, button + utils).
- Added `QueryProvider` in root layout; created route placeholders for all 5 pages.
- Traces to **AC-1.2**, **AC-12.1–12.5** (page routes scaffolded), **AC-15.2** (Query provider).

### Task B1 — Environment Config & App Bootstrap (2026-07-15)
- Added Zod-validated `config/env.ts` (fail-fast on invalid env per **AC-10.5**).
- Added MongoDB connection with 5-attempt retry and `serverSelectionTimeoutMS: 5000`.
- Added `createApp()` factory with CORS + JSON parsing; `server.ts` with graceful shutdown.
- Added typed API response envelope helpers matching `spec.md` §6.1 (**AC-2.3**).
- Added unit tests for success/failure envelope format.
- MongoDB live connection not verified in CI environment (no Docker/MongoDB locally); retry logic confirmed via startup logs.

### Task B2 — Middleware Stack (2026-07-15)
- Added `requestLogger`, `errorHandler`, `validate` (Zod factory), `notFoundHandler`.
- Added `AppError`, `ErrorCodes`, `isValidObjectId` utility.
- Wired middleware in `app.ts` per `spec.md` §8.2 order.
- Unit tests cover 404, AppError, validation, and internal error envelopes (**AC-2.3**, **AC-2.6**, **AC-8.11**).

### Task B3 — Health Endpoint (2026-07-15)
- Added `GET /health` returning `{ status, timestamp, uptime }` in success envelope.
- Traces to **AC-2.1**, **AC-2.2**.

### Task B5 — Ticket Model & Repository (2026-07-15)
- Added ticket types, Mongoose model with indexes per `project-context.md` §6.2.
- Added `ALLOWED_TRANSITIONS` constant (service layer follows in B6).
- Added `ticketRepository` with CRUD, filter/search, pagination, priority sort via aggregation.
- Added `utils/pagination.ts` for shared page/limit handling.
- Integration tests verify indexes, CRUD, filters, and priority sorting.
- Traces to **spec.md** §4.2, **FR-T01–T05**, **FR-Q01–Q06**, **NFR-16**.

### Task B6 — Status Machine Service (2026-07-15)
- Added `statusMachineService` with `canTransition`, `validateTransition`, `getAllowedTransitions`.
- Invalid transitions throw `AppError` with `INVALID_STATUS_TRANSITION` (**AC-5.11**).
- Same-status transitions allowed (idempotent per spec edge cases E10/E11).
- 20 unit tests cover all **AC-5.1–AC-5.10** scenarios plus **AC-5.13**.

### Task B7 — Ticket Validators & DTOs (2026-07-15)
- Added `common.validator.ts` (ObjectId, pagination, string-array query parsing).
- Added `ticket.validator.ts` for create, update, status patch, list, and search queries.
- Added `ticket.dto.ts` mapping documents to API records and paginated responses.
- 14 unit tests for validators and DTOs per `spec.md` §7.1–7.3 and §6.3.

### Task B4 — User Model & Seed Script (2026-07-15, re-implemented)
- Restored user model, repository, service, `GET /users`, and seed script after accidental revert.
- Added `ensureUserExists` helper for ticket service user validation.
- Traces to **FR-U01–U05**, **AC-3.1–AC-3.5**.

### Task B8 — Ticket Service (2026-07-15)
- Added `ticketService` with create, detail, update, status patch, list, search, and stats.
- Added minimal comment model/repository for detail view and search-in-comments.
- Search unions ticket text matches with comment text matches.
- 7 integration tests for service business logic.

### Task B9 — Ticket Controller & Routes (2026-07-15)
- Added `ticket.controller.ts` with handlers for list, search, detail, create, update, and status patch.
- Added `ticket.routes.ts` with Zod validation on body, query, and params.
- Mounted ticket routes in `routes/index.ts` (`/tickets`, `/tickets/search`, `/tickets/:id`, etc.).
- Added 7 REST integration tests covering AC-4.1–AC-4.7.
- Traces to **FR-T01–FR-T07**, **FR-Q07–FR-Q08**, **AC-4.1–AC-4.7**.

### Task B10 — Comment Service & Routes (2026-07-15)
- Model, repository, and DTO already existed from B8; added validator, service, controller, and route.
- `POST /tickets/:id/comments` validates ticket/user existence and returns 201 with comment DTO.
- Added 4 REST integration tests covering AC-6.1–AC-6.4 and empty-message validation.
- Traces to **FR-C01–FR-C04**, **AC-6.1–AC-6.4**, **AC-8.10**.

### Task B11 — Swagger / OpenAPI (2026-07-15)
- Added `config/swagger.ts` with swagger-jsdoc and shared component schemas.
- Added `docs/openapi.paths.ts` with JSDoc path definitions for all 9 operations.
- Mounted Swagger UI at `/api-docs` and raw spec at `/api-docs.json`.
- Added 4 unit tests covering AC-9.1–AC-9.3.

### Task B12 — Backend Integration Tests (2026-07-15)
- Added `tests/helpers/test-db.ts` (memory DB lifecycle, seed, cleanup) and `tests/helpers/test-app.ts` (app factory, API helpers).
- Updated `tests/setup.ts` to set `NODE_ENV=test`.
- Added `status-machine.test.ts` covering AC-5.1–AC-5.12 via REST API.
- Added `validation.test.ts` covering AC-8.1–AC-8.11.
- Refactored `tickets.test.ts`, `comments.test.ts`, and `users.test.ts` to use shared helpers.
- 96 tests passing with isolated MongoMemoryServer per integration suite.

### Task B13 — Backend Dockerfile (2026-07-15)
- Added multi-stage `backend/Dockerfile` (Node 20 Alpine build + production).
- Added `backend/.dockerignore` excluding tests, env files, and dev artifacts.
- HEALTHCHECK hits `GET /health` via curl.
- Fixed production build: `tsc-alias` rewrites path aliases; swagger resolves `.ts`/`.js` OpenAPI paths file.
- Verified `docker build` succeeds.

### Task C1 — API Client & Types (2026-07-15)
- Added `services/api-client.ts` with Axios instance, error parsing, and response interceptor.
- Added `types/api.types.ts`, `types/ticket.types.ts`, and `types/user.types.ts` mirroring backend contracts.
- Wired `QueryProvider` to shared `createQueryClient()` from `lib/query-client.ts`.

### Task C2 — API Service Layer (2026-07-15)
- Added `ticket.service.ts` for list, search, detail, create, update, and status patch API calls.
- Added `user.service.ts` (`getUsers`) and `comment.service.ts` (`addComment`).
- Added `lib/status-transitions.ts` mirroring backend workflow rules for UI use.
- Query param serializer supports repeated array keys for status/priority filters.

### Task C3 — TanStack Query Hooks (2026-07-15)
- Added `hooks/ticket-keys.ts` for stable TanStack Query cache keys.
- Added `use-tickets` (list/search + `useCreateTicket`), `use-ticket` (detail + update mutations), `use-users`, `use-comments`, and `use-ticket-stats`.
- Added `getTicketStats()` to ticket service (client-side aggregation until a dedicated API exists).
- Mutations invalidate list, detail, and stats queries as appropriate.

### Task C4 — Layout & Navigation (2026-07-15)
- Added `header.tsx`, `sidebar.tsx`, `page-container.tsx`, and `app-shell.tsx` with responsive mobile nav.
- Added `app-providers.tsx` (Query + Sonner toast) and `components/ui/sonner.tsx`.
- Updated root `layout.tsx` and all placeholder pages to use shared shell and page container.
- Added `sonner` dependency for toast notifications.

### Task C5 — Shared UI Components (2026-07-15)
- Added common components: `empty-state`, `error-state`, `loading-skeleton`, `pagination`.
- Added ticket components: `status-badge`, `priority-badge` with per-status/priority color coding.
- Added base `components/ui/badge.tsx`.
- Toast via Sonner already wired in C4; showcase page at `/dev/ui` verifies all components.
- Traces to **FR-UI01**, **AC-13.1**, **AC-13.8**, **AC-13.11**, **AC-13.12**.

### Task C6 — Dashboard Page (2026-07-15)
- Added `stats-cards.tsx` showing counts for all 5 ticket statuses.
- Added `recent-tickets-table.tsx` and `dashboard-view.tsx` with live API data.
- Dashboard uses `useTicketStats` and `useTickets` (5 newest tickets) with loading/error states.
- Traces to **US-11**, **AC-12.1**.

### Task C7 — Ticket List Page (2026-07-15)
- Added `lib/ticket-list-params.ts` for URL `searchParams` parse/serialize/merge (filters, sort, pagination).
- Added `lib/format.ts` with shared `formatShortDate()` used by dashboard and ticket table.
- Added `ticket-table.tsx`, `ticket-filters.tsx`, and `ticket-list-view.tsx` with status/priority/assignee filters, search, sort, and pagination.
- Wired `app/tickets/page.tsx` with `Suspense` boundary for `useSearchParams`.
- Search field uses keyed remount (`SearchField`) to sync URL query without `useEffect` setState (eslint `react-hooks/set-state-in-effect`).
- Verified: `npm run typecheck` and `npm run lint` pass. `npm run build` blocked by Google Fonts fetch in sandbox (pre-existing layout dependency).
- Traces to **US-2**, **US-3**, **AC-12.2**, **AC-12.3**, **D7**.

### Task C8 — Create Ticket Page (2026-07-15)
- Added `schemas/ticket.schema.ts` with Zod validation aligned to backend rules.
- Added `ticket-form.tsx` (create mode) and `create-ticket-view.tsx` with React Hook Form + user selector.
- Wired `app/tickets/new/page.tsx` with success toast and redirect to ticket detail.
- Traces to **US-1**, **FR-F04**, **AC-12.4**.

### Task C9 — Ticket Detail Page (2026-07-15)
- Added `ticket-detail-view.tsx` with ticket info, badges, and metadata.
- Added `comment-form.tsx`, `comment-timeline.tsx`, `status-select.tsx`, `assignment-select.tsx`, and `activity-timeline.tsx`.
- Added `lib/activity-timeline.ts` to derive activity from ticket metadata and comments (no audit collection).
- Wired `app/tickets/[id]/page.tsx` with 404/invalid-id error handling.
- Traces to **US-4**, **US-5**, **FR-F03**, **FR-UI02**, **FR-UI03**, **AC-12.5**.

### Task C10 — Edit Ticket Page (2026-07-15)
- Reused `ticket-form.tsx` in edit mode via `edit-ticket-view.tsx`.
- Pre-populates from `useTicket`; updates via PUT; redirects to detail on success.
- Traces to **US-6**, **FR-F05**, **AC-12.6**.

### Task C11 — Error & Loading Pages (2026-07-15)
- Added root `loading.tsx`, `error.tsx`, and `not-found.tsx`.
- Added `app/tickets/loading.tsx` for list route skeleton.
- Ticket detail/edit views include API-level 404 and retry error states.
- Traces to **FR-F07**, **FR-F08**, **AC-13.9**, **AC-13.10**.

### Task C12 — Frontend Dockerfile (2026-07-15)
- Added multi-stage `frontend/Dockerfile` with Next.js `standalone` output.
- Added `frontend/.dockerignore` and `output: 'standalone'` in `next.config.ts`.
- `docker build` not verified locally (Docker CLI unavailable in environment).
- Traces to **AC-17.4**, **D14**.

### Task D1 — Docker Compose (2026-07-15)
- Finalized `docker-compose.yml` with MongoDB, backend, and frontend (no profiles).
- Added service health checks and `depends_on` with `service_healthy` conditions.
- Added `docker-seed.ts` + `docker-entrypoint.sh` for idempotent user seed on backend startup.
- Named volume `mongodb_data` for MongoDB persistence.
- Traces to **AC-17.1**, **AC-17.2**, **AC-17.3**, **D17**.

### Task D2 — Root README (2026-07-15)
- Rewrote `README.md` with architecture overview, folder structure, features, env vars, local dev, Docker guide, testing, API table, and future improvements.
- Removed "scaffolding in progress" notice; updated stack versions (Next.js 16).
- Traces to **AC-18.1–18.6**.

### Task D3 — Final Verification & Cleanup (2026-07-15)
- Backend: 96/96 tests pass, typecheck and lint pass.
- Frontend: typecheck and lint pass.
- Fixed backend lint: added vitest `expect` import in `test-app.ts`, removed unused import in `validation.test.ts`.
- No `TODO`/`FIXME` in production source code.
- Docker end-to-end not verified (Docker CLI unavailable in environment).
- Traces to **AC-1.4**, acceptance criteria verification.

---

## v2.0 — Auth, RBAC, Audit & SaaS UI

### Decision D18: v2.0 Major Refactor
- **Decision:** Add JWT auth, RBAC, ownership rules, embedded audit history, and SaaS UI redesign.
- **Rationale:** Evolved requirements for production-quality security and maintainability.
- **Impact:** Supersedes v1 no-auth model; `createdBy` will come from JWT in later tasks.

### Decision D19: Role Values
- **Decision:** Use `SUPER_ADMIN`, `ADMIN`, `EMPLOYEE` as stored role enum values.
- **Rationale:** Aligns with spec; distinct from v1 lowercase roles.

### Decision D20: Password & JWT Config
- **Decision:** bcrypt (12 rounds); JWT in HTTP-only cookie (implemented in E3); env-validated secrets.
- **Rationale:** Industry standard; fail-fast on missing `JWT_SECRET`.

### Task E1 — Workflow Documentation Refresh (2026-07-15)
- Rewrote `spec.md` v2.0.0 with auth, RBAC, ownership, audit, and UI requirements.
- Added v2 phases E–K to `tasks.md`; appended AC-19–AC-23 to `acceptance-criteria.md`.
- Updated `project-context.md` and `cursor-rules-or-instructions.md` for auth/RBAC rules.

### Task E2 — User Model, Roles & Seed Users (2026-07-15)
- Added `constants/roles.ts`, `utils/password.ts`, `utils/avatar.ts`.
- Extended user model: `password` (select:false), `avatar`, `isActive`, `createdAt`.
- Seed: 1 SUPER_ADMIN, 2 ADMIN, 3 EMPLOYEE with bcrypt-hashed `SEED_DEFAULT_PASSWORD`.
- Added JWT/cookie env vars to `config/env.ts` and `.env.example`.
- Traces to **AC-22.1–AC-22.3**.

### Tasks E3–E5 — Auth, Middleware & Permission Service (2026-07-15)
- `auth.service.ts`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`.
- HTTP-only JWT cookie via `cookie-parser`; CORS `credentials: true`.
- `permission.service.ts` centralizes RBAC + ownership; `authenticate` middleware.
- Traces to **AC-19**, **AC-20.8**.

### Tasks F1–F3 — Audit History, RBAC Tickets, Dashboard (2026-07-15)
- Ticket model: `history[]`, `lastUpdatedBy`; `audit.service.ts`.
- Ticket/comment services use auth user (no `createdBy` in body).
- `PATCH /tickets/:id/assign`; `GET /dashboard/stats` role-aware.
- Scoped list/search; ticket detail returns `permissions` flags for frontend UX.
- Fixed route mounting: protected routes under `/tickets` prefix only.
- Traces to **AC-21**, **AC-20**, **AC-23.5**.

### Tasks G1–G3 — Backend Tests v2 (2026-07-15)
- Added `auth.test.ts`, `permissions.test.ts`, `permission.service.test.ts`.
- Updated all integration tests for cookie auth. **137 tests passing**.

### Session — 2026-07-15: Deeper Unit & Failure-Mode Tests
- Expanded `permission.service.test.ts` with `getTicketListFilter`, admin ownership edge cases, all `assertCan*` methods, and `getAllowedTransitionsForUser` status matrix.
- Expanded `status-machine.test.ts` with per-status `getAllowedTransitions`, terminal-state rejection, and error detail assertions.
- Added `failure-modes.test.ts` integration suite: list/search scope isolation, permission-before-state-machine ordering, idempotent status PATCH, permission flags on detail response, and audit history on status/assign.
- Documented four real bugs and a debugging guide in the Bug Fixes section below.
- Updated `swagger.test.ts` endpoint count (9 → 12) for v2 auth routes.
- **174 tests passing**.

### Session — 2026-07-15: AI Workflow Visibility
- Created root `AI-WORKFLOW.md` — reviewer entry point with tool, approach, artifact index, context strategy, iteration examples, verification commands.
- Added prominent "AI Workflow" section to root `README.md` with direct links to all artifacts.
- Added `tool-specific/cursor-workflow/README.md` as folder index pointing back to root guide.
- Updated `prompt-history.md` with Prompts 23–25 (test deepening, visibility feedback, visibility fix).
- **Why:** Review feedback scored AI Workflow 10/25 — artifacts existed but were buried; now visible from README first screen.

### Session — 2026-07-15: tool-workflow.md Submission
- Created `tool-workflow.md` at repo root — required submission covering all 11 rubric sections with project-specific examples.
- Linked from README (primary deliverable), AI-WORKFLOW.md, and cursor-workflow README.
- Logged as Prompt 26 in `prompt-history.md`.

### Task H1 — Swagger v2 (2026-07-15)
- Added Auth tag and login/logout/me OpenAPI paths; updated User schema.

### Tasks I1–I2 — Frontend Auth (2026-07-15)
- `auth.service.ts`, `AuthProvider`, login page, Next.js middleware, `withCredentials`.

### Tasks J1–J5 — Frontend SaaS UI (2026-07-15)
- Theme provider (dark mode), redesigned shell, role-aware dashboard.
- Permission-gated ticket actions; audit history timeline; profile/settings pages.
- Route group `(app)` for protected pages.

### Tasks K1–K2 — Docker & README v2 (2026-07-15)
- Docker compose includes `JWT_SECRET`, `SEED_DEFAULT_PASSWORD`.
- README rewritten for auth, RBAC, ownership, seed users, testing.

---

### Architecture Changes

#### v2.0 (2026-07-15)
- Introduced authentication layer (JWT + bcrypt) and three-tier RBAC.
- PermissionService and audit `history[]` planned for Phase F.
- v1 derived activity timeline will be replaced by embedded audit history.

---

### Bug Fixes

#### Bug Fix: Protected Routes Mounted at Wrong Prefix (v2)
- **Issue:** After adding auth middleware, ticket and comment routes returned 404 for all authenticated requests.
- **Root cause:** Protected routes were mounted at the app root (`/`) instead of under `/tickets`, so paths like `GET /tickets/:id` never matched.
- **How it was debugged:** Logged incoming request paths in the error middleware; compared `routes/index.ts` mount points against integration test URLs. Supertest calls failed with 404 while route handlers were never invoked.
- **Fix:** Remounted protected ticket routes under the `/tickets` prefix only; left `/auth` and `/health` at root.
- **Files:** `backend/src/routes/index.ts`

#### Bug Fix: Swagger OpenAPI Paths Missing in Production Build
- **Issue:** `GET /api-docs` returned an empty spec in the Docker production image.
- **Root cause:** `swagger-jsdoc` glob pointed at `.ts` source files, which are not copied into the production image after `tsc` compile.
- **How it was debugged:** Built the Docker image locally, hit `/api-docs.json`, and confirmed zero paths. Compared dev (ts-node) vs prod (compiled `.js`) file resolution.
- **Fix:** Updated swagger config to resolve both `.ts` (dev) and `.js` (prod) OpenAPI path files; added `tsc-alias` for path alias rewriting in the build step.
- **Files:** `backend/src/config/swagger.ts`, `backend/Dockerfile`, `backend/package.json`

#### Bug Fix: Employee Status Change Returned 400 Instead of 403
- **Issue:** When an employee attempted a workflow transition they were not permitted to perform (e.g. `Open → Resolved`), the API returned `INVALID_STATUS_TRANSITION` (400) instead of `FORBIDDEN` (403).
- **Root cause:** `ticket.service.updateStatus` called `validateTransition` before `assertCanChangeStatus`, so the state machine rejected the request before the permission layer ran.
- **How it was debugged:** Wrote a failing integration test expecting 403; traced the call order in `ticket.service.ts` and confirmed permission checks ran second.
- **Fix:** Reordered `updateStatus` to call `assertCanChangeStatus` before `validateTransition`.
- **Files:** `backend/src/services/ticket.service.ts`
- **Regression test:** `backend/tests/integration/failure-modes.test.ts` — "employee Open -> Resolved returns 403"

#### Bug Fix: Vitest Helper Missing `expect` Import
- **Issue:** Backend lint failed in CI on `tests/helpers/test-app.ts`.
- **Root cause:** `expectValidationError` used `expect` without importing it from vitest.
- **Fix:** Added `import { expect } from 'vitest'`.
- **Files:** `backend/tests/helpers/test-app.ts`

---

### Debugging Guide

| Symptom | How to debug |
|---------|--------------|
| 401 on all API calls | Check JWT cookie name matches `AUTH_COOKIE_NAME` / `NEXT_PUBLIC_AUTH_COOKIE_NAME`; verify `withCredentials: true` on frontend Axios |
| 403 on ticket access | Inspect `permission.service.ts` — check role, ownership (`createdBy`), and `assignedTo` |
| 400 `INVALID_STATUS_TRANSITION` | Check `status-transitions.ts` map; confirm permission check ran first (should be 403 if role lacks access) |
| Empty ticket list for admin | Verify `getTicketListFilter` scope — admin sees own tickets, assigned tickets, and active non-own tickets |
| Swagger empty in Docker | Confirm production build resolves `.js` OpenAPI paths (see bug fix above) |
| Test DB pollution | Each suite uses `MongoMemoryServer` + `clearTestDatabase()` in `afterEach` |

**Runtime logging:** Set `LOG_LEVEL=debug` in `backend/.env` to enable HTTP request/response logging via `logger.middleware.ts`.

**Test commands:**
```bash
cd backend && npm test                              # full suite
cd backend && npx vitest run tests/unit             # unit only
cd backend && npx vitest run tests/integration      # integration only
cd backend && npx vitest run tests/integration/failure-modes.test.ts  # edge cases
```

---

### Performance Improvements

*None yet — implementation not started.*

---

## Template for Future Entries

```markdown
### Session N — YYYY-MM-DD: <Title>

#### D<N>: <Decision Title>
- **Decision:** <What was decided>
- **Rationale:** <Why>
- **Alternative rejected:** <What else was considered>
- **Trade-off:** <Any downsides>

### Bug Fix: <Title>
- **Issue:** <What was broken>
- **Root cause:** <Why>
- **Fix:** <What changed>
- **Files:** <Affected files>
```
