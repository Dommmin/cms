import type {
    SeoData,
    SeoHealthIssue,
    SeoHealthOptions,
} from './seo-panel.types';

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

export function analyzeSeoHealth(
    data: SeoData,
    options: SeoHealthOptions,
): SeoHealthIssue[] {
    const issues: SeoHealthIssue[] = [];
    const title = options.displayTitle.trim();
    const description = options.displayDescription.trim();

    if (!title) {
        issues.push({
            id: 'missing-title',
            severity: 'error',
            message: 'Missing SEO title.',
        });
    }

    if (title.length > MAX_TITLE_LENGTH) {
        issues.push({
            id: 'long-title',
            severity: 'warning',
            message: `SEO title is too long (${title.length}/${MAX_TITLE_LENGTH}).`,
        });
    }

    if (!description || description === 'No description provided.') {
        issues.push({
            id: 'missing-description',
            severity: 'error',
            message: 'Missing meta description.',
        });
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
        issues.push({
            id: 'long-description',
            severity: 'warning',
            message: `Meta description is too long (${description.length}/${MAX_DESCRIPTION_LENGTH}).`,
        });
    }

    if (!data.og_image) {
        issues.push({
            id: 'missing-og-image',
            severity: 'warning',
            message: 'Missing Open Graph image.',
        });
    }

    if (options.showCanonical && !data.canonical_url) {
        issues.push({
            id: 'missing-canonical',
            severity: 'warning',
            message: 'Canonical URL is empty.',
        });
    }

    if (data.meta_robots.includes('noindex')) {
        issues.push({
            id: 'noindex',
            severity: 'warning',
            message: 'Robots setting prevents indexing.',
        });
    }

    // Thin content heuristic
    if (options.contentLength !== undefined && options.contentLength < 300) {
        issues.push({
            id: 'thin-content',
            severity: 'warning',
            message: `Thin content: Main body text is too short (${options.contentLength}/300 chars), which may harm search index quality.`,
        });
    }

    // Broken slug / redirect concerns
    if (options.urlPath) {
        const slug = options.urlPath.split('/').pop() || '';

        if (/[A-Z]/.test(slug)) {
            issues.push({
                id: 'slug-uppercase',
                severity: 'warning',
                message:
                    'Slug contains uppercase letters. Use lowercase to prevent canonical indexing conflicts.',
            });
        }

        if (/\s/.test(slug) || slug.includes('%20')) {
            issues.push({
                id: 'slug-spaces',
                severity: 'error',
                message:
                    'Slug contains spaces. This causes URL-encoding (%20) and broken links.',
            });
        }

        if (/[^a-z0-9\-_]/.test(slug) && !/[A-Z]/.test(slug)) {
            issues.push({
                id: 'slug-special-chars',
                severity: 'warning',
                message:
                    'Slug contains special characters. Stick to alphanumeric characters and hyphens.',
            });
        }
    }

    return issues;
}
