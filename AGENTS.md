<!-- GSD:project-start source:PROJECT.md -->
## Project

**Help Desk - Sistema de Gestión de Tickets**

Sistema centralizado de gestión de tickets de soporte técnico para TechSupport Solutions S.A. Permite a clientes crear tickets, agentes gestionar solicitudes, y supervisores monitorear métricas del equipo. Sustituye el sistema actual de emails y hojas de cálculo.

**Core Value:** Proveer un sistema unificado de tickets que mejore la eficiencia del equipo de soporte y la satisfacción del cliente mediante seguimiento completo y visibilidad del estado de las solicitudes.

### Constraints

- **Tech Stack**: Next.js 14+ (App Router), TypeScript 5+, shadcn/ui, Tailwind CSS 3+, PocketBase 0.22+
- **Tiempo MVP**: 8-10 horas estimadas
- **Adjuntos**: Máximo 3 archivos por ticket, 5MB cada uno, tipos: png, jpeg, pdf, zip
- **Seguridad**: Contraseñas: 8+ chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Stack Recomendado
### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Next.js** | 14+ (App Router) | Full-stack React framework | Server Actions para mutations, Route Handlers para APIs, Server Components para optimizar rendereo. App Router es el estándar actual. **Verificado:** Context7 muestra v15 y v14 como recommended. |
| **TypeScript** | 5.x | Type safety | Mejor DX y catching errors en build time. El proyecto especifica 5+. |
| **Tailwind CSS** | 3.x | Utility-first CSS | Integración nativa con shadcn/ui. Specification indica 3+. |
### Backend
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **PocketBase** | 0.22+ | Backend-as-a-Service | SQLite embebido, auth built-in, REST API, realtime subscriptions. Specification indica 0.22+. El SDK soporta file uploads natively. **Verificado:** JS SDK v0.26.2 disponible. |
### UI Components
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **shadcn/ui** | latest (~2.x) | Component library | Copy-paste en vez de npm dependency. Basado en Radix UI primitives, completamente customizable. **Verificado:** Context7 muestra versiones hasta shadcn@3.x. |
| **Radix UI** | (included via shadcn) | Accessibility primitives | Headless components con ARIA support. shadcn lo usa internamente. |
### Form & Validation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React Hook Form** | 7.x | Form state management | Rendereo óptima, integration con cualquier UI. **Verificado:** v7.66.0 en Context7. El estándar para React forms. |
| **Zod** | 3.x | Schema validation | TypeScript-first, inference automática. **Verificado:** v3.24.2 disponible.取代 Joi por mejor TS integration. |
| **@hookform/resolvers** | latest | Zod + RHF bridge | Conecta Zod schemas con React Hook Form. |
### Charts (Dashboard)
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Recharts** | 3.x | Data visualization | 22.2M weekly downloads, React-native, SVG-based. **Verificado:** v3.3.0 en Context7, benchmark 86.65. El estándar de facto para React. |
### Utilities
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **date-fns** | 3.x | Date formatting | Fechas relativas ("hace 2 horas"), formateo de timestamps. Es más lightweight que moment.js. |
| **class-variance-authority** | (via shadcn) | Variant handling | shadcn lo usa paramanage variants (size, variant, etc). |
| **lucide-react** | (via shadcn) | Icons | shadcn incluye estos icons por defecto. |
## Stack Alternativo Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Charts | **Recharts** | Victory | Victory es más powerful pero más complejo. Para dashboard básico Recharts es suficiente y más liviano. |
| Charts | — | Chart.js | Requiere wrapper para React. Recharts es native. |
| Validation | **Zod** | Yup | Yup no ofrece inference TypeScript tan buena como Zod. |
| Validation | — | Joi | Diseñado para runtime validation, no TypeScript-first. |
| Forms | **React Hook Form** | react-final-form | RHF es más popular y tiene mejor integration con libraries modernas. |
## Installation
# Core dependencies
# PocketBase SDK
# UI & Forms
# Charts
# Utilities
## Npm Scripts Típicos
# Development
# Build
# Lint
## Dependencias del Sistema (no npm)
- **PocketBase binary**: Descargar release de https://github.com/pocketbase/pocketbase/releases
- Ejecutar: `./pocketbase serve`
## Sources
### HIGH Confidence (Context7 verified)
- **Next.js App Router:** Context7 `/vercel/next.js` — Server Actions pattern
- **PocketBase SDK:** Context7 `/pocketbase/js-sdk` v0.26.2 — File upload supported
- **shadcn/ui:** Context7 `/shadcn-ui/ui` — v2.x/v3.x
- **React Hook Form:** Context7 `/react-hook-form/react-hook-form` v7.66.0
- **Zod:** Context7 `/colinhacks/zod` v3.24.2
- **Recharts:** Context7 `/recharts/recharts` v3.3.0 — Benchmark 86.65
### MEDIUM Confidence (WebSearch verified)
- **PocketBase file uploads:** Stack Overflow 2024 — FormData pattern verified
- **Recharts vs Victory:** LogRocket Blog 2025 — Recharts recommended para proyectos simples
## Confidence Assessment
| Area | Confidence | Reason |
|------|------------|--------|
| Core (Next.js/Tailwind/TS) | HIGH | Specification predefined, Context7 verified |
| Backend (PocketBase) | HIGH | Specification predefined, SDK verified |
| UI (shadcn) | HIGH | Basado en Radix UI, standard en comunidad |
| Forms (RHF + Zod) | HIGH | Estándar de industria, Context7 verified |
| Charts (Recharts) | HIGH | 22M weekly downloads, Context7 verified |
| Utilities | MEDIUM | Standard patterns, no critical dependencies |
## Recommendations for Implementation
## Anti-Patterns to Avoid
| Pattern | Why Avoid | Instead |
|---------|-----------|---------|
| **useEffect para data fetching** | Server Components rinden mejor | Fetch en Server Components directamente |
| **API Routes para todo** | Server Actions son más simples | Server Actions para form submissions |
| **Global state para auth** | PocketBase provee authStore | Usar el built-in auth store |
| **Client-side validation only** | Security risk | Zod + Server Action validation |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
