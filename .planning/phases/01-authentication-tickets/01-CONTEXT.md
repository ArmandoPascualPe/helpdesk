# Phase 1: Authentication & Tickets - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Sistema de autenticación con roles (Cliente, Agente, Supervisor) y gestión básica de tickets. El usuario puede crear cuenta, iniciar sesión, y crear/gestionar tickets. Los agentes pueden tomar tickets y cambiar estados.

</domain>

<decisions>
## Implementation Decisions

### Session Management
- **D-01:** PocketBase built-in auth con authStore + cookies
- Usa el sistema de autenticación nativo de PocketBase
- Sesión persiste vía httpOnly cookies

### Password Policy
- **D-02:** Política fuerte: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
- Validación tanto en frontend (Zod) como en backend (PocketBase hooks)

### User Roles
- **D-03:** 3 roles: Cliente (default), Agente, Supervisor
- Cliente: crear tickets, ver sus propios tickets, agregar comentarios
- Agente: ver tickets asignados, cambiar estado, reasignar
- Supervisor: todas las anteriores + ver todos los tickets + dashboard

### Ticket Number Format
- **D-04:** Formato TKT-YYYY-NNNNN (ej: TKT-2026-00001)
- Generado automáticamente con hook de PocketBase
- Secuencial por año

### Ticket Creation Fields
- **D-05:** Campos obligatorios: título (max 200), descripción, priority, category, department
- Campos opcionales: adjuntos (max 3, 5MB cada uno)

### Ticket Lifecycle States
- **D-06:** Estados: NUEVO → EN_PROCESO → RESUELTO → CERRADO
- También: EN_ESPERA, REABIERTO
- Transiciones validadas en backend

### Agent Actions
- **D-07:** Agent puede "tomar" ticket no asignado (asigna y cambia a EN_PROCESO)
- Agent/supervisor puede reasignar a otro agent del mismo departamento

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — AUTH-01 a AUTH-04, TICK-01 a TICK-08

### Research
- `.planning/research/STACK.md` — Tech stack (Next.js, PocketBase, shadcn/ui)
- `.planning/research/PITFALLS.md` — Security pitfalls (internal comments, RBAC at API level)

[No external specs — requirements fully captured in decisions above]

</canonical_refs>

<section>
## Existing Code Insights

### Reusable Assets
- Ninguno aún — proyecto nuevo

### Established Patterns
- Ninguno aún — proyecto nuevo

### Integration Points
- PocketBase SDK: `src/lib/pocketbase.ts`
- Next.js App Router: `src/app/`
- shadcn/ui para componentes

</code_context>

<specifics>
## Specific Ideas

- El usuario quiere autenticación robusta con roles definidos
- Tickets con formato legible TKT-YYYY-NNNNN
- Workflow claro: Cliente crea → Agent toma → Proceso → Resuelto → Cerrado

</specifics>

<deferred>
## Deferred Ideas

- Email verification (AUTH-02) — deferido a Phase 2 (funcionalidad adicional)
- Password reset (AUTH-03) — deferido a Phase 2

</deferred>

---

*Phase: 01-authentication-tickets*
*Context gathered: 2026-04-08*