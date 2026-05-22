# Blog SEO Audit Report

## Findings

- Blog posts had translatable title/excerpt/content, but only one canonical slug. This made English and Polish article URLs share the same slug and weakened hreflang/canonical clarity.
- Article metadata existed, but article pages did not use localized canonical URLs or localized slug alternates.
- Blog RSS existed on Laravel `/feed`, but the storefront did not expose locale-specific blog RSS URLs.
- Article pages rendered server-side HTML and JSON-LD, but lacked a table of contents, visible last-updated date, author box, and related posts.

## Implemented

- Added `slug_translations`, `translation_group_id`, and `canonical_url` to `blog_posts`.
- Added localized API output for article `slug`, `slug_translations`, `available_locales`, `canonical_url`, `published_at`, and `updated_at`.
- Added `blog:seo-audit` with report mode and safe `--fix`; it generates missing SEO descriptions, SEO titles, reading time, English slugs, and translation group IDs without overwriting manual SEO fields unless `--force` is used.
- Updated Next.js blog metadata with localized canonical URLs, hreflang alternates, x-default to English, OpenGraph, Twitter metadata, and dynamic generated OG images.
- Updated sitemap, robots, and locale-specific blog RSS at `/blog/rss.xml` and `/en/blog/rss.xml`.
- Added article table of contents, h1 normalization, last-updated date, author box, and related posts.

## Manual Decisions Needed

- Review `docker compose exec php php artisan blog:seo-audit --format=markdown` suggestions before applying any title or slug changes.
- Decide whether each article is primarily Polish, English, or fully bilingual. The current implementation supports bilingual content in one post row.
- Add explicit `canonical_url` only for intentional canonical overrides. Leave it empty for normal self-canonical article URLs.
- For technical tutorials, editors should add real content sections named "Common mistakes", "Production checklist", and "Troubleshooting" where relevant rather than generating generic filler.
