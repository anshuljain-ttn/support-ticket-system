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

---

### Architecture Changes

*None yet — initial architecture established.*

---

### Bug Fixes

*None yet — implementation not started.*

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
