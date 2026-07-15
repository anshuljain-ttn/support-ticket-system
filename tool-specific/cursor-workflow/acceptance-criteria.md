# Acceptance Criteria

> Every requirement maps to measurable, verifiable criteria. Use this as the definition of done.

---

## AC-1: Project Structure

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-1.1 | Repository contains `frontend/`, `backend/`, `tool-workflow.md`, `docs/`, `prompts/`, `artifacts/`, `tool-specific/` | Directory listing |
| AC-1.2 | Both apps compile without TypeScript errors | `tsc --noEmit` in each |
| AC-1.3 | ESLint passes with zero errors | `npm run lint` in each |
| AC-1.4 | No `TODO`, `FIXME`, or placeholder implementations in production code | Code search |

---

## AC-2: Backend — Health & Infrastructure

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-2.1 | `GET /health` returns HTTP 200 | Supertest assertion |
| AC-2.2 | Health response includes `status`, `timestamp`, `uptime` | Response body check |
| AC-2.3 | All API responses use `{ success, data }` or `{ success, error }` envelope | Integration tests |
| AC-2.4 | Request logger logs method, path, status, duration | Log output inspection |
| AC-2.5 | Unhandled errors return 500 with `INTERNAL_ERROR` code | Integration test |
| AC-2.6 | Unknown routes return 404 with error envelope | Integration test |

---

## AC-3: Backend — Users (Seed)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-3.1 | Seed script creates ≥ 5 users | DB query after seed |
| AC-3.2 | Each user has `_id`, `name`, `email`, `role` | Schema validation |
| AC-3.3 | Duplicate email in seed data causes script failure | Run seed twice with dup data |
| AC-3.4 | `GET /users` returns all seeded users | Supertest: length ≥ 5 |
| AC-3.5 | No POST/PUT/DELETE endpoints exist for users | Route inspection |

---

## AC-4: Backend — Tickets CRUD

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-4.1 | `POST /tickets` creates ticket with status `Open` | Supertest assertion |
| AC-4.2 | Created ticket has `createdAt` and `updatedAt` | Response body check |
| AC-4.3 | `GET /tickets/:id` returns ticket with comments array | Supertest assertion |
| AC-4.4 | `GET /tickets/:id` returns `allowedTransitions` array | Response body check |
| AC-4.5 | `PUT /tickets/:id` updates ticket fields | Supertest assertion |
| AC-4.6 | `GET /tickets` returns paginated list | Pagination meta in response |
| AC-4.7 | Non-existent ticket ID returns 404 `TICKET_NOT_FOUND` | Supertest assertion |
| AC-4.8 | Invalid ObjectId in URL returns 400 | Supertest assertion |

---

## AC-5: Backend — Status State Machine

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-5.1 | Open → In Progress: **succeeds** (200) | Integration test |
| AC-5.2 | Open → Resolved: **fails** (400) | Integration test |
| AC-5.3 | In Progress → Resolved: **succeeds** (200) | Integration test |
| AC-5.4 | Resolved → Closed: **succeeds** (200) | Integration test |
| AC-5.5 | Closed → Open: **fails** (400) | Integration test |
| AC-5.6 | Open → Cancelled: **succeeds** (200) | Integration test |
| AC-5.7 | In Progress → Cancelled: **succeeds** (200) | Integration test |
| AC-5.8 | Resolved → Cancelled: **fails** (400) | Integration test |
| AC-5.9 | Resolved → In Progress: **fails** (400) | Integration test |
| AC-5.10 | Closed → Cancelled: **fails** (400) | Integration test |
| AC-5.11 | Invalid transition returns `INVALID_STATUS_TRANSITION` error code | Error code assertion |
| AC-5.12 | Status validated on both `PUT` and `PATCH` endpoints | Integration tests |
| AC-5.13 | `getAllowedTransitions('Open')` returns `['In Progress', 'Cancelled']` | Unit test |

---

## AC-6: Backend — Comments

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-6.1 | `POST /tickets/:id/comments` creates comment | Supertest assertion |
| AC-6.2 | Comment has `ticketId`, `message`, `createdBy`, `createdAt` | Response body check |
| AC-6.3 | Comment on non-existent ticket returns 404 | Supertest assertion |
| AC-6.4 | Comments appear in ticket detail, sorted by `createdAt` asc | Supertest assertion |

---

