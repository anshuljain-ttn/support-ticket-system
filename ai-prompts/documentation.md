# Documentation Prompts

> Workflow artifacts, prompt logging, and submission deliverables.

---

## Session 1 — 2026-07-15

### Prompt 13: Prompt History Not Updating

**Type:** Refinement  
**Date:** 2026-07-15

```
Seems like @tool-specific/cursor-workflow/prompt-history.md is not updating
```

**Outcome:** Retroactively updated `prompt-history.md` with prompts 5–13 and outcomes for B9–B13 and C1–C2.

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

**Outcome:** Created `tool-workflow.md` at repo root with all 11 required sections, concrete examples from this project, and links to supporting artifacts. Updated README and cursor-workflow README to point to it as the primary deliverable.

---

### Prompt 27: Assignment Folder Structure & Authenticity Signals

**Type:** Refinement  
**Date:** 2026-07-15

```
Notes for a Human Glance — Authenticity Signals
No workflow artifacts / Repository structure incomplete
Missing tool-specific/, docs/, prompts/, or artifacts/ folders
```

**Outcome:** Created assignment-aligned folder structure: `docs/`, `prompts/`, `artifacts/` with README indexes and symlinks to canonical `tool-specific/cursor-workflow/` files. Added `SUBMISSION.md` reviewer checklist, `artifacts/form-answers.md` (Q&A format), `tool-specific/README.md`. Updated README, `tool-workflow.md`, and AC-1.1.

---

## Template

```markdown
### Prompt N: <Title>

**Type:** Original | Refinement
**Date:** YYYY-MM-DD

<Full prompt text>

**Outcome:** <Documentation files created or updated>
```
