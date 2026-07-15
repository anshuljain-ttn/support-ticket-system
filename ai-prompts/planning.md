# Planning Prompts

> Requirements analysis, specification, and plan refinement before and during implementation.

---

## Session 1 — 2026-07-15

### Prompt 1: Initial Project Specification

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
- `prompt-history.md` — Prompt log index
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

## Template

```markdown
### Prompt N: <Title>

**Type:** Original | Follow-up | Refinement
**Date:** YYYY-MM-DD

<Full prompt text>

**Outcome:** <What was produced or changed>
```
