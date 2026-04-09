# Phase 2: Features & History - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Comentarios, adjuntos, búsqueda/filtrado y auditoría de tickets. Los usuarios pueden agregar comentarios (públicos e internos), subir archivos, buscar y filtrar tickets, y ver el historial de cambios.

</domain>

<decisions>
## Implementation Decisions

### Comments System
- **D-01:** Comentarios públicos visibles a todos los usuarios
- **D-02:** Comentarios internos (is_internal=true) solo visibles para agentes/supervisores
- **D-03:** Orden cronológico (created asc) por defecto
- **D-04:** Campos: content, is_internal, ticket_id, user_id, created, updated

### Attachments
- **D-05:** Máximo 3 archivos por ticket
- **D-06:** Tamaño máximo 5MB cada uno
- **D-07:** Tipos permitidos: png, jpeg, pdf, zip
- **D-08:** Storage en PocketBase (campo file)
- **D-09:** Download con autenticación (Server Action)

### Search & Filter
- **D-10:** Búsqueda por texto en title y description (LIKE %query%)
- **D-11:** Filtros: status, priority, category, date_from, date_to
- **D-12:** Paginación: 10 resultados por página
- **D-13:** Queries combinables (search + filters)

### Audit History
- **D-14:** Tabla history con campos: ticket_id, user_id, change_type, old_value, new_value, created
- **D-15:** change_types: STATE_CHANGE, ASSIGNMENT_CHANGE, PRIORITY_CHANGE
- **D-16:** Registro automático vía PocketBase hooks

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — COMM-01 a COMM-03, ATT-01 a ATT-03, SECH-01 a SECH-06, HIST-01 a HIST-03

### Previous Phase Context
- `.planning/phases/01-authentication-tickets/01-CONTEXT.md` — Phase 1 decisions (roles, ticket format, lifecycle)

### Research
- `.planning/research/STACK.md` — Tech stack (Next.js, PocketBase, shadcn/ui)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- PocketBase SDK: `src/lib/pocketbase.ts`
- User roles system from Phase 1
- Ticket lifecycle from Phase 1

### Established Patterns
- Server Actions para mutations
- Zod + React Hook Form para validación
- authStore de PocketBase para sesión

### Integration Points
- Comments dependen de tickets existentes (Phase 1)
- Attachments se almacenan en la colección tickets (Phase 1)
- History se integra con ticket state changes

</specifics>

<specifics>
## Specific Ideas

- Comments internos no visibles para clientes (is_internal + RBAC)
- Attachments con validación server-side (PocketBase hooks)
- Search con paginación robusta
- History automatizado, no manual

</specifics>

<deferred>
## Deferred Ideas

- Notificaciones (NOTF-01 a NOTF-04) — deferido a v2
- Advanced features (ADV-01 a ADV-03) — deferido a v2

</deferred>

---

*Phase: 02-features-history*
*Context gathered: 2026-04-09*
