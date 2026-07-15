# Support Ticket Management System — Specification

> **Version:** 1.0.0  
> **Status:** Draft — Phase 1 Complete  
> **Last Updated:** 2026-07-15

---

## 1. Business Requirements

### 1.1 Business Goal

Build an **internal support ticket application** for employees to create, assign, update, and progress support tickets through a predefined workflow. The system must demonstrate production-quality software engineering practices suitable for senior engineering review.

### 1.2 Scope

| In Scope | Out of Scope |
|----------|--------------|
| Ticket CRUD | User authentication / SSO |
| Comment threads on tickets | Email notifications |
| Status workflow enforcement | File attachments |
| Search, filter, sort, pagination | Multi-tenant organizations |
| Dashboard statistics | Real-time WebSocket updates |
| Seeded users (read-only) | User CRUD |
| REST API with Swagger | Mobile native apps |
| Docker deployment | Role-based access control (beyond seed data) |

### 1.3 Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Employees (end users) | Create and track their support requests |
| Admins | Assign, update, and resolve tickets |
| Engineering leadership | Architecture quality, maintainability, test coverage |

---

## 2. Functional Requirements

### 2.1 User Management (Seed Only)

| ID | Requirement |
|----|-------------|
| FR-U01 | System shall seed a predefined set of users at startup |
| FR-U02 | System shall expose `GET /users` to list seeded users |
| FR-U03 | Users shall have: `_id`, `name`, `email`, `role` |
| FR-U04 | Seed script shall fail if duplicate emails exist |
| FR-U05 | No user CRUD endpoints shall be exposed |

**Assumed Roles:** `employee`, `admin` (used for display; no auth enforcement in v1).

### 2.2 Ticket Management

| ID | Requirement |
|----|-------------|
| FR-T01 | Users shall create tickets with title, description, and priority |
| FR-T02 | Tickets shall have status following the state machine (§2.4) |
| FR-T03 | Tickets may be assigned to a seeded user via `assignedTo` |
| FR-T04 | Tickets shall record `createdBy` referencing a seeded user |
| FR-T05 | Tickets shall have `createdAt` and `updatedAt` timestamps |
| FR-T06 | System shall support full ticket update via `PUT /tickets/:id` |
| FR-T07 | System shall support status-only update via `PATCH /tickets/:id/status` |
| FR-T08 | System shall return 404 for non-existent ticket IDs |
| FR-T09 | New tickets shall default to status `Open` |

### 2.3 Comments

| ID | Requirement |
|----|-------------|
| FR-C01 | Users shall add comments to tickets via `POST /tickets/:id/comments` |
| FR-C02 | Comments shall have: `_id`, `ticketId`, `message`, `createdBy`, `createdAt` |
| FR-C03 | Comments shall be retrievable as part of ticket detail |
| FR-C04 | Adding a comment to a non-existent ticket shall return 404 |

### 2.4 Status State Machine (Mandatory)

```
Open ──────────► In Progress ──────────► Resolved ──────────► Closed
  │                    │
  │                    │
  └──────► Cancelled ◄─┘
```

**Allowed Transitions:**

| From | To |
|------|----|
| Open | In Progress |
| Open | Cancelled |
| In Progress | Resolved |
| In Progress | Cancelled |
| Resolved | Closed |

**All other transitions are invalid** and must be rejected by the backend.

| ID | Requirement |
|----|-------------|
| FR-S01 | Backend shall enforce state machine as source of truth |
| FR-S02 | Frontend shall only display allowed transitions for current status |
| FR-S03 | Invalid transitions shall return HTTP 400 with descriptive error |
| FR-S04 | Status field on `PUT` shall also be validated against state machine |

### 2.5 Search, Filter, Sort, Pagination

| ID | Requirement |
|----|-------------|
| FR-Q01 | Keyword search across ticket title, description, and comment messages |
| FR-Q02 | Filter by status (single or multiple) |
| FR-Q03 | Filter by priority (single or multiple) |
| FR-Q04 | Filter by assigned user (`assignedTo`) |
| FR-Q05 | Sort by: newest, oldest, priority (high → low) |
| FR-Q06 | Paginate results with `page` and `limit` query params |
| FR-Q07 | `GET /tickets` shall support list with filters |
| FR-Q08 | `GET /tickets/search` shall support dedicated search endpoint |

### 2.6 API Infrastructure

| ID | Requirement |
|----|-------------|
| FR-A01 | `GET /health` shall return service health status |
| FR-A02 | All responses shall follow consistent envelope format |
| FR-A03 | OpenAPI/Swagger documentation shall be auto-generated |
| FR-A04 | Request logging middleware shall log all API calls |
| FR-A05 | Global error handling middleware shall catch and format errors |

### 2.7 Frontend Pages

| ID | Requirement |
|----|-------------|
| FR-F01 | **Dashboard** — statistics cards + ticket table with search/filters |
| FR-F02 | **Ticket List** — paginated, filterable ticket table |
| FR-F03 | **Ticket Detail** — full ticket view with comments and activity |
| FR-F04 | **Create Ticket** — form with validation |
| FR-F05 | **Edit Ticket** — form pre-populated with existing data |
| FR-F06 | Responsive layout for mobile, tablet, desktop |
| FR-F07 | Loading skeletons during data fetch |
| FR-F08 | Error pages and empty states |
| FR-F09 | Toast notifications for success/error actions |

### 2.8 Frontend UI Components

| ID | Requirement |
|----|-------------|
| FR-UI01 | Status badge with color coding per status |
| FR-UI02 | Comment timeline on ticket detail |
| FR-UI03 | Activity timeline (status changes, assignments) |
| FR-UI04 | Assignment dropdown (seeded users) |
| FR-UI05 | Priority dropdown |
| FR-UI06 | Status transition dropdown (allowed transitions only) |

---

## 3. Non-Functional Requirements

### 3.1 Architecture & Code Quality

| ID | Requirement |
|----|-------------|
| NFR-01 | Backend shall use Repository → Service → Controller layering |
| NFR-02 | Frontend shall use feature-based folder structure |
| NFR-03 | No duplicated business logic between layers |
| NFR-04 | Strong TypeScript typing throughout (no `any`) |
| NFR-05 | Functions shall be ≤ 40 lines where practical |
| NFR-06 | SOLID principles applied consistently |

### 3.2 Validation

| ID | Requirement |
|----|-------------|
| NFR-07 | All API inputs validated on backend with Zod |
| NFR-08 | Frontend forms validated with Zod + React Hook Form |
| NFR-09 | Invalid MongoDB ObjectIds shall return 400 |
| NFR-10 | References to non-existent users shall return 400/404 |

### 3.3 Testing

| ID | Requirement |
|----|-------------|
| NFR-11 | Integration tests for all state machine transitions |
| NFR-12 | Integration tests for validation failures |
| NFR-13 | Integration tests for 404 scenarios |
| NFR-14 | Test framework: Vitest + Supertest |
| NFR-15 | Tests shall run in CI-compatible headless mode |

### 3.4 Performance & Scalability

| ID | Requirement |
|----|-------------|
| NFR-16 | Ticket list queries shall use MongoDB indexes |
| NFR-17 | Pagination shall limit default page size to 20 |
| NFR-18 | Search shall use text indexes where appropriate |

### 3.5 DevOps & Deployment

| ID | Requirement |
|----|-------------|
| NFR-19 | Docker Compose shall orchestrate frontend, backend, MongoDB |
| NFR-20 | Environment variables managed via `.env` files |
| NFR-21 | Health endpoint usable for container orchestration probes |

### 3.6 Documentation

| ID | Requirement |
|----|-------------|
| NFR-22 | Professional README with setup instructions |
| NFR-23 | Swagger UI accessible in development |
| NFR-24 | Cursor workflow documentation maintained throughout |

---

## 4. Entity Definitions

### 4.1 User (Seed Only)

```typescript
interface User {
  _id: ObjectId;
  name: string;        // 2–100 chars
  email: string;       // valid email, unique
  role: 'employee' | 'admin';
}
```

### 4.2 Ticket

