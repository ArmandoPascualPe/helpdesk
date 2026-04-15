# Requirements: Help Desk

**Defined:** 2026-04-08
**Core Value:** Sistema unificado de tickets que mejore la eficiencia del equipo de soporte y la satisfacción del cliente mediante seguimiento completo y visibilidad del estado de las solicitudes.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User receives email verification after signup
- [x] **AUTH-03**: User can reset password via email link
- [x] **AUTH-04**: User session persists across browser refresh

### Tickets

- [x] **TICK-01**: User can create a ticket with title, description, category, priority, department
- [x] **TICK-02**: Ticket is assigned a unique ticket_number (TKT-YYYY-NNNNN)
- [x] **TICK-03**: User can view list of their tickets
- [x] **TICK-04**: User can view detailed ticket information
- [x] **TICK-05**: Agent can take an unassigned ticket
- [x] **TICK-06**: Agent/supervisor can change ticket state (valid transitions only)
- [x] **TICK-07**: Agent/supervisor can reassign ticket to another agent
- [x] **TICK-08**: Agent/supervisor can change ticket priority

### Comments

- [x] **COMM-01**: User can add public comments to a ticket
- [x] **COMM-02**: Agent/supervisor can add internal comments (not visible to clients)
- [x] **COMM-03**: Comments display in chronological order

### Attachments

- [x] **ATT-01**: User can attach up to 3 files per ticket
- [x] **ATT-02**: Files max 5MB each, types: png, jpeg, pdf, zip
- [x] **ATT-03**: User can download attachments

### Search & Filter

- [x] **SECH-01**: User can search tickets by text in title/description
- [x] **SECH-02**: User can filter by status
- [x] **SECH-03**: User can filter by priority
- [x] **SECH-04**: User can filter by category
- [x] **SECH-05**: User can filter by date range
- [x] **SECH-06**: Results are paginated (10 per page)

### Departments

- [x] **DEPT-01**: Supervisor can create departments
- [x] **DEPT-02**: Supervisor can edit departments
- [x] **DEPT-03**: Supervisor can deactivate departments (if no open tickets)
- [x] **DEPT-04**: Agents can be assigned to departments

### Dashboard

- [x] **DASH-01**: Supervisor can view tickets by status
- [x] **DASH-02**: Supervisor can view tickets by priority
- [x] **DASH-03**: Supervisor can view tickets by department
- [x] **DASH-04**: Supervisor can view agent workload
- [x] **DASH-05**: Supervisor can view average resolution time
- [x] **DASH-06**: Supervisor can view tickets open > 7 days

### History

- [x] **HIST-01**: System records state changes with timestamp and user
- [x] **HIST-02**: System records assignment changes with timestamp and user
- [x] **HIST-03**: System records priority changes with timestamp and user

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
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| TICK-01 | Phase 1 | Complete |
| TICK-02 | Phase 1 | Complete |
| TICK-03 | Phase 1 | Complete |
| TICK-04 | Phase 1 | Complete |
| TICK-05 | Phase 1 | Complete |
| TICK-06 | Phase 1 | Complete |
| TICK-07 | Phase 1 | Complete |
| TICK-08 | Phase 1 | Complete |
| COMM-01 | Phase 2 | Complete |
| COMM-02 | Phase 2 | Complete |
| COMM-03 | Phase 2 | Complete |
| ATT-01 | Phase 2 | Complete |
| ATT-02 | Phase 2 | Complete |
| ATT-03 | Phase 2 | Complete |
| SECH-01 | Phase 1 | Complete |
| SECH-02 | Phase 1 | Complete |
| SECH-03 | Phase 1 | Complete |
| SECH-04 | Phase 1 | Complete |
| SECH-05 | Phase 1 | Complete |
| SECH-06 | Phase 1 | Complete |
| HIST-01 | Phase 2 | Complete |
| HIST-02 | Phase 2 | Complete |
| HIST-03 | Phase 2 | Complete |
| DEPT-01 | Phase 3 | Complete |
| DEPT-02 | Phase 3 | Complete |
| DEPT-03 | Phase 3 | Complete |
| DEPT-04 | Phase 3 | Complete |
| DASH-01 | Phase 3 | Complete |
| DASH-02 | Phase 3 | Complete |
| DASH-03 | Phase 3 | Complete |
| DASH-04 | Phase 3 | Complete |
| DASH-05 | Phase 3 | Complete |
| DASH-06 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-08*
*Last updated: 2026-04-08 after initial definition*
