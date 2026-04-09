# Roadmap: Help Desk

## Phases

- [ ] **Phase 1: Authentication & Tickets** - Sistema de autenticación y gestión básica de tickets
- [ ] **Phase 2: Features & History** - Comentarios, adjuntos, búsqueda y auditoría
- [ ] **Phase 3: Management & Supervision** - Departamentos y dashboard de métricas

---

## Phase Details

### Phase 1: Authentication & Tickets
**Goal**: Users can create accounts, log in, and create/manage tickets
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, TICK-01, TICK-02, TICK-03, TICK-04, TICK-05, TICK-06, TICK-07, TICK-08
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password, and receives confirmation email
  2. User can log in with email/password and stay logged in across browser sessions
  3. User can reset forgotten password via email link
  4. User can create a ticket with title, description, category, priority, and department
  5. Ticket is assigned a unique ticket number in format TKT-YYYY-NNNNN
  6. User can view a list of their tickets with status indicators
  7. User can view detailed ticket information
  8. Agent can take an unassigned ticket
  9. Agent/supervisor can change ticket state (with valid transitions only)
  10. Agent/supervisor can reassign ticket to another agent
  11. Agent/supervisor can change ticket priority
**Plans**: TBD

### Phase 2: Features & History
**Goal**: Users can add comments/attachments to tickets, search & filter, and view audit history
**Depends on**: Phase 1
**Requirements**: COMM-01, COMM-02, COMM-03, ATT-01, ATT-02, ATT-03, SECH-01, SECH-02, SECH-03, SECH-04, SECH-05, SECH-06, HIST-01, HIST-02, HIST-03
**Success Criteria** (what must be TRUE):
  1. User can add public comments to any of their tickets
  2. Agent/supervisor can add internal comments (visible only to agents/supervisors, not to clients)
  3. All comments on a ticket display in chronological order
  4. User can attach up to 3 files per ticket (png, jpeg, pdf, zip; max 5MB each)
  5. User can download any attachment from a ticket
  6. User can search tickets by text in title or description
  7. User can filter tickets by status, priority, category, and date range
  8. Search results are paginated (10 per page)
  9. System records every ticket state change with timestamp and user who made it
  10. System records every assignment change with timestamp and user who made it
  11. System records every priority change with timestamp and user who made it
**Plans**: TBD

### Phase 3: Management & Supervision
**Goal**: Supervisors can manage departments and view operational metrics
**Depends on**: Phase 1
**Requirements**: DEPT-01, DEPT-02, DEPT-03, DEPT-04, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06
**Success Criteria** (what must be TRUE):
  1. Supervisor can create new departments with name and description
  2. Supervisor can edit existing department details
  3. Supervisor can deactivate departments (only if no open tickets assigned)
  4. Supervisor can assign agents to departments
  5. Supervisor can view dashboard with ticket count by status
  6. Supervisor can view dashboard with ticket count by priority
  7. Supervisor can view dashboard with ticket count by department
  8. Supervisor can view agent workload (tickets assigned per agent)
  9. Supervisor can view average ticket resolution time
  10. Supervisor can view list of tickets open for more than 7 days
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1 - Authentication & Tickets | 1/1 | ✅ Completed | 2026-04-09 |
| 2 - Features & History | 0/1 | Not started | - |
| 3 - Management & Supervision | 0/1 | Not started | - |

---

*Roadmap created: 2026-04-08*