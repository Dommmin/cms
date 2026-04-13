# Cloudflare Cache Rules — Setup Guide

This document explains how to configure Cloudflare CDN caching for the CMS. The machine-readable version of these rules is in `cache-rules.json`.

## Architecture Overview

```
Browser → Cloudflare Edge → Origin (Laravel/Next.js)
```

- **Cloudflare** caches public, read-only responses at the edge (PoPs worldwide).
- **Next.js** sets `Cache-Control` headers per route group.
- **Laravel** middleware (`ApiCacheHeaders`) sets `Cache-Control` + `Vary` on every API response.
- Rules are **ordered** — first match wins. Bypass rules (low priority number) must come before cache rules.

---

## Applying Rules: Cloudflare Dashboard

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com) and select your zone.
2. Navigate to **Caching → Cache Rules**.
3. Click **Create rule** for each rule below.
4. Set the rule **order** to match the priority listed (drag-and-drop in the dashboard).

> **Free plan note:** Cache Rules require at least the **Free plan**. Some TTL override features require **Pro** or above. On Free plans you can use "Bypass Cache" and "Cache Everything" actions without TTL overrides — rely on `Cache-Control` headers from the origin instead.

---

## Rules (in priority order)

### Rule 1 — Bypass: Admin SPA

| Field | Value |
|-------|-------|
| Name | Bypass: Admin SPA |
| Expression | `http.request.uri.path matches "^/admin(/.*)?$"` |
| Action | Bypass cache |
| Why | Admin is session-authenticated. Caching would leak sensitive management UI. |

---

### Rule 2 — Bypass: Authenticated API

| Field | Value |
|-------|-------|
| Name | Bypass: Authenticated API |
| Expression | `http.request.uri.path matches "^/api/v1/(cart\|orders\|account\|profile\|wishlist\|checkout\|payments\|reviews\|support\|notifications\|notification-preferences\|push-subscriptions\|addresses)(/.*)?$"` |
| Action | Bypass cache |
| Why | These endpoints return user-specific data tied to auth tokens or sessions. |

---

### Rule 3 — Bypass: Non-GET API

| Field | Value |
|-------|-------|
| Name | Bypass: Mutating API requests |
| Expression | `http.request.uri.path matches "^/api/" and not http.request.method in {"GET" "HEAD"}` |
| Action | Bypass cache |
| Why | POST/PUT/PATCH/DELETE must always hit the origin to mutate state. |

---

### Rule 4 — Bypass: Checkout & Account pages

| Field | Value |
|-------|-------|
| Name | Bypass: Checkout and account pages |
| Expression | `http.request.uri.path matches "^/[a-z]{2}/(checkout\|account)(/.*)?$"` |
| Action | Bypass cache |
| Why | Multi-step checkout and account pages contain user-specific state. |

---

### Rule 5 — Cache: Next.js static assets (1 year, immutable)

| Field | Value |
|-------|-------|
| Name | Cache: Next.js static assets |
| Expression | `http.request.uri.path matches "^/_next/static/"` |
| Action | Cache everything |
| Edge TTL | 1 year (override origin) |
| Browser TTL | 1 year (override origin) |
| Why | `/_next/static/` files have content hashes in their filenames. They never change for the same URL. Safe to cache forever. |

---

### Rule 6 — Cache: Public static files (1 year)

| Field | Value |
|-------|-------|
| Name | Cache: Public static files |
| Expression | `http.request.uri.path matches "^/(images\|fonts\|icons\|favicon)" or http.request.uri.path matches "\.(ico\|png\|jpg\|jpeg\|webp\|svg\|woff2\|woff\|ttf\|otf)$"` |
| Action | Cache everything |
| Edge TTL | 1 year (override origin) |
| Browser TTL | 1 year (override origin) |
| Why | Static assets referenced with versioning. |

---

### Rule 7 — Cache: API settings/public (1 hour)

| Field | Value |
|-------|-------|
| Name | Cache: API settings/public |
| Expression | `http.request.uri.path eq "/api/v1/settings/public" and http.request.method in {"GET" "HEAD"}` |
| Action | Cache everything |
| Edge TTL | 1 hour (override origin) |
| Why | Site-wide settings (store name, SEO defaults, social links). Changes are admin-triggered; purge cache after saving settings in admin. |

---

### Rule 8 — Cache: Locales & Translations (1 hour)

