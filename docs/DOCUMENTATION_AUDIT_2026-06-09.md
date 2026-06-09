# Documentation Audit — 2026-06-09

## Purpose

This file records which documentation files were reviewed, which ones remain
valid, and which ones were removed because they no longer reflect the codebase.

## Current Source of Truth

| Area | Primary docs |
|---|---|
| Feature map | `.ai/guide.md` |
| Current platform gaps / audit / roadmap | `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md` |
| Documentation review status | `docs/DOCUMENTATION_AUDIT_2026-06-09.md` |
| Backend architecture | `docs/backend.md`, `server/docs/DEVELOPER_GUIDE.md` |
| Frontend architecture | `docs/frontend.md` |
| Editor / merchant workflows | `server/docs/USER_GUIDE.md`, `docs/page-builder.md` |

## Reviewed And Kept

| File | Decision | Notes |
|---|---|---|
| `docs/page-builder.md` | Keep | Still accurate as the Page Builder contract and usage guide; reviewed and status-marked |
| `docs/PAGE_BUILDER_RTE_AUDIT_2026-05-06.md` | Keep | Active detailed backlog; many items implemented, but not fully closed |
| `docs/ADMIN_UI_AUDIT_2026-05-05.md` | Keep | Active detailed backlog; reviewed and status-marked |
| `docs/multi-site-locale.md` | Keep | Locale cloning and locale-specific pages are implemented; doc remains useful and status-marked |
| `docs/backend.md` | Keep | Still matches the Laravel/backend structure closely |
| `docs/frontend.md` | Keep | Updated current frontend contexts and storefront/admin guidance |
| `docs/project-status.md` | Keep | Compact entry point for current state |
| `.ai/guide.md` | Keep | Primary feature map |
| `.ai/audit-plan.md` | Keep with caution | Historical enterprise audit; no longer the primary source of truth |

## Removed After Verification

| File | Reason |
|---|---|
| `docs/AUDIT_2026-05-04.md` | Superseded by newer audits; contained multiple outdated or false project-state claims |
| `docs/PHASE3_ENHANCEMENTS.md` | Mixed implemented snippets with speculative items; superseded by current roadmap and codebase |
| `docs/features-backlog.md` | Historical implementation checklist with stale remaining items and duplicate scope |
| `docs/PAYNOW_IMPLEMENTATION_PLAN.md` | Implemented; already removed |
| `docs/RTE_ENTERPRISE_IMPLEMENTATION_PLAN_2026-05-18.md` | Mostly implemented; already removed |
| `docs/STAFF_ENGINEER_DESIGN_PLAN_2026-05-14.md` | Partly implemented and otherwise superseded; already removed |
| `docs/SCRIPT_NONCE_HYDRATION_MISMATCH_TODO_2026-05-21.md` | Resolved; already removed |
| `docs/MOBILE_REACT_NATIVE_IMPLEMENTATION_PLAN.md` | Mobile MVP exists; remaining gaps moved to current roadmap |

## Notes

- New backlog or audit notes should not be created as scattered dated TODO files
  when the topic already belongs in `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md`
  or one of the two active detailed audit files.
- If a future dated doc is created for a focused implementation stream, it should
  either become the active source of truth for that stream or be removed once its
  content is verified as implemented.
