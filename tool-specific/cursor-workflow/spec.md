# Support Ticket Management System — Specification

> **Version:** 2.0.0  
> **Status:** Active — Auth, RBAC & SaaS UI Refactor  
> **Last Updated:** 2026-07-15  
> **Supersedes:** v1.0.0 (no-auth internal demo)

---

## 1. Business Requirements

### 1.1 Business Goal

Build a **production-quality support ticket management system** with JWT authentication, role-based access control, ownership rules, audit history, and a modern SaaS-style UI. The system must be secure, scalable, maintainable, and suitable for senior engineering review.

### 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| JWT authentication (login/logout/me) | User self-registration |
| RBAC (SUPER_ADMIN, ADMIN, EMPLOYEE) | SSO / OAuth providers |
| Ownership-based ticket permissions | Multi-tenant organizations |
| Embedded ticket audit `history[]` | Email notifications |
| Comment threads | File attachments |
| Status workflow enforcement | Real-time WebSockets |
| Role-aware dashboard & lists | Mobile native apps |
| Search, filter, sort, pagination (scoped) | |
| Swagger/OpenAPI | |
| Docker deployment | |
| Premium SaaS UI (dark mode, etc.) | |

### 1.3 Stakeholders

| Stakeholder | Interest |
|-------------|------------|
| Employees | Create and track their own tickets |
| Admins | Process tickets they do not own; assign and resolve |
| Super Admins | Full system access and user oversight |
| Engineering leadership | Security, architecture, test coverage |

---

## 2. Authentication

| ID | Requirement |
|----|-------------|
| FR-A01 | `POST /auth/login` — email + password, returns user + sets HTTP-only JWT cookie |
| FR-A02 | `POST /auth/logout` — clears auth cookie |
| FR-A03 | `GET /auth/me` — returns authenticated user (no password) |
| FR-A04 | Passwords hashed with bcrypt; never stored or returned in plaintext |
| FR-A05 | No registration page; users seeded only |
| FR-A06 | Unauthenticated API requests return 401 |
| FR-A07 | Frontend login page; protected routes redirect to login |
| FR-A08 | Inactive users (`isActive: false`) cannot log in |

---

## 3. Users (Seed Only)

| ID | Requirement |
|----|-------------|
| FR-U01 | Seed exactly: 1 Super Admin, 2 Admins, 3 Employees |
| FR-U02 | Each user: `name`, `email`, `password` (hashed), `role`, `avatar`, `isActive`, `createdAt` |
| FR-U03 | `GET /users` — authenticated; scoped by role (Super Admin sees all; others per policy) |
| FR-U04 | No user registration or public CRUD |
| FR-U05 | Super Admin may manage users (future-ready; list minimum in v2) |

### 3.1 Seeded Users

| Role | Count | Default Password (dev seed) |
|------|-------|------------------------------|
| SUPER_ADMIN | 1 | From `SEED_DEFAULT_PASSWORD` env |
| ADMIN | 2 | Same |
| EMPLOYEE | 3 | Same |

---

## 4. Roles

| Role | Value |
|------|-------|
| Super Admin | `SUPER_ADMIN` |
| Admin | `ADMIN` |
| Employee | `EMPLOYEE` |

---

## 5. Role-Based Access Control

**Backend is the sole authority.** Frontend hides unauthorized actions for UX only.

| ID | Requirement |
|----|-------------|
| FR-R01 | Authentication middleware validates JWT on protected routes |
| FR-R02 | Authorization middleware checks permissions via Permission Service |
| FR-R03 | Ownership middleware applies owner-vs-non-owner rules |
| FR-R04 | Never duplicate authorization logic in controllers |
| FR-R05 | Forbidden actions return HTTP 403 with error envelope |

### 5.1 Employee Permissions

**Can:** login; create ticket; view own tickets only; view own ticket detail; edit own ticket while `Open`; cancel own ticket while `Open`; comment on own tickets anytime.

**Cannot:** assign; change status beyond cancel; resolve; close; reopen; view others' tickets; edit after leaving `Open`.

### 5.2 Admin Permissions — Owner Mode

When admin **created** the ticket → same as Employee (edit/cancel while Open, comment anytime; no assign/workflow).

### 5.3 Admin Permissions — Non-Owner Mode

When admin **did not create** the ticket → view, assign, edit, change status, resolve, close, cancel (if workflow allows), comment.

### 5.4 Super Admin

Unrestricted: all tickets, all users, all actions, own and others' tickets.

### 5.5 Ownership Rule

Ticket owner (Employee or Admin who created it) has limited permissions. Only another Admin or Super Admin processes lifecycle beyond Open/cancel.

---

## 6. Ticket Management

| ID | Requirement |
|----|-------------|
| FR-T01 | Create ticket: title, description, priority; `createdBy` = authenticated user |
| FR-T02 | Status follows state machine (§7) |
| FR-T03 | `assignedTo` nullable; assign via `PATCH /tickets/:id/assign` |
| FR-T04 | `lastUpdatedBy` on every mutation |
| FR-T05 | `history[]` embedded audit trail (§8) |
| FR-T06 | `PUT /tickets/:id` — field updates per RBAC |
| FR-T07 | `PATCH /tickets/:id/status` — status per RBAC + workflow |
| FR-T08 | `GET /tickets` — scoped by role |
| FR-T09 | `GET /tickets/:id` — scoped by role |
| FR-T10 | `GET /tickets/search` — keyword + filters; permission-scoped |
| FR-T11 | New tickets default to `Open` |

### 6.1 Ticket List Scopes

