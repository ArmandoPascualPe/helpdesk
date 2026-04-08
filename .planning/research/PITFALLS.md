# Domain Pitfalls — Help Desk System

**Domain:** Help Desk / Ticket Management System  
**Researched:** 2026-04-08  
**Confidence:** HIGH

## Overview

Help desk projects have well-documented failure patterns. Based on industry research (EasyDesk 2026, Adaptist Consulting 2026) and domain expertise, these pitfalls apply specifically to ticket management systems built with the Next.js + PocketBase stack.

---

## Critical Pitfalls

Mistakes that cause rewrites, security breaches, or major user experience failures.

### Pitfall 1: Exposing Internal Comments to Clients

**What goes wrong:** Internal comments (visible only to agents/supervisors) are sent to the client and hidden with CSS or conditional rendering. This is a **security vulnerability** — the data is in the API response.

**Why it happens:** 
- Filtering only on frontend, not at API level
- PocketBase API rules not configured for comment visibility
- Developers assume UI hiding is sufficient

**Consequences:** 
- Clients can inspect network requests and see internal agent notes
- Violates trust and confidentiality
- Security audit failure

**Prevention:** 
1. **Filter at API level** — PocketBase API rule: `(is_internal = false) || (author.role != 'cliente')`
2. **Create a separate API endpoint** for comments that applies the filter automatically
3. **Test with network inspector** — verify internal comments don't appear in response

**Detection:** 
- Browser DevTools → Network tab → check comments API response
- Look for `is_internal: true` records in response

**Phase:** Phase 1 (Ticket Detail View - HU-04)

---

### Pitfall 2: Invalid State Transitions Allowed

**What goes wrong:** Users can change ticket status in ways not allowed by the PRD workflow (e.g., directly from NUEVO to CERRADO, or from RESUELTO back to NUEVO without REABIERTO).

**Why it happens:** 
- No server-side validation of state machine rules
- Client-only state validation that can be bypassed
- Missing validation in PocketBase API hooks

**Consequences:** 
- Broken workflow (tickets skip stages)
- Audit trail shows invalid transitions
- Dashboard metrics become unreliable

**Prevention:** 
1. **Define valid transitions explicitly:**
   - NUEVO → EN_PROCESO
   - EN_PROCESO → EN_ESPERA, RESUELTO
   - EN_ESPERA → EN_PROCESO
   - RESUELTO → CERRADO, REABIERTO
   - REABIERTO → EN_PROCESO

2. **Server-side validation** — Create PocketBase hook/JS to validate before update

3. **Client-side UX** — Only show valid transition buttons (e.g., "Take Ticket" only when status=NUEVO)

**Detection:** 
- Query ticket_history for invalid transitions
- Review tickets with status sequences that don't match workflow

**Phase:** Phase 1 (Agent Ticket Management - HU-06)

---

### Pitfall 3: Race Conditions in Ticket Number Generation

**What goes wrong:** Two users creating tickets simultaneously get duplicate ticket numbers (TKT-2026-00001 for both).

**Why it happens:** 
- Generating ticket_number client-side
- No database-level uniqueness constraint
- Relying on auto-increment without proper locking

**Consequences:** 
- Duplicate ticket numbers
- Client confusion
- Data integrity issues

**Prevention:** 
1. **Use PocketBase hooks** — Generate ticket_number server-side using a hook that:
   - Queries for max ticket_number in current year
   - Increments by 1
   - Uses format `TKT-{YYYY}-{00000}`

2. **Add unique index** on `ticket_number` field in PocketBase collection

3. **Fallback** — If duplicate detected, retry with new number

**Detection:** 
- Database query: `SELECT ticket_number, COUNT(*) FROM tickets GROUP BY ticket_number HAVING COUNT(*) > 1`

**Phase:** Phase 1 (Ticket Creation - HU-02)

---

### Pitfall 4: File Upload Limits Not Enforced

**What goes wrong:** Users can upload more than 3 files or files larger than 5MB, despite PRD limits.

**Why it happens:** 
- Client-side validation only (can be bypassed)
- Missing server-side validation
- No PocketBase API rule for file count

**Consequences:** 
- Storage bloat
- Performance degradation
- PRD requirements violated

**Prevention:** 
1. **Client-side:** React Hook Form validation (Zod schema with max length)
2. **Server-side:** PocketBase hook/JS hook:
   ```javascript
   if (files.length > 3) throw new Error("Max 3 files allowed");
   for (const file of files) {
     if (file.size > 5 * 1024 * 1024) throw new Error("Max 5MB per file");
   }
   ```
3. **Content-type validation** — Only allow png, jpeg, pdf, zip

**Detection:** 
- Check attachments table for count > 3 or size > 5MB
- Review file_type values for invalid types

**Phase:** Phase 1 (Ticket Creation - HU-02)

---

### Pitfall 5: Missing Audit Trail (Ticket History)

**What goes wrong:** Changes to tickets (status, priority, assignment) are not recorded in ticket_history, making the system non-compliant with RF-07.

**Why it happens:** 
- No automatic tracking mechanism
- Only manual logging implemented
- Forgetting to record history on each update

**Consequences:** 
- No accountability (who changed what, when)
- Supervisor can't review decision history
- PRD RF-07 not met

