# Platform Audit and Roadmap — 2026-06-09

## Purpose

This file replaces older one-off implementation plans and TODO notes that no longer reflect the current state of the monorepo.

Use it as the current reference for:

- security review and OWASP Top 10 coverage,
- open platform gaps still worth implementing,
- product direction for a more extensible, easier-to-use CMS/e-commerce platform.
- The broader documentation cleanup status is tracked in `docs/DOCUMENTATION_AUDIT_2026-06-09.md`.

## Historical Plan Cleanup

The following historical docs were reviewed against the current codebase and folded into this file:

| Old file | Status |
|---|---|
| `docs/PAYNOW_IMPLEMENTATION_PLAN.md` | Implemented; removed |
| `docs/RTE_ENTERPRISE_IMPLEMENTATION_PLAN_2026-05-18.md` | Mostly implemented; remaining editor/product gaps moved here |
| `docs/STAFF_ENGINEER_DESIGN_PLAN_2026-05-14.md` | Partly implemented, partly obsolete; remaining strategic gaps moved here |
| `docs/SCRIPT_NONCE_HYDRATION_MISMATCH_TODO_2026-05-21.md` | Resolved/superseded by current CSP+nonce setup; removed |
| `docs/MOBILE_REACT_NATIVE_IMPLEMENTATION_PLAN.md` | Mobile MVP exists; remaining parity/product gaps moved here |
| `docs/AUDIT_2026-05-04.md` | Superseded by newer audits; removed because it no longer reflected the codebase accurately |
| `docs/PHASE3_ENHANCEMENTS.md` | Mixed implemented snippets with speculative items; removed and folded into current roadmap/history |
| `docs/features-backlog.md` | Historical checklist with stale remaining items; removed |

The following audit docs were intentionally kept because they still contain active,
more detailed sub-backlogs that are not fully closed yet:

| Active audit file | Status |
|---|---|
| `docs/PAGE_BUILDER_RTE_AUDIT_2026-05-06.md` | Partially implemented; several core items shipped, but detailed Page Builder/RTE polish backlog still active |
| `docs/ADMIN_UI_AUDIT_2026-05-05.md` | Largely still open; mainly admin UX/UI cleanup and consistency backlog |

## Recently Verified On 2026-06-09

- MailerLite inbound newsletter webhook now requires `X-MailerLite-Signature` HMAC verification using `services.mailerlite.webhook_secret` or the API key fallback.
- Anonymous support chat endpoints now run behind `throttle:api.strict`, and guest conversation creation requires Turnstile when the secret is configured.
- `/api/health?fresh=1` now requires local environment, authenticated access, or a valid `X-Health-Token`.
- `/debug-glitchtip` is now blocked outside `local`, `testing`, and `staging`.
- `TrustCloudflareProxies` now accepts `CF-Connecting-IP` only from trusted Cloudflare ranges, with local/testing allowances for loopback and private Docker networks.
- Publish/unpublish webhook coverage now includes products and blog posts in addition to pages.

## Current Platform Snapshot

### Clearly implemented

- Headless CMS with Page Builder, reusable blocks, themes, menus, blog, forms, media, locales, scheduling, preview, approval flow and publication webhooks
- Storefront in Next.js 16 with SEO metadata, schema.org, GTM/dataLayer, CMS rendering, PWA, cart, checkout, account, blog and search
- Mobile Expo storefront MVP with typed API client, auth, cart, checkout, account, wishlist, blog and CMS page rendering
- E-commerce core: products, variants, categories, discounts, promotions, orders, invoices, returns, reviews, wishlists, shared carts
- Payments: PayU, P24, Paynow, bank transfer, COD
- Inventory reservations with release job and low-stock alerts
- Metafields, smart collections, tax rates, VAT reporting/JPK foundation
- Shipping integrations: Furgonetka carriers, InPost ShipX lockers, pickup

### Still strategic gaps

- No first-class hook/filter extension system for third-party customization
- No admin-managed widget-area / global slot system comparable to WordPress sidebars/global sections
- No full tax-rule engine by market, customer type, exemption and shipping-tax behavior
- No gift cards / store credit / wallet
- No one-page checkout or accelerated express checkout flow
- No full “site-builder onboarding” that makes merchant setup simpler than Shopify/WooCommerce

