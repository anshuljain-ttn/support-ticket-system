# Candidate Information

**Name:** Anshul Jain  
**Role:** Software Engineer  
**Primary Technology Stack:** TypeScript, Node.js (Express), Next.js, MongoDB, Docker

**Primary AI Tool Used:** Cursor IDE (Agent mode)  
**Project Option Selected:** Support Ticket Management System

**Assessment Start Date:** 2026-07-15  
**Submission Date:** 2026-07-15

---

## Project Summary

Built a production-quality **Support Ticket Management System** with JWT authentication, three-tier RBAC (SUPER_ADMIN / ADMIN / EMPLOYEE), ownership rules, embedded audit history, and a SaaS-style UI. The system enforces a ticket status state machine, supports search/filter/sort/pagination, and ships with Docker Compose, Swagger/OpenAPI, and **174 automated tests**.

Development followed a **spec-first, phased** approach: documentation and acceptance criteria before code, then task-by-task implementation with AI assistance and human review.

## Tools Used

| Tool | Purpose |
|------|---------|
| **Cursor IDE** | Agent-mode implementation, testing, debugging, doc generation |
| **TypeScript** | Strict typing across frontend and backend |
| **Express + Mongoose** | REST API and MongoDB persistence |
| **Next.js 16 + ShadCN UI** | Frontend app shell, forms, role-aware UI |
| **Zod** | Request validation (API) and form validation (UI) |
| **Vitest + Supertest** | Unit and integration tests |
| **TanStack Query** | Server state and caching on the frontend |
| **Docker Compose** | Full-stack local deployment |
| **swagger-jsdoc** | Interactive API docs at `/api-docs` |

## Setup Summary

```bash
# Backend
cd backend && cp .env.example .env && npm install && npm run seed && npm run dev

# Frontend (separate terminal)
cd frontend && cp .env.example .env && npm install && npm run dev

# Or full stack
docker compose --profile full up --build

# Verify
cd backend && npm test   # 174 tests
```

**Seed users:** `superadmin@company.com`, `bob@company.com`, `carol@company.com`, `alice@company.com`, `dave@company.com`, `eve@company.com` — password from `SEED_DEFAULT_PASSWORD` in `.env`.

**Key entry points for reviewers:** [`SUBMISSION.md`](SUBMISSION.md) · [`tool-workflow.md`](tool-workflow.md) · [`ai-prompts/`](ai-prompts/)