## AC-7: Backend — Search & Filtering

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-7.1 | `GET /tickets/search?q=keyword` searches title | Test with known ticket |
| AC-7.2 | Search includes description field | Test with description-only match |
| AC-7.3 | Search includes comment messages | Test with comment-only match |
| AC-7.4 | `?status=Open` filters by status | Supertest assertion |
| AC-7.5 | `?priority=High` filters by priority | Supertest assertion |
| AC-7.6 | `?assignedTo=<id>` filters by assignee | Supertest assertion |
| AC-7.7 | `?sort=newest` sorts by `createdAt` desc | Order assertion |
| AC-7.8 | `?sort=oldest` sorts by `createdAt` asc | Order assertion |
| AC-7.9 | `?sort=priority` sorts Critical > High > Medium > Low | Order assertion |
| AC-7.10 | `?page=2&limit=10` returns correct page | Pagination meta check |
| AC-7.11 | Page beyond results returns empty items array | Supertest assertion |
| AC-7.12 | Default page size is 20 | Supertest assertion |

---

## AC-8: Backend — Validation

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-8.1 | Missing `title` on create returns 400 with field detail | Supertest assertion |
| AC-8.2 | Missing `description` on create returns 400 | Supertest assertion |
| AC-8.3 | Title < 3 chars returns 400 | Supertest assertion |
| AC-8.4 | Title > 200 chars returns 400 | Supertest assertion |
| AC-8.5 | Description < 10 chars returns 400 | Supertest assertion |
| AC-8.6 | Invalid `priority` enum returns 400 | Supertest assertion |
| AC-8.7 | Non-existent `createdBy` returns 400/404 | Supertest assertion |
| AC-8.8 | Non-existent `assignedTo` returns 400/404 | Supertest assertion |
| AC-8.9 | Malformed ObjectId returns 400 `INVALID_OBJECT_ID` | Supertest assertion |
| AC-8.10 | Empty comment message returns 400 | Supertest assertion |
| AC-8.11 | Validation errors include `details` array with field + message | Response body check |

---

## AC-9: Backend — Swagger

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-9.1 | Swagger UI accessible at `/api-docs` | Browser/curl check |
| AC-9.2 | All 9 endpoints documented | OpenAPI spec inspection |
| AC-9.3 | Request/response schemas defined | OpenAPI spec inspection |

---

## AC-10: Backend — Architecture

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-10.1 | Controllers contain no business logic | Code review |
| AC-10.2 | Services contain no direct Mongoose calls | Code review |
| AC-10.3 | Repositories contain no HTTP/response logic | Code review |
| AC-10.4 | All inputs validated via Zod middleware | Code review |
| AC-10.5 | Environment variables validated at startup | Startup with bad env fails |

---

## AC-11: Backend — Testing

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-11.1 | `npm test` runs all tests and passes | CI/local run |
| AC-11.2 | State machine tests cover all AC-5 scenarios | Test file inspection |
| AC-11.3 | Validation tests cover all AC-8 scenarios | Test file inspection |
| AC-11.4 | 404 tests exist for tickets and comments | Test file inspection |
| AC-11.5 | Tests use isolated test database | Test setup inspection |

---

## AC-12: Frontend — Pages

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-12.1 | Dashboard (`/`) renders statistics cards for all 5 statuses | Visual/manual test |
| AC-12.2 | Ticket list (`/tickets`) renders paginated table | Visual/manual test |
| AC-12.3 | Create ticket (`/tickets/new`) renders form | Visual/manual test |
| AC-12.4 | Ticket detail (`/tickets/:id`) renders full ticket info | Visual/manual test |
| AC-12.5 | Edit ticket (`/tickets/:id/edit`) renders pre-filled form | Visual/manual test |
| AC-12.6 | All pages are responsive (mobile, tablet, desktop) | Browser resize test |
| AC-12.7 | 404 page renders for invalid routes | Navigate to `/foo` |

---

## AC-13: Frontend — UI Features

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-13.1 | Status badge shows correct color per status | Visual inspection |
| AC-13.2 | Comment timeline displays comments chronologically | Visual inspection |
| AC-13.3 | Status dropdown shows only allowed transitions | Compare with backend |
| AC-13.4 | Assignment dropdown lists seeded users | Visual inspection |
| AC-13.5 | Priority dropdown shows all 4 priorities | Visual inspection |
| AC-13.6 | Search input filters ticket list | Manual test |
| AC-13.7 | Filter controls for status, priority, assignee work | Manual test |
| AC-13.8 | Pagination controls navigate between pages | Manual test |
| AC-13.9 | Toast appears on successful create/update/comment | Manual test |
| AC-13.10 | Toast appears on API errors | Manual test |
| AC-13.11 | Skeleton loaders shown during data fetch | Network throttle test |
| AC-13.12 | Empty state shown when no tickets match filters | Manual test |

---

## AC-14: Frontend — Forms & Validation

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-14.1 | Create form validates required fields before submit | Submit empty form |
| AC-14.2 | Field-level error messages displayed inline | Submit invalid form |
| AC-14.3 | Edit form validates same rules as create | Submit invalid edit |
| AC-14.4 | Comment form validates message required | Submit empty comment |
| AC-14.5 | Forms use React Hook Form + Zod | Code inspection |

