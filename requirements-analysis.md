# Requirement Analysis

## Selected Project Option

**Support Ticket Management System** — internal support desk for employees to raise tickets and admins to process them through a defined workflow, with authentication, RBAC, and audit trail.

Full specification: [`docs/design-spec.md`](docs/design-spec.md) (symlink to [`tool-specific/cursor-workflow/spec.md`](tool-specific/cursor-workflow/spec.md)).

---

## My Understanding (in your own words)

The system is a **role-aware ticket desk**, not a generic CRUD app. Employees create and track their own tickets; admins process tickets they do not own; super admins have full visibility. A **status state machine** governs lifecycle transitions (Open → In Progress → Resolved → Closed, with Cancelled as a terminal state). **Ownership matters**: creators cannot advance workflow on their own tickets — another admin must process them.

Security is enforced on the **backend** (JWT + PermissionService); the frontend only hides unauthorized actions for UX. Every mutation should be auditable via embedded `history[]` on tickets.

---

## Functional Requirements

| Area | Requirements |
|------|----------------|
| **Auth** | Login/logout/me via JWT HTTP-only cookie; bcrypt passwords; inactive users blocked |
| **Users** | Seed-only users (1 super admin, 2 admins, 3 employees); list endpoint scoped by role |
| **Tickets** | CRUD with pagination; scoped visibility by role and ownership |
| **Workflow** | Status transitions validated by dedicated state machine service |
| **Comments** | Thread on tickets; visible in detail view |
| **RBAC** | SUPER_ADMIN unrestricted; ADMIN owner vs non-owner modes; EMPLOYEE own tickets only |
| **Search** | Text search on title, description, comments; filter by status, priority, assignee; sort |
| **Dashboard** | Role-aware stats and recent tickets |
| **API docs** | Swagger UI at `/api-docs` |

---

## Non-Functional Requirements

| Area | Requirements |
|------|----------------|
| **Architecture** | Monorepo; Repository → Service → Controller; DTOs at API boundary |
| **Validation** | Zod on all inputs; typed `AppError` envelope |
| **Testing** | Unit + integration tests; AC IDs in test names where applicable |
| **Type safety** | TypeScript `strict`; no `any` |
| **Deployment** | Multi-stage Dockerfiles; Docker Compose full stack |
| **Maintainability** | Cursor rules, phased tasks, logged decisions |
| **Security** | No secrets in repo; RBAC in services not controllers |

---

## Assumptions

1. Single organization (no multi-tenancy).
2. Users are provisioned via seed script — no self-registration.
3. Email notifications, file attachments, and WebSockets are out of scope.
4. MongoDB is acceptable for embedded comments and audit history.
5. Dev/staging use a shared seed password via environment variable.

---

## Clarifications (questions for a product owner)

1. Should admins see **all** open tickets or only assigned + unassigned queue?
   - *Resolved:* Scoped list — own tickets, assigned tickets, and active non-own tickets.
2. Can an employee **reopen** a closed ticket?
   - *Resolved:* No — Closed is terminal; only valid transitions from state machine.
3. Two roles or three in v1?
   - *Evolved:* Started with Admin + Employee (Prompt 2); v2 added SUPER_ADMIN for production-quality RBAC.
4. Where should permission checks run relative to state machine validation?
   - *Resolved:* Permission before transition (403 before 400) — see [`debugging-notes.md`](debugging-notes.md).

---

## Edge Cases

| Edge case | Expected behavior |
|-----------|-------------------|
| Employee tries `Open → Resolved` on own ticket | 403 Forbidden (not 400 transition error) |
| Admin owns ticket they created | Same limits as employee for workflow actions |
| Invalid ObjectId in URL | 400 validation error |
| Non-existent ticket | 404 `TICKET_NOT_FOUND` |
| Unauthenticated API call | 401 |
| Inactive user login | 401 / blocked |
| Invalid status transition | 400 `INVALID_STATUS_TRANSITION` |
| Duplicate seed email | Seed script fails |
| Empty search results | 200 with empty paginated list |
| Swagger in Docker prod image | Must resolve compiled `.js` paths (bug fixed) |
