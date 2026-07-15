# Debugging Notes

## Issue 1: Protected Routes Returned 404 After Auth (v2)

### Problem

After adding JWT authentication, all ticket endpoints returned **404** for authenticated integration tests and API clients.

### How I Investigated

1. Reproduced with failing Supertest calls (`GET /tickets/:id` → 404).
2. Enabled request logging in error middleware — handlers never invoked.
3. Compared `backend/src/routes/index.ts` mount points against test URLs.
4. Found ticket routes mounted at `/` instead of `/tickets`.

### How AI Helped

Cursor Agent traced route registration across `app.ts` → `routes/index.ts` → `ticket.routes.ts` and proposed remounting under the correct prefix.

### What I Validated

- Re-ran integration suite — ticket routes matched.
- Confirmed `/auth` and `/health` still at root.
- No regression on public endpoints.

### Final Fix

Remounted protected ticket routes under `/tickets` prefix in `backend/src/routes/index.ts`.

---

## Issue 2: Empty Swagger Spec in Docker Production Image

### Problem

`GET /api-docs` showed an **empty** OpenAPI spec in the Docker production build; worked locally in dev.

### How I Investigated

1. Built Docker image locally and hit `/api-docs.json` — zero paths.
2. Compared dev (ts-node, `.ts` files present) vs prod (compiled `.js` only).
3. Found `swagger-jsdoc` glob pointed at `.ts` source paths not copied to image.

### How AI Helped

Agent built the image, inspected file layout in the container, and updated swagger config for dual resolution.

### What I Validated

- `/api-docs.json` lists all endpoints in Docker.
- Dev mode still works with `.ts` paths.
- `swagger.test.ts` endpoint count updated (9 → 12 for v2 auth routes).

### Final Fix

Updated `backend/src/config/swagger.ts` to glob both `.ts` (dev) and `.js` (prod); added `tsc-alias` in Dockerfile build step.

---

## Issue 3: Employee Status Change Returned 400 Instead of 403

### Problem

When an employee attempted a forbidden transition (e.g. `Open → Resolved`), API returned `INVALID_STATUS_TRANSITION` (**400**) instead of `FORBIDDEN` (**403**).

### How I Investigated

1. Wrote failing integration test expecting 403.
2. Traced `ticket.service.updateStatus` call order.
3. Found `validateTransition` ran **before** `assertCanChangeStatus`.

### How AI Helped

Agent identified ordering bug and added `failure-modes.test.ts` for regression coverage.

### What I Validated

- Employee forbidden transitions → 403.
- Invalid transitions for permitted roles → 400.
- Audit history still recorded on successful changes.

### Final Fix

Reordered `updateStatus` in `backend/src/services/ticket.service.ts`: permission check first, then state machine.

---

## Issue 4: Vitest Helper Missing `expect` Import

### Problem

Backend **lint failed in CI** on `tests/helpers/test-app.ts`.

### How I Investigated

Read linter output — `expect` used without import.

### How AI Helped

One-line fix suggested immediately from lint error.

### What I Validated

`npm run lint` passes in backend.

### Final Fix

Added `import { expect } from 'vitest'` to `backend/tests/helpers/test-app.ts`.

---

## Debugging Guide (quick reference)

| Symptom | Check |
|---------|-------|
| 401 on all API calls | JWT cookie name; `withCredentials: true` on frontend |
| 403 on ticket access | `permission.service.ts` — role, `createdBy`, `assignedTo` |
| 400 `INVALID_STATUS_TRANSITION` | State map; confirm 403 wasn't expected first |
| Empty ticket list for admin | `getTicketListFilter` scope rules |
| Empty Swagger in Docker | `.js` vs `.ts` path resolution in swagger config |

Full log: [`artifacts/implementation-log.md`](artifacts/implementation-log.md) § Bug Fixes.
