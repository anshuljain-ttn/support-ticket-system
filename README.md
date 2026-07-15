# Support Ticket Management System

A production-quality support ticket application with JWT authentication, role-based access control, ownership rules, audit history, and a modern SaaS-style UI.

> **Built with Cursor (AI-assisted).** Workflow evidence is in **[tool-workflow.md](tool-workflow.md)** and [`tool-specific/cursor-workflow/`](tool-specific/cursor-workflow/).

## AI Workflow (Reviewer Entry Point)

| What to review | Where |
|----------------|-------|
| **Required submission** | **[tool-workflow.md](tool-workflow.md)** ← start here |
| **Every prompt + outcome** | [`tool-specific/cursor-workflow/prompt-history.md`](tool-specific/cursor-workflow/prompt-history.md) |
| **Decisions, bugs, debugging** | [`tool-specific/cursor-workflow/implementation-log.md`](tool-specific/cursor-workflow/implementation-log.md) |
| **Context fed to the agent** | [`project-context.md`](tool-specific/cursor-workflow/project-context.md), [`cursor-rules-or-instructions.md`](tool-specific/cursor-workflow/cursor-rules-or-instructions.md) |
| **Spec & acceptance criteria** | [`spec.md`](tool-specific/cursor-workflow/spec.md), [`acceptance-criteria.md`](tool-specific/cursor-workflow/acceptance-criteria.md) |
| **Phased task plan** | [`tasks.md`](tool-specific/cursor-workflow/tasks.md) |

**Tool:** Cursor IDE (Agent mode) · **Method:** spec-first → phased prompts → test → log

## Architecture Overview

```
┌─────────────────┐   cookie + REST    ┌──────────────────────────────┐     Mongoose     ┌─────────────┐
│  Next.js 16     │ ◄────────────────► │  Express API                 │ ◄────────────► │  MongoDB 7  │
│  (port 3000)    │                    │  Auth │ RBAC │ Audit │ API  │                │  (27017)    │
└─────────────────┘                    └──────────────────────────────┘                └─────────────┘
```

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Frontend | Next.js 16, ShadCN UI, TanStack Query | Login, role-aware dashboard, permission-gated UI |
| Auth | JWT (HTTP-only cookie), bcrypt | Login/logout/me; passwords hashed at rest |
| API | Express, Zod, PermissionService | RBAC + ownership enforced on every mutation |
| Data | MongoDB, embedded `history[]` | Users, tickets, comments, audit trail |

## Authentication Flow

1. User submits email + password at `/login`
2. Backend validates credentials, sets HTTP-only `sts_token` cookie
3. Frontend sends `withCredentials: true` on all API requests
4. `authenticate` middleware loads user from JWT; `PermissionService` enforces actions
5. Next.js middleware redirects unauthenticated users to `/login`

## Roles & RBAC

| Role | Ticket visibility | Workflow actions |
|------|-------------------|------------------|
| **EMPLOYEE** | Own tickets only | Edit/cancel while Open; comment anytime |
| **ADMIN** (owner) | Own tickets | Same as employee on owned tickets |
| **ADMIN** (non-owner) | Assigned + queue | Assign, edit, full workflow |
| **SUPER_ADMIN** | All tickets | Unrestricted |

**Ownership rule:** Ticket creators (employee or admin) cannot assign, resolve, close, or advance workflow on their own tickets. Another admin or super admin must process them.

## Seed Users

| Email | Role | Default password |
|-------|------|------------------|
| `superadmin@company.com` | SUPER_ADMIN | `SEED_DEFAULT_PASSWORD` |
| `bob@company.com` | ADMIN | same |
| `carol@company.com` | ADMIN | same |
| `alice@company.com` | EMPLOYEE | same |
| `dave@company.com` | EMPLOYEE | same |
| `eve@company.com` | EMPLOYEE | same |

Run `npm run seed` in `backend/` on first setup. Password is set via `SEED_DEFAULT_PASSWORD` in `.env`.

