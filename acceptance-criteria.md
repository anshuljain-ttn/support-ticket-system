# Acceptance Criteria

> Checkbox summary for reviewers. Detailed AC-1–AC-23 with verification methods: [`docs/acceptance-criteria.md`](docs/acceptance-criteria.md).

## Core

- [x] Monorepo with `frontend/` and `backend/` compiles without TypeScript errors
- [x] JWT authentication (login, logout, me) with HTTP-only cookie
- [x] Three roles: SUPER_ADMIN, ADMIN, EMPLOYEE with distinct permissions
- [x] Ownership rule: ticket creators cannot assign or advance workflow on own tickets
- [x] Ticket CRUD with pagination, search, filter, and sort
- [x] Status state machine enforces valid transitions only
- [x] Comments on tickets with timeline in detail view
- [x] Embedded audit `history[]` on ticket mutations
- [x] Role-aware dashboard and permission-gated UI actions
- [x] Seed script creates 6 users with bcrypt-hashed passwords
- [x] Swagger/OpenAPI at `/api-docs`

## Validation

- [x] Zod validation on all API inputs (body, query, params)
- [x] Consistent API envelope: `{ success, data }` or `{ success, error }`
- [x] Frontend forms validated with Zod + react-hook-form
- [x] Invalid ObjectId returns 400; missing resources return 404

## Error Handling

- [x] Domain errors use typed `AppError` codes (e.g. `FORBIDDEN`, `INVALID_STATUS_TRANSITION`)
- [x] Permission failures return 403 before state machine returns 400
- [x] Global error middleware returns structured 500 for unhandled errors
- [x] Frontend displays user-friendly error and empty states

## Testing

- [x] **174 tests** passing (unit + integration)
- [x] Integration tests use MongoMemoryServer (isolated DB)
- [x] RBAC matrix covered in `permission.service.test.ts` and `permissions.test.ts`
- [x] State machine transitions covered in `status-machine.test.ts`
- [x] Failure modes covered in `failure-modes.test.ts`
- [x] `npm run typecheck` and `npm run lint` pass in both apps

## Documentation

- [x] Root `README.md` with setup and architecture
- [x] `tool-workflow.md` — required AI workflow submission
- [x] `ai-prompts/` — categorized prompt history (27 prompts)
- [x] `artifacts/implementation-log.md` — decisions D1–D20 and bug fixes
- [x] Submission artifacts at repo root (this file and siblings)
- [x] `SUBMISSION.md` reviewer checklist
