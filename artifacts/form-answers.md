# Assignment Form Answers

> Answers to standard AI workflow rubric questions. Full narrative: [`tool-workflow.md`](../tool-workflow.md).

---

### What is the primary AI tool you used?

**Cursor IDE** (Agent mode) — integrated AI agent with codebase context, terminal access, and persistent rules.

---

### How do you provide project context to the tool?

Layered context files checked into the repo:

- `docs/architecture.md` — stack, folder layout, RBAC, state machine
- `artifacts/cursor-rules.md` — enforced coding patterns (Repository → Service → Controller, Zod, DTOs)
- `docs/design-spec.md` — full requirements
- `artifacts/tasks.md` — current phase/task to execute
- `docs/acceptance-criteria.md` — verification methods

Per session: open relevant source files in the IDE and reference task IDs in prompts (e.g. *"Start Task B9"*).

---

### How do you use AI for requirement analysis?

Prompt 1 instructed the agent to **not write code** until documentation existed. The agent produced `design-spec.md`, `acceptance-criteria.md`, and `architecture.md`. Human refinements (e.g. role simplification, v2 auth pivot) were prompted explicitly and logged in `implementation-log.md`.

---

### How do you use AI for planning and design?

Phased plan in `artifacts/tasks.md` (27+ tasks, Phases A–K). Each session prompt targeted one task. Design decisions (D1–D20) recorded in `implementation-log.md` with rationale and rejected alternatives before matching code was generated.

---

### How do you use AI for code generation?

Task-by-task implementation following cursor rules: constants → types → models → repositories → services → controllers → routes → tests. Agent constrained to TypeScript strict, Zod validation, minimal diffs. Human reviewed diffs before next task.

---

### How do you validate AI-generated code?

```bash
cd backend && npm test    # 174 tests
cd backend && npm run typecheck && npm run lint
cd frontend && npm run typecheck && npm run lint
```

Integration tests map to acceptance criteria (e.g. `AC-5.1`, `AC-20.2`). Manual smoke test via Swagger and role-based login.

---

### How do you use AI for testing?

Tests generated alongside features per `tasks.md`. Agent wrote unit tests (`permission.service.test.ts`, `status-machine.test.ts`) and integration tests (`failure-modes.test.ts`, `permissions.test.ts`) using MongoMemoryServer + Supertest helpers.

---

### How do you use AI for debugging?

Symptom pasted into agent → code trace → fix → regression test → logged in `implementation-log.md` § Bug Fixes. Examples: route mounting 404, Swagger empty in Docker, permission-before-state-machine ordering (403 vs 400).

---

### How do you use AI for code review?

Rubric feedback pasted into prompts (e.g. deeper unit tests, workflow visibility). Agent explored codebase for gaps, expanded test suites, and updated docs. Human retained final judgment on architecture and scope.

---

### What information do you avoid sharing with AI tools?

Never shared: `JWT_SECRET`, passwords, API keys, production credentials, real customer/PII data, private keys. Used `.env.example` placeholders only. Workspace rules forbid secrets in code, tests, or docs.

---

### How would you reuse this workflow in a real project?

1. Spec + acceptance criteria first (human-approved)
2. `architecture.md` + cursor rules in repo
3. `tasks.md` sprint-sized chunks
4. `ai-prompts/` (matching lifecycle file) + `implementation-log.md` per session
5. CI: test + lint + typecheck on every change
6. PR review by human; paste incident/feedback into agent for targeted fixes

See [`tool-workflow.md`](../tool-workflow.md) §11 for team adaptations.

---

### Where is the full prompt log?

[`ai-prompts/`](../ai-prompts/) — 27 prompts across planning, design, implementation, testing, debugging, code-review, and documentation. Index: [`ai-prompts/prompt-history.md`](../ai-prompts/prompt-history.md).
