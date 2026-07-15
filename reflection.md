# Reflection

## What I Built

A full-stack **Support Ticket Management System**: JWT auth, three-tier RBAC with ownership rules, ticket workflow state machine, comments, embedded audit history, search/filter/sort, role-aware dashboard, Swagger docs, Docker deployment, and **174 automated tests**.

---

## How I Used AI (across the lifecycle)

| Phase | How Cursor was used |
|-------|---------------------|
| Requirements | Prompt 1 — spec, tasks, acceptance criteria before any code |
| Planning | Phased `tasks.md`; "Start Task B9" style prompts |
| Design | v2 pivot (Prompt 21) — auth/RBAC spec rewrite before implementation |
| Implementation | One task per session with cursor rules as guardrails |
| Testing | Tests alongside features; review-driven deepening (Prompt 23) |
| Debugging | Symptom → trace → fix → regression test → log |
| Review | Rubric feedback pasted verbatim; agent addressed gaps |
| Documentation | `tool-workflow.md`, submission artifacts, prompt history |

**27 prompts logged:** [`ai-prompts/prompt-history.md`](ai-prompts/prompt-history.md)

---

## What AI Helped With Most

1. **Boilerplate at speed** — repositories, controllers, routes, test helpers following consistent patterns
2. **Test generation** — Supertest + MongoMemoryServer suites mapped to acceptance criteria
3. **Cross-file refactors** — v2 auth touched models, middleware, services, frontend providers in coordinated steps
4. **Debugging traces** — quickly narrowing route mounting and call-order bugs
5. **Documentation** — structuring workflow narrative and submission artifacts

---

## What AI Got Wrong

1. **Route mounting** — initial v2 auth wiring mounted tickets at wrong prefix (404s)
2. **Call ordering** — state machine before permission check (wrong 400 vs 403)
3. **Docker/prod paths** — Swagger globs assumed `.ts` files in production image
4. **Incomplete prompt logging** — early sessions not logged until explicitly prompted (Prompt 13)
5. **Scope creep tendency** — occasional suggestions for unrelated refactors; required human constraint

---

## How I Validated AI Output

```bash
cd backend && npm test && npm run typecheck && npm run lint
cd frontend && npm run typecheck && npm run lint
```

- Reviewed every agent diff in the IDE before next task
- Integration test names reference AC IDs where applicable
- Manual smoke: login as each role, create ticket, transition status, verify 403 paths
- Docker build to catch prod-only issues (Swagger)

---

## What I Would Improve Next

1. **E2E tests** — Playwright for login → create ticket → workflow → RBAC denial paths
2. **Frontend component tests** — permission-gated UI with React Testing Library
3. **CI pipeline** — GitHub Actions running test + lint + Docker build on every PR
4. **Prompt logging habit** — automate or hook post-session updates to `ai-prompts/`
5. **Staging environment** — contract tests against real MongoDB, not only memory server

---

## Reusable Workflow (prompts, rules, specs, templates)

| Artifact | Reuse |
|----------|-------|
| `tool-workflow.md` | Onboarding template for AI-assisted teams |
| `tool-specific/cursor-workflow/cursor-rules-or-instructions.md` | Team coding standards for Cursor |
| `ai-prompts/` structure | Lifecycle-grouped prompt audit trail |
| `artifacts/tasks.md` pattern | Sprint-sized phased tasks |
| Root submission templates | `candidate-info.md`, `requirements-analysis.md`, etc. |
| Spec-first Prompt 1 pattern | "Docs before code" prevents architectural drift |

See [`tool-workflow.md`](tool-workflow.md) §11 for real-team adaptations.