| Role | Visible Tickets |
|------|-----------------|
| EMPLOYEE | Own tickets only |
| ADMIN | Created by me, assigned to me, awaiting my action |
| SUPER_ADMIN | All tickets |

---

## 7. Status State Machine

```
Open ──────────► In Progress ──────────► Resolved ──────────► Closed
  │                    │
  └──────► Cancelled ◄─┘
```

| From | To |
|------|-----|
| Open | In Progress, Cancelled |
| In Progress | Resolved, Cancelled |
| Resolved | Closed |

All other transitions invalid. Backend enforces; frontend shows only allowed transitions for current actor.

---

## 8. Audit History

| ID | Requirement |
|----|-------------|
| FR-H01 | `history[]` on ticket document |
| FR-H02 | Track: status changes, assignments, updates, priority, description |
| FR-H03 | Each entry: `action`, `performedBy`, `performedAt`, `previousValue`, `newValue`, `comment?` |
| FR-H04 | Display as timeline on ticket detail |
| FR-H05 | History written by Audit Service on every important mutation |

---

## 9. Comments

| ID | Requirement |
|----|-------------|
| FR-C01 | `POST /tickets/:id/comments` — authenticated; permission-scoped |
| FR-C02 | Comment: `_id`, `ticketId`, `message`, `createdBy`, `createdAt` |
| FR-C03 | Comments in ticket detail response |
| FR-C04 | Employees comment only on own tickets |

---

## 10. Search & Filters

| ID | Requirement |
|----|-------------|
| FR-S01 | Keyword search: title, description, comments |
| FR-S02 | Filters: status, priority, assignedTo, createdBy |
| FR-S03 | Sort: newest, oldest, priority |
| FR-S04 | Pagination (default 20, max 100) |
| FR-S05 | Results never leak unauthorized tickets |

---

## 11. Dashboard (Role-Aware)

### 11.1 Employee

Stats: My Open, In Progress, Resolved, Closed, Cancelled. Recent tickets + my activity.

### 11.2 Admin

Stats: Created by me, assigned to me, waiting for action, resolved, closed. Recent activity.

### 11.3 Super Admin

Global stats: users, all status counts, top employees/admins, average resolution time.

---

## 12. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Current user |
| GET | `/health` | No | Health check |
| GET | `/users` | Yes | List users (scoped) |
| GET | `/tickets` | Yes | List tickets (scoped) |
| GET | `/tickets/search` | Yes | Search (scoped) |
| GET | `/tickets/:id` | Yes | Detail + comments + history |
| POST | `/tickets` | Yes | Create ticket |
| PUT | `/tickets/:id` | Yes | Update ticket |
| PATCH | `/tickets/:id/status` | Yes | Update status |
| PATCH | `/tickets/:id/assign` | Yes | Assign ticket |
| POST | `/tickets/:id/comments` | Yes | Add comment |

---

## 13. Data Models

### 13.1 User

```
_id, name, email, password, role, avatar, isActive, createdAt
```

### 13.2 Ticket

```
_id, title, description, priority, status, assignedTo, createdBy,
createdAt, updatedAt, lastUpdatedBy, history[]
```

### 13.3 Comment

```
_id, ticketId, message, createdBy, createdAt
```

### 13.4 History Entry

```
action, performedBy, performedAt, previousValue, newValue, comment?
```

---

## 14. Frontend Pages

| Page | Route | Auth |
|------|-------|------|
| Login | `/login` | Public |
| Dashboard | `/` | Protected |
| Tickets | `/tickets` | Protected |
| Ticket Detail | `/tickets/[id]` | Protected |
| Create Ticket | `/tickets/new` | Protected |
| Profile | `/profile` | Protected |
| Settings | `/settings` | Protected |

### 14.1 UI Requirements

Premium SaaS dashboard: ShadCN UI, TailwindCSS, Lucide icons, responsive layout, subtle glassmorphism, rounded cards, dark mode + theme toggle, sticky navbar, collapsible sidebar, toasts, skeletons, empty states, user avatar menu, breadcrumbs.

---

## 15. Error Handling

Envelope format unchanged. HTTP codes: 400, 401, 403, 404, 409, 422, 500.

New codes: `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_CREDENTIALS`, `USER_INACTIVE`.

---

## 16. Testing

| Category | Examples |
|----------|----------|
| Auth | Login success/failure, logout, me, 401 without token |
| Authorization | Employee cannot resolve; admin cannot transition own ticket |
| Ownership | Owner edit only while Open |
| Workflow | Invalid transitions rejected |
| Scoping | Employee cannot access another's ticket |

---

## 17. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | TypeScript strict mode everywhere |
| NFR-02 | No duplicated business logic |
| NFR-03 | SOLID principles; modular services |
| NFR-04 | Swagger documents all endpoints |
| NFR-05 | Docker Compose full stack |
| NFR-06 | Comprehensive README |

---

## 18. Architecture Services

| Service | Responsibility |
|---------|----------------|
| AuthService | Login, logout, JWT, cookie, password verify |
| PermissionService | Central RBAC checks |
| TicketService | Ticket CRUD with permission + ownership |
| AuditService | History entry creation |
| StatusMachineService | Workflow validation |
| UserService | User queries, seed |

---

## 19. Assumptions

| # | Assumption |
|---|------------|
| A1 | JWT in HTTP-only cookie (SameSite=Lax; Secure in production) |
| A2 | Single organization (no multi-tenancy) |
| A3 | Avatar stored as URL string |
| A4 | `GET /users` for assignee dropdowns; Super Admin sees all |
| A5 | Dashboard stats via dedicated endpoints or scoped aggregation |
