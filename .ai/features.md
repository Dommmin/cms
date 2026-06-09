# Features Backlog

> Implemented features live in `.ai/guide.md`.
> Current roadmap and audit priorities live in `docs/PLATFORM_AUDIT_AND_ROADMAP_2026-06-09.md`.
> This file is intentionally short and only mirrors the highest-signal open gaps.

## P0 — Security / hardening

- Standardize security headers across storefront and admin surfaces.
- Require explicit signature verification and tests for every inbound webhook integration.
- Keep strict throttling and risk controls on all anonymous write endpoints, not only support chat.
- Formalize outbound-integration safeguards: allowlists, timeouts, retries and circuit breakers.

## P1 — Merchant simplicity and extensibility

- Hook/filter system for backend and storefront extension points.
- Global widget areas / site slots / synced layout sections.
- Merchant setup wizard with defaults for brand, taxes, payments, shipping, homepage and SEO.
- One-page checkout and accelerated checkout UX.
- SEO and analytics upgrades: richer SERP preview, funnel visibility, zero-result search alerts, internal-link suggestions.

## P2 — Commerce depth

- Tax rule engine (market, customer type, exemptions, shipping tax behavior).
- Gift cards, store credit and wallet flows.
- B2B company mode with invoice and quote flows.
- Multi-warehouse inventory and deeper fulfillment tooling.

## Notes

- Do not reintroduce stale historical TODOs here once they are implemented.
- If a feature is shipped, move it to `.ai/guide.md`.
