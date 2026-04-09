# Phase 1: Authentication & Tickets - Tasks

**Phase:** 01-authentication-tickets
**Status:** In Progress
**Created:** 2026-04-08

---

## Authentication

- [x] AUTH-01.1: Create register form with email, username, first_name, last_name, password, passwordConfirm
- [x] AUTH-01.2: Add Zod validation with strong password policy (8+ chars, 1 upper, 1 lower, 1 number, 1 symbol)
- [x] AUTH-01.3: Implement register function in src/lib/auth.ts
- [x] AUTH-02.1: Create login form with email and password
- [x] AUTH-02.2: Add Zod validation for login
- [x] AUTH-02.3: Implement login function with PocketBase authWithPassword
- [x] AUTH-03.1: Add session persistence via cookies (pb_auth cookie)
- [x] AUTH-03.2: Create middleware.ts for route protection
- [x] AUTH-03.3: Implement logout function
- [x] AUTH-04.1: Create password reset page (UI only, backend deferred)
- [ ] AUTH-04.2: Add email verification flow (deferred to Phase 2)

## Tickets - Core

- [x] TICK-01.1: Create new ticket form with title, description, priority, category, department
- [x] TICK-01.2: Add Zod validation for ticket creation
- [x] TICK-01.3: Implement ticket creation API endpoint
- [x] TICK-01.4: Add ticket number generation (TKT-YYYY-NNNNN format)
- [x] TICK-02.1: Create tickets list page with user tickets
- [x] TICK-02.2: Add status and priority indicators
- [x] TICK-02.3: Add link to ticket detail
- [x] TICK-03.1: Create ticket detail page
- [x] TICK-03.2: Display ticket information (title, description, status, priority, etc.)
- [x] TICK-03.3: Add navigation back to tickets list

## Tickets - Agent Actions

- [x] TICK-04.1: Implement "Take Ticket" action for agents
- [x] TICK-04.2: Add status transition validation (validTransitions map)
- [x] TICK-04.3: Create status change buttons on ticket detail
- [x] TICK-04.4: Implement reassign ticket action (supervisor only)
- [x] TICK-04.5: Add priority change action for agents
- [x] TICK-04.6: Create server actions for ticket operations

## Database Migrations

- [x] DB-01.1: Create usuarios collection with role field
- [x] DB-01.2: Create tickets collection with all required fields
- [x] DB-01.3: Create departamentos collection
- [x] DB-01.4: Set up PocketBase migrations

## Files Created/Modified

| File | Status |
|------|--------|
| `src/app/(auth)/login/page.tsx` | Done |
| `src/app/(auth)/register/page.tsx` | Done |
| `src/lib/auth.ts` | Done |
| `src/lib/validations.ts` | Done |
| `src/lib/pocketbase.ts` | Done |
| `src/app/(dashboard)/tickets/page.tsx` | Done |
| `src/app/(dashboard)/tickets/new/page.tsx` | Done |
| `src/app/(dashboard)/tickets/[id]/page.tsx` | Done |
| `src/app/(dashboard)/tickets/[id]/actions.ts` | Done |
| `src/middleware.ts` | Done |
| `src/types/index.ts` | Done |
| `pocketbase/pb_migrations/` | Done |

## Pending

- [ ] Email verification (AUTH-02) - Deferred to Phase 2
- [ ] Password reset email (AUTH-03) - Deferred to Phase 2

---

*Tasks defined: 2026-04-08*
