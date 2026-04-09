# Phase 2: Features & History - Research

**Researched:** 2026-04-09
**Phase:** 02-features-history

## Domain Overview

Phase 2 adds 4 feature groups to the Phase 1 foundation:
1. **Comments** — Public and internal comments on tickets
2. **Attachments** — File uploads with validation
3. **Search & Filter** — Find tickets by text, status, priority, category, date
4. **Audit History** — Automatic logging of ticket changes

## Technical Approach

### Comments System

**Data Model:**
```typescript
interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean; // true = agents/supervisors only
  created: string;
  updated: string;
}
```

**Implementation Pattern:**
- Create `comentarios` collection in PocketBase
- RBAC: Filter `is_internal=true` from client-side for cliente role
- Query ordered by `created asc` (chronological)

**Key Consideration:** Internal comments must be filtered at API level, not just UI, to prevent data leakage via direct API calls.

### Attachments System

**Constraints (from D-05 to D-09):**
- Max 3 files per ticket
- Max 5MB each
- Types: png, jpeg, pdf, zip
- Storage: PocketBase file field
- Download: Server Action with auth check

**Implementation Pattern:**
- Add `adjuntos` field to tickets collection (JSON array or separate collection)
- PocketBase supports file uploads natively via FormData
- Server Action for download to enforce authentication

**PocketBase File Upload:**
```typescript
const formData = new FormData();
formData.append('file', fileBlob, 'filename.pdf');
await pb.collection('tickets').update(ticketId, formData);
```

### Search & Filter

**Requirements:**
- Text search: LIKE %query% on title + description
- Filters: status, priority, category, date_from, date_to
- Pagination: 10 results per page

**Implementation Pattern:**
- PocketBase filter syntax: `title ~ "query" || description ~ "query"`
- Combine filters with `&&`
- Use `page` and `per_page` params for pagination
- Return meta info: `totalItems`, `totalPages`

**Performance Note:** For larger datasets, consider indexing frequently-filtered fields.

### Audit History

**Data Model:**
```typescript
interface HistoryEntry {
  id: string;
  ticket_id: string;
  user_id: string;
  change_type: 'STATE_CHANGE' | 'ASSIGNMENT_CHANGE' | 'PRIORITY_CHANGE';
  old_value: string;
  new_value: string;
  created: string;
}
```

**Implementation Pattern:**
- Create `historial` collection
- PocketBase hooks (API hook) to automatically log changes
- Hook triggers on ticket update, compares old vs new values

**Hook Logic:**
```javascript
// On ticket update
if (oldRecord.state !== newRecord.state) {
  await createHistoryEntry({
    ticket_id: ticketId,
    user_id: currentUser.id,
    change_type: 'STATE_CHANGE',
    old_value: oldRecord.state,
    new_value: newRecord.state
  });
}
```

## Dependencies

- **Phase 1 Collections:** `usuarios`, `tickets`, `departamentos`
- **Phase 1 Patterns:** Server Actions, Zod validation, authStore
- **Required:** Ticket ID available for comment/attachment association

## Key Decisions Needed During Planning

1. **Comments storage:** Separate collection vs JSON in tickets?
2. **Attachments storage:** Files in tickets collection vs separate collection?
3. **History hook:** Use PocketBase API hooks or Next.js Server Actions?

## Patterns to Reuse from Phase 1

- Server Actions for mutations (src/lib/auth-actions.ts pattern)
- Zod schemas for validation (src/lib/validations.ts pattern)
- pb.authStore for user context
- Role checking: `currentUser()?.rol === 'agente' || currentUser()?.rol === 'supervisor'`

## Potential Pitfalls

1. **Internal comments leak:** Must filter at API level, not just UI
2. **File upload size:** PocketBase default is 10MB, but hook validation needed
3. **Search performance:** LIKE queries on large tables need indexes
4. **History duplication:** Don't log if value hasn't changed

---

*Research complete: 2026-04-09*