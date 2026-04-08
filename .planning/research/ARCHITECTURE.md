# Architecture Patterns - Help Desk System

**Domain:** Help Desk / Ticket Management System  
**Researched:** 2026-04-08  
**Confidence:** HIGH

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 14)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   (auth)     │  │  (dashboard) │  │     API      │           │
│  │  /login      │  │  /tickets    │  │  /api/*      │           │
│  │  /register   │  │  /departments│  │              │           │
│  └──────────────┘  │  /dashboard  │  └──────────────┘           │
│                    └──────────────┘                             │
├─────────────────────────────────────────────────────────────────┤
│                     POCKETBASE (Backend + DB)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Auth Store   │  │  Collections │  │   API Rules  │           │
│  │              │  │  - users     │  │              │           │
│  │              │  │  - departments│ │              │           │
│  │              │  │  - tickets   │  │              │           │
│  │              │  │  - comments  │  │              │           │
│  │              │  │  - history   │  │              │           │
│  │              │  │  - attachments│ │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Frontend (Next.js)** | UI/UX, routing, form validation, state management | PocketBase via REST API |
| **PocketBase Backend** | Auth, DB, file storage, API rules, business logic | Frontend via JSON REST API |
| **Auth Store** | User sessions, RBAC enforcement | Both layers |

### Communication Flow

```
[Client] ──HTTP/REST──▶ [PocketBase API] ──▶ [Collections]
                                    │
                              [API Rules]
                                    │
                              [File Storage]
```

## Data Flow

### Ticket Creation Flow (Client Perspective)

```
1. User fills form → React Hook Form validates with Zod
2. Submit → POST /api/collections/tickets
3. PocketBase:
   a. Validates auth token
   b. Runs API rules (user.role === 'cliente')
   c. Generates ticket_number (TKT-YYYY-NNNNN)
   d. Stores record in `tickets` collection
4. Response → Client redirects to ticket detail
```

### State Transition Flow

```
User clicks "Take Ticket"
       │
       ▼
POST to /api/collections/tickets/{id}
       │
       ▼
PocketBase API Rules:
- Verify user is agent OR supervisor
- Verify ticket status === 'new'
       │
       ▼
Update: assigned_to = user.id, status = 'in_progress'
       │
       ▼
Trigger: Create TicketHistory record (field_changed: status)
       │
       ▼
Return updated ticket → Client re-fetches
```

### Comment System Flow

```
1. User submits comment form
2. POST /api/collections/comments
3. PocketBase:
   a. Validates auth (any logged user)
   b. Stores with is_internal flag
   c. Updates ticket.updated_at
4. UI refresh: comments list re-fetches
5. Visibility filter: is_internal && user.role === 'cliente' → hide
```

## Component Details

### 1. Authentication & Authorization Layer

**PocketBase Built-in Features:**
- Email/password authentication
- User collections with role field
- API rules for fine-grained access

**Frontend:**
- `use-auth` hook for session management
- Role-based route guards in layout
- Redirect logic based on user role

| Access Pattern | API Rule (PocketBase) |
|----------------|---------------------|
| Client sees own tickets | `created_by = @request.auth.id` |
| Agent sees dept tickets | `department_id = @request.auth.department_id` |
| Supervisor sees all | `@request.auth.role = 'supervisor'` |

### 2. Ticket Management Core

**Ticket Entity Structure:**
- Main record in `tickets` collection
- All state changes via PATCH requests
- History automatically tracked via separate collection

**State Machine Implementation:**
```
NUEVO ──(agent takes)──▶ EN_PROCESO ──(needs input)──▶ EN_ESPERA
   │                          │                              │
   │                          │ (solved)                   │ (client responds)
   │                          ▼                              ▼
   │                    RESUELTO ◀────────────────── EN_PROCESO
   │                          │
   │              (48h or client confirms)
   │                          │
   │                          ▼
   └──────────────────▶ CERRADO
        (client dissatisfied)
            │
            ▼
         REABIERTO ──▶ EN_PROCESO
```

### 3. Dashboard (Supervisor Only)

**Data Aggregation Queries:**
- Count tickets by status → pie chart
- Count tickets by priority → bar chart
- Agent workload → table (assigned + open + resolved per agent)
- Avg resolution time → calculated field
- Stale tickets → filter `status != 'closed' && created_at < 7 days ago`

### 4. File Upload Handling

```
Client → POST /api/collections/attachments (multipart)
              │
              ▼
       PocketBase validates:
       - File size ≤ 5MB
       - MIME type in [png, jpeg, pdf, zip]
       - Ticket attachments count < 3
              │
              ▼
       Store in pb_files/ → returns file URL
              │
              ▼
       Create attachment record linking to ticket
```

## Build Order Implications

### Phase 1: Foundation (MVP Core)

| Order | Component | Dependencies | Rationale |
|-------|-----------|--------------|-----------|
| 1 | PocketBase setup + collections | None | Must exist before frontend can connect |
| 2 | Auth (login/register) | PocketBase | All other features require auth |
| 3 | Ticket CRUD | Auth | Core value proposition |
| 4 | Comments | Auth + Tickets | Requires ticket context |
| 5 | Search/Filters | Tickets | Applies to existing data |

**Dependency Graph:**
```
PocketBase → Auth → Tickets → Comments → Search/Filters
                ↓
            Departments (Phase 2)
                ↓
            Dashboard (Phase 2)
```

### Phase 2: Management Layer

| Order | Component | Dependencies |
|-------|-----------|--------------|
| 1 | Department CRUD | Auth (supervisor only) |
| 2 | Agent assignment logic | Departments + Tickets |
| 3 | Dashboard metrics | Tickets + Departments |

### Phase 3: Polish (Optional)

- File upload improvements
- Dashboard real-time (polling)
- Export functionality

## Scalability Considerations

| Concern | At 100 Users | At 10K Users | At 100K Users |
|---------|--------------|--------------|---------------|
| **Auth** | PocketBase default | PocketBase default | Consider external SSO |
| **Queries** | Simple filters | Add indexes on status, department_id | Pagination + cursor-based |
| **Files** | Local storage | Consider S3/minio | CDN for attachments |
| **Dashboard** | Simple counts | Aggregation queries | Background jobs/cached |

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side State Transitions
**What:** Updating ticket state in React state only, then sending to server
**Why bad:** Fails if user refreshes, loses audit trail
**Instead:** Server-side state machine, client just triggers transitions

### Anti-Pattern 2: Exposing Internal Comments to Clients
**What:** Sending all comments to client, hiding with CSS
**Why bad:** Security flaw — comments visible in API response
**Instead:** Filter at API level: `is_internal = false OR author.role != 'cliente'`

### Anti-Pattern 3: Direct PocketBase Client in Components
**What:** Importing pb client directly in each component
**Why bad:** Hard to mock in tests, no centralized error handling
**Instead:** Use abstraction layer / hooks (`use-tickets.ts`)

## Database Schema (PocketBase Collections)

### users
```
id (system)
email (unique)
username (unique)
first_name
last_name
role (enum: cliente, agente, supervisor)
department_id (relation → departments, nullable)
```

### departments
```
id (system)
name
description
contact_email
active (bool)
```

### tickets
```
id (system)
ticket_number (auto-generated: TKT-YYYY-NNNNN)
title (max 200)
description
priority (enum: low, medium, high, critical)
category (enum: hardware, software, network, other)
status (enum: new, in_progress, waiting, resolved, reopened, closed)
department_id (relation → departments)
created_by (relation → users)
assigned_to (relation → users, nullable)
created_at (system)
updated_at (system)
closed_at (datetime, nullable)
```

### comments
```
id (system)
ticket_id (relation → tickets)
content (text)
is_internal (bool)
author_id (relation → users)
created_at (system)
```

### ticket_history
```
id (system)
ticket_id (relation → tickets)
field_changed (string)
old_value (text)
new_value (text)
changed_by (relation → users)
changed_at (system)
```

### attachments
```
id (system)
ticket_id (relation → tickets)
filename (string)
file_size (number)
file_type (string)
file (PocketBase file)
uploaded_by (relation → users)
uploaded_at (system)
```

## Sources

- Jitbit "8 Must Have Components of an Internal Help Desk System" (2026)
- PRD Requirements Analysis (prd-helpdesk.md)
- PocketBase documentation for API rules and collections
- Next.js 14 App Router best practices

---

**Quality Gate Status:**
- [x] Components clearly defined with boundaries
- [x] Data flow direction explicit
- [x] Build order implications noted