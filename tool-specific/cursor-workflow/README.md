# Cursor Workflow Artifacts

> Supporting evidence for [`tool-workflow.md`](../../tool-workflow.md) (required submission).

## Files in this folder

| File | Description |
|------|-------------|
| [`prompt-history.md`](prompt-history.md) | Every prompt, type, date, and outcome |
| [`implementation-log.md`](implementation-log.md) | Architecture decisions, task traces, bug fixes, debugging guide |
| [`project-context.md`](project-context.md) | Stack, conventions, and architecture context for the agent |
| [`cursor-rules-or-instructions.md`](cursor-rules-or-instructions.md) | Persistent Cursor agent rules |
| [`spec.md`](spec.md) | Full product specification (v2) |
| [`tasks.md`](tasks.md) | Phased implementation plan (Phases A–K) |
| [`acceptance-criteria.md`](acceptance-criteria.md) | AC-1 through AC-23 |

## Quick verification

```bash
cat tool-workflow.md
wc -l tool-specific/cursor-workflow/prompt-history.md
cd backend && npm test   # 174 tests
```