### Detailed backlog files still worth keeping

- `docs/PAGE_BUILDER_RTE_AUDIT_2026-05-06.md` stays as the detailed implementation ledger for Page Builder and RTE hardening/polish. A meaningful part of its server-side validation, sanitization, health-panel and builder UX work is already implemented, but not every follow-up item is closed.
- `docs/ADMIN_UI_AUDIT_2026-05-05.md` stays as the detailed admin-panel UX/UI cleanup backlog. It is not an obsolete “done plan”; most of it is still a valid backlog, especially visual consistency, translation completeness and small interaction polish.

## Security Audit

### Highest-priority findings

1. Security hardening for MailerLite webhooks, support chat abuse controls, trusted proxy handling, `/debug-glitchtip`, and `/api/health?fresh` has now been implemented and covered by targeted feature tests.
2. Security headers are still not described as a standardized cross-surface baseline for storefront and admin in one place. CSP exists on storefront, but broader header posture still needs unification and explicit verification.
3. Outbound/inbound integration verification is still inconsistent at platform level: MailerLite is covered now, but the same “every webhook must be verified and documented” standard should be enforced across all future integrations.
4. SSRF posture for external integrations is still process-dependent. Outbound allowlists, explicit timeout ceilings, and retry/circuit-breaker conventions should be formalized centrally.
5. Merchant-extensibility security boundaries are still immature: there is no first-class hook/plugin model with scoped permissions, which raises long-term insecure-design risk once custom extensions grow.

### OWASP Top 10 view

| Category | Status | Notes |
|---|---|---|
| A01 Broken Access Control | Good/Partial | Core auth/policies/roles exist, and public operational endpoint exposure was tightened; continue auditing extension/admin edge cases |
| A02 Cryptographic Failures | Good | Payment/webhook signatures, encrypted settings and token auth are present; keep secret rotation operationalized |
| A03 Injection | Good/Partial | Validation and ORM usage are generally strong; continue reviewing reporting/custom-query surfaces |
| A04 Insecure Design | Partial | Extensibility, plugin isolation and merchant self-service flows are not yet systematized |
| A05 Security Misconfiguration | Good/Partial | Production posture improved for debug/health/proxy handling; next step is a standardized header baseline and deployment verification |
| A06 Vulnerable Components | Process-dependent | Requires regular `composer audit` / `npm audit` / CI enforcement |
| A07 Identification and Authentication Failures | Good/Partial | Fortify, Sanctum, rate limits and 2FA exist; guest chat now has anti-bot support, but broader anonymous-form abuse review should continue |
| A08 Software and Data Integrity Failures | Good/Partial | MailerLite signature verification is now enforced; keep the same standard for every inbound integration |
| A09 Security Logging and Monitoring Failures | Good/Partial | Activity logs and monitoring exist; trusted-proxy spoofing risk was reduced, but ops verification still matters |
| A10 SSRF | Partial | Many outbound integrations exist; central outbound allowlisting and timeout/retry policy should be hardened further |

## Status of Your Suggested Features

| Feature | Status | Comment |
|---|---|---|
| WordPress-style hooks / filters | Missing | High-priority gap for extensibility |
| Menu builder | Implemented | Menus CRUD already exists |
| Widget areas / sidebars | Partial/Missing | CMS has blocks and templates, but no merchant-friendly global slot manager |
| Scheduled publishing on all content types | Partial | Pages and blog are covered; products/promotions should be normalized |
| Inventory management | Implemented foundation | Reservations, release job, low stock alerts exist |
| Metafields | Implemented | Strong Shopify-like capability already present |
| Tax zones / VAT / OSS | Partial | Tax rates and EU VAT service exist, but not a complete rules engine |
| Shipping integrations | Implemented foundation | Strong for PL market; still room for label UX and tracking automation |
| Gift cards | Missing | Good ROI feature |
| One-page checkout | Missing/Partial | Current checkout is structured, but not yet “best-in-class conversion” |
| Analytics funnel | Partial | GTM events and admin analytics exist; merchant-facing funnel should go deeper |

