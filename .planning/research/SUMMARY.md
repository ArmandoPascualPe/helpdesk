# Research Summary — Help Desk System

**Project:** Help Desk / Ticket Management System  
**Synthesized:** 2026-04-08  
**Confidence:** HIGH

---

## Executive Summary

This is a **self-hosted help desk system** designed to replace email/spreadsheets for TechSupport Solutions. Built on **Next.js + PocketBase**, it provides a lightweight, fast alternative to enterprise monoliths like Zendesk.

The recommended stack is well-validated: Next.js 14 with Server Actions for mutations, PocketBase for embedded SQLite with built-in auth and realtime, shadcn/ui for accessible components, and React Hook Form + Zod for type-safe form validation.

**Key insight:** This is a *replacement* project, not a discovery project. Users expect table stakes — authentication, ticket lifecycle, roles, comments, search, supervisor dashboard. The differentiation comes from the *self-hosted* nature and *tight Next.js+PocketBase integration*, not from AI or omnichannel features (appropriately deferred to Phase 3+).

**Critical risks identified:** Security vulnerabilities around internal comment exposure, state machine enforcement, race conditions in ticket number generation, and API-level RBAC enforcement. These must be addressed in Phase 1.

---

## Key Findings

### From STACK.md
| Technology | Rationale |
|------------|-----------|
| **Next.js 14+** (App Router) | Server Actions for mutations, Route Handlers for APIs, Server Components for performance |
| **PocketBase 0.22+** | Embedded SQLite, built-in auth, REST API, realtime subscriptions, file uploads |
| **shadcn/ui** | Copy-paste components based on Radix UI primitives, fully customizable |
| **React Hook Form + Zod** | Type-safe form validation, best-in-class TypeScript integration |
| **Recharts** | 22M weekly downloads, standard for React dashboards |
| **date-fns** | Lightweight date utility over moment.js |

**Anti-patterns to avoid:** useEffect for data fetching, API Routes for everything, global state for auth, client-side-only validation.

### From FEATURES.md
**Table Stakes (MVP):**
- User Authentication & Roles (HU-01, RF-01)
- Ticket Creation (HU-02, RF-03)
- Ticket Lifecycle: Nuevo → En Proceso → Resuelto → Cerrado (HU-04, RF-04)
- RBAC: Client sees own, Agent sees dept, Supervisor sees all (RF-01)
- Comments + Internal comments (HU-05, RF-06)
- File Attachments (RF-03)
- Search + Filters + Pagination (HU-09, RF-09, RF-10)
- Supervisor Dashboard (HU-07, RF-08)

**MVP Build Order:** Auth → Ticket Creation → List/Detail → Comments → Agent Management → Search → Dashboard → Departments

**Differentiators (Phase 3+):** AI ticket summarization, AI agent assistance, knowledge base, omnichannel, SLA management.

**Anti-Features (Out of Scope):** Real-time chat, email notifications, payment gateways, PDF reports, dark mode, AI features (MVP phase).

### From ARCHITECTURE.md
**Component Boundaries:**
- Frontend (Next.js): UI/UX, routing, form validation
- Backend (PocketBase): Auth, DB, file storage, API rules, business logic
- Communication: REST API via PocketBase SDK

**Data Model:**
- `users`: role (cliente/agente/supervisor), department_id
- `tickets`: ticket_number (TKT-YYYY-NNNNN), status, priority, category, department, assignment
- `comments`: is_internal flag (CRITICAL: filter at API level)
- `ticket_history`: audit trail (RF-07)
- `attachments`: file storage with limits

**Build Order:**
```
PocketBase → Auth → Tickets → Comments → Search/Filters
              ↓
          Departments (Phase 2)
              ↓
          Dashboard (Phase 2)
```

**Anti-Patterns to Avoid:**
1. Client-side state transitions (must be server-side)
2. Exposing internal comments to clients (must filter at API level)
3. Direct PocketBase client in components (use abstraction layer/hooks)

