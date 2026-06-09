# Project Status

> Updated: 2026-06-09

## Source of Truth

- Feature map: `.ai/guide.md`
- Architecture/how-it-works: `docs/backend.md`, `docs/frontend.md`, `server/docs/USER_GUIDE.md`, `server/docs/DEVELOPER_GUIDE.md`
- Current audit, gaps and roadmap: `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md`
- Documentation review/cleanup status: `docs/DOCUMENTATION_AUDIT_2026-06-09.md`

## Current Status

The platform is no longer in an MVP-only state. The codebase already includes:

- headless CMS with Page Builder, themes, menus, blog, forms, media and localization,
- storefront in Next.js with SEO, schema.org, PWA, cart, checkout, account and dynamic CMS pages,
- mobile Expo storefront MVP,
- e-commerce core with inventory reservations, shipping integrations, payments, returns, reviews and invoices,
- merchant-facing SEO, analytics, VAT and reporting foundations.

## Main Open Gaps

- extensibility model comparable to WordPress/Shopify apps and hooks,
- global widget areas / slot-based site composition,
- fuller tax-rule engine and B2B/B2C market handling,
- gift cards, store credit and stronger checkout conversion UX,
- deeper merchant analytics and SEO automation,
- a more guided, simpler merchant onboarding flow.

## Notes

Older dated implementation plans were intentionally removed after verification against the current codebase. Open items were consolidated into `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md`, and documentation review status is tracked in `docs/DOCUMENTATION_AUDIT_2026-06-09.md`.