**Prevention:** 
1. **Server-side hook** — On ticket update, compare old vs new values and create history records for changed fields:
   - `status` → record old_value, new_value
   - `priority` → record old_value, new_value
   - `assigned_to` → record old_value, new_value

2. **Frontend hint** — Show "Last updated by X" in ticket detail

3. **Default behavior** — Always create history record on any field change

**Detection:** 
- Tickets with status changes but no corresponding ticket_history entries

**Phase:** Phase 1 (Ticket Detail - HU-04)

---

## Moderate Pitfalls

### Pitfall 6: Role-Based Access Control Not Enforced at API Level

**What goes wrong:** Users can see tickets they shouldn't access by manipulating API requests (e.g., client modifies URL to view another user's ticket).

**Why it happens:** 
- Only frontend route protection
- No PocketBase API rules on collections
- Believing "UI hides it = secure"

**Consequences:** 
- Data leakage
- Privacy violation
- System trust compromised

**Prevention:** 
1. **PocketBase API Rules:**
   - `tickets` collection: 
     - Client: `created_by = @request.auth.id`
     - Agent: `department_id = @request.auth.department_id` OR `assigned_to = @request.auth.id`
     - Supervisor: `@request.auth.role = 'supervisor'`

2. **Test by direct API call** — Try accessing ticket via curl/Postman with client token

**Phase:** Phase 1 (Authentication - HU-01)

---

### Pitfall 7: Dashboard Queries Not Optimized

**What goes wrong:** Supervisor dashboard loads slowly or times out as ticket volume grows (>1000 tickets).

**Why it happens:** 
- Multiple API calls per widget
- No pagination on aggregation queries
- Missing indexes on filter fields

**Consequences:** 
- Poor UX for supervisors
- Dashboard unusable during high load

**Prevention:** 
1. **Limit data fetched** — Use PocketBase filtering with `limit` and `page`
2. **Cache common queries** — Use Next.js `unstable_cache` for dashboard metrics
3. **Add indexes** on: `status`, `department_id`, `assigned_to`, `created_at`
4. **Progressive loading** — Load widgets independently

**Phase:** Phase 2 (Dashboard - HU-07)

---

### Pitfall 8: Department Deactivation with Open Tickets

**What goes wrong:** Supervisors can deactivate a department that has non-closed tickets (violates RF-08).

**Why it happens:** 
- No validation before department update
- UI allows deactivation without checking ticket status

**Consequences:** 
- Orphaned tickets
- Ticket assignment fails
- PRD rule violation

**Prevention:** 
1. **Server-side validation** — Before deactivating department:
   ```javascript
   const openTickets = await pb.collection('tickets').getList(1, 1, {
     filter: `department_id = "${deptId}" && status != 'closed'`
   });
   if (openTickets.totalItems > 0) throw new Error("Cannot deactivate department with open tickets");
   ```

2. **Frontend feedback** — Show warning if deactivation would be blocked

**Phase:** Phase 2 (Department Management - HU-08)

---

## Minor Pitfalls

### Pitfall 9: Pagination State Lost on Filter Change

**What goes wrong:** User applies a filter, goes to page 3, changes filter, sees empty results or wrong page.

**Why it happens:** 
- URL query params not updated with filter state
- Local state only, lost on navigation

**Prevention:** 
- Use URL search params for filters and pagination: `/tickets?page=3&status=new&priority=high`
- Next.js `useSearchParams` and `useRouter`

**Phase:** Phase 1 (Search - HU-09)

---

### Pitfall 10: Ticket Number Format Inconsistent

**What goes wrong:** Ticket numbers display as TKT-2026-1 instead of TKT-2026-00001.

**Why it happens:** 
- Simple auto-increment without zero-padding
- No format specification in code

**Prevention:** 
- Pad with leading zeros: `TKT-${year}-${String(id).padStart(5, '0')}`

**Phase:** Phase 1 (Ticket Creation - HU-02)

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|----------------|------------|
| **Phase 1** | Auth + RBAC | Access control only on UI, not API | PocketBase API rules on collections |
| **Phase 1** | Ticket Creation | Duplicate ticket numbers | Server-side generation with unique index |
| **Phase 1** | Ticket Lifecycle | Invalid state transitions | Server-side validation of state machine |
| **Phase 1** | Comments | Internal comments exposed to clients | API-level filtering |
| **Phase 1** | Search | Pagination state lost | URL params for filters + pagination |
| **Phase 2** | Dashboard | Slow queries at scale | Indexes + caching |
| **Phase 2** | Departments | Deactivation with open tickets | Validation before update |

---

## Sources

- **EasyDesk** — "Helpdesk Implementation Mistakes To Avoid In 2026" (March 2026) — HIGH confidence
- **Adaptist Consulting** — "5 Mistakes That Cause Ticketing System Implementation to Fail" (Feb 2026) — HIGH confidence
- **PRD** — prd-helpdesk.md for requirements-specific pitfalls — HIGH confidence
- **Stack Overflow / GitHub** — PocketBase common issues (file limits, performance) — MEDIUM confidence

---

## Quality Gate Status

- [x] Pitfalls are specific to Help Desk domain
- [x] Prevention strategies are actionable
- [x] Phase mapping included for each critical pitfall
- [x] Security considerations (internal comments, RBAC) highlighted
