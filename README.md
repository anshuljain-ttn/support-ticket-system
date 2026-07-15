# Support Ticket Management System

An internal support ticket application for creating, assigning, updating, and tracking support tickets through a predefined workflow.

## Architecture Overview

```
┌─────────────────┐     REST (JSON)      ┌─────────────────┐     Mongoose      ┌─────────────┐
│  Next.js 16     │ ◄──────────────────► │  Express API    │ ◄──────────────► │  MongoDB 7  │
│  (port 3000)    │                      │  (port 4000)    │                  │  (27017)    │
└─────────────────┘                      └─────────────────┘                  └─────────────┘
        │                                         │
        │ TanStack Query + Axios                  │ Zod validation, status machine,
        │ React Hook Form + ShadCN UI             │ Swagger at /api-docs
        └─────────────────────────────────────────┘
```

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Frontend | Next.js 16, TypeScript, Tailwind v4, ShadCN UI | Dashboard, ticket CRUD UI, filters, comments |
| API | Express 4, TypeScript, Zod | REST endpoints, validation, error envelope |
| Data | MongoDB 7, Mongoose | Users, tickets, comments |
| Ops | Docker Compose | MongoDB + API + frontend with health checks |

**Auth note:** v1 has no authentication. The frontend sends `createdBy` (and comment author) via a user dropdown to simulate identity. Auth can be added later as middleware without changing the service layer.

## Project Structure

```
support-ticket-system/
├── frontend/                 # Next.js App Router application
│   ├── src/app/              # Routes (dashboard, tickets, create/edit/detail)
│   ├── src/components/       # UI, layout, tickets, comments
│   ├── src/hooks/            # TanStack Query hooks
│   ├── src/services/         # API client and service layer
│   └── Dockerfile            # Multi-stage standalone build
├── backend/                  # Express REST API
│   ├── src/controllers/      # HTTP handlers
│   ├── src/services/         # Business logic + status machine
│   ├── src/repositories/     # MongoDB access
│   ├── src/validators/       # Zod request schemas
│   ├── tests/                # Unit + integration tests (Vitest)
│   └── Dockerfile            # Multi-stage production build
├── tool-specific/cursor-workflow/   # Spec, tasks, acceptance criteria
├── docker-compose.yml        # Full-stack orchestration
└── README.md
```

## Features

- **Ticket CRUD** with priority and optional assignment
- **Comment threads** on ticket detail pages
- **Enforced status workflow** with allowed-transition validation
- **Search** across titles, descriptions, and comment messages
- **Filtering** by status, priority, and assignee (URL-synced on list page)
- **Sorting** (newest, oldest, priority) and pagination
- **Dashboard** with status statistics and recent tickets
- **Swagger UI** at `/api-docs`
- **96+ backend tests** (unit + integration)

## Status Workflow

```
Open ──────────► In Progress ──────────► Resolved ──────────► Closed
  │                    │
  └──────► Cancelled ◄─┘
```

| Current Status | Allowed Transitions |
|----------------|---------------------|
| Open | In Progress, Cancelled |
| In Progress | Resolved, Cancelled |
| Resolved | Closed |
| Closed | *(terminal)* |
| Cancelled | *(terminal)* |

## Prerequisites

- **Node.js 20+** and npm
- **MongoDB 7+** (local install or Docker)
- **Docker & Docker Compose** (optional, for containerized setup)

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | `development`, `test`, or `production` | `development` |
| `PORT` | HTTP server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/support-tickets` |
| `CORS_ORIGIN` | Allowed frontend origin (must be valid URL) | `http://localhost:3000` |
| `LOG_LEVEL` | `error`, `warn`, `info`, `debug` | `info` |

Copy `backend/.env.example` to `backend/.env` before running locally.

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (browser-accessible) | `http://localhost:4000` |

Copy `frontend/.env.example` to `frontend/.env.local` before running locally.

> **Docker note:** `NEXT_PUBLIC_API_URL` must be reachable from your **browser**, not from inside the frontend container. With the default port mapping, use `http://localhost:4000`.

## Local Development

### 1. Start MongoDB

```bash
# Option A — Docker (MongoDB only)
docker compose up mongodb -d

# Option B — local MongoDB instance on port 27017
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed          # first run only; fails if users already exist
npm run dev           # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev           # http://localhost:3000
```

### Useful URLs (local)

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Dashboard |
| http://localhost:3000/tickets | Ticket list with filters |
| http://localhost:3000/tickets/new | Create ticket |
| http://localhost:4000/health | API health check |
| http://localhost:4000/api-docs | Swagger UI |
| http://localhost:4000/api-docs.json | OpenAPI JSON |

## Docker (Full Stack)

Start MongoDB, backend (with auto-seed), and frontend:

```bash
docker compose up --build
```

| Service | Port | Notes |
|---------|------|-------|
| Frontend | 3000 | Next.js standalone server |
| Backend | 4000 | Seeds users on first startup if DB is empty |
| MongoDB | 27017 | Data persisted in `mongodb_data` volume |

**Startup order:** MongoDB health check → backend seed + API → frontend.

```bash
# Run in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop and remove containers
docker compose down

# Stop and remove containers + MongoDB volume
docker compose down -v
```

## Testing & Quality

### Backend

```bash
cd backend
npm test              # Vitest — unit + integration (96 tests)
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
```

### Frontend

```bash
cd frontend
npm run typecheck
npm run lint
npm run build         # production build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | List seeded users |
| GET | `/tickets` | List tickets (filters, sort, pagination) |
| GET | `/tickets/search` | Keyword search |
| GET | `/tickets/:id` | Ticket detail + comments + allowed transitions |
| POST | `/tickets` | Create ticket |
| PUT | `/tickets/:id` | Update ticket fields |
| PATCH | `/tickets/:id/status` | Update status (validated transitions) |
| POST | `/tickets/:id/comments` | Add comment |

All responses use the envelope format `{ success: true, data }` or `{ success: false, error }`.

## Documentation

| Document | Purpose |
|----------|---------|
| [spec.md](tool-specific/cursor-workflow/spec.md) | Requirements and entity definitions |
| [project-context.md](tool-specific/cursor-workflow/project-context.md) | Architecture and coding conventions |
| [tasks.md](tool-specific/cursor-workflow/tasks.md) | Implementation task breakdown |
| [acceptance-criteria.md](tool-specific/cursor-workflow/acceptance-criteria.md) | Definition of done |
| [implementation-log.md](tool-specific/cursor-workflow/implementation-log.md) | Decisions and change log |

## Future Improvements

- User authentication (JWT/OAuth) with role-based access control
- `GET /tickets/stats` endpoint (frontend currently aggregates client-side)
- Email notifications on status changes and assignments
- File attachments on tickets
- Real-time updates via WebSockets
- Dedicated audit log collection for status/assignment history
- Rate limiting and API versioning

## License

Internal use only.
