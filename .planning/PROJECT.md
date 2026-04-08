# Help Desk - Sistema de Gestión de Tickets

## What This Is

Sistema centralizado de gestión de tickets de soporte técnico para TechSupport Solutions S.A. Permite a clientes crear tickets, agentes gestionar solicitudes, y supervisores monitorear métricas del equipo. Sustituye el sistema actual de emails y hojas de cálculo.

## Core Value

Proveer un sistema unificado de tickets que mejore la eficiencia del equipo de soporte y la satisfacción del cliente mediante seguimiento completo y visibilidad del estado de las solicitudes.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Sistema de autenticación con roles (Cliente, Agente, Supervisor)
- [ ] Gestión de departamentos
- [ ] Creación y ciclo de vida de tickets
- [ ] Sistema de comentarios (públicos e internos)
- [ ] Historial de cambios (auditoría)
- [ ] Dashboard de supervisor con métricas
- [ ] Búsqueda avanzada y filtros
- [ ] Adjuntos en tickets

### Out of Scope

- Chat en tiempo real (websockets)
- Integración con pasarelas de pago
- Reportes en PDF
- Notificaciones por email
- Modo oscuro

## Context

TechSupport Solutions es una empresa de servicios tecnológicos que brinda soporte a múltiples clientes corporativos. El sistema actual usa emails y hojas de cálculo, generando pérdida de solicitudes, duplicación de esfuerzos, e imposibilidad de medir rendimiento.

## Constraints

- **Tech Stack**: Next.js 14+ (App Router), TypeScript 5+, shadcn/ui, Tailwind CSS 3+, PocketBase 0.22+
- **Tiempo MVP**: 8-10 horas estimadas
- **Adjuntos**: Máximo 3 archivos por ticket, 5MB cada uno, tipos: png, jpeg, pdf, zip
- **Seguridad**: Contraseñas: 8+ chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Stack Next.js + PocketBase | PRD especifica esta tecnología | — Pending |
| Formato ticket: TKT-YYYY-NNNNN | Legible y secuencial | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-08 after initialization*
