# Implementation Plan

## Overview

Spec-first delivery in a **monorepo** with phased tasks (A–K). Each phase completes a vertical slice before moving on. AI (Cursor Agent) implemented one task per session; human reviewed diffs and approved pivots (e.g. v2 auth refactor).

**Detailed task list:** [`artifacts/tasks.md`](artifacts/tasks.md)

| Phase | Focus | Outcome |
|-------|-------|---------|
| A | Scaffolding | Monorepo, backend + frontend init |
| B | Backend core | Models, services, REST API, Swagger, tests, Dockerfile |
| C | Frontend | API client, hooks, pages, UI shell, Dockerfile |
| D | Integration | Docker Compose, README, verification |
| E–K | v2 auth/RBAC | JWT, PermissionService, audit, SaaS UI, test deepening |

---

## Task Breakdown

### Phase A — Scaffolding
- A1: Repository structure
- A2: Backend project init (Express, TypeScript, Vitest)
- A3: Frontend project init (Next.js, ShadCN, TanStack Query)

### Phase B — Backend Core
- B1–B3: Env, middleware, health
- B4–B8: Users, tickets, status machine, validators, services
- B9–B10: Ticket + comment REST endpoints
- B11: Swagger/OpenAPI
- B12–B13: Integration tests, Dockerfile

### Phase C — Frontend
- C1–C3: API client, services, TanStack Query hooks
- C4–C7: Layout, shared UI, dashboard, ticket list
- C8–C12: Create/edit/detail pages, error states, Dockerfile

### Phase D — Ship v1
- D1–D3: Docker Compose, README, final verification

### Phase E–K — v2 Auth, RBAC, SaaS UI
- JWT auth, three-tier roles, PermissionService, audit history
- Frontend auth provider, middleware, permission-gated actions
- Review-driven test expansion (137 → 174 tests)

---

## Milestones

| Milestone | Date | Evidence |
|-----------|------|----------|
| Docs before code | 2026-07-15 | Prompt 1 → spec, tasks, acceptance criteria |
| Backend API complete | 2026-07-15 | Phase B, 96 tests |
| Frontend complete | 2026-07-15 | Phase C |
| v1 Docker stack | 2026-07-15 | Phase D |
| v2 auth + RBAC | 2026-07-15 | Prompt 21–22, 137 tests |
| Review polish | 2026-07-15 | Prompt 23–27, 174 tests, submission docs |

---

## AI Usage Plan

| Phase | AI role | Human role |
|-------|---------|------------|
| Requirements | Structure spec, user stories, schema | Approve scope; refine roles (Prompt 2) |
| Planning | Generate `tasks.md` phases | Prioritize; reject scope creep |
| Design | Architecture in `project-context.md` | Approve v2 pivot (Prompt 21) |
| Implementation | One task per prompt ("Start B9", "Continue") | Review diffs before next task |
| Testing | Generate tests alongside features | Paste rubric gaps (Prompt 23) |
| Debugging | Trace symptoms, propose fixes | Validate fixes; approve merges |
| Review | Address rubric feedback | Final judgment on architecture |
| Documentation | `tool-workflow.md`, submission artifacts | Verify accuracy |

**Prompt log:** [`ai-prompts/prompt-history.md`](ai-prompts/prompt-history.md)

---

## Risks

| Risk | Impact |
|------|--------|
| AI generates code before architecture is stable | Architectural drift across sessions |
| RBAC logic duplicated in controllers | Security holes |
| Permission vs state machine ordering wrong | Wrong HTTP status codes (400 vs 403) |
| Swagger paths break in Docker prod | Empty API docs |
| Over-reliance on AI without tests | Regressions on refactor |
| Secrets leaked into prompts or code | Security incident |

---

## Mitigation

| Risk | Mitigation |
|------|------------|
| Architectural drift | Prompt 1: docs before code; persistent `cursor-rules-or-instructions.md` |
| RBAC duplication | PermissionService only; controllers stay thin |
| Wrong status codes | `assertCanChangeStatus` before `validateTransition`; `failure-modes.test.ts` |
| Swagger in Docker | Dual `.ts`/`.js` glob + `tsc-alias`; Docker build verification |
| Untested refactors | AC-mapped integration tests; CI lint + typecheck |
| Secrets | `.env.example` only; workspace rules forbid credentials in prompts |

**Decision log:** [`artifacts/implementation-log.md`](artifacts/implementation-log.md)
