# Phase 3: Management & Supervision - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Supervisores pueden gestionar departamentos y ver métricas operacionales. Incluye: creación/edición de departamentos, desactivación con restricción, dashboard con gráficos, métricas de agentes, y tickets vencidos.

</domain>

<decisions>
## Implementation Decisions

### Gestión de Departamentos
- **D-01:** UI con página dedicada (no modal) — más espacio para gestión completa
- **D-02:** Campos mínimos: nombre + descripción — simple y suficiente
- **D-03:** Desactivación bloqueada si hay tickets abiertos en el departamento

### Dashboard
- **D-04:** Gráficos + tablas combinadas — visualización completa
- **D-05:** Ubicación en menú del supervisor (no página separada de menú)
- **D-06:** Actualización solo al cargar (no tiempo real)

### Métricas de Agentes
- **D-07:** Mostrar tickets abiertos + resueltos — breakdown completo
- **D-08:** Ordenar por carga total (mayor a menor)

### Tickets Vencidos
- **D-09:** Umbral configurable por supervisor — no hardcodeado
- **D-10:** Highlightvisual en listado (color distintivo)

### the agent's Discretion
- Exacta implementación de gráficos (Recharts ya disponible en stack)
- Diseño detallado de tables y layouts
- Campos adicionales en UI de departamentos si se necesitan

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/REQUIREMENTS.md` — DEPT-01, DEPT-02, DEPT-03, DEPT-04, DASH-01 al DASH-06
- `.planning/ROADMAP.md` §Phase 3 — descripción de la fase
- `src/lib/auth.ts` — User interface con campo departamento ya definido

**No external specs** — requirements fully captured in decisions above

</canonical_refs>

 код_контекст
## Existing Code Insights

### Reusable Assets
- `src/components/ticket-history-list.tsx` — Pattern para listas con datos de PocketBase
- `src/lib/auth.ts` — User interface con `departamento` ya previsto

### Integration Points
- Colección `departamentos` se integrará con `usuarios.departamento`
- Dashboard conectará con `tickets` collection para métricas

### Missing Infrastructure
- Colección `departamentos` YA EXISTE en PocketBase con campos: nombre, descripcion, email, activo
- Campo `resolved_at` no existe en tickets — necesario para DASH-05 (tiempo promedio)

</code_context>

<specifics>
## Specific Ideas

- Dashboard estilo "gráfico + tabla" similar al de Linear/GitHub Projects
- UI de departamentos sencilla: lista con acciones inline (editar, desactivar)

</specifics>

<deferred>
## Deferred Ideas

- Notificaciones en tiempo real para supervisor — Phase futura
- Reportes exportables — out of scope según PROJECT.md

</deferred>

---

*Phase: 03-management-supervision*
*Context gathered: 2026-04-10*