```typescript
type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Cancelled';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface Ticket {
  _id: ObjectId;
  title: string;           // 3–200 chars, required
  description: string;     // 10–5000 chars, required
  priority: TicketPriority;
  status: TicketStatus;    // default: 'Open'
  assignedTo: ObjectId | null;  // ref: User
  createdBy: ObjectId;          // ref: User, required
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.3 Comment

```typescript
interface Comment {
  _id: ObjectId;
  ticketId: ObjectId;    // ref: Ticket
  message: string;       // 1–2000 chars, required
  createdBy: ObjectId;   // ref: User, required
  createdAt: Date;
}
```

### 4.4 Activity Log (Derived / Embedded)

Activity timeline is derived from ticket `updatedAt`, status changes, assignment changes, and comment creation. No separate collection required for v1; computed in service layer or stored as embedded audit array if needed.

---

## 5. User Stories

### Epic: Ticket Lifecycle

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As an employee, I want to create a support ticket so that I can report an issue | P0 |
| US-02 | As an admin, I want to assign a ticket to myself so that I can work on it | P0 |
| US-03 | As an admin, I want to change ticket status to In Progress so that others know I'm working on it | P0 |
| US-04 | As an admin, I want to resolve a ticket so that the requester knows it's fixed | P0 |
| US-05 | As an admin, I want to close a resolved ticket so that it's archived | P0 |
| US-06 | As an admin, I want to cancel an open ticket so that invalid requests are removed | P1 |

### Epic: Collaboration

| ID | Story | Priority |
|----|-------|----------|
| US-07 | As any user, I want to add comments to a ticket so that I can provide updates | P0 |
| US-08 | As any user, I want to see a comment timeline so that I can follow the conversation | P0 |

### Epic: Discovery

| ID | Story | Priority |
|----|-------|----------|
| US-09 | As an admin, I want to search tickets by keyword so that I can find related issues | P0 |
| US-10 | As an admin, I want to filter tickets by status and priority so that I can prioritize work | P0 |
| US-11 | As an admin, I want to see dashboard statistics so that I can monitor workload | P1 |

### Epic: Data Integrity

| ID | Story | Priority |
|----|-------|----------|
| US-12 | As the system, I must reject invalid status transitions so that workflow integrity is maintained | P0 |
| US-13 | As the system, I must validate all inputs so that data quality is preserved | P0 |

---

## 6. API Requirements

### 6.1 Response Envelope

**Success:**
```json
{
  "success": true,
  "data": {}
}
```

**Failure:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

### 6.2 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | List seeded users |
| GET | `/tickets` | List tickets (filters, sort, pagination) |
| GET | `/tickets/search` | Keyword search with filters |
| GET | `/tickets/:id` | Get ticket by ID (includes comments) |
| POST | `/tickets` | Create ticket |
| PUT | `/tickets/:id` | Update ticket |
| PATCH | `/tickets/:id/status` | Update status only |
| POST | `/tickets/:id/comments` | Add comment |

### 6.3 Query Parameters

**GET /tickets & GET /tickets/search**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Keyword search (search endpoint) |
| `status` | string[] | Filter by status |
| `priority` | string[] | Filter by priority |
| `assignedTo` | string | Filter by assignee ObjectId |
| `sort` | enum | `newest` \| `oldest` \| `priority` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

---

## 7. Validation Rules

### 7.1 Ticket Creation

| Field | Rule |
|-------|------|
| `title` | Required, 3–200 characters |
| `description` | Required, 10–5000 characters |
| `priority` | Required, enum: Low, Medium, High, Critical |
| `createdBy` | Required, valid ObjectId, must exist in Users |
| `assignedTo` | Optional, valid ObjectId, must exist in Users |
| `status` | Ignored on create; always defaults to `Open` |

### 7.2 Ticket Update

| Field | Rule |
|-------|------|
| `title` | Optional, 3–200 characters |
| `description` | Optional, 10–5000 characters |
| `priority` | Optional, enum |
| `assignedTo` | Optional, valid ObjectId or null |
| `status` | Optional, must pass state machine validation |
| `createdBy` | Immutable |

### 7.3 Status Patch

| Field | Rule |
|-------|------|
| `status` | Required, valid enum, must pass state machine from current status |

### 7.4 Comment Creation

| Field | Rule |
|-------|------|
| `message` | Required, 1–2000 characters |
| `createdBy` | Required, valid ObjectId, must exist in Users |

### 7.5 Common

| Rule | Description |
|------|-------------|
| ObjectId format | 24-char hex string; invalid → 400 |
| Unknown user ID | → 400 with `USER_NOT_FOUND` |
| Unknown ticket ID | → 404 with `TICKET_NOT_FOUND` |
| Invalid transition | → 400 with `INVALID_STATUS_TRANSITION` |

---

## 8. Error Handling

### 8.1 Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_STATUS_TRANSITION` | 400 | State machine violation |
| `INVALID_OBJECT_ID` | 400 | Malformed MongoDB ID |
| `USER_NOT_FOUND` | 400/404 | Referenced user does not exist |
| `TICKET_NOT_FOUND` | 404 | Ticket does not exist |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

