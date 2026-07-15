# Support Ticket Management System

A production-quality support ticket application with JWT authentication, role-based access control, ownership rules, audit history, and a modern SaaS-style UI.

> **Submission / AI workflow:** Start at **[SUBMISSION.md](SUBMISSION.md)** → **[tool-workflow.md](tool-workflow.md)** → `docs/` · `ai-prompts/` · `artifacts/` · `tool-specific/`

## Submission & AI Workflow (Reviewer Entry Point)

| What to review | Where |
|----------------|-------|
| **Checklist (human glance)** | **[SUBMISSION.md](SUBMISSION.md)** |
| **Candidate info** | [`candidate-info.md`](candidate-info.md) |
| **Submission artifacts** | Root: `requirements-analysis.md`, `acceptance-criteria.md`, `implementation-plan.md`, `design-notes.md`, `api-contract.md`, `test-strategy.md`, `debugging-notes.md`, `code-review-notes.md`, `reflection.md`, `pr-description.md` |
| **Required workflow doc** | **[tool-workflow.md](tool-workflow.md)** |
| **Form answers** | [`artifacts/form-answers.md`](artifacts/form-answers.md) |
| **Design specs** | [`docs/`](docs/) — spec, architecture, acceptance criteria |
| **Prompt log** | [`ai-prompts/`](ai-prompts/) — [`ai-prompts/prompt-history.md`](ai-prompts/prompt-history.md) index |
| **Iteration logs** | [`artifacts/implementation-log.md`](artifacts/implementation-log.md), [`artifacts/tasks.md`](artifacts/tasks.md) |
| **Tool-specific (Cursor)** | [`tool-specific/cursor-workflow/`](tool-specific/cursor-workflow/) — spec, tasks, cursor rules |

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
├── SUBMISSION.md            # Reviewer checklist — start here
├── candidate-info.md        # Submission artifacts (see SUBMISSION.md for full list)
├── tool-workflow.md         # Required AI workflow submission
├── docs/                    # Design spec, architecture, acceptance criteria
├── ai-prompts/              # Prompt history by lifecycle phase (27 prompts)
├── artifacts/               # Form answers, implementation log, tasks
├── tool-specific/           # Cursor agent context
│   └── cursor-workflow/
│       ├── spec.md
│       ├── project-context.md
│       ├── tasks.md
│       ├── acceptance-criteria.md
│       └── cursor-rules-or-instructions.md
├── frontend/src/
│   ├── app/login/           # Public login
│   ├── app/(app)/           # Protected routes (dashboard, tickets, profile)
│   ├── components/          # UI, layout, tickets, auth
│   ├── providers/           # Auth, theme, query
│   └── middleware.ts        # Route protection
└── backend/src/
    ├── services/            # auth, permission, audit, ticket, comment
    ├── middleware/          # authenticate, validate, error
    └── tests/               # 174 tests (unit + integration)
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
| **[SUBMISSION.md](SUBMISSION.md)** | Reviewer checklist — all deliverables and folder map |
| **[candidate-info.md](candidate-info.md)** | Candidate and project summary |
| **[tool-workflow.md](tool-workflow.md)** | **Required submission** — full AI lifecycle narrative |
| **[acceptance-criteria.md](acceptance-criteria.md)** | Checkbox acceptance summary |
| **[requirements-analysis.md](requirements-analysis.md)** | Requirements and edge cases |
| **[implementation-plan.md](implementation-plan.md)** | Phased plan, risks, AI usage |
| **[design-notes.md](design-notes.md)** | Architecture and design decisions |
| **[api-contract.md](api-contract.md)** | Key API endpoints |
| **[test-strategy.md](test-strategy.md)** | Test scope and coverage |
| **[debugging-notes.md](debugging-notes.md)** | Documented bugs and fixes |
| **[code-review-notes.md](code-review-notes.md)** | Review feedback and changes |
| **[reflection.md](reflection.md)** | AI workflow reflection |
| **[pr-description.md](pr-description.md)** | PR-style delivery summary |
| [`artifacts/form-answers.md`](artifacts/form-answers.md) | Assignment form answers (Q&A format) |
| [`docs/`](docs/) | Design spec, architecture, acceptance criteria |
| [`ai-prompts/`](ai-prompts/) | Prompt history by lifecycle phase (index + category files) |
| [`artifacts/`](artifacts/) | Implementation log, tasks, cursor rules |
| [`tool-specific/`](tool-specific/) | Cursor-specific workflow folder |

## License

Internal use only.
