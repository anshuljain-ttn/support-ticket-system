# Cursor Rules & Instructions

> Persistent instructions for AI-assisted development. These rules apply to every implementation session.

---

## 1. General Principles

- **Always use TypeScript** with `strict: true`. Never use `any`.
- **Never duplicate logic.** Extract shared code into utilities, services, or components.
- **Prefer composition over inheritance.** Use functions and hooks, not class hierarchies.
- **Keep functions under 40 lines** whenever practical. Extract helpers when exceeded.
- **Use clean, descriptive naming.** Names should reveal intent without comments.
- **No TODO placeholders.** Every implementation must be complete and functional.
- **No fake implementations.** No mock data in production code (seed script only).
- **No hardcoded data** except in the seed script.
- **Comments only where necessary** — explain *why*, not *what*.

---

## 2. Architecture Rules

### Backend

- **Always use Repository → Service → Controller separation.**
  - Controllers: parse request, call service, return response. No business logic.
  - Services: business logic, validation orchestration, state machine. No Mongoose calls.
  - Repositories: database queries only. No HTTP or business logic.
- **Always validate on the backend.** Zod schemas for every request body, query param, and URL param.
- **Backend is the source of truth** for status transitions. Frontend mirrors for UX only.
- **Use DTOs** to transform Mongoose documents before sending responses. Never expose raw documents.
- **Use the response envelope** for all API responses: `{ success, data }` or `{ success, error }`.
- **Throw `AppError`** with code, message, status, and optional details. Let error middleware handle formatting.
- **Environment variables** must be validated at startup via Zod. Fail fast on missing/invalid config.

### Frontend

- **Use reusable React components.** No copy-pasted JSX across pages.
- **Use custom hooks** for all data fetching. Pages should not call Axios directly.
- **Use React Hook Form + Zod** for all forms.
- **Use TanStack Query** for all server state. No `useEffect` + `fetch` patterns.
- **Mirror status transitions** in `lib/status-transitions.ts` for UI dropdown filtering only.
- **Sync filters to URL** via `searchParams` for shareable/bookmarkable list views.
- **Show loading skeletons** during data fetch, not spinners alone.
- **Show toast notifications** for all mutations (success and error).

---

## 3. File & Naming Conventions

### Files
- Backend: `kebab-case.ts` (e.g., `ticket.service.ts`)
- Frontend components: `kebab-case.tsx` (e.g., `ticket-table.tsx`)
- Frontend hooks: `use-kebab-case.ts` (e.g., `use-tickets.ts`)
- Test files: `*.test.ts` in `tests/` directory

### Code
- Classes: `PascalCase` (e.g., `TicketService`)
- Functions/variables: `camelCase` (e.g., `getTicketById`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `ALLOWED_TRANSITIONS`)
- Types/interfaces: `PascalCase`, no `I` prefix (e.g., `TicketDto`, not `ITicketDto`)
- React components: `PascalCase` (e.g., `TicketTable`)
- Enums: `PascalCase` values (e.g., `'In Progress'`, not `'IN_PROGRESS'`)

### Imports
- Use path aliases: `@/` maps to `src/`
- Order: external packages → internal absolute → relative

---

## 4. Validation Conventions

- Define Zod schemas in `validators/` (backend) or `schemas/` (frontend).
- Reuse `objectIdSchema` for all MongoDB ID fields.
- Reuse `paginationSchema` for all list endpoints.
- Validation error responses must include `details` array with `{ field, message }` objects.
- Frontend schemas should match backend rules (lengths, enums, required fields).

---

## 5. Testing Conventions

- **Always write tests** for new backend features.
- **Integration tests are mandatory** for:
  - Status state machine (every valid and invalid transition)
  - CRUD operations
  - Validation failures
  - 404 scenarios
- Use `describe` / `it` blocks with clear descriptions.
- Test file naming: `<feature>.test.ts`
- Seed test data in `beforeAll`, clean in `afterEach` or `afterAll`.
- Never depend on test execution order.
- Use Supertest for HTTP assertions; never call controllers directly in integration tests.

---

