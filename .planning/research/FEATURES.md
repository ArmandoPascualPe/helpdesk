# Feature Landscape

**Domain:** Help Desk / Ticket Management System
**Researched:** 2026-04-08
**Confidence:** HIGH

## Executive Summary

Help desk systems have a well-established feature taxonomy. The PRD's scope aligns with table stakes — authentication, ticket lifecycle, roles, comments, search, and supervisor dashboards are all expected features. What makes this project differentiating is the tight integration with Next.js + PocketBase for a self-hosted, lightweight solution. AI features, omnichannel support, and knowledge bases are differentiators in the broader market but are appropriately deferred for MVP.

## Table Stakes

Features users expect. Missing = product feels incomplete or unusable. Based on industry research (Hiver, Suptask, 2026) and PRD alignment.

| Feature | Why Expected | Complexity | PRD Alignment |
|---------|--------------|------------|---------------|
| **User Authentication & Roles** | Core security; without it there's no access control | Low | HU-01, RF-01 |
| **Ticket Creation** | Primary value proposition — users submit requests | Low | HU-02, RF-03 |
| **Ticket Lifecycle (states)** | Defines workflow: Nuevo → En Proceso → Resuelto → Cerrado | Medium | HU-04, RF-04 |
| **Role-Based Access Control (RBAC)** | Clients see own tickets; agents see assigned; supervisors see all | Medium | RF-01 |
| **Ticket List View with Filters** | Finding tickets among dozens/hundreds | Low | HU-03, HU-09, RF-09 |
| **Ticket Detail View** | Full context: description, history, comments, attachments | Low | HU-04 |
| **Comments System** | Communication between parties; internal comments for agents only | Medium | HU-05, RF-06 |
| **File Attachments** | Evidence, screenshots, logs | Medium | RF-03, 8.1 Attachments |
| **Search (text + filters)** | Locating specific tickets | Low | HU-09, RF-09 |
| **Pagination** | Performance at scale (PRD: 10/page) | Low | RF-10 |
| **Department Management** | Organizing tickets by team | Low | RF-02, HU-08 |
| **Supervisor Dashboard** | KPIs: tickets by status/priority/agent, resolution time | Medium | HU-07, RF-08 |
| **Audit/Change History** | Accountability: who changed what, when | Medium | RF-07 |

### Dependencies

```
User Auth → Role Definitions → Dashboard Views by Role
        → Ticket Creation → Ticket Lifecycle
        → Department Management
        
Ticket Creation → Ticket List → Ticket Detail → Comments
               → Attachments
               
Search → Filters → Pagination
```

## Differentiators

Features that set product apart. Not expected by default, but valued. These are NOT in the PRD MVP scope but represent competitive opportunities.

| Feature | Value Proposition | Complexity | When to Add |
|---------|-------------------|------------|-------------|
| **AI Ticket Summarization** | Agents instantly understand long ticket threads | High | Phase 3+ |
| **AI Agent Assistance** | Suggested responses based on KB + history | High | Phase 3+ |
| **Omnichannel Support** | Email, chat, social → single inbox | High | Phase 3+ |
| **Knowledge Base / Self-Service** | Customers resolve issues without submitting tickets | High | Phase 3+ |
| **SLA Management** | Automatic escalation on breach risk | Medium | Phase 3+ |
| **Workflow Automation** | Auto-routing, auto-tagging, canned responses | Medium | Phase 3+ |
| **Mobile Apps** | On-the-go ticket management | High | Phase 3+ |
| **Advanced Reporting** | Custom dashboards, trend analysis, forecasting | Medium | Phase 3+ |
| **Customer Satisfaction (CSAT) Surveys** | Post-resolution feedback collection | Medium | Phase 3+ |
| **Integration APIs** | Connect to CRM, Slack, tools | High | Phase 3+ |

### Differentiation Rationale

The PRD targets a specific use case: TechSupport Solutions replacing email/spreadsheets. This is a **replacement** scenario, not a "discover new capabilities" one. Differentiators matter less when the core problem is "we have no system at all."

However, for future competitive positioning:
- **Self-hosted (PocketBase)** is a differentiator vs cloud-only solutions (Zendesk, Freshdesk)
- **Lightweight + fast** differentiates from enterprise monoliths
- **Internal comments** is a minor differentiator — many entry-level systems lack this

## Anti-Features

Features to explicitly NOT build. These are explicitly out of scope in PRD and confirmed by research as non-MVP.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Real-time Chat (WebSockets)** | Complexity high; out of scope in PRD | Use ticket comments for async communication |
| **Email Notifications** | Out of scope; adds infrastructure complexity | Future: optional email digests |
| **Payment Gateways** | Not a support function | N/A — not relevant |
| **PDF Report Generation** | Out of scope per PRD | Future: CSV export if needed |
| **Dark Mode** | Aesthetic only; adds UI complexity | Future phase |
| **AI Features** | Post-MVP per PRD roadmap | Phase 3 |
| **Multi-brand/White-label** | Over-scope for single-company internal tool | N/A |

## MVP Recommendation

Prioritize in this order (based on PRD HU sequence and dependencies):

1. **Authentication + Roles** — Foundation for everything
2. **Ticket Creation** — Core value (HU-02)
3. **Ticket List + Detail** — View and track (HU-03, HU-04)
4. **Comments** — Communication (HU-05)
5. **Agent Ticket Management** — Workflow (HU-06)
6. **Search + Filters** — Findability (HU-09)
7. **Supervisor Dashboard** — Visibility (HU-07)
8. **Department Management** — Organization (HU-08)

### Phase Structure from Research

**Phase 1: Core Ticket Management**
- Auth, roles, ticket CRUD, lifecycle, comments, attachments

**Phase 2: Management & Visibility**
- Dashboard, department CRUD, reporting widgets

**Phase 3: Differentiation** (post-MVP)
- AI features, knowledge base, omnichannel, automation

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Table Stakes | HIGH | Directly aligned with PRD RFs + industry standards |
| Differentiators | HIGH | Based on 2026 industry research from Hiver/Suptask |
| Anti-Features | HIGH | Explicitly stated in PRD Out of Scope + project constraints |
| Dependencies | HIGH | Logical flow derived from PRD user stories |

## Sources

- Hiver: "15 Essential Help Desk Software Features for 2026" (Feb 2026) — HIGH confidence
- Suptask: "Help Desk Software Requirements - 21 Important Features" (2024-2026) — HIGH confidence
- PRD document: prd-helpdesk.md — Project-specific context — HIGH confidence
- PROJECT.md: Tech stack and constraints — HIGH confidence
