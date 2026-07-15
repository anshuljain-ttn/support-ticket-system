# Prompt History

> Document every prompt used during implementation for traceability and reproducibility.

**Categorized by lifecycle phase:** see category files in this folder.

| Category | File | Prompts |
|----------|------|---------|
| Planning | [`planning.md`](planning.md) | 1–2 |
| Design | [`design.md`](design.md) | 21 |
| Implementation | [`implementation.md`](implementation.md) | 3–20, 22 |
| Testing | [`testing.md`](testing.md) | 9, 23 |
| Debugging | [`debugging.md`](debugging.md) | 23 |
| Code review | [`code-review.md`](code-review.md) | 23–25 |
| Documentation | [`documentation.md`](documentation.md) | 13, 26–27 |

---

## Session 1 — 2026-07-15 (27 prompts)

| # | Title | Category |
|---|-------|----------|
| 1 | Initial Project Specification | [planning](planning.md) |
| 2 | Simplify Roles to Admin and Employee | [planning](planning.md) |
| 3 | Begin Implementation | [implementation](implementation.md) |
| 4 | Start Task B1 | [implementation](implementation.md) |
| 5 | Separate GitHub SSH Identity | [implementation](implementation.md) |
| 6 | Start Task B9 | [implementation](implementation.md) |
| 7 | Continue Backend (B10) | [implementation](implementation.md) |
| 8 | Continue Backend (B11) | [implementation](implementation.md) |
| 9 | Continue Backend (B12) | [implementation](implementation.md) · [testing](testing.md) |
| 10 | Continue Backend (B13) | [implementation](implementation.md) |
| 11 | Start Phase C | [implementation](implementation.md) |
| 12 | Continue Frontend (C2) | [implementation](implementation.md) |
| 13 | Prompt History Not Updating | [documentation](documentation.md) |
| 14 | Start Task C3 | [implementation](implementation.md) |
| 15 | Continue (C4) | [implementation](implementation.md) |
| 16 | Start Task C5 | [implementation](implementation.md) |
| 17 | Start Task C6 | [implementation](implementation.md) |
| 18 | Continue C7 | [implementation](implementation.md) |
| 19 | Complete C8–C12 | [implementation](implementation.md) |
| 20 | Begin Phase D | [implementation](implementation.md) |
| 21 | v2.0 Auth, RBAC & SaaS UI Refactor | [design](design.md) |
| 22 | Complete v2 Roadmap | [implementation](implementation.md) |
| 23 | Review Feedback — Deeper Tests & Debugging Docs | [testing](testing.md) · [debugging](debugging.md) · [code-review](code-review.md) |
| 24 | Review Feedback — AI Workflow Visibility | [code-review](code-review.md) |
| 25 | Fix Workflow Visibility | [code-review](code-review.md) |
| 26 | Required tool-workflow.md Submission | [documentation](documentation.md) |
| 27 | Assignment Folder Structure & Authenticity Signals | [documentation](documentation.md) |

---

## Template for Future Prompts

Add the full entry to the matching category file in this folder, then add a row to the index table above.

```markdown
### Prompt N: <Title>

**Type:** Original | Follow-up | Refinement | Bug Fix | Optimization
**Date:** YYYY-MM-DD

<Full prompt text>

**Outcome:** <What was produced or changed>
```

---

## Prompt Types

| Type | Description |
|------|-------------|
| Original | Initial specification or feature request |
| Follow-up | Continuation of previous work |
| Refinement | Adjustment to existing implementation |
| Bug Fix | Fixing a defect or addressing review feedback |
| Optimization | Performance or code quality improvement |
