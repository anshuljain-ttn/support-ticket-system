# Submission Checklist — Human Glance

> Quick verification for reviewers. All items below exist in this repository.

## Required deliverables

| Item | Location | Status |
|------|----------|--------|
| **AI workflow document** | [`tool-workflow.md`](tool-workflow.md) | ✅ Root |
| **Form answers** | [`artifacts/form-answers.md`](artifacts/form-answers.md) | ✅ |
| **Prompt log** | [`prompts/prompt-history.md`](prompts/prompt-history.md) | ✅ 26+ prompts |
| **Design spec** | [`docs/design-spec.md`](docs/design-spec.md) | ✅ |
| **Architecture / context** | [`docs/architecture.md`](docs/architecture.md) | ✅ |
| **Acceptance criteria** | [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md) | ✅ |
| **Implementation log** | [`artifacts/implementation-log.md`](artifacts/implementation-log.md) | ✅ Decisions + bugs |
| **Task plan** | [`artifacts/tasks.md`](artifacts/tasks.md) | ✅ Phases A–K |

## Assignment folder structure

```
ai-project/
├── tool-workflow.md          ← required submission (start here)
├── SUBMISSION.md             ← this checklist
├── docs/                     ← design & requirements
├── prompts/                  ← prompt history
├── artifacts/                ← logs, tasks, form answers
├── tool-specific/            ← tool-specific workflow (Cursor)
│   └── cursor-workflow/      ← canonical source for docs & prompts
├── frontend/
└── backend/
```

## Lifecycle evidence (how AI was used)

| Phase | Evidence |
|-------|----------|
| Requirements | [`docs/design-spec.md`](docs/design-spec.md), Prompt 1 in [`prompts/prompt-history.md`](prompts/prompt-history.md) |
| Planning | [`artifacts/tasks.md`](artifacts/tasks.md), [`docs/architecture.md`](docs/architecture.md) |
| Design decisions | [`artifacts/implementation-log.md`](artifacts/implementation-log.md) (D1–D20) |
| Code generation | [`artifacts/tasks.md`](artifacts/tasks.md) task traces, [`tool-workflow.md`](tool-workflow.md) §5 |
| Validation | `cd backend && npm test` — **174 tests** |
| Testing | [`tool-workflow.md`](tool-workflow.md) §7, `backend/tests/` |
| Debugging | [`artifacts/implementation-log.md`](artifacts/implementation-log.md) § Bug Fixes |
| Review | [`tool-workflow.md`](tool-workflow.md) §9, Prompts 23–27 in prompt history |

## Verify in 30 seconds

```bash
ls tool-workflow.md docs/ prompts/ artifacts/ tool-specific/
wc -l prompts/prompt-history.md artifacts/implementation-log.md
cd backend && npm test
```

## Primary AI tool

**Cursor IDE** (Agent mode) — documented in [`tool-workflow.md`](tool-workflow.md).
