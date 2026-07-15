# Tool Workflow

> How AI was used to build the Support Ticket Management System.

**Reviewer checklist:** [`SUBMISSION.md`](SUBMISSION.md)

**Supporting evidence:**

| Assignment folder | Contents |
|-------------------|----------|
| [`docs/`](docs/) | Design spec, architecture, acceptance criteria |
| [`ai-prompts/`](ai-prompts/) | Prompt history by lifecycle phase (27 prompts) + [`prompt-history.md`](ai-prompts/prompt-history.md) index |
| [`artifacts/`](artifacts/) | Form answers, implementation log, tasks, cursor rules |
| [`tool-specific/cursor-workflow/`](tool-specific/cursor-workflow/) | Cursor agent context: spec, tasks, acceptance criteria, project context, cursor rules |

---

## 1. Primary AI Tool Used

**[Cursor](https://cursor.com)** — IDE with an integrated AI Agent.

| Capability used | How it was applied |
|-----------------|-------------------|
| **Agent mode** | Multi-file implementation (services, routes, tests, frontend pages) from a single prompt |
| **Codebase context** | Agent reads open files, `@` references, and the full repo when exploring |
| **Cursor Rules** | Persistent instructions in `tool-specific/cursor-workflow/cursor-rules-or-instructions.md` |
| **Terminal access** | Agent runs `npm test`, lint, typecheck, and Docker builds to verify changes |
| **Chat history** | Each session prompt recorded in [`ai-prompts/`](ai-prompts/) (indexed in [`prompt-history.md`](ai-prompts/prompt-history.md)) |

No other AI tools were used for implementation. The human author drove requirements, reviewed diffs, and approved architectural pivots (e.g. v1 → v2 auth refactor).

---

## 2. How I Provide Project Context to the Tool

Context is layered so the agent does not guess architecture on every prompt.

### Persistent context (checked into the repo)

| File | What the agent learns |
|------|----------------------|
| [`project-context.md`](tool-specific/cursor-workflow/project-context.md) | Stack, folder layout, state machine, RBAC matrix, naming conventions |
| [`cursor-rules-or-instructions.md`](tool-specific/cursor-workflow/cursor-rules-or-instructions.md) | Enforced patterns: Repository → Service → Controller, Zod validation, DTOs, no `any` |
| [`spec.md`](tool-specific/cursor-workflow/spec.md) | Full product requirements |
| [`tasks.md`](tool-specific/cursor-workflow/tasks.md) | Current phase and task to execute |
| [`acceptance-criteria.md`](tool-specific/cursor-workflow/acceptance-criteria.md) | How to verify each feature |

### Per-session context

1. **Open relevant files** in the editor (e.g. `ticket.service.ts` when fixing status transitions).
2. **Reference docs in the prompt** — e.g. *"Implement according to tasks.md Task B9"*.
3. **Point to prior decisions** — e.g. *"Follow decision D2: status machine as dedicated service"* in `implementation-log.md`.
4. **Paste review feedback** when iterating — e.g. rubric gaps for tests or workflow visibility.

### First-prompt pattern (Prompt 1)

The initial prompt explicitly forbade code generation until documentation existed:

> *"DO NOT immediately generate code. FIRST understand the problem, create documentation, architecture, implementation plan, tasks and acceptance criteria."*

This produced `spec.md`, `project-context.md`, `tasks.md`, and `acceptance-criteria.md` before any application code.

---

## 3. How I Use AI for Requirement Analysis

AI was used to **structure and challenge** requirements, not to invent product goals blindly.

### Process

1. **Human provides the problem statement** — support ticket system with workflow, roles, search, Docker, etc. (Prompt 1).
2. **Agent produces structured analysis** in `spec.md`:
   - User stories and stakeholders
   - State machine diagram and transition rules
   - API contract (endpoints, request/response shapes)
   - Database schema (users, tickets, comments, embedded `history[]`)
   - Non-functional requirements (validation, testing, deployment)
3. **Human refines** — e.g. Prompt 2: *"Let's keep only two Roles… Admin and Employee"* → agent updated spec, seed data, and logged decision D16.
4. **Major pivot documented** — v2.0 (Prompt 21) added JWT auth, three-tier RBAC, ownership rules, audit history; `spec.md` and `acceptance-criteria.md` were rewritten before code changed.

### Output artifacts

- [`spec.md`](tool-specific/cursor-workflow/spec.md) — single source of truth for *what* to build
- [`acceptance-criteria.md`](tool-specific/cursor-workflow/acceptance-criteria.md) — AC-1 through AC-23 with verification method per criterion
- [`artifacts/implementation-log.md`](artifacts/implementation-log.md) — decisions when requirements were ambiguous (e.g. D4: MongoDB text indexes vs Elasticsearch)

---

## 4. How I Use AI for Planning and Design

Planning was **phased and task-driven**, not one-shot code dumps.

### Planning artifacts

| Artifact | Role |
|----------|------|
| [`tasks.md`](tool-specific/cursor-workflow/tasks.md) | 27+ tasks across Phases A–K (scaffold → backend → frontend → Docker → v2 auth) |
| [`project-context.md`](tool-specific/cursor-workflow/project-context.md) | Architecture: monorepo, layer separation, error envelope, permission model |
| [`artifacts/implementation-log.md`](artifacts/implementation-log.md) | Design decisions with rationale and rejected alternatives |

### Typical planning prompt

> *"Start With Task B9"* or *"Begin next Phase"*

The agent read `tasks.md`, identified the next unchecked item, implemented only that scope, and logged the outcome.

### Design decisions captured by AI (examples)

| ID | Decision | Rationale logged |
|----|----------|------------------|
| D2 | `StatusMachineService` as standalone module | Independently testable; single responsibility |
| D11 | DTOs at API boundary | Prevents leaking Mongoose internals |
| D18 | v2 JWT + RBAC refactor | Production-quality security; supersedes v1 no-auth |
| D19 | `SUPER_ADMIN` / `ADMIN` / `EMPLOYEE` enum | Aligns with spec; distinct from v1 lowercase roles |

Architecture was discussed in docs **before** the agent generated matching code structures.

---

## 5. How I Use AI for Code Generation

Code generation followed **tasks.md** one task at a time, with cursor rules as guardrails.

### Backend pattern (every feature)

```
constants/ → types/ → models/ → repositories/ → services/ → validators/ → controllers/ → routes/ → tests/
```

Example: Task B9 produced `ticket.controller.ts`, `ticket.routes.ts`, Zod validators, and 7 integration tests — not a monolithic dump.

### Frontend pattern

```
types/ → services/ → hooks/ → components/ → app/ pages
```

Example: Phase J — auth provider, middleware, permission-gated ticket actions, SaaS shell.

### Constraints enforced in every session

- TypeScript `strict`, no `any`
- Zod validation on all inputs
- `AppError` with typed error codes
- Repository → Service → Controller — no business logic in controllers
- Match existing naming and folder structure

### Human oversight

- Reviewed diffs before moving to the next task
- Rejected scope creep — agent instructed to make minimal, reviewable changes
- Pasted rubric feedback to target specific gaps (e.g. deeper permission unit tests)

---

## 6. How I Validate AI-Generated Code

Validation was **automated first**, human review second.

### Automated checks (agent runs these)

```bash
cd backend && npm test          # 174 tests (unit + integration)
cd backend && npm run typecheck
cd backend && npm run lint
cd frontend && npm run typecheck && npm run lint
```

### Test pyramid for this project

| Layer | Examples | Purpose |
|-------|----------|---------|
| **Unit** | `permission.service.test.ts`, `status-machine.test.ts`, `ticket.validator.test.ts` | RBAC matrix, state transitions, Zod schemas |
| **Integration** | `status-machine.test.ts`, `permissions.test.ts`, `failure-modes.test.ts` | HTTP + DB via Supertest + MongoMemoryServer |
| **Acceptance mapping** | Test names reference AC IDs (e.g. `AC-5.1`, `AC-20.2`) | Traceability to `acceptance-criteria.md` |

### Manual validation

- Swagger UI at `/api-docs` — verify documented endpoints match implementation
- Local smoke test — login, create ticket, transition status, check RBAC as different roles
- Docker build — multi-stage Dockerfiles verified where environment allowed

### Validation logging

Task completion notes in `implementation-log.md` record test counts and what passed (e.g. *"96/96 tests pass"*, then *"174 tests passing"* after v2 and review-driven additions).

---

## 7. How I Use AI for Testing

AI generated tests **alongside** feature code, not as an afterthought.

### When tests were created

| Phase | What AI produced |
|-------|------------------|
| B8–B9 | Service + REST integration tests for tickets |
| B10 | Comment REST tests |
| B12 | Status machine integration tests (AC-5), validation tests (AC-8) |
| G1–G3 (v2) | `auth.test.ts`, `permissions.test.ts`, `permission.service.test.ts` |
| Review (Prompt 23) | `failure-modes.test.ts`, expanded unit coverage for permissions and state machine |

### How AI was prompted for tests

- Tasks in `tasks.md` explicitly require tests per acceptance criterion
- Review feedback pasted verbatim: *"Add more granular unit tests for permission checks and state transitions"*
- Agent explored codebase first (Task/explore subagent) to identify gaps before writing tests

### Test infrastructure AI set up

- `tests/helpers/test-db.ts` — MongoMemoryServer lifecycle, seed users, cleanup
- `tests/helpers/test-app.ts` — Supertest app factory, `loginViaApi`, `createTicketViaApi`
- Isolated test DB — prevents cross-suite pollution

---

## 8. How I Use AI for Debugging

When something broke, AI was used to **diagnose from symptoms**, fix, and **document** the resolution.

### Documented bugs ([`implementation-log.md` § Bug Fixes](artifacts/implementation-log.md))

| Bug | Symptom | How AI debugged | Fix |
|-----|---------|-----------------|-----|
| Route mounting | 404 on all ticket routes after auth | Logged request paths; compared mount points in `routes/index.ts` vs test URLs | Remounted under `/tickets` prefix |
| Swagger in Docker | Empty OpenAPI spec in production image | Built Docker image; compared `.ts` vs `.js` path resolution | Dual `.ts`/`.js` glob + `tsc-alias` |
| Permission ordering | Employee status change returned 400 not 403 | Failing integration test; traced call order in `ticket.service.ts` | `assertCanChangeStatus` before `validateTransition` |
| Vitest lint | CI lint failure in test helper | Read linter output | Added missing `expect` import |

### Debugging workflow

1. **Reproduce** — failing test or HTTP status from integration suite
2. **Prompt AI with symptom** — paste error, stack trace, or rubric feedback
3. **AI traces code** — reads service layer, middleware, route mounting
4. **Fix + regression test** — e.g. `failure-modes.test.ts` for permission-before-state-machine ordering
5. **Log in implementation-log.md** — symptom, root cause, debug steps, files changed

### Runtime logging

- `LOG_LEVEL=debug` in backend `.env` for HTTP request logging
- Documented in implementation log debugging guide table

---

## 9. How I Use AI for Code Review

AI acted as a **first-pass reviewer**; the human author applied rubric feedback and judgment calls.

### Review triggers

| Trigger | Example |
|---------|---------|
| **End of phase** | *"Final verification & cleanup"* (Task D3) — lint, tests, no TODOs |
| **External rubric feedback** | Pasted scores for Code Implementation, Testing, AI Workflow |
| **Pre-merge self-review** | *"Continue with the complete Roadmap"* — agent verified cross-cutting concerns |

### What AI reviewed

- **Consistency** — RBAC enforced in services, not just controllers
- **Test coverage gaps** — explore agent mapped tested vs untested permission paths
- **Security** — no hardcoded secrets, JWT in HTTP-only cookie, inactive user blocked
- **Scope** — minimal diffs, no unrelated refactors

### Review outputs

- Expanded test suites (`failure-modes.test.ts`, permission unit tests)
- `implementation-log.md` debugging guide
- `tool-workflow.md` (this document) and visibility updates to README

### Human role in review

- Accepted or rejected architectural choices (e.g. two roles → three roles in v2)
- Prioritized rubric gaps (tests before workflow docs)
- Did not blindly merge — reviewed agent diffs in the IDE

---

## 10. What Information I Avoid Sharing Unnecessarily with AI Tools

### Never shared with AI

| Category | Examples |
|----------|----------|
| **Secrets** | `JWT_SECRET`, `SEED_DEFAULT_PASSWORD`, production API keys |
| **Credentials** | Real user passwords, OAuth tokens, private keys |
| **Production data** | Real customer tickets, PII, production database dumps |
| **Internal infra** | Production hostnames, VPN configs, unreleased security policies |

### Practices followed

- `.env` files are gitignored; agent uses `.env.example` with placeholder values only
- Seed users use a shared dev password via env var — not real credentials
- Workspace rules explicitly forbid logging or pasting secrets into code, tests, or docs
- SSH key setup (Prompt 5) discussed key *paths* and GitHub account names — not private key material

### Safe to share

- Architecture, schemas, business rules, acceptance criteria
- Error messages and stack traces from local/test environments
- Rubric feedback and code review comments
- Open-source dependencies and public API contracts

### Principle

Share **enough context to implement correctly**, never **credentials or production identity**.

---

## 11. How I Would Reuse This Workflow in a Real Project

This workflow maps directly to a production team using AI-assisted development.

### Reusable structure

```
1. Spec first        → spec.md + acceptance-criteria.md (human-approved)
2. Context files     → project-context.md + cursor-rules (team conventions)
3. Phased tasks      → tasks.md (sprint-sized chunks)
4. Prompt log        → `ai-prompts/` by phase (audit trail; index in `ai-prompts/prompt-history.md`)
5. Decision log      → implementation-log.md (ADRs, bugs, trade-offs)
6. Implement         → one task per agent session
7. Validate          → CI: test + lint + typecheck on every change
8. Review            → human PR review + paste external feedback into agent
9. Ship              → Docker/CI pipeline already in repo
```

### Adaptations for a real team

| Demo project | Real project |
|--------------|--------------|
| Single developer + Cursor Agent | Shared cursor-rules in repo; PR templates reference `tasks.md` |
| MongoMemoryServer in tests | Staging environment + contract tests against real services |
| Prompt history visibility | Same format, plus linked to tickets (Jira/Linear IDs); categorized under `ai-prompts/` |
| Manual rubric review | PR checks, Sentry, Datadog — paste incident context into agent for debugging |
| `tool-workflow.md` once | Onboarding doc for new engineers using Cursor on the codebase |

### What made this workflow succeed

1. **Docs before code** — prevented architectural drift across 25+ prompts
2. **Small iterations** — *"Start Task B9"* not *"build the entire backend"*
3. **Acceptance criteria as tests** — AC IDs in test names prove requirements met
4. **Logged decisions** — future sessions (human or AI) know *why* D2 exists
5. **Validation loop** — agent runs tests; human does not merge on faith
6. **Security defaults** — rules forbid secrets in prompts and generated code

### Artifacts to copy to any new project

- `tool-workflow.md` (this file) — submission / onboarding template
- `tool-specific/cursor-workflow/` — agent context files (spec, tasks, cursor rules)
- Cursor rules file aligned to team standards
- `ai-prompts/` + `implementation-log.md` habit — one entry per session in the matching lifecycle file

---

## Related Files

| File | Purpose |
|------|---------|
| [`ai-prompts/`](ai-prompts/) | Categorized prompt log (27 prompts) |
| [`ai-prompts/prompt-history.md`](ai-prompts/prompt-history.md) | Prompt index with cross-links |
| [`artifacts/implementation-log.md`](artifacts/implementation-log.md) | Decisions, bugs, debugging guide |
| [`README.md`](README.md) | Project setup and links to all documentation |

### How to verify claims in this document

```bash
cat SUBMISSION.md tool-workflow.md
ls docs/ ai-prompts/ artifacts/ tool-specific/
less ai-prompts/planning.md ai-prompts/implementation.md ai-prompts/prompt-history.md
less artifacts/implementation-log.md
cd backend && npm test   # 174 tests
```