---

## AC-15: Frontend — Data Fetching

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-15.1 | All API calls go through Axios service layer | Code inspection |
| AC-15.2 | TanStack Query used for all server state | Code inspection |
| AC-15.3 | Query cache invalidated after mutations | Status change reflects immediately |
| AC-15.4 | API errors parsed from envelope and displayed | Error toast content check |

---

## AC-16: Docker

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-16.1 | `docker compose up` starts all 3 services | Docker command |
| AC-16.2 | MongoDB data persists across restarts (named volume) | Restart test |
| AC-16.3 | Backend connects to MongoDB container | Health check passes |
| AC-16.4 | Frontend loads in browser at `localhost:3000` | Browser test |
| AC-16.5 | Seed data available after compose startup | `GET /users` returns data |

---

## AC-17: Documentation

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-17.1 | Root README covers installation, env vars, testing, Docker | File inspection |
| AC-17.2 | `spec.md` complete with all requirements | File inspection |
| AC-17.3 | `tasks.md` has all implementation tasks | File inspection |
| AC-17.4 | `project-context.md` has architecture and conventions | File inspection |
| AC-17.5 | `cursor-rules-or-instructions.md` has persistent rules | File inspection |
| AC-17.6 | `.env.example` files exist for both apps | File listing |

---

## AC-18: Code Quality

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-18.1 | No `any` types in production code | TypeScript strict + grep |
| AC-18.2 | No hardcoded data except seed users | Code review |
| AC-18.3 | No duplicated validation logic across layers | Code review |
| AC-18.4 | Functions generally ≤ 40 lines | Spot check |
| AC-18.5 | Consistent naming per conventions in `project-context.md` | Code review |

---

## Definition of Done (Global)

A task is **done** when:

1. ✅ Code compiles (`tsc --noEmit`)
2. ✅ Lint passes (`npm run lint`)
3. ✅ Relevant tests pass (`npm test`)
4. ✅ Acceptance criteria for that feature are met
5. ✅ No TODOs or placeholders remain
6. ✅ Git commit message suggested

The project is **done** when all AC-1 through AC-18 criteria are met.

---

# v2.0 Acceptance Criteria

## AC-19: Authentication

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-19.1 | `POST /auth/login` returns 200 and sets HTTP-only cookie on valid credentials | Integration test |
| AC-19.2 | Invalid credentials return 401 `INVALID_CREDENTIALS` | Integration test |
| AC-19.3 | `GET /auth/me` returns authenticated user without password | Integration test |
| AC-19.4 | `POST /auth/logout` clears cookie | Integration test |
| AC-19.5 | Protected routes return 401 without auth | Integration test |
| AC-19.6 | Inactive user login returns 403 | Integration test |
| AC-19.7 | Passwords stored as bcrypt hashes only | DB inspection |

## AC-20: RBAC & Ownership

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-20.1 | Employee can create ticket | Integration test |
| AC-20.2 | Employee cannot resolve ticket | Integration test → 403 |
| AC-20.3 | Employee cannot edit ticket after Open | Integration test → 403 |
| AC-20.4 | Employee cannot access another employee's ticket | Integration test → 403/404 |
| AC-20.5 | Admin cannot transition own ticket (workflow) | Integration test → 403 |
| AC-20.6 | Admin can transition employee ticket | Integration test → 200 |
| AC-20.7 | Super Admin can perform every action | Integration test |
| AC-20.8 | Permission logic centralized in PermissionService | Code review |
| AC-20.9 | Forbidden returns 403 with envelope | Integration test |

## AC-21: Audit History

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-21.1 | Status change creates history entry | Integration test |
| AC-21.2 | Assignment creates history entry | Integration test |
| AC-21.3 | History includes action, performedBy, performedAt, previous/new values | Schema test |
| AC-21.4 | Ticket detail returns history array | Integration test |

## AC-22: Seeded Users (v2)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-22.1 | Seed creates 1 SUPER_ADMIN, 2 ADMIN, 3 EMPLOYEE | Seed + DB query |
| AC-22.2 | Each user has name, email, role, avatar, isActive, createdAt | Schema validation |
| AC-22.3 | Password field hashed; never in API responses | DTO + API test |

## AC-23: Frontend Auth & UI (v2)

| ID | Criterion | Verification |
|----|-----------|--------------|
| AC-23.1 | Login page at `/login` | Manual / E2E |
| AC-23.2 | Unauthenticated users redirected to login | Manual |
| AC-23.3 | Unauthorized actions hidden in UI | Manual |
| AC-23.4 | Dark mode toggle works | Manual |
| AC-23.5 | Role-aware dashboard displays correct stats | Manual |

## v2 Definition of Done

v2 is **done** when AC-19 through AC-23 are met in addition to retained AC-1 through AC-18 (updated where superseded).
