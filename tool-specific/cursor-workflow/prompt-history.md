# Prompt History

> Document every prompt used during implementation for traceability and reproducibility.

---

## Session 1 — 2026-07-15

### Prompt 1: Initial Project Specification (Original)

**Type:** Original  
**Date:** 2026-07-15

```
You are a Senior Staff Software Engineer and Technical Architect.

Your goal is to build a production-quality Support Ticket Management System using a specification-driven development approach.

DO NOT immediately generate code.

FIRST understand the problem, create documentation, architecture, implementation plan, tasks and acceptance criteria.

Work in small iterations.

Think like you're building software for a real company.

Whenever something is ambiguous, choose the cleanest architecture and explain why.

Always optimize for readability, maintainability, scalability and clean architecture rather than shortest code.

[Full specification including tech stack, database schema, state machine, API endpoints, frontend features, validation, testing, Docker, and phased delivery approach]
```

**Outcome:** Phases 1–3 completed. Created:
- `spec.md` — Full requirements analysis
- `project-context.md` — Architecture and conventions
- `tasks.md` — 27 implementation tasks across 4 phases
- `acceptance-criteria.md` — 18 acceptance criteria groups
- `cursor-rules-or-instructions.md` — Persistent development rules
- `prompt-history.md` — This file
- `implementation-log.md` — Initial decisions

---

### Prompt 2: Simplify Roles to Admin and Employee

**Type:** Refinement  
**Date:** 2026-07-15

```
Let's keep only two Roles for now i.e., Admin and Employee
```

**Outcome:** Updated `spec.md` (roles enum, user stories, seed data, stakeholders), `project-context.md` (business goal), and `implementation-log.md` (decision D16). Removed `agent` role; former agent users reassigned to `admin`.

---

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

**Outcome:** Task B12 completed — shared test helpers (`test-db.ts`, `test-app.ts`), `status-machine.test.ts` (AC-5), `validation.test.ts` (AC-8), refactored integration tests; 96 tests passing.

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

### Prompt 13: Prompt History Not Updating

**Type:** Refinement  
**Date:** 2026-07-15

```
Seems like @tool-specific/cursor-workflow/prompt-history.md is not updating
```

**Outcome:** Retroactively updated `prompt-history.md` with prompts 5–13 and outcomes for B9–B13 and C1–C2.

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

### Prompt 21: v2.0 Auth, RBAC & SaaS UI Refactor

**Type:** Original  
**Date:** 2026-07-15

```
[Full v2.0 requirements — authentication, RBAC, ownership, audit history, SaaS UI redesign]
```

**Outcome:** v2 workflow docs refreshed. Task E2 completed — user model v2, three roles, bcrypt seed (6 users), JWT env config.

---

### Prompt 22: Complete v2 Roadmap

**Type:** Original  
**Date:** 2026-07-15

```
Continue with the complete Roadmap
```

**Outcome:** v2.0 complete — JWT auth, PermissionService RBAC, audit history, 137 backend tests, frontend auth + SaaS UI redesign, role-aware dashboard, README and workflow docs updated.

---

### Prompt 23: Review Feedback — Deeper Tests & Debugging Docs

**Type:** Bug Fix  
**Date:** 2026-07-15

```
got these two feedbacks

4. Code Implementation — 12/15
...
What to grow: Add more granular unit tests for permission checks and state transitions.

5. Testing, Debugging, and Review — 14/20
...
What to grow: Document specific bugs found and how they were debugged; add failure mode tests.
```

**Outcome:** Expanded unit tests for `permission.service` and `status-machine`; added `failure-modes.test.ts` integration suite (scope isolation, permission-before-state-machine ordering, audit history, permission flags). Documented 4 bugs with debug steps and a debugging guide in `implementation-log.md`. Test count 137 → 174.

---

### Prompt 24: Review Feedback — AI Workflow Visibility

**Type:** Follow-up  
**Date:** 2026-07-15

```
Why this feedback
2. AI Workflow and Prompting — 10/25
Missing; no artifact evidence
...
What to grow: Capture and submit prompt history, context-setting approach, iteration logs.
```

**Outcome:** Explained that artifacts existed in `tool-specific/cursor-workflow/` but were not discoverable from README/submission. Identified gaps: no root-level workflow doc, prompt history incomplete, no explicit "AI tool usage" narrative.

---

### Prompt 25: Fix Workflow Visibility

**Type:** Refinement  
**Date:** 2026-07-15

```
Fix their visibility
```

**Outcome:** Created root `AI-WORKFLOW.md` (tool, approach, artifact index, context strategy, iteration examples, verification steps). Added prominent "AI Workflow" section to README with direct links. Expanded project structure tree to list all workflow files. Updated this prompt history (Prompts 23–25).

---

### Prompt 26: Required tool-workflow.md Submission

**Type:** Original  
**Date:** 2026-07-15

```
This is expected

Expected Submission
Submit a document named tool-workflow.md covering:
Primary AI tool used.
How you provide project context to the tool.
...
How you would reuse this workflow in a real project.
```

**Outcome:** Created `tool-workflow.md` at repo root with all 11 required sections, concrete examples from this project, and links to supporting artifacts. Updated README, AI-WORKFLOW.md, and cursor-workflow README to point to it as the primary deliverable.

---

## Template for Future Prompts

```markdown
### Prompt N: <Title>

**Type:** Original | Follow-up | Refinement | Bug Fix | Optimization
**Date:** YYYY-MM-DD

<Full prompt text>

**Outcome:** <What was produced or changed>
```

---

## Prompt Categories

| Type | Description |
|------|-------------|
| Original | Initial specification or feature request |
| Follow-up | Continuation of previous work |
| Refinement | Adjustment to existing implementation |
| Bug Fix | Fixing a defect |
| Optimization | Performance or code quality improvement |
