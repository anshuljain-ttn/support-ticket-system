# Submission Checklist — Human Glance

> Quick verification for reviewers. All items below exist in this repository.

## Required deliverables

| Item | Location | Status |
|------|----------|--------|
| **AI workflow document** | [`tool-workflow.md`](tool-workflow.md) | ✅ Root |
| **Form answers** | [`artifacts/form-answers.md`](artifacts/form-answers.md) | ✅ |
| **Prompt log** | [`ai-prompts/`](ai-prompts/) · [`ai-prompts/prompt-history.md`](ai-prompts/prompt-history.md) | ✅ 27 prompts |
| **Design spec** | [`docs/design-spec.md`](docs/design-spec.md) | ✅ |
| **Architecture / context** | [`docs/architecture.md`](docs/architecture.md) | ✅ |
| **Acceptance criteria** | [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md) | ✅ |
| **Implementation log** | [`artifacts/implementation-log.md`](artifacts/implementation-log.md) | ✅ Decisions + bugs |
| **Task plan** | [`artifacts/tasks.md`](artifacts/tasks.md) | ✅ Phases A–K |

## Submission artifacts (root)

| Artifact | File | Status |
|----------|------|--------|
| Candidate information | [`candidate-info.md`](candidate-info.md) | ✅ |
| Requirement analysis | [`requirements-analysis.md`](requirements-analysis.md) | ✅ |
| Acceptance criteria (summary) | [`acceptance-criteria.md`](acceptance-criteria.md) | ✅ |
| Implementation plan | [`implementation-plan.md`](implementation-plan.md) | ✅ |
| Design notes | [`design-notes.md`](design-notes.md) | ✅ |
| API contract | [`api-contract.md`](api-contract.md) | ✅ |
| Test strategy | [`test-strategy.md`](test-strategy.md) | ✅ |
| Debugging notes | [`debugging-notes.md`](debugging-notes.md) | ✅ |
| Code review notes | [`code-review-notes.md`](code-review-notes.md) | ✅ |
| Reflection | [`reflection.md`](reflection.md) | ✅ |
| PR description | [`pr-description.md`](pr-description.md) | ✅ |

## Assignment folder structure

```
ai-project/
├── SUBMISSION.md             ← this checklist
├── candidate-info.md         ← submission artifacts (start here)
├── requirements-analysis.md
├── acceptance-criteria.md
├── implementation-plan.md
├── design-notes.md
├── api-contract.md
├── test-strategy.md
├── debugging-notes.md
├── code-review-notes.md
├── reflection.md
├── pr-description.md
├── tool-workflow.md          ← required AI workflow narrative
├── docs/                     ← design & requirements
├── ai-prompts/               ← prompt history (category files + index)
├── artifacts/                ← logs, tasks, form answers
├── tool-specific/            ← Cursor agent context (spec, tasks, cursor rules)
│   └── cursor-workflow/
├── frontend/
└── backend/
```

## Lifecycle evidence (how AI was used)

| Phase | Evidence |
|-------|----------|
| Requirements | [`requirements-analysis.md`](requirements-analysis.md), [`docs/design-spec.md`](docs/design-spec.md) |
| Planning | [`implementation-plan.md`](implementation-plan.md), [`artifacts/tasks.md`](artifacts/tasks.md) |
| Design | [`design-notes.md`](design-notes.md), [`docs/architecture.md`](docs/architecture.md) |
| API contract | [`api-contract.md`](api-contract.md), Swagger at `/api-docs` |
| Design decisions | [`artifacts/implementation-log.md`](artifacts/implementation-log.md) (D1–D20) |
| Code generation | [`artifacts/tasks.md`](artifacts/tasks.md) task traces, [`tool-workflow.md`](tool-workflow.md) §5 |
| Validation | `cd backend && npm test` — **174 tests** |
| Testing | [`test-strategy.md`](test-strategy.md), [`tool-workflow.md`](tool-workflow.md) §7 |
| Debugging | [`debugging-notes.md`](debugging-notes.md), [`artifacts/implementation-log.md`](artifacts/implementation-log.md) § Bug Fixes |
| Review | [`code-review-notes.md`](code-review-notes.md), [`ai-prompts/code-review.md`](ai-prompts/code-review.md) |
| Reflection | [`reflection.md`](reflection.md) |

## Verify in 30 seconds

```bash
ls candidate-info.md requirements-analysis.md acceptance-criteria.md tool-workflow.md
ls docs/ ai-prompts/ artifacts/ tool-specific/
wc -l ai-prompts/*.md artifacts/implementation-log.md
cd backend && npm test
```

## Primary AI tool

**Cursor IDE** (Agent mode) — documented in [`tool-workflow.md`](tool-workflow.md).
