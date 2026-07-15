# Code Review Notes

## AI-Assisted Review Summary

Cursor Agent acted as a **first-pass reviewer** when external rubric feedback was pasted into prompts (Prompts 23–25). The agent:

- Explored the codebase for untested permission paths and state transitions
- Expanded `permission.service.test.ts` and `status-machine` unit tests
- Added `failure-modes.test.ts` integration suite
- Documented bugs and debug steps in `implementation-log.md`
- Improved workflow artifact visibility (`tool-workflow.md`, README, `SUBMISSION.md`)

Human retained final judgment on architecture (e.g. approving v2 three-role RBAC pivot).

---

## My Review Observations

| Area | Observation |
|------|-------------|
| **RBAC** | Correctly centralized in `PermissionService`; controllers stay thin |
| **State machine** | Standalone service (D2) — independently testable |
| **API boundary** | DTOs prevent Mongoose leakage (D11) |
| **Error semantics** | Permission-before-transition ordering matters for HTTP correctness |
| **Tests** | Initial coverage good on happy paths; review exposed edge-case gaps |
| **Docs** | Rich content existed early but was hard to discover from README |
| **Scope** | Agent occasionally suggested broad refactors — rejected in favor of minimal diffs |

---

## Changes Made After Review

| Feedback | Change |
|----------|--------|
| Deeper unit tests for permissions and transitions | Expanded unit suites; 137 → 174 tests |
| Document bugs and debug steps | `debugging-notes.md`, `implementation-log.md` § Bug Fixes |
| Failure mode tests | `failure-modes.test.ts` |
| AI workflow visibility (10/25) | `tool-workflow.md`, `SUBMISSION.md`, `ai-prompts/`, root submission artifacts |
| Swagger endpoint count drift | Updated `swagger.test.ts` for v2 auth routes |

**Prompt evidence:** [`ai-prompts/code-review.md`](ai-prompts/code-review.md)

---

## Suggestions Rejected (and why)

| Suggestion | Why rejected |
|----------|--------------|
| Add Elasticsearch for search | D4: MongoDB text indexes sufficient for demo scale |
| Separate audit log collection | D3: Embedded `history[]` simpler and atomic |
| User self-registration | Out of scope per spec |
| Real-time WebSockets for ticket updates | Out of scope; polling/refetch via TanStack Query |
| Monolithic single-prompt backend generation | Task-by-task approach prevents drift and aids review |
| Keeping v1 no-auth demo for submission | v2 JWT + RBAC required for production-quality bar (D18) |
