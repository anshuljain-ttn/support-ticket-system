# Support Ticket Management System

An internal support ticket application for creating, assigning, updating, and tracking support tickets through a predefined workflow.

## Overview

This monorepo contains a full-stack support ticket management system built with:

- **Frontend:** Next.js 15, TypeScript, TailwindCSS, ShadCN UI, TanStack Query
- **Backend:** Express.js, TypeScript, MongoDB, Mongoose, Zod
- **Infrastructure:** Docker Compose, Swagger/OpenAPI

## Project Structure

```
support-ticket-system/
├── frontend/          # Next.js 15 App Router application
├── backend/           # Express.js REST API
├── tool-specific/
│   └── cursor-workflow/   # Spec, tasks, architecture docs
│       ├── project-context.md
│       ├── spec.md
│       ├── tasks.md
│       ├── acceptance-criteria.md
│       ├── cursor-rules-or-instructions.md
│       ├── prompt-history.md
│       └── implementation-log.md
├── docker-compose.yml
└── README.md
```

## Features

- Ticket CRUD with priority and assignment
- Comment threads on tickets
- Enforced status workflow (Open → In Progress → Resolved → Closed, with Cancelled branch)
- Keyword search across titles, descriptions, and comments
- Filtering by status, priority, and assignee
- Sorting and pagination
- Dashboard with status statistics
- Swagger API documentation
- Comprehensive integration tests

## Status Workflow

```
Open ──────────► In Progress ──────────► Resolved ──────────► Closed
  │                    │
  └──────► Cancelled ◄─┘
```

## Getting Started

> **Status:** Project scaffolding in progress. See `tool-specific/cursor-workflow/tasks.md` for implementation progress.

### Prerequisites

- Node.js 20+
- MongoDB 7+ (or Docker)
- npm or yarn

### Documentation

| Document | Purpose |
|----------|---------|
| [spec.md](tool-specific/cursor-workflow/spec.md) | Full requirements and entity definitions |
| [project-context.md](tool-specific/cursor-workflow/project-context.md) | Architecture and coding conventions |
| [tasks.md](tool-specific/cursor-workflow/tasks.md) | Implementation task breakdown |
| [acceptance-criteria.md](tool-specific/cursor-workflow/acceptance-criteria.md) | Definition of done |

### Environment Variables

**Backend** (`backend/.env`):

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/support-tickets` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |

**Frontend** (`frontend/.env.local`):

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000` |

### Running Locally

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Running with Docker

```bash
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger UI: http://localhost:4000/api-docs

### Testing

```bash
cd backend
npm test
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/users` | List seeded users |
| GET | `/tickets` | List tickets (filters, sort, pagination) |
| GET | `/tickets/search` | Keyword search |
| GET | `/tickets/:id` | Get ticket detail |
| POST | `/tickets` | Create ticket |
| PUT | `/tickets/:id` | Update ticket |
| PATCH | `/tickets/:id/status` | Update status |
| POST | `/tickets/:id/comments` | Add comment |

## Future Improvements

- User authentication (JWT/OAuth)
- Email notifications on status changes
- File attachments on tickets
- Real-time updates via WebSockets
- Role-based access control
- Audit log collection
- Rate limiting
- API versioning

## License

Internal use only.
