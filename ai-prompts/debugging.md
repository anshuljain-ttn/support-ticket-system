# Debugging Prompts

> Symptom-driven diagnosis, root-cause fixes, and documented debug trails.

---

## Session 1 — 2026-07-15

### Prompt 23: Review Feedback — Document Bugs & Debug Steps

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

**Outcome (debugging):** Documented 4 bugs with debug steps and a debugging guide in `implementation-log.md`:

| Bug | Symptom | Debug approach | Fix |
|-----|---------|----------------|-----|
| Route mounting | 404 on all ticket routes after auth | Compared mount points in `routes/index.ts` vs test URLs | Remounted under `/tickets` prefix |
| Swagger in Docker | Empty OpenAPI spec in production image | Built Docker image; compared `.ts` vs `.js` path resolution | Dual `.ts`/`.js` glob + `tsc-alias` |
| Permission ordering | Employee status change returned 400 not 403 | Traced call order in `ticket.service.ts` | `assertCanChangeStatus` before `validateTransition` |
| Vitest lint | CI lint failure in test helper | Read linter output | Added missing `expect` import |

**Regression coverage:** `failure-modes.test.ts` encodes permission-before-state-machine ordering and related edge cases.

*(Test additions from this prompt are in [`testing.md`](testing.md).)*

---

## Bugs found during implementation (no dedicated prompt)

These were diagnosed and fixed during task sessions; full write-up is in [`../artifacts/implementation-log.md`](../artifacts/implementation-log.md) § Bug Fixes.

---

## Template

```markdown
### Prompt N: <Title>

**Type:** Bug Fix
**Date:** YYYY-MM-DD

<Symptom, error output, or review feedback>

**Outcome:** Root cause, fix, regression test, log entry in implementation-log.md
```