### From PITFALLS.md
**Critical (Phase 1 must address):**
1. **Internal comments exposed to clients** — API-level filter required: `(is_internal = false) || (author.role != 'cliente')`
2. **Invalid state transitions** — Server-side validation of: NUEVO→EN_PROCESO, EN_PROCESO→EN_ESPERA|RESUELTO, etc.
3. **Race conditions in ticket numbers** — Server-side generation with hook, unique index on ticket_number
4. **File upload limits not enforced** — Server-side validation (max 3 files, 5MB each)
5. **Missing audit trail** — Server-side hook to create ticket_history on any field change

**Moderate:**
- RBAC not enforced at API level (only frontend protection)
- Dashboard queries slow at scale (>1000 tickets)
- Department deactivation with open tickets

**Minor:**
- Pagination state lost on filter change → use URL params
- Ticket number format inconsistent → pad with zeros

---

## Implications for Roadmap

### Suggested Phase Structure

**Phase 1: Core Ticket Management**
- PocketBase setup + collections
- Authentication + RBAC
- Ticket CRUD + lifecycle
- Comments (with internal comment security)
- Search + Filters + Pagination

*Rationale:* Foundation for everything. Must establish security patterns early — API-level filtering for internal comments, state machine validation, server-side ticket number generation. These are the highest-risk areas.

*Delivers:* Working MVP with basic ticket management

*Pitfalls to avoid:* All 5 critical pitfalls from PITFALLS.md

---

**Phase 2: Management & Visibility**
- Department CRUD (supervisor only)
- Agent assignment logic
- Supervisor Dashboard with Recharts
- Ticket history / audit trail

*Rationale:* Management layer on top of foundation. Dashboard requires aggregation queries — add indexes early to prevent performance issues at scale.

*Delivers:* Full supervisor visibility, department organization

*Pitfalls to avoid:* Dashboard query optimization, department deactivation validation

---

**Phase 3: Differentiation (Post-MVP)**
- AI ticket summarization
- AI agent assistance
- Knowledge base / self-service
- Omnichannel support
- SLA management
- Advanced reporting

*Rationale:* Competitive positioning beyond the "replacement" use case. PRD explicitly defers these.

*Delivers:* Feature-rich help desk with AI capabilities

---

### Research Flags

| Phase | Needs Research | Standard Patterns |
|-------|----------------|-------------------|
| Phase 1 | PocketBase hooks for ticket_number generation | Next.js Server Actions pattern (well-documented) |
| Phase 1 | API-level comment filtering | RBAC at API level (standard PocketBase) |
| Phase 2 | Dashboard aggregation at scale | Caching with unstable_cache (Next.js) |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | All technologies verified via Context7, aligns with specification |
| **Features** | HIGH | Directly aligned with PRD RFs + industry standards (Hiver, Suptask 2026) |
| **Architecture** | HIGH | Standard patterns for Next.js + PocketBase, schema well-defined |
| **Pitfalls** | HIGH | Domain-specific pitfalls with actionable prevention strategies |

**Overall Confidence: HIGH**

**Gaps Identified:**
- PocketBase hooks implementation details (need SDD phase design)
- Real-time updates vs polling for dashboard (future consideration)
- File storage scaling (S3/minio for 100K+ users)

---

## Sources

### Primary (High Confidence)
- **PRD** — prd-helpdesk.md (project-specific requirements)
- **PROJECT.md** — Tech stack and constraints specification
- **Context7** — Verified library versions: Next.js v15, PocketBase SDK v0.26.2, shadcn/ui v2.x/v3.x, React Hook Form v7.66.0, Zod v3.24.2, Recharts v3.3.0

### Secondary (High Confidence)
- **Hiver** — "15 Essential Help Desk Software Features for 2026" (Feb 2026)
- **Suptask** — "Help Desk Software Requirements - 21 Important Features" (2024-2026)
- **Jitbit** — "8 Must Have Components of an Internal Help Desk System" (2026)
- **EasyDesk** — "Helpdesk Implementation Mistakes To Avoid In 2026" (March 2026)
- **Adaptist Consulting** — "5 Mistakes That Cause Ticketing System Implementation to Fail" (Feb 2026)

### Tertiary (Medium Confidence)
- Stack Overflow / GitHub — PocketBase common issues
- LogRocket Blog 2025 — Recharts vs Victory comparison
