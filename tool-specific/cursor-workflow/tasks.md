# Implementation Tasks

> **Approach:** Complete each task fully before moving to the next. Verify (build, lint, test) after each task. Suggest a git commit message upon completion.

---

## Phase A — Project Scaffolding

### Task A1: Initialize Repository Structure
**Status:** Complete  
**Scope:**
- Create root `README.md` (skeleton)
- Create `frontend/` and `backend/` directories
- Create `docker-compose.yml` (skeleton)
- Create `.gitignore`

**Verify:** Directory structure matches spec  
**Commit:** `chore: initialize monorepo structure`

---

### Task A2: Initialize Backend Project
**Status:** Complete  
**Scope:**
- `package.json` with dependencies (express, mongoose, zod, dotenv, cors, swagger)
- Dev dependencies (typescript, vitest, supertest, eslint, prettier, @types/*)
- `tsconfig.json` with strict mode and path aliases
- `vitest.config.ts`
- ESLint + Prettier config
- `.env.example`
- Folder structure per `project-context.md`

**Verify:** `npm install` succeeds, `npx tsc --noEmit` passes  
**Commit:** `chore(backend): initialize express typescript project`

---

### Task A3: Initialize Frontend Project
**Status:** Complete  
**Scope:**
- Next.js 15 with App Router, TypeScript, TailwindCSS
- Install: react-hook-form, zod, @tanstack/react-query, axios, lucide-react
- Initialize ShadCN UI
- `tsconfig.json`, ESLint, Prettier
- `.env.example`
- Folder structure per `project-context.md`
- Query provider in root layout

**Verify:** `npm run dev` starts without errors  
**Commit:** `chore(frontend): initialize next.js project with shadcn`

---

## Phase B — Backend Core

### Task B1: Environment Config & App Bootstrap
**Status:** Complete  
**Scope:**
- `config/env.ts` — Zod-validated environment variables
- `config/database.ts` — MongoDB connection with retry
- `app.ts` — Express setup (cors, json parser, routes mount)
- `server.ts` — Entry point, graceful shutdown
- `types/api-response.types.ts`
- `utils/api-response.ts` — `success()` and `failure()` helpers

**Verify:** Server starts, connects to MongoDB  
**Commit:** `feat(backend): add env config and express bootstrap`

---

### Task B2: Middleware Stack
**Status:** Complete  
**Scope:**
- `middleware/logger.middleware.ts` — Request/response logging
- `middleware/error.middleware.ts` — Global error handler with envelope
- `middleware/validate.middleware.ts` — Zod schema validator factory
- `middleware/not-found.middleware.ts` — 404 handler
- `utils/object-id.ts` — ObjectId validation helper
- `constants/error-codes.ts`

**Verify:** Error middleware returns correct envelope format  
**Commit:** `feat(backend): add middleware stack and error handling`

---

### Task B3: Health Endpoint
**Status:** Complete  
**Scope:**
- `controllers/health.controller.ts`
- `routes/health.routes.ts`
- Returns `{ status: 'ok', timestamp, uptime }`

**Verify:** `GET /health` returns 200  
**Commit:** `feat(backend): add health check endpoint`

---

### Task B4: User Model & Seed Script
**Status:** Complete  
**Scope:**
- `models/user.model.ts` — Schema with unique email index
- `repositories/user.repository.ts` — `findAll`, `findById`, `findByEmail`
- `services/user.service.ts`
- `controllers/user.controller.ts`
- `routes/user.routes.ts` — `GET /users`
- `scripts/seed.ts` — Seed 5 users, fail on duplicate email
- npm script: `npm run seed`

**Verify:** Seed runs, `GET /users` returns 5 users, duplicate seed fails  
**Commit:** `feat(backend): add user model, seed script, and list endpoint`

---

### Task B5: Ticket Model & Repository
**Status:** Complete  
**Scope:**
- `models/ticket.model.ts` — Schema with indexes
- `types/ticket.types.ts` — Status, Priority enums
- `repositories/ticket.repository.ts` — CRUD + query builder
- `constants/status-transitions.ts`

**Verify:** Model compiles, indexes created  
**Commit:** `feat(backend): add ticket model and repository`

---

### Task B6: Status Machine Service
**Status:** Complete  
**Scope:**
- `services/status-machine.service.ts`
  - `canTransition(from, to): boolean`
  - `validateTransition(from, to): void`
  - `getAllowedTransitions(from): TicketStatus[]`
- Unit tests for all transitions

**Verify:** All state machine unit tests pass  
**Commit:** `feat(backend): add status machine service with tests`

---

### Task B7: Ticket Validators & DTOs
**Status:** Complete  
**Scope:**
- `validators/ticket.validator.ts` — Create, update, status patch, query schemas
- `validators/common.validator.ts` — ObjectId, pagination schemas
- `dto/ticket.dto.ts` — Response mapping functions

**Verify:** Validator unit tests pass  
**Commit:** `feat(backend): add ticket validators and DTOs`

---

### Task B8: Ticket Service
**Status:** Complete  
**Scope:**
- `services/ticket.service.ts`
  - `createTicket(dto)` — default status Open, validate users
  - `getTicketById(id)` — with comments and allowed transitions
  - `updateTicket(id, dto)` — validate status transitions on PUT
  - `updateStatus(id, status)` — PATCH path
  - `listTickets(query)` — filters, sort, pagination
  - `searchTickets(query)` — keyword + filters
  - `getStats()` — count by status

**Verify:** Service methods work via manual testing  
**Commit:** `feat(backend): add ticket service with business logic`

---

### Task B9: Ticket Controller & Routes
**Status:** Complete  
**Scope:**
- `controllers/ticket.controller.ts`
- `routes/ticket.routes.ts`
  - `GET /tickets`
  - `GET /tickets/search`
  - `GET /tickets/:id`
  - `POST /tickets`
  - `PUT /tickets/:id`
  - `PATCH /tickets/:id/status`

**Verify:** All endpoints respond correctly via curl/Postman  
**Commit:** `feat(backend): add ticket REST endpoints`

---

### Task B10: Comment Model, Service & Routes
**Status:** Complete  
**Scope:**
- `models/comment.model.ts`
- `repositories/comment.repository.ts`
- `validators/comment.validator.ts`
- `dto/comment.dto.ts`
- `services/comment.service.ts`
- `controllers/comment.controller.ts`
- `POST /tickets/:id/comments` route

**Verify:** Comments created and returned in ticket detail  
**Commit:** `feat(backend): add comment model and endpoints`

---

### Task B11: Swagger / OpenAPI
**Status:** Complete  
**Scope:**
- Install `swagger-jsdoc` + `swagger-ui-express`
- OpenAPI spec for all endpoints
- Swagger UI at `/api-docs`

**Verify:** Swagger UI loads, all endpoints documented  
**Commit:** `feat(backend): add swagger openapi documentation`

---

### Task B12: Backend Integration Tests
**Status:** Complete  
**Scope:**
- `tests/setup.ts` — Test DB connection
- `tests/helpers/test-app.ts` — App factory
- `tests/helpers/test-db.ts` — Seed and cleanup
- `tests/integration/status-machine.test.ts` — All transition tests
- `tests/integration/tickets.test.ts` — CRUD tests
- `tests/integration/validation.test.ts` — Bad IDs, missing fields
- `tests/integration/comments.test.ts` — Comment tests

**Verify:** `npm test` — all tests pass  
**Commit:** `test(backend): add integration tests for api and state machine`

---

### Task B13: Backend Dockerfile
**Status:** Pending  
**Scope:**
- Multi-stage Dockerfile (build + production)
- `.dockerignore`
- Health check instruction

**Verify:** `docker build` succeeds  
**Commit:** `chore(backend): add dockerfile`

---

## Phase C — Frontend Core

### Task C1: API Client & Types
**Status:** Pending  
**Scope:**
- `services/api-client.ts` — Axios instance, interceptors, error parsing
- `types/api.types.ts` — Response envelope types
- `types/ticket.types.ts`, `types/user.types.ts`
- `lib/query-client.ts`

**Verify:** Types compile, client configured  
**Commit:** `feat(frontend): add api client and shared types`

---

### Task C2: API Service Layer
**Status:** Pending  
**Scope:**
- `services/ticket.service.ts` — All ticket API calls
- `services/user.service.ts` — `getUsers()`
- `services/comment.service.ts` — `addComment()`
- `lib/status-transitions.ts` — Mirror backend transitions

**Verify:** Services typed correctly  
**Commit:** `feat(frontend): add api service layer`

---

### Task C3: TanStack Query Hooks
**Status:** Pending  
**Scope:**
- `hooks/use-tickets.ts` — List with filters
- `hooks/use-ticket.ts` — Single ticket detail
- `hooks/use-users.ts` — User list
- `hooks/use-comments.ts` — Add comment mutation
- `hooks/use-ticket-stats.ts` — Dashboard stats

**Verify:** Hooks export correct query keys and mutations  
**Commit:** `feat(frontend): add tanstack query hooks`

---

### Task C4: Layout & Navigation
**Status:** Pending  
**Scope:**
- `components/layout/header.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/page-container.tsx`
- Root `layout.tsx` with providers (Query, Toast)
- Responsive navigation

**Verify:** Layout renders on all pages  
**Commit:** `feat(frontend): add app layout and navigation`

---

### Task C5: Shared UI Components
**Status:** Pending  
**Scope:**
- `components/common/empty-state.tsx`
- `components/common/error-state.tsx`
- `components/common/loading-skeleton.tsx`
- `components/common/pagination.tsx`
- `components/tickets/status-badge.tsx`
- `components/tickets/priority-badge.tsx`
- Toast setup (ShadCN Sonner)

**Verify:** Components render in Storybook or test page  
**Commit:** `feat(frontend): add shared ui components`

---

### Task C6: Dashboard Page
**Status:** Pending  
**Scope:**
- `app/page.tsx` — Dashboard
- `components/dashboard/stats-cards.tsx` — 5 status counts
- Recent tickets table (subset of ticket table)
- Loading skeletons

**Verify:** Dashboard shows live stats from API  
**Commit:** `feat(frontend): add dashboard with statistics`

---

### Task C7: Ticket List Page
**Status:** Pending  
**Scope:**
- `app/tickets/page.tsx`
- `components/tickets/ticket-table.tsx`
- `components/tickets/ticket-filters.tsx` — Status, priority, assignee, search
- URL-synced filters via `searchParams`
- Pagination

**Verify:** List, filter, sort, paginate works  
**Commit:** `feat(frontend): add ticket list with filters and pagination`

---

### Task C8: Create Ticket Page
**Status:** Pending  
**Scope:**
- `app/tickets/new/page.tsx`
- `components/tickets/ticket-form.tsx`
- `schemas/ticket.schema.ts` — Zod schema
- React Hook Form integration
- User selector for `createdBy`
- Success toast + redirect to detail

**Verify:** Form validates, creates ticket, redirects  
**Commit:** `feat(frontend): add create ticket page`

---

### Task C9: Ticket Detail Page
**Status:** Pending  
**Scope:**
- `app/tickets/[id]/page.tsx`
- Ticket info display
- `components/comments/comment-timeline.tsx`
- `components/comments/comment-form.tsx`
- `components/tickets/status-select.tsx` — Allowed transitions only
- `components/tickets/assignment-select.tsx`
- Activity timeline (status/assignment changes)
- Status badge, priority badge

**Verify:** Detail loads, comments display, status change works  
**Commit:** `feat(frontend): add ticket detail page with comments`

---

### Task C10: Edit Ticket Page
**Status:** Pending  
**Scope:**
- `app/tickets/[id]/edit/page.tsx`
- Reuse `ticket-form.tsx` in edit mode
- Pre-populate form from API
- Update via PUT

**Verify:** Edit saves changes, validates  
**Commit:** `feat(frontend): add edit ticket page`

---

### Task C11: Error & Loading Pages
**Status:** Pending  
**Scope:**
- `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`
- Ticket-level error states
- Empty states for no tickets

**Verify:** Error boundaries trigger correctly  
**Commit:** `feat(frontend): add error and loading states`

---

### Task C12: Frontend Dockerfile
**Status:** Pending  
**Scope:**
- Multi-stage Next.js Dockerfile
- `.dockerignore`
- Standalone output config in `next.config.ts`

**Verify:** `docker build` succeeds  
**Commit:** `chore(frontend): add dockerfile`

---

## Phase D — Integration & DevOps

### Task D1: Docker Compose
**Status:** Pending  
**Scope:**
- `docker-compose.yml` with mongodb, backend, frontend
- Named volumes for MongoDB data
- Environment variables
- Health checks and depends_on
- Backend seed on startup

**Verify:** `docker compose up` — full stack runs  
**Commit:** `chore: add docker compose for full stack`

---

### Task D2: Root README
**Status:** Pending  
**Scope:**
- Architecture overview
- Folder structure
- Features list
- Installation steps
- Environment variables table
- Local development guide
- Docker guide
- Testing instructions
- Swagger URL
- Future improvements

**Verify:** New developer can set up from README alone  
**Commit:** `docs: add comprehensive readme`

---

### Task D3: Final Verification & Cleanup
**Status:** Pending  
**Scope:**
- Run all backend tests
- Run lint on both projects
- Verify Docker end-to-end
- Remove any TODOs or placeholders
- Update `implementation-log.md`
- Update `prompt-history.md`

**Verify:** All acceptance criteria in `acceptance-criteria.md` met  
**Commit:** `chore: final verification and cleanup`

---

## Task Dependency Graph

```
A1 → A2 → B1 → B2 → B3
A1 → A3 (parallel with A2)
B3 → B4 → B5 → B6 → B7 → B8 → B9 → B10 → B11 → B12 → B13
A3 → C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8 → C9 → C10 → C11 → C12
B13 + C12 → D1 → D2 → D3
```

**Parallelization:** Backend (Phase B) and Frontend (Phase C) can proceed in parallel after scaffolding (Phase A), once B9+ API is ready for frontend integration testing.
