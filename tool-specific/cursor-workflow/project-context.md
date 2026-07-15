# Project Context — Support Ticket Management System

> **Purpose:** Persistent context for AI-assisted development. Read this file at the start of every implementation session.

---

## 1. Business Goal

Build a production-quality **internal support ticket management system** where employees create tickets, admins assign and resolve them, and all parties collaborate via comments. The system enforces a strict status workflow and provides search, filtering, and dashboard analytics.

This project demonstrates: clean architecture, full-stack TypeScript, MongoDB design, comprehensive testing, API documentation, and Docker deployment.

---

## 2. Technology Choices

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 15+ (App Router) | SSR/SSG capable, industry standard, excellent DX |
| UI | ShadCN UI + TailwindCSS | Accessible, composable, consistent design system |
| Forms | React Hook Form + Zod | Performant forms with schema validation |
| Data Fetching | TanStack Query + Axios | Caching, loading states, retry logic |
| Backend | Express.js + TypeScript | Mature, flexible, well-understood |
| Database | MongoDB + Mongoose | Document model fits ticket/comment structure |
| Validation | Zod (both layers) | Single schema language, type inference |
| Testing | Vitest + Supertest | Fast, ESM-native, Express-compatible |
| API Docs | Swagger/OpenAPI | Auto-generated, interactive |
| Container | Docker Compose | Reproducible local and deployment environment |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│                    Next.js 15 — App Router                      │
│         Pages │ Components │ Hooks │ Services │ Types           │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API SERVER (Express)                       │
│    Routes → Controllers → Services → Repositories → Models    │
│         Middleware: Logger │ Error Handler │ Validator          │
└────────────────────────────┬────────────────────────────────────┘
                             │ Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MongoDB                                 │
│              Collections: users, tickets, comments              │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Backend is source of truth** — especially for status transitions
2. **Thin controllers** — delegate to services
3. **Repositories abstract data access** — services never touch Mongoose directly
4. **DTOs at API boundary** — never expose Mongoose documents
5. **Validation at every boundary** — request body, query params, URL params

---

## 4. Backend Architecture

### 4.1 Layer Responsibilities

```
Request
  │
  ▼
┌──────────────┐
│   Routes     │  HTTP method + path mapping
└──────┬───────┘
       ▼
┌──────────────┐
│ Middleware   │  Logger, validator, error wrapper
└──────┬───────┘
       ▼
┌──────────────┐
│ Controller   │  Parse request, call service, format response
└──────┬───────┘
       ▼
┌──────────────┐
│ Service      │  Business logic, state machine, orchestration
└──────┬───────┘
       ▼
┌──────────────┐
│ Repository   │  Database queries, Mongoose operations
└──────┬───────┘
       ▼
┌──────────────┐
│ Model        │  Mongoose schema + indexes
└──────────────┘
```

### 4.2 Backend Folder Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # HTTP server entry
│   ├── config/
│   │   ├── env.ts                # Environment validation (Zod)
│   │   └── database.ts           # MongoDB connection
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── ticket.model.ts
│   │   └── comment.model.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── ticket.repository.ts
│   │   └── comment.repository.ts
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── ticket.service.ts
│   │   ├── comment.service.ts
│   │   └── status-machine.service.ts
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   ├── user.controller.ts
│   │   ├── ticket.controller.ts
│   │   └── comment.controller.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── health.routes.ts
│   │   ├── user.routes.ts
│   │   └── ticket.routes.ts
│   ├── middleware/
│   │   ├── logger.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── validators/
│   │   ├── ticket.validator.ts
│   │   ├── comment.validator.ts
│   │   └── common.validator.ts
│   ├── dto/
│   │   ├── ticket.dto.ts
│   │   ├── comment.dto.ts
│   │   └── user.dto.ts
│   ├── types/
│   │   ├── api-response.types.ts
│   │   ├── ticket.types.ts
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── object-id.ts
│   │   └── pagination.ts
│   ├── constants/
│   │   ├── status-transitions.ts
│   │   └── error-codes.ts
│   └── scripts/
│       └── seed.ts
├── tests/
│   ├── integration/
│   │   ├── tickets.test.ts
│   │   ├── status-machine.test.ts
│   │   ├── comments.test.ts
│   │   └── validation.test.ts
│   ├── helpers/
│   │   ├── test-app.ts
│   │   └── test-db.ts
│   └── setup.ts
├── Dockerfile
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
└── .eslintrc.cjs
```

### 4.3 State Machine Service

Centralized in `status-machine.service.ts`:

```typescript
const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  'Open': ['In Progress', 'Cancelled'],
  'In Progress': ['Resolved', 'Cancelled'],
  'Resolved': ['Closed'],
  'Closed': [],
  'Cancelled': [],
};