## What To Build Next

### P0 — Security and platform hardening

- Standardize security headers across storefront and admin surfaces: CSP, frame-ancestors, referrer-policy, permissions-policy, X-Content-Type-Options.
- Document and enforce a platform rule that every inbound webhook requires explicit signature verification and tests before release.
- Keep anonymous support/chat/forms on dedicated strict rate limits and risk controls; extend the same review to every public write endpoint.
- Operationalize proxy hardening in deployment checklists so application middleware and edge config cannot drift apart.

### P0 — Merchant simplicity

- Build a first-class setup wizard: brand, domain, taxes, shipping, payments, homepage, menus, legal pages, SEO basics.
- Add “global sections” / “widget areas” / “site slots” managed from admin: header announcement, footer columns, side panels, trust bar, sticky CTAs.
- Add prebuilt site kits by industry: fashion, electronics, furniture, cosmetics, B2B catalog, local store.
- Introduce design presets on top of themes: typography packs, spacing packs, card styles, CTA styles, section presets.

### P1 — Extensibility like WordPress/Shopify

- Implement a hook/filter system:
  - backend actions/filters for checkout, pricing, shipping, search, SEO, rendering, customer lifecycle;
  - outbound webhooks/outbox for async integrations;
  - typed extension points instead of ad hoc observer coupling.
- Add merchant-safe app/plugin SDK with permission-scoped capabilities.
- Add custom fields/metafields for orders, customers, shipping methods, discounts and menus, not only core content models.

### P1 — Commerce completeness

- Build a tax engine with zones, OSS, B2B reverse charge, customer-type logic, shipping taxation, invoice rules and exemptions.
- Add gift cards, store credit, refunds-to-credit and promo wallet.
- Add one-page checkout with address autocomplete, inline pickup selection, express methods and recovery-focused UX.
- Add shipping labels, tracking sync, shipment events and customer notifications per carrier.
- Add business-customer mode: company account type, NIP/VAT validation, GUS autofill in checkout/account/admin, invoice preferences and quote flow.

### P1 — SEO and analytics “top of the top”

- Keep current SEO panel and add:
  - technical SEO crawler inside admin,
  - redirect manager with impact detection,
  - orphan-page/internal-link suggestions,
  - canonical/indexability warnings per locale,
  - broken-link monitoring,
  - structured-data validator preview.
- Add richer SERP previews:
  - Google snippet preview for desktop/mobile,
  - category/product rich-result preview,
  - social preview for Facebook/X/LinkedIn.
- Add merchant analytics that explain actions:
  - funnel by channel and device,
  - search queries with zero-result alerts,
  - add-to-cart drop-offs,
  - checkout-step abandonment,
  - promotion attribution,
  - SEO landing-page conversion reports.

### P1 — “Easier than Shopify / WooCommerce”

- Add reusable composition primitives:
  - global sections,
  - page templates,
  - section variants,
  - saved block groups,
  - synced content fragments,
  - industry starter templates.
- Give every block a “simple” mode first and hide complexity behind “advanced”.
- Add live storefront preview with device presets and draft-sharing URLs.
- Add an AI-assisted builder workflow:
  - generate page from brief,
  - rewrite copy by tone,
  - suggest missing sections,
  - propose SEO title/meta,
  - generate FAQ/schema candidates.

### P2 — Advanced differentiation

- Conditional/personalized blocks by locale, campaign, device, customer segment, auth state and basket value.
- A/B testing for sections and hero variants.
- Content calendar for pages, promos, blog and seasonal banners in one timeline.
- Marketplace-grade app ecosystem with installable integrations.
- Visual navigation/menu mega-builder with image tiles, promo cards and per-device variants.

## Recommended Source of Truth Going Forward

- Keep `.ai/guide.md` as the compact feature map.
- Keep `docs/backend.md`, `docs/frontend.md` and `server/docs/*` as architecture/how-to docs.
- Use this file for current gaps, audit findings and product roadmap instead of creating more dated TODO plans for already-shipped work.
