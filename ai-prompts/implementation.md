# Implementation Prompts

> Task-driven code generation following `tasks.md` and cursor rules.

---

## Session 1 — 2026-07-15

### Prompt 3: Begin Implementation

**Type:** Follow-up  
**Date:** 2026-07-15

```
Now start implementing the project according to tasks.md.
[Full implementation workflow instructions]
```

**Outcome:** Task A1 completed — monorepo structure initialized.

---

### Prompt 4: Start Task B1

**Type:** Follow-up  
**Date:** 2026-07-15

```
Start With Task B1
```

**Outcome:** Task B1 completed — backend env config, database connection, Express bootstrap, API response envelope.

---

### Prompt 5: Separate GitHub SSH Identity

**Type:** Refinement  
**Date:** 2026-07-15

```
Don't want to use lumi-anshul-jain ssh key, need a separate one for anshuljain-ttn
```

**Outcome:** Created dedicated SSH key pair in `.ssh/id_ed25519_anshuljain_ttn`, configured repo `core.sshCommand` to use it exclusively, documented steps to add key to `anshuljain-ttn` GitHub account and create `support-ticket-system` repo. Push blocked until user completes GitHub setup.

---

### Prompt 6: Start Task B9

**Type:** Follow-up  
**Date:** 2026-07-15

```
Start working on B9 Task
```

**Outcome:** Task B9 completed — `ticket.controller.ts`, `ticket.routes.ts` (6 REST operations), mounted in routes index, 7 integration tests in `tickets.test.ts`.

---

### Prompt 7: Continue Backend (B10)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task B10 completed — comment validator, service, controller, `POST /tickets/:id/comments` route, 4 integration tests in `comments.test.ts`.

---

### Prompt 8: Continue Backend (B11)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task B11 completed — Swagger/OpenAPI via `swagger-jsdoc`, `config/swagger.ts`, `docs/openapi.paths.ts`, UI at `/api-docs`, spec at `/api-docs.json`, 4 unit tests.

---

### Prompt 9: Continue Backend (B12)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task B12 completed — shared test helpers (`test-db.ts`, `test-app.ts`), `status-machine.test.ts` (AC-5), `validation.test.ts` (AC-8), refactored integration tests; 96 tests passing. *(See also [`testing.md`](testing.md).)*

---

### Prompt 10: Continue Backend (B13)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task B13 completed — multi-stage `backend/Dockerfile`, `.dockerignore`, HEALTHCHECK on `/health`. Fixed production build with `tsc-alias` and swagger OpenAPI path resolution for compiled output. **Phase B complete.**

---

### Prompt 11: Start Phase C

**Type:** Follow-up  
**Date:** 2026-07-15

```
Start with Phase C
```

**Outcome:** Task C1 completed — `api-client.ts`, `api.types.ts`, `ticket.types.ts`, `user.types.ts`; `QueryProvider` wired to `createQueryClient()`.

---

### Prompt 12: Continue Frontend (C2)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task C2 completed — `ticket.service.ts`, `user.service.ts`, `comment.service.ts`, `lib/status-transitions.ts` mirroring backend workflow.

---

### Prompt 14: Start Task C3

**Type:** Follow-up  
**Date:** 2026-07-15

```
Start Impelementing C3 Task
```

**Outcome:** Task C3 completed — TanStack Query hooks (`use-tickets`, `use-ticket`, `use-users`, `use-comments`, `use-ticket-stats`), shared `ticket-keys.ts`, and `getTicketStats()` service helper.

---

### Prompt 15: Continue (C4)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task C4 completed — app shell layout with header, sidebar, page container, responsive mobile navigation, and Query + Sonner toast providers.

---

### Prompt 16: Start Task C5

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue with Task C5
```

**Outcome:** Task C5 completed — shared UI components (empty/error states, skeletons, pagination, status/priority badges) and `/dev/ui` showcase page.

---

### Prompt 17: Start Task C6

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue with C6
```

**Outcome:** Task C6 completed — dashboard with live stats cards, recent tickets table, and loading/error states.

---

### Prompt 18: Continue C7

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task C7 completed — ticket list page with URL-synced filters (search, status, priority, assignee, sort), paginated table, loading/error states, and shared date formatting.

---

### Prompt 19: Complete C8–C12

**Type:** Follow-up  
**Date:** 2026-07-15

```
Complete task from C8 till C12 and give me a combined commit
```

**Outcome:** Tasks C8–C12 completed — create/edit/detail ticket pages with forms, comments, status/assignment controls, activity timeline, app error/loading/404 pages, and frontend Dockerfile with standalone Next.js output.

---

### Prompt 20: Begin Phase D

**Type:** Follow-up  
**Date:** 2026-07-15

```
Begin next Phase
```

**Outcome:** Phase D completed — Docker Compose full stack with startup seeding, comprehensive README, final verification (96 backend tests, lint/typecheck), and workflow docs updated.

---

### Prompt 22: Complete v2 Roadmap

**Type:** Original  
**Date:** 2026-07-15

```
Continue with the complete Roadmap
```

**Outcome:** v2.0 complete — JWT auth, PermissionService RBAC, audit history, 137 backend tests, frontend auth + SaaS UI redesign, role-aware dashboard, README and workflow docs updated.

---

## Template

```markdown
### Prompt N: <Title>

**Type:** Follow-up | Refinement
**Date:** YYYY-MM-DD

<Full prompt text>

**Outcome:** <Task completed and files changed>
```