### 8.2 Middleware Stack (Order)

1. Request logger
2. Body parser (JSON)
3. Routes
4. 404 handler
5. Global error handler

---

## 9. Assumptions

| # | Assumption | Rationale |
|---|------------|-----------|
| A1 | No authentication in v1; `createdBy` passed in request body | Simplifies demo; real system would use JWT/session |
| A2 | Single organization (no multi-tenancy) | Internal tool scope |
| A3 | English-only UI and content | No i18n requirement specified |
| A4 | MongoDB is the sole data store | Per tech stack |
| A5 | Frontend talks to backend via REST (not GraphQL) | Per spec |
| A6 | Activity timeline derived from ticket metadata + comments | No separate audit log collection |
| A7 | `createdBy` on frontend selected from user dropdown (simulated auth) | No real auth layer |
| A8 | Seed runs on app startup or via npm script | Standard pattern |
| A9 | CORS enabled for local dev frontend origin | Required for separate frontend/backend |
| A10 | Priority sort order: Critical > High > Medium > Low | Industry standard |

---

## 10. Edge Cases

| # | Edge Case | Expected Behavior |
|---|-----------|-------------------|
| E1 | Create ticket with non-existent `createdBy` | 400 USER_NOT_FOUND |
| E2 | Assign ticket to non-existent user | 400 USER_NOT_FOUND |
| E3 | Update closed ticket | Allowed for title/description; status transitions blocked |
| E4 | Cancel already closed ticket | 400 INVALID_STATUS_TRANSITION |
| E5 | Search with empty query | Return all tickets (with filters applied) |
| E6 | Page beyond total results | Return empty array with correct pagination meta |
| E7 | Limit > 100 | Cap at 100 or return 400 |
| E8 | Duplicate email in seed data | Seed script fails with error |
| E9 | Comment on cancelled ticket | Allowed (discussion can continue) |
| E10 | PUT with same status as current | Allowed (no-op transition) |
| E11 | PATCH status to same status | Allowed (idempotent) |
| E12 | Ticket with null `assignedTo` | Valid; shown as "Unassigned" in UI |
| E13 | Invalid ObjectId in URL params | 400 INVALID_OBJECT_ID |
| E14 | Empty title or description | 400 VALIDATION_ERROR |
| E15 | Very long search query | Truncate or reject at max length (256 chars) |

---

## 11. Risks

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| R1 | No authentication | Anyone can impersonate any user | Document as known limitation; design API to accept user ID for easy auth retrofit |
| R2 | Text search performance at scale | Slow queries with large datasets | MongoDB text indexes; pagination limits |
| R3 | State machine bypass via PUT | Data corruption | Validate status in both PUT and PATCH paths |
| R4 | Race conditions on concurrent status updates | Inconsistent state | Optimistic locking via `updatedAt` check (v2) or document as known limitation |
| R5 | Frontend/backend status enum drift | UI shows invalid options | Shared types or constants; backend is source of truth |
| R6 | Docker networking issues | Services can't communicate | Use docker-compose service names; document ports |
| R7 | Test flakiness with MongoDB | Unreliable CI | Use test database; clean between tests |
| R8 | Seed data idempotency | Duplicate users on restart | Upsert or check-before-insert in seed script |

---

## 12. Seed Data

### 12.1 Users (Minimum)

| Name | Email | Role |
|------|-------|------|
| Alice Johnson | alice@company.com | employee |
| Bob Smith | bob@company.com | admin |
| Carol Williams | carol@company.com | admin |
| Dave Admin | dave@company.com | admin |
| Eve Employee | eve@company.com | employee |

### 12.2 Sample Tickets (Optional, for demo)

3–5 tickets in various statuses for dashboard demonstration.