function canTransition(from: TicketStatus, to: TicketStatus): boolean;
function validateTransition(from: TicketStatus, to: TicketStatus): void; // throws
function getAllowedTransitions(from: TicketStatus): TicketStatus[];
```

---

## 5. Frontend Architecture

### 5.1 Architecture Pattern

- **App Router** for routing and layouts
- **Feature-based modules** for domain logic
- **Shared UI components** via ShadCN
- **Custom hooks** for data fetching (TanStack Query wrappers)
- **API service layer** — Axios instance with interceptors
- **Zod schemas** shared between forms and API types

### 5.2 Frontend Folder Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── tickets/
│   │       ├── page.tsx                # Ticket list
│   │       ├── new/
│   │       │   └── page.tsx            # Create ticket
│   │       └── [id]/
│   │           ├── page.tsx            # Ticket detail
│   │           └── edit/
│   │               └── page.tsx        # Edit ticket
│   ├── components/
│   │   ├── ui/                         # ShadCN primitives
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── page-container.tsx
│   │   ├── tickets/
│   │   │   ├── ticket-table.tsx
│   │   │   ├── ticket-form.tsx
│   │   │   ├── ticket-filters.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── priority-badge.tsx
│   │   │   ├── status-select.tsx
│   │   │   └── assignment-select.tsx
│   │   ├── comments/
│   │   │   ├── comment-timeline.tsx
│   │   │   └── comment-form.tsx
│   │   ├── dashboard/
│   │   │   └── stats-cards.tsx
│   │   └── common/
│   │       ├── empty-state.tsx
│   │       ├── error-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── pagination.tsx
│   ├── hooks/
│   │   ├── use-tickets.ts
│   │   ├── use-ticket.ts
│   │   ├── use-users.ts
│   │   ├── use-comments.ts
│   │   └── use-ticket-stats.ts
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── ticket.service.ts
│   │   ├── user.service.ts
│   │   └── comment.service.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── query-client.ts
│   │   └── status-transitions.ts       # Mirror backend (UI only)
│   ├── schemas/
│   │   ├── ticket.schema.ts
│   │   └── comment.schema.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── ticket.types.ts
│   │   └── user.types.ts
│   └── providers/
│       └── query-provider.tsx
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.example
└── .eslintrc.json
```

### 5.3 State Management Strategy

| State Type | Solution |
|------------|----------|
| Server state | TanStack Query (tickets, users, comments, stats) |
| Form state | React Hook Form |
| UI state | React `useState` / `useReducer` (filters, modals) |
| URL state | Next.js `searchParams` (pagination, filters) |

No global client state store (Redux/Zustand) needed — server state dominates.

---

## 6. Database Architecture

### 6.1 Collections

```
users          tickets              comments
─────────      ─────────            ─────────
_id            _id                  _id
name           title                ticketId  → tickets._id
email (unique) description          message
role           priority             createdBy → users._id
               status               createdAt
               assignedTo → users
               createdBy → users
               createdAt
               updatedAt
```

### 6.2 Indexes

```javascript
// users
{ email: 1 }                          // unique

// tickets
{ status: 1, createdAt: -1 }          // filter + sort
{ priority: 1 }                       // filter + sort
{ assignedTo: 1 }                     // filter
{ createdBy: 1 }                      // filter
{ title: 'text', description: 'text' } // keyword search

// comments
{ ticketId: 1, createdAt: -1 }        // timeline per ticket
{ message: 'text' }                   // search in comments
```

