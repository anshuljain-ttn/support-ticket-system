# Test Strategy

## Test Scope

| Layer | Tooling | Location |
|-------|---------|----------|
| Backend unit | Vitest | `backend/tests/unit/` |
| Backend integration | Vitest + Supertest + MongoMemoryServer | `backend/tests/integration/` |
| Frontend | Typecheck + lint (no E2E in scope) | `frontend/` |

**Current count:** 174 backend tests passing.

```bash
cd backend && npm test
cd backend && npm run typecheck && npm run lint
cd frontend && npm run typecheck && npm run lint
```

---

## Unit Tests

| Suite | Covers |
|-------|--------|
| `permission.service.test.ts` | RBAC matrix — role × action × ownership |
| `status-machine.test.ts` / `status-transitions.test.ts` | Allowed transitions per status |
| `ticket.validator.test.ts` | Zod schemas for create/update/list |
| `ticket.dto.test.ts` | DTO mapping from Mongoose documents |
| `password.test.ts` | bcrypt hash/compare |
| `middleware.test.ts` | Auth and validation middleware |
| `swagger.test.ts` | OpenAPI path count and structure |
| `api-response.test.ts` | Response envelope helpers |
| `health.test.ts` | Health controller |

**Purpose:** Fast feedback on business rules without DB I/O.

---

## Component Tests

Not implemented in this submission.

**Why:** Scope prioritized backend integration and API contract correctness. Frontend behavior is validated via typecheck, lint, and manual smoke testing (login, create ticket, RBAC as different roles).

**Future:** React Testing Library for permission-gated buttons and form validation.

---

## API / Integration Tests

| Suite | Covers |
|-------|--------|
| `auth.test.ts` | Login, logout, me, inactive user |
| `tickets.test.ts` | CRUD, pagination, 404/400 paths |
| `comments.test.ts` | Comment creation and ordering |
| `status-machine.test.ts` | AC-5 transition matrix |
| `validation.test.ts` | AC-8 input validation |
| `permissions.test.ts` | Role-scoped list and mutation access |
| `failure-modes.test.ts` | Permission-before-transition, scope isolation, audit |
| `users.test.ts` | User list endpoint |
| `ticket.repository.test.ts` | Repository query behavior |

**Infrastructure:**
- `tests/helpers/test-db.ts` — MongoMemoryServer lifecycle, seed users
- `tests/helpers/test-app.ts` — Supertest factory, `loginViaApi`, `createTicketViaApi`

---

## Edge Case Tests

| Case | Test location |
|------|---------------|
| Employee forbidden transition → 403 | `failure-modes.test.ts` |
| Invalid transition → 400 | `status-machine.test.ts` |
| Invalid ObjectId → 400 | `tickets.test.ts` |
| Non-existent ticket → 404 | `tickets.test.ts` |
| Employee sees only own tickets | `permissions.test.ts` |
| Admin owner limited on own ticket | `permissions.test.ts` |
| Audit history on status change | `failure-modes.test.ts` |
| Duplicate seed email fails | Manual / seed script |

---

## Tests Not Covered (and why)

| Gap | Reason |
|-----|--------|
| End-to-end browser tests (Playwright/Cypress) | Out of assessment scope; manual smoke test used |
| Frontend component unit tests | Time prioritized backend RBAC and state machine |
| Load/performance tests | Single-tenant demo; not a production SLA target |
| Contract tests against real MongoDB in CI | MongoMemoryServer sufficient for integration |
| Email/notification flows | Feature out of scope |
| Multi-tenant isolation | Single org by design |

**Traceability:** Detailed AC-1–AC-23 in [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md).
