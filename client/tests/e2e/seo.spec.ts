import { expect, test } from '@playwright/test';
import { execSync } from 'child_process';

// 1. Fetch sitemap.xml synchronously using curl via child_process
const BASE_URL = process.env.TEST_BASE_URL ?? 'http://node:3000';
const sitemapUrl = `${BASE_URL}/sitemap.xml`;

let urls: string[] = [];
try {
    const xml = execSync(`curl -s ${sitemapUrl}`, { encoding: 'utf8' });
    const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
    let match;
    while ((match = locRegex.exec(xml)) !== null) {
        urls.push(match[1]);
    }
} catch (error: any) {
    console.error(`Error loading sitemap.xml synchronously: ${error.message}`);
}

// Fallback to basic URLs if sitemap couldn't be loaded/parsed
if (urls.length === 0) {
    urls = [
        `${BASE_URL}/`,
        `${BASE_URL}/shop`,
        `${BASE_URL}/blog`,
        `${BASE_URL}/faq`,
    ];
}

const productUrls = urls.filter(
    (u) => u.includes('/shop/') || u.includes('/sklep/'),
);
const blogUrls = urls.filter(
    (u) => u.includes('/blog/') && !u.endsWith('/blog'),
);
const generalUrls = urls.filter(
    (u) => !productUrls.includes(u) && !blogUrls.includes(u),
);

// Sample up to 3 products and 3 blog posts
const sampledProducts = productUrls.slice(0, 3);
const sampledBlog = blogUrls.slice(0, 3);
const urlsToAudit = [...generalUrls, ...sampledProducts, ...sampledBlog];

console.log(
    `Discovered ${urls.length} sitemap URLs. Auditing sampled subset of ${urlsToAudit.length} pages.`,
);

// Define a separate test for each URL
for (const urlStr of urlsToAudit) {
    const parsedUrl = new URL(urlStr);
    const relativePath = parsedUrl.pathname + parsedUrl.search;

    test(`SEO Audit: ${relativePath}`, async ({ page }) => {
        test.setTimeout(90_000); // 90 seconds per page

        const pageRes = await page.goto(relativePath, {
            waitUntil: 'domcontentloaded',
        });
        expect(pageRes).not.toBeNull();
        expect(pageRes!.status()).toBe(200);

        // Extract metadata and page tags via page.evaluate
        const auditData = await page.evaluate(() => {
            const getMeta = (query: string) =>
                document.querySelector(query)?.getAttribute('content') ?? null;
            const getLink = (query: string) =>
                document.querySelector(query)?.getAttribute('href') ?? null;

            return {
                title: document.title,
                description: getMeta('meta[name="description"]'),
                canonical: getLink('link[rel="canonical"]'),
                ogTitle: getMeta('meta[property="og:title"]'),
                ogDesc: getMeta('meta[property="og:description"]'),
                ogImage: getMeta('meta[property="og:image"]'),
                h1Count: document.querySelectorAll('h1').length,
                sdScripts: Array.from(
                    document.querySelectorAll(
                        'script[type="application/ld+json"]',
                    ),
                ).map((s) => s.textContent ?? ''),
            };
        });

        const failures: string[] = [];

        // Title check
        if (!auditData.title || auditData.title.trim() === '') {
            failures.push(`title tag is missing or empty`);
        } else if (
            auditData.title.toLowerCase().includes('undefined') ||
            auditData.title.toLowerCase().includes('null')
        ) {
            failures.push(
                `title contains placeholder value ("${auditData.title}")`,
            );
        }

        const isIndexable =
            !relativePath.includes('/search') &&
            !relativePath.includes('/account') &&
            !relativePath.includes('/checkout');

        // Description check
        if (isIndexable) {
            if (!auditData.description || auditData.description.trim() === '') {
                failures.push(`meta description is missing or empty`);
            } else if (
                auditData.description.toLowerCase().includes('undefined') ||
                auditData.description.toLowerCase().includes('null')
            ) {
                failures.push(
                    `meta description contains placeholder value ("${auditData.description}")`,
                );
            }
        }

        // Canonical check
        if (!auditData.canonical || auditData.canonical.trim() === '') {
            failures.push(`canonical link tag is missing or empty`);
        }

        // Open Graph checks
        if (isIndexable) {
            if (!auditData.ogTitle) {
                failures.push(`og:title meta tag is missing`);
            } else if (
                auditData.ogTitle.toLowerCase().includes('undefined') ||
                auditData.ogTitle.toLowerCase().includes('null')
            ) {
                failures.push(
                    `og:title contains placeholder value ("${auditData.ogTitle}")`,
                );
            }

            if (!auditData.ogDesc) {
                failures.push(`og:description meta tag is missing`);
            } else if (
                auditData.ogDesc.toLowerCase().includes('undefined') ||
                auditData.ogDesc.toLowerCase().includes('null')
            ) {
                failures.push(
                    `og:description contains placeholder value ("${auditData.ogDesc}")`,
                );
            }

            if (!auditData.ogImage) {
                failures.push(`og:image meta tag is missing`);
            }
        }

        // Headings structure
        if (auditData.h1Count === 0) {
            failures.push(`missing <h1> heading`);
        } else if (auditData.h1Count > 1) {
            failures.push(
                `multiple <h1> headings found (${auditData.h1Count})`,
            );
        }

        // Structured Data
        if (auditData.sdScripts.length === 0) {
            failures.push(`missing structured data (JSON-LD)`);
        } else {
            auditData.sdScripts.forEach((text, i) => {
                if (!text || text.trim() === '') {
                    failures.push(`empty JSON-LD script at index ${i}`);
                } else {
                    try {
                        JSON.parse(text);
                    } catch (e: any) {
                        failures.push(
                            `invalid JSON in JSON-LD at index ${i}: ${e.message}`,
                        );
                    }
                }
            });
        }

        expect(failures).toEqual([]);
    });
}
