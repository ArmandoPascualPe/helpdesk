# Requirements: Help Desk

**Defined:** 2026-04-08
**Core Value:** Sistema unificado de tickets que mejore la eficiencia del equipo de soporte y la satisfacción del cliente mediante seguimiento completo y visibilidad del estado de las solicitudes.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can reset password via email link
- [ ] **AUTH-04**: User session persists across browser refresh

### Tickets

- [ ] **TICK-01**: User can create a ticket with title, description, category, priority, department
- [ ] **TICK-02**: Ticket is assigned a unique ticket_number (TKT-YYYY-NNNNN)
- [ ] **TICK-03**: User can view list of their tickets
- [ ] **TICK-04**: User can view detailed ticket information
- [ ] **TICK-05**: Agent can take an unassigned ticket
- [ ] **TICK-06**: Agent/supervisor can change ticket state (valid transitions only)
- [ ] **TICK-07**: Agent/supervisor can reassign ticket to another agent
- [ ] **TICK-08**: Agent/supervisor can change ticket priority

### Comments

- [ ] **COMM-01**: User can add public comments to a ticket
- [ ] **COMM-02**: Agent/supervisor can add internal comments (not visible to clients)
- [ ] **COMM-03**: Comments display in chronological order

### Attachments

- [ ] **ATT-01**: User can attach up to 3 files per ticket
- [ ] **ATT-02**: Files max 5MB each, types: png, jpeg, pdf, zip
- [ ] **ATT-03**: User can download attachments

### Search & Filter

- [ ] **SECH-01**: User can search tickets by text in title/description
- [ ] **SECH-02**: User can filter by status
- [ ] **SECH-03**: User can filter by priority
- [ ] **SECH-04**: User can filter by category
- [ ] **SECH-05**: User can filter by date range
- [ ] **SECH-06**: Results are paginated (10 per page)

### Departments

- [ ] **DEPT-01**: Supervisor can create departments
- [ ] **DEPT-02**: Supervisor can edit departments
- [ ] **DEPT-03**: Supervisor can deactivate departments (if no open tickets)
- [ ] **DEPT-04**: Agents can be assigned to departments

### Dashboard

- [ ] **DASH-01**: Supervisor can view tickets by status
- [ ] **DASH-02**: Supervisor can view tickets by priority
- [ ] **DASH-03**: Supervisor can view tickets by department
- [ ] **DASH-04**: Supervisor can view agent workload
- [ ] **DASH-05**: Supervisor can view average resolution time
- [ ] **DASH-06**: Supervisor can view tickets open > 7 days

### History

- [ ] **HIST-01**: System records state changes with timestamp and user
- [ ] **HIST-02**: System records assignment changes with timestamp and user
- [ ] **HIST-03**: System records priority changes with timestamp and user

## v2 Requirements

### Notifications

- **NOTF-01**: User receives in-app notifications
- **NOTF-02**: User receives email for new followers
- **NOTF-03**: User receives email for comments on own posts
- **NOTF-04**: User can configure notification preferences

### Advanced Features

- **ADV-01**: AI ticket summarization
- **ADV-02**: Knowledge base for self-service
- **ADV-03**: Omnichannel support (email-to-ticket)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat (websockets) | Alta complejidad, no está en el PRD |
| Integración con pasarelas de pago | No es una función de soporte |
| Reportes en PDF | Opcional según PRD |
| Notificaciones por email | Opcional según PRD |
| Modo oscuro | Opcional según PRD |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| TICK-01 | Phase 1 | Pending |
| TICK-02 | Phase 1 | Pending |
| TICK-03 | Phase 1 | Pending |
| TICK-04 | Phase 1 | Pending |
| TICK-05 | Phase 1 | Pending |
| TICK-06 | Phase 1 | Pending |
| TICK-07 | Phase 1 | Pending |
| TICK-08 | Phase 1 | Pending |
| COMM-01 | Phase 2 | Pending |
| COMM-02 | Phase 2 | Pending |
| COMM-03 | Phase 2 | Pending |
| ATT-01 | Phase 2 | Pending |
| ATT-02 | Phase 2 | Pending |
| ATT-03 | Phase 2 | Pending |
| SECH-01 | Phase 2 | Pending |
| SECH-02 | Phase 2 | Pending |
| SECH-03 | Phase 2 | Pending |
| SECH-04 | Phase 2 | Pending |
| SECH-05 | Phase 2 | Pending |
| SECH-06 | Phase 2 | Pending |
| HIST-01 | Phase 2 | Pending |
| HIST-02 | Phase 2 | Pending |
| HIST-03 | Phase 2 | Pending |
| DEPT-01 | Phase 3 | Pending |
| DEPT-02 | Phase 3 | Pending |
| DEPT-03 | Phase 3 | Pending |
| DEPT-04 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DASH-05 | Phase 3 | Pending |
| DASH-06 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
