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

### Prompt 5: (Pending — Next Session)

**Type:** Follow-up  
**Date:** TBD

*To be filled when implementation begins.*

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