## Project Structure

```
support-ticket-system/
├── tool-workflow.md         # Required AI workflow submission
├── frontend/src/
│   ├── app/login/           # Public login
│   ├── app/(app)/           # Protected routes (dashboard, tickets, profile)
│   ├── components/          # UI, layout, tickets, auth
│   ├── providers/           # Auth, theme, query
│   └── middleware.ts        # Route protection
├── backend/src/
│   ├── services/            # auth, permission, audit, ticket, comment
│   ├── middleware/          # authenticate, validate, error
│   └── tests/               # 174 tests (unit + integration)
└── tool-specific/cursor-workflow/   # Supporting workflow artifacts
    ├── prompt-history.md            # All prompts and outcomes
    ├── implementation-log.md        # Decisions, bugs, debugging guide
    ├── project-context.md           # Architecture context for agent
    ├── cursor-rules-or-instructions.md
    ├── spec.md
    ├── tasks.md
    └── acceptance-criteria.md
```

## Features

- JWT authentication (login/logout/me) with HTTP-only cookies
- Three-tier RBAC with ownership rules
- Embedded audit `history[]` on tickets
- Role-aware dashboard (`GET /dashboard/stats`)
- Ticket CRUD, comments, assign (`PATCH /tickets/:id/assign`)
- Search, filters, pagination (permission-scoped)
- Status workflow enforcement
- Dark mode + SaaS UI shell
- Swagger at `/api-docs`
- Docker Compose full stack

## Status Workflow

```
Open ──────────► In Progress ──────────► Resolved ──────────► Closed
  │                    │
  └──────► Cancelled ◄─┘
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Frontend origin (`http://localhost:3000`) |
| `JWT_SECRET` | Min 32 characters |
| `JWT_EXPIRES_IN` | Token TTL (default `7d`) |
| `AUTH_COOKIE_NAME` | Cookie name (default `sts_token`) |
| `COOKIE_SECURE` | `true` in production HTTPS |
| `SEED_DEFAULT_PASSWORD` | Password for all seed users |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (`http://localhost:4000`) |
| `NEXT_PUBLIC_AUTH_COOKIE_NAME` | Must match backend `AUTH_COOKIE_NAME` |

## Local Development

```bash
# MongoDB
docker compose up mongodb -d

# Backend
cd backend && npm install && cp .env.example .env
# Edit .env with JWT_SECRET and SEED_DEFAULT_PASSWORD
npm run seed && npm run dev

# Frontend
cd frontend && npm install && cp .env.example .env.local
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:3000/login | Login page |
| http://localhost:3000 | Dashboard (protected) |
| http://localhost:4000/api-docs | Swagger UI |

## Docker

```bash
docker compose up --build
```

Backend auto-seeds users on first startup when the database is empty.

## Testing

```bash
cd backend && npm test        # 174 tests
cd frontend && npm run typecheck && npm run lint
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Current user |
| GET | `/dashboard/stats` | Yes | Role-aware dashboard |
| GET | `/tickets` | Yes | List (scoped) |
| GET | `/tickets/search` | Yes | Search (scoped) |
| GET | `/tickets/:id` | Yes | Detail + history + permissions |
| POST | `/tickets` | Yes | Create |
| PUT | `/tickets/:id` | Yes | Update |
| PATCH | `/tickets/:id/status` | Yes | Status change |
| PATCH | `/tickets/:id/assign` | Yes | Assign |
| POST | `/tickets/:id/comments` | Yes | Add comment |
| GET | `/users` | Yes | User directory |

## Documentation

| Document | Description |
|----------|-------------|
| **[tool-workflow.md](tool-workflow.md)** | **Required submission** — AI tool usage across requirements, planning, code, testing, debugging, review |
| [`tool-specific/cursor-workflow/`](tool-specific/cursor-workflow/) | Supporting artifacts (prompt history, implementation log, spec, tasks) |

## License

Internal use only.
