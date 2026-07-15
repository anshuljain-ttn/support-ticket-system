# Design Notes

## Architecture Overview (frontend, backend, database)

```
┌─────────────────┐   cookie + REST    ┌──────────────────────────────┐     Mongoose     ┌─────────────┐
│  Next.js 16     │ ◄────────────────► │  Express API                 │ ◄────────────► │  MongoDB 7  │
│  (port 3000)    │                    │  Auth │ RBAC │ Audit │ API  │                │  (27017)    │
└─────────────────┘                    └──────────────────────────────┘                └─────────────┘
```

**Pattern:** Monorepo with strict layer separation. Backend authority for all business rules and permissions. Frontend mirrors status transitions for UX only.

**Full context:** [`docs/architecture.md`](docs/architecture.md) (symlink to `project-context.md`)

---

## Frontend Design

| Concern | Approach |
|---------|----------|
| Framework | Next.js 16 App Router, TypeScript strict |
| UI | ShadCN UI, Tailwind, dark mode via theme provider |
| State | TanStack Query for server state; URL-synced filters on ticket list |
| Auth | `AuthProvider`, HTTP-only cookie, `withCredentials` on Axios |
| Routing | Next.js middleware protects `(app)` routes; `/login` public |
| Forms | react-hook-form + Zod schemas mirroring backend validators |
| Permissions | UI hides disallowed actions; backend enforces truth |

**Key folders:** `frontend/src/app/`, `components/`, `hooks/`, `services/`, `providers/`

---

## Backend Design

| Layer | Responsibility |
|-------|----------------|
| `routes/` | Mount paths, apply middleware |
| `controllers/` | Parse request, call service, format response |
| `services/` | Business logic, RBAC, state machine, audit |
| `repositories/` | Mongoose queries only |
| `validators/` | Zod schemas |
| `dto/` | API boundary types (no Mongoose leakage) |
| `middleware/` | Auth, validation, error handling, logging |

**Key services:**
- `PermissionService` — RBAC matrix + ownership
- `StatusMachineService` — transition validation
- `AuditService` — append to `history[]`
- `AuthService` — login, JWT, bcrypt

**Error envelope:** `{ success: false, error: { code, message, details? } }`

---

## Database Design

| Collection | Key fields |
|------------|------------|
| **users** | `name`, `email`, `password` (bcrypt), `role`, `avatar`, `isActive` |
| **tickets** | `title`, `description`, `status`, `priority`, `createdBy`, `assignedTo`, `comments[]`, `history[]`, timestamps |
| **comments** | Embedded in ticket: `message`, `createdBy`, `createdAt` |
| **history** | Embedded audit: `action`, `field`, `oldValue`, `newValue`, `performedBy`, `timestamp` |

**Indexes:** Text indexes on ticket title/description for search; compound indexes for list filters.

**Decision D3:** No separate audit collection — embedded `history[]` for simplicity and atomic reads.

---

## Validation Strategy

- **API:** Zod middleware validates body, query, params before controller
- **Domain:** Services throw `AppError` with typed codes
- **State machine:** `StatusMachineService.validateTransition(from, to)`
- **Frontend:** Zod schemas in `frontend/src/schemas/`; shared transition map in `lib/status-transitions.ts`

---

## Error Handling Strategy

| HTTP | When |
|------|------|
| 400 | Validation failure, invalid transition (after permission check) |
| 401 | Missing/invalid JWT |
| 403 | Authenticated but not permitted |
| 404 | Resource not found |
| 500 | Unhandled — logged, generic message to client |

Global `error.middleware.ts` maps `AppError` → status + envelope.

---

## Testing Strategy Link

See [`test-strategy.md`](test-strategy.md). Tests map to acceptance criteria where possible (e.g. `AC-5.1` in `status-machine.test.ts`).