| Field | Value |
|-------|-------|
| Name | Cache: Locales and translations |
| Expression | `http.request.uri.path matches "^/api/v1/(locales\|translations)(/.*)?$" and http.request.method in {"GET" "HEAD"}` |
| Action | Cache everything |
| Edge TTL | 1 hour (override origin) |
| Why | Translation strings rarely change. High traffic endpoints called on every page load. |

---

### Rule 9 — Cache: Blog API (10 minutes)

| Field | Value |
|-------|-------|
| Name | Cache: Blog API |
| Expression | `http.request.uri.path matches "^/api/v1/blog(/.*)?$" and http.request.method in {"GET" "HEAD"}` |
| Action | Cache everything |
| Edge TTL | 10 minutes (override origin) |
| Why | Blog posts are updated by editors. 10-minute window is acceptable; editors can purge manually for urgent changes. |

---

### Rule 10 — Cache: Products & Categories API (5 minutes)

| Field | Value |
|-------|-------|
| Name | Cache: Products and categories API |
| Expression | `http.request.uri.path matches "^/api/v1/(products\|categories)(/.*)?$" and http.request.method in {"GET" "HEAD"}` |
| Action | Cache everything |
| Edge TTL | 5 minutes (override origin) |
| Why | Stock levels and prices change frequently (especially during flash sales). 5 minutes balances origin load vs. data freshness. |

---

### Rule 11 — Cache: Frontend HTML pages (10 minutes)

| Field | Value |
|-------|-------|
| Name | Cache: Public frontend pages |
| Expression | `http.request.uri.path matches "^/[a-z]{2}/(products\|categories\|blog\|flash-sales\|stores\|search\|compare\|faq)(/.*)?$" or http.request.uri.path matches "^/[a-z]{2}/?$"` |
| Action | Cache everything |
| Edge TTL | 10 minutes (override origin) |
| Why | Next.js pages for public content. ISR handles revalidation; CDN acts as a second cache layer in front of the origin. |

---

## Cache Purging

### When to purge manually

| Event | Purge target |
|-------|-------------|
| Settings saved in admin | `/api/v1/settings/public` |
| Product updated | `/api/v1/products/*`, product page URL |
| Blog post published/updated | `/api/v1/blog/*`, blog page URLs |
| Category changed | `/api/v1/categories/*` |
| Translation updated | `/api/v1/translations/*` |

### How to purge

- **Dashboard:** Caching → Cache Purge → Custom Purge → enter URLs
- **API:** `POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache`
- **Terraform:** use `cloudflare_cache_reserve_clear` or `cloudflare_purge_cache` resource

### Automatic purge (recommended)

Wire Laravel model observers to call the Cloudflare Purge API when key models are saved. Example: add a `ProductObserver` that calls `CloudflareService::purge(['/api/v1/products/'.$product->slug])` on `saved`/`deleted`.

---

## Terraform Example

```hcl
resource "cloudflare_ruleset" "cache_rules" {
  zone_id     = var.zone_id
  name        = "CMS Cache Rules"
  description = "Cache rules for Laravel + Next.js CMS"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules {
    ref         = "bypass_admin"
    description = "Bypass: Admin SPA"
    expression  = "(http.request.uri.path matches \"^/admin(/.*)?$\")"
    action      = "set_cache_settings"
    action_parameters {
      cache = false
    }
    enabled = true
  }

  # ... (repeat for each rule in cache-rules.json)
}
```

---

## Notes

- **Vary header:** The Laravel `ApiCacheHeaders` middleware adds `Vary: Accept-Encoding, Accept-Language, X-Cart-Token`. Cloudflare respects `Vary` — different locales and cart states get separate cache keys.
- **Flash sales:** Because product TTL is 5 minutes, a flash sale may appear up to 5 minutes late at the CDN edge. Acceptable for most setups. If stricter freshness is needed, reduce the TTL or trigger a cache purge when a flash sale activates.
- **`stale-while-revalidate`:** Laravel sets this in the `Cache-Control` response header. Cloudflare Enterprise supports SWR natively. On Pro/Free plans the `s-maxage` value controls edge TTL; SWR is a hint that Cloudflare may or may not honour.
- **`Cloudflare-CDN-Cache-Control`:** Set in `next.config.ts` for Next.js pages. This header lets you specify a different TTL specifically for Cloudflare without affecting the browser's `Cache-Control`.
