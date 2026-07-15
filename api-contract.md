# API Contract

> Interactive docs: `GET /api-docs` · JSON spec: `GET /api-docs.json`  
> Full OpenAPI paths: `backend/src/docs/openapi.paths.ts`

All authenticated endpoints require JWT in HTTP-only cookie `sts_token` (unless noted).

---

## Endpoint: Health Check

**Method:** `GET`  
**Path:** `/health`  
**Purpose:** Liveness probe for Docker and monitoring

### Request

No body. No auth required.

### Response

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-07-15T10:00:00.000Z",
    "uptime": 123.456
  }
}
```

### Validation Rules

None.

### Error Responses

| Status | Code | When |
|--------|------|------|
| 500 | `INTERNAL_ERROR` | Unhandled failure |

---

## Endpoint: Login

**Method:** `POST`  
**Path:** `/auth/login`  
**Purpose:** Authenticate user and set JWT cookie

### Request

```json
{
  "email": "alice@company.com",
  "password": "dev-password-from-env"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Alice",
      "email": "alice@company.com",
      "role": "EMPLOYEE",
      "avatar": "...",
      "isActive": true
    }
  }
}
```

Sets `Set-Cookie: sts_token=...; HttpOnly; ...`

### Validation Rules

- `email`: valid email string, required
- `password`: non-empty string, required

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid body |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password |
| 401 | `USER_INACTIVE` | `isActive: false` |

---

## Endpoint: List Tickets

**Method:** `GET`  
**Path:** `/tickets`  
**Purpose:** Paginated ticket list scoped by role

### Request

Query parameters:

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default 1) |
| `limit` | number | Page size (default 20, max 100) |
| `status` | string | Filter by status |
| `priority` | string | Filter by priority |
| `assignedTo` | string | Filter by assignee ObjectId |
| `sort` | string | `newest` \| `oldest` \| `priority` |

### Response

```json
{
  "success": true,
  "data": {
    "items": [ { "_id": "...", "title": "...", "status": "Open", "priority": "High", ... } ],
    "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  }
}
```

### Validation Rules

- Query validated by `ticketListQuerySchema`
- EMPLOYEE sees own tickets only; ADMIN/SUPER_ADMIN per RBAC scope

### Error Responses

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | No valid JWT |
| 400 | `VALIDATION_ERROR` | Invalid query params |

---

## Endpoint: Create Ticket

**Method:** `POST`  
**Path:** `/tickets`  
**Purpose:** Create a new ticket (status defaults to `Open`)

### Request

```json
{
  "title": "VPN not connecting",
  "description": "Cannot access internal tools since this morning",
  "priority": "High"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "VPN not connecting",
    "status": "Open",
    "priority": "High",
    "createdBy": "...",
    "comments": [],
    "history": [ { "action": "created", ... } ],
    "allowedTransitions": ["In Progress", "Cancelled"],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Validation Rules

- `title`: required, min length
- `description`: required
- `priority`: enum `Low` \| `Medium` \| `High` \| `Critical`

### Error Responses

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid body |
| 401 | `UNAUTHORIZED` | Not authenticated |

---

## Endpoint: Update Ticket Status

**Method:** `PATCH`  
**Path:** `/tickets/:id/status`  
**Purpose:** Transition ticket through state machine

### Request

```json
{
  "status": "In Progress"
}
```

### Response

Updated ticket object with new `status`, `history[]`, and `allowedTransitions`.

### Validation Rules

- `id`: valid MongoDB ObjectId
- `status`: valid enum value
- **Permission check runs before state machine** (403 before 400)
- Transition must be allowed by `StatusMachineService`

### Error Responses

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | Role/ownership cannot change status |
| 400 | `INVALID_STATUS_TRANSITION` | Transition not allowed |
| 404 | `TICKET_NOT_FOUND` | Invalid id |

---

## Endpoint: Add Comment

**Method:** `POST`  
**Path:** `/tickets/:id/comments`  
**Purpose:** Add comment to ticket thread

### Request

```json
{
  "message": "Escalated to network team"
}
```

### Response

Updated ticket with new comment appended.

### Validation Rules

- `message`: required, non-empty
- User must have view access to ticket

### Error Responses

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | No access to ticket |
| 404 | `TICKET_NOT_FOUND` | Ticket missing |

---

## Additional Endpoints (summary)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/auth/logout` | Clear auth cookie |
| `GET` | `/auth/me` | Current user |
| `GET` | `/users` | List users (role-scoped) |
| `GET` | `/tickets/search` | Full-text search |
| `GET` | `/tickets/:id` | Ticket detail + comments + transitions |
| `PUT` | `/tickets/:id` | Update ticket fields |
| `PATCH` | `/tickets/:id/assign` | Assign ticket |
| `GET` | `/dashboard/stats` | Role-aware dashboard metrics |

See Swagger UI for complete request/response schemas.
