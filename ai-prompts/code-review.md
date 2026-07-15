# Code Review Prompts

> External rubric feedback and review-driven iteration.

---

## Session 1 — 2026-07-15

### Prompt 23: Review Feedback — Tests & Debugging Depth

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

**Outcome:** Addressed rubric gaps for Code Implementation and Testing/Debugging/Review. Expanded unit and integration tests; documented bugs and debug steps. Test count 137 → 174.

**Split artifacts:** [`testing.md`](testing.md) · [`debugging.md`](debugging.md)

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

**Outcome:** Created root `AI-WORKFLOW.md` (tool, approach, artifact index, context strategy, iteration examples, verification steps). Added prominent "AI Workflow" section to README with direct links. Expanded project structure tree to list all workflow files. Updated prompt history (Prompts 23–25).

---

## Template

```markdown
### Prompt N: <Title>

**Type:** Follow-up | Refinement | Bug Fix
**Date:** YYYY-MM-DD

<Pasted review or rubric feedback>

**Outcome:** <How feedback was addressed>
```
