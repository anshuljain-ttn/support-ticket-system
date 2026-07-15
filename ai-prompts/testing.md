# Testing Prompts

> Test infrastructure, acceptance-criteria mapping, and review-driven coverage expansion.

---

## Session 1 — 2026-07-15

### Prompt 9: Test Infrastructure & AC-Mapped Suites (Task B12)

**Type:** Follow-up  
**Date:** 2026-07-15

```
Continue
```

**Outcome:** Task B12 completed — shared test helpers (`test-db.ts`, `test-app.ts`), `status-machine.test.ts` (AC-5), `validation.test.ts` (AC-8), refactored integration tests; 96 tests passing.

**Artifacts:**
- `backend/tests/helpers/test-db.ts` — MongoMemoryServer lifecycle, seed users
- `backend/tests/helpers/test-app.ts` — Supertest factory, `loginViaApi`, `createTicketViaApi`
- Integration suites mapped to acceptance criteria IDs in test names

---

### Prompt 23: Review Feedback — Deeper Tests

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

**Outcome (testing):** Expanded unit tests for `permission.service` and `status-machine`; added `failure-modes.test.ts` integration suite (scope isolation, permission-before-state-machine ordering, audit history, permission flags). Test count 137 → 174.

*(Debugging documentation from this prompt is in [`debugging.md`](debugging.md); full review context in [`code-review.md`](code-review.md).)*

---

## Template

```markdown
### Prompt N: <Title>

**Type:** Follow-up | Bug Fix
**Date:** YYYY-MM-DD

<Full prompt text>

**Outcome:** <Tests added, counts, AC IDs covered>
```
