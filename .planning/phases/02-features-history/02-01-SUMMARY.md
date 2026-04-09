---
phase: 02-features-history
plan: 01
subsystem: comments-attachments
tags: [comments, attachments, files, upload, download]
dependency_graph:
  requires: []
  provides:
    - src/lib/comments.ts
    - src/actions/comments.ts
    - src/lib/attachments.ts
    - src/actions/download-attachment.ts
  affects:
    - src/app/(dashboard)/tickets/[id]/page.tsx
tech_stack:
  added: []
  patterns:
    - Server Actions for mutations
    - PocketBase file field
    - Role-based access control
    - Zod + React Hook Form validation
key_files:
  created:
    - src/lib/comments.ts
    - src/actions/comments.ts
    - src/lib/attachments.ts
    - src/actions/download-attachment.ts
    - src/components/ticket-comment-form.tsx
    - src/components/ticket-comments-list.tsx
    - src/components/ticket-attachment-upload.tsx
    - src/components/ticket-attachments-list.tsx
    - pb_schema.json
  modified:
    - src/app/(dashboard)/tickets/[id]/page.tsx
decisions:
  - D-01: Public comments visible to all users
  - D-02: Internal comments (is_internal=true) visible only to agents/supervisors
  - D-03: Chronological order (created asc)
  - D-04: Fields: content, is_internal, ticket_id, user_id, created, updated
  - D-05: Max 3 files per ticket
  - D-06: Max 5MB each
  - D-07: Types: png, jpeg, pdf, zip
  - D-08: Storage in PocketBase (file field)
  - D-09: Download with authentication (Server Action)
metrics:
  duration: 0
  completed: 2026-04-09
---

# Phase 2 Plan 1: Comments & Attachments Summary

**Implemented:** Comments and Attachments system for ticket detail page

## One-Liner

Comments system with public/internal visibility + file attachments with validation and authenticated download.

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Comments library and Server Actions | 0a470a3 | src/lib/comments.ts, src/actions/comments.ts |
| 2 | Attachments library and download | 0a470a3 | src/lib/attachments.ts, src/actions/download-attachment.ts |
| 3 | Comment and Attachment UI | 0a470a3 | ticket-comment-form, ticket-comments-list, ticket-attachment-upload, ticket-attachments-list |

## Key Artifacts

- `src/lib/comments.ts` - Comment interface, Zod schema, getCommentsByTicket function
- `src/actions/comments.ts` - addComment Server Action with RBAC filtering
- `src/lib/attachments.ts` - Validation constants (MAX_FILES_PER_TICKET, MAX_FILE_SIZE, ALLOWED_TYPES)
- `src/actions/download-attachment.ts` - Authenticated file download
- `src/components/ticket-comment-form.tsx` - Comment form with internal flag
- `src/components/ticket-comments-list.tsx` - Chronological comment display
- `src/components/ticket-attachment-upload.tsx` - Validated file upload
- `src/components/ticket-attachments-list.tsx` - Attachment list with download
- `pb_schema.json` - PocketBase schema for comentarios collection

## Requirements Verified

- COMM-01: User can add public comments to a ticket
- COMM-02: Agent/supervisor can add internal comments (is_internal flag, RBAC filter)
- COMM-03: Comments display in chronological order (created asc)
- ATT-01: User can attach up to 3 files per ticket
- ATT-02: Files max 5MB, types: png, jpeg, pdf, zip
- ATT-03: User can download attachments with authentication

## Deviations from Plan

None - plan executed exactly as written.

## Auth Gates

None - no authentication workarounds needed.

## Known Stubs

None.