### 6.3 Relationships

- **Tickets → Users:** `createdBy` (required), `assignedTo` (optional) — application-level refs
- **Comments → Tickets:** `ticketId` (required, cascade delete on ticket removal)
- **Comments → Users:** `createdBy` (required)

No Mongoose `populate()` in hot paths for list views; populate only for detail view.

---

## 7. API Architecture

### 7.1 Versioning

No URL versioning in v1. All routes at root: `/tickets`, `/users`, `/health`.

### 7.2 Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 7.3 Ticket Detail Response

```json
{
  "success": true,
  "data": {
    "ticket": { },
    "comments": [],
    "allowedTransitions": ["In Progress", "Cancelled"]
  }
}
```

---

## 8. Validation Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Request body | Zod via `validate.middleware.ts` | POST, PUT, PATCH bodies |
| Query params | Zod | GET filters, pagination |
| URL params | Zod | `:id` ObjectId format |
| Business rules | Service layer | State machine, user existence |
| Frontend forms | Zod + React Hook Form | All user inputs |

**Rule:** Never trust frontend validation alone. Backend always validates.

---

## 9. Testing Strategy

### 9.1 Test Pyramid

```
        ┌─────────┐
        │  E2E    │  (out of scope v1)
        ├─────────┤
        │ Integr. │  ← Primary focus: API + state machine
        ├─────────┤
        │  Unit   │  ← Status machine, validators, utils
        └─────────┘
```

### 9.2 Integration Test Setup

- Spin up Express app with test MongoDB (in-memory or dedicated test DB)
- Seed users before each test suite
- Clean collections between tests
- Use Supertest for HTTP assertions

### 9.3 Mandatory Test Cases

- All 6 valid status transitions
- All specified invalid transitions
- Validation failures (missing fields, bad IDs)
- 404 scenarios
- Pagination edge cases

---

## 10. Coding Conventions

### 10.1 Naming

| Entity | Convention | Example |
|--------|------------|---------|
| Files | kebab-case | `ticket.service.ts` |
| Classes | PascalCase | `TicketService` |
| Functions | camelCase | `getTicketById` |
| Constants | UPPER_SNAKE | `ALLOWED_TRANSITIONS` |
| Interfaces | PascalCase, no `I` prefix | `TicketDto` |
| React components | PascalCase | `TicketTable` |
| Hooks | camelCase, `use` prefix | `useTickets` |
| Env vars | UPPER_SNAKE | `MONGODB_URI` |

### 10.2 TypeScript

- `strict: true` in tsconfig
- No `any` — use `unknown` and narrow
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types from dedicated `types/` files

### 10.3 Error Handling

- Services throw domain errors (`AppError` class with code + status)
- Controllers catch nothing — middleware handles
- Never expose stack traces in production responses

### 10.4 Functions

- Max ~40 lines; extract helpers when exceeded
- Single responsibility per function
- Pure functions preferred for business logic (state machine)

### 10.5 Imports

- Absolute imports via path aliases (`@/services`, `@/components`)
- Group: external → internal → relative

---

## 11. Environment Variables

### Backend (`.env`)

```
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/support-tickets
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### Frontend (`.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 12. Docker Architecture

```yaml
services:
  mongodb:     # Mongo 7, port 27017, named volume
  backend:     # Node 20, port 4000, depends on mongodb
  frontend:    # Node 20, port 3000, depends on backend
```

- Backend waits for MongoDB health check before starting
- Seed script runs on backend startup in Docker
- Frontend `NEXT_PUBLIC_API_URL` points to backend service name

---

## 13. Key Decisions Log

| Decision | Choice | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| No auth v1 | Pass `createdBy` in body | JWT mock, session | Scope reduction; easy to add later |
| Status machine as service | Dedicated `StatusMachineService` | Inline in ticket service | Single responsibility, testable |
| No audit log collection | Derive activity from ticket + comments | Separate `activities` collection | YAGNI for v1 |
| Text search | MongoDB text indexes | Elasticsearch | Sufficient for internal tool scale |
| Monorepo | Single repo, two apps | Separate repos | Easier local dev, shared docs |