## 6. Error Handling Conventions

- Define error codes in `constants/error-codes.ts`.
- Use typed `AppError` class:
  ```typescript
  throw new AppError('TICKET_NOT_FOUND', 'Ticket not found', 404);
  ```
- **Never catch errors in controllers** (middleware handles them).
- **Never expose stack traces** in API responses.
- **Log errors** with context (request path, method) in error middleware.

### v2 — Authentication & Authorization

- **JWT in HTTP-only cookies** — never store tokens in localStorage.
- **bcrypt** for password hashing (cost factor ≥ 10).
- **PermissionService is the single source of truth** for authorization rules.
- **Controllers never contain permission logic** — use `authenticate` + `authorize(action)` middleware.
- **Ownership checks** via PermissionService or ownership helpers, not inline in controllers.
- **Frontend mirrors permissions for UX only** — call `canPerform(action)` helpers derived from API flags or shared types; never reimplement full RBAC matrix.
- **Never return password** in any API response or DTO.

---

## 7. Database Conventions

- Define indexes in Mongoose schema (not manually in scripts).
- Use `timestamps: true` for `createdAt`/`updatedAt` on tickets.
- Validate references in service layer (check user exists before assigning).
- Use lean queries for list views; populate only for detail views.
- Never use `populate()` in list/search queries (performance).

---

## 8. API Conventions

- Use correct HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial update).
- Return 201 for successful creation.
- Return 200 for successful read/update.
- Return 400 for validation errors and business rule violations.
- Return 404 for resource not found.
- Return 500 only for unhandled errors.
- Include `allowedTransitions` in ticket detail responses.

---

## 9. Frontend UI Conventions

- Use ShadCN UI components as base primitives. Do not reinvent buttons, inputs, selects.
- Use TailwindCSS for styling. No CSS modules or styled-components.
- Use Lucide icons consistently.
- Status badge colors:
  - Open: blue
  - In Progress: yellow/amber
  - Resolved: green
  - Closed: gray
  - Cancelled: red
- Priority badge colors:
  - Low: gray
  - Medium: blue
  - High: orange
  - Critical: red

---

## 10. Git Conventions

- Suggest a commit message after each completed task.
- Format: `<type>(<scope>): <description>`
- Types: `feat`, `fix`, `test`, `chore`, `docs`, `refactor`
- Scope: `backend`, `frontend`, or omitted for root changes.
- One task = one commit. Do not batch unrelated changes.

---

## 11. Implementation Workflow

1. **Read context first:** `project-context.md`, `spec.md`, `tasks.md`
2. **Pick the next pending task** from `tasks.md`
3. **Implement completely** — no partial or stub code
4. **Verify:** compile, lint, test
5. **Update [`artifacts/implementation-log.md`](../../artifacts/implementation-log.md)** with decisions made
6. **Update the matching file in [`ai-prompts/`](../../ai-prompts/)** and the index in [`ai-prompts/prompt-history.md`](../../ai-prompts/prompt-history.md) with prompts used
7. **Mark task complete** in `tasks.md`
8. **Suggest commit message**
9. **Move to next task**

---

## 12. What NOT to Do

- ❌ Do not skip backend validation because frontend validates
- ❌ Do not put business logic in controllers or route handlers
- ❌ Do not use `mongoose.Types.ObjectId` directly in services (use repository)
- ❌ Do not fetch data in components (use hooks)
- ❌ Do not hardcode API URLs (use environment variables)
- ❌ Do not create files outside the defined folder structure
- ❌ Do not add dependencies without justification
- ❌ Do not generate the entire project in one response
- ❌ Do not leave `console.log` in production code (use logger)
- ❌ Do not use `// @ts-ignore` or `// @ts-expect-error`

---

## 13. When Ambiguous

- Choose the **cleanest architecture** over the shortest code.
- Choose **explicit over implicit** (named constants over magic strings).
- Choose **backend enforcement** over frontend-only checks.
- Choose **existing patterns** in the codebase over new patterns.
- Document the decision in [`artifacts/implementation-log.md`](../../artifacts/implementation-log.md).
