# Phase 1: Authentication & Tickets - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 01-authentication-tickets
**Mode:** discuss
**Areas discussed:** Session Management, Password Policy, User Roles, Ticket Number Format, Ticket Creation Fields

---

## Session Management

| Option | Description | Selected |
|--------|-------------|----------|
| PocketBase built-in | authStore + cookies (recomendado) | ✓ |
| JWT manual | JWT con localStorage | |
| NextAuth | NextAuth con PocketBase como proveedor | |

**User's choice:** PocketBase built-in (Recommended)
**Notes:** Usa el sistema de autenticación nativo de PocketBase con sesión persistente vía httpOnly cookies.

---

## Password Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Strong | 8+ chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo (recomendado) | ✓ |
| Simple | Solo requerimiento mínimo | |

**User's choice:** Strong (Recommended)
**Notes:** Validación tanto en frontend (Zod) como en backend (PocketBase hooks).

---

## User Roles

| Option | Description | Selected |
|--------|-------------|----------|
| 3 roles | Cliente (default), Agente, Supervisor (recomendado) | ✓ |
| 2 roles | Solo Cliente y Admin | |
| Custom | Personalizado | |

**User's choice:** 3 roles (Recommended)
**Notes:** Cliente: crear/ver tickets propios. Agente: tickets asignados, cambiar estado, reasignar. Supervisor: todo + dashboard.

---

## Ticket Number Format

| Option | Description | Selected |
|--------|-------------|----------|
| TKT-YYYY-NNNNN | Formato legible (ej: TKT-2026-00001) (recomendado) | ✓ |
| UUID | UUID simple | |
| Auto-increment | Solo ID numérico | |

**User's choice:** TKT-YYYY-NNNNN (Recommended)
**Notes:** Generado automáticamente con hook de PocketBase, secuencial por año.

---

## Ticket Creation Fields

| Option | Description | Selected |
|--------|-------------|----------|
| All required fields | Título, descripción, priority, category, department (recomendado) | ✓ |
| Minimal | Solo título y descripción | |

**User's choice:** All required fields (Recommended)
**Notes:** Título max 200 caracteres, campos obligatorios definidos.

---

## Deferred Ideas

- **Email verification (AUTH-02):** Deferido a Phase 2 — funcionalidad adicional
- **Password reset (AUTH-03):** Deferido a Phase 2 — funcionalidad adicional