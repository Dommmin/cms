import type {
    AnalyzePageHealthOptions,
    PageHealthIssue,
    PageHealthResult,
} from './page-health.types';
import type { Block, Section } from './types';

const H1_TAG_PATTERN = /<h1(?:\s|>)/gi;
const ANCHOR_WITHOUT_HREF_PATTERN = /<a\b(?![^>]*\bhref\s*=)[^>]*>/gi;
const MEDIA_IMAGE_TYPE = 'media.image';

const CTA_PAIRS = [
    ['cta_text', 'cta_url', 'Primary CTA'],
    ['cta2_text', 'cta2_url', 'Secondary CTA'],
    ['link_text', 'link_url', 'Link CTA'],
    ['primary_label', 'primary_url', 'Primary CTA'],
    ['secondary_label', 'secondary_url', 'Secondary CTA'],
    ['cta_label', 'cta_url', 'CTA'],
] as const;

function isFilled(value: unknown): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

function collectStringValues(value: unknown): string[] {
    if (typeof value === 'string') return [value];

    if (Array.isArray(value)) {
        return value.flatMap((item) => collectStringValues(item));
    }

    if (value && typeof value === 'object') {
        return Object.values(value).flatMap((item) =>
            collectStringValues(item),
        );
    }

    return [];
}

function countH1Tags(value: unknown): number {
    return collectStringValues(value).reduce((count, item) => {
        const matches = item.match(H1_TAG_PATTERN);

        return count + (matches?.length ?? 0);
    }, 0);
}

function countAnchorsWithoutHref(value: unknown): number {
    return collectStringValues(value).reduce((count, item) => {
        const matches = item.match(ANCHOR_WITHOUT_HREF_PATTERN);

        return count + (matches?.length ?? 0);
    }, 0);
}

function blockLocation(
    section: Section,
    block: Block,
    blockLabels: Record<string, string>,
): string {
    const label = blockLabels[block.type] ?? block.type;

    return `${label} in section ${section.position + 1}`;
}

function addCtaIssues(
    issues: PageHealthIssue[],
    section: Section,
    block: Block,
    blockLabels: Record<string, string>,
): void {
    const location = blockLocation(section, block, blockLabels);

    function inspectObject(value: unknown): void {
        if (Array.isArray(value)) {
            value.forEach(inspectObject);

            return;
        }

        if (!value || typeof value !== 'object') return;

        const record = value as Record<string, unknown>;

        CTA_PAIRS.forEach(([labelKey, urlKey, label]) => {
            const hasLabel = isFilled(record[labelKey]);
            const hasUrl = isFilled(record[urlKey]);

            if (hasUrl && !hasLabel) {
                issues.push({
                    id: `empty-cta-${block.client_id ?? block.id ?? block.position}-${labelKey}`,
                    severity: 'warning',
                    title: 'CTA has no visible label',
                    description: `${label} has a URL but no button text. Add a clear label before publishing.`,
                    location,
                });
            }

            if (hasLabel && !hasUrl) {
                issues.push({
                    id: `cta-link-missing-${block.client_id ?? block.id ?? block.position}-${urlKey}`,
                    severity: 'error',
                    title: 'CTA link is missing',
                    description: `${label} has button text but no URL, so the rendered link will be omitted.`,
                    location,
                });
            }
        });

        Object.values(record).forEach(inspectObject);
    }

    inspectObject(block.configuration);
}

function addImageAltIssues(
    issues: PageHealthIssue[],
    section: Section,
    block: Block,
    blockLabels: Record<string, string>,
): void {
    const location = blockLocation(section, block, blockLabels);

    block.relations
        ?.filter((relation) => relation.relation_type === MEDIA_IMAGE_TYPE)
        .forEach((relation) => {
            const alt = relation.metadata?.alt;

            if (typeof alt === 'string' && alt.trim().length > 0) return;

            issues.push({
                id: `image-alt-missing-${block.client_id ?? block.id ?? block.position}-${relation.id ?? relation.position}`,
                severity: 'warning',
                title: 'Image is missing alt text',
                description:
                    'Add alt metadata to this image or confirm it is decorative in the block implementation.',
                location,
            });
        });
}

function activeBlocks(sections: Section[]): Array<{
    section: Section;
    block: Block;
}> {
    return sections
        .filter((section) => section.is_active)
        .flatMap((section) =>
            section.blocks
                .filter((block) => block.is_active)
                .map((block) => ({ section, block })),
        );
}

export function analyzePageHealth({
    sections,
    blockLabels = {},
}: AnalyzePageHealthOptions): PageHealthResult {
    const issues: PageHealthIssue[] = [];
    const blocks = activeBlocks(sections);
    let h1Count = 0;

    blocks.forEach(({ section, block }) => {
        if (
            block.type === 'hero_banner' &&
            isFilled(block.configuration.title)
        ) {
            h1Count += 1;
        }

        h1Count += countH1Tags(block.configuration);

        const anchorsWithoutHref = countAnchorsWithoutHref(block.configuration);

        if (anchorsWithoutHref > 0) {
            issues.push({
                id: `link-without-href-${block.client_id ?? block.id ?? block.position}`,
                severity: 'error',
                title: 'Link without href',
                description: `${anchorsWithoutHref} HTML link ${anchorsWithoutHref === 1 ? 'is' : 'are'} missing an href attribute.`,
                location: blockLocation(section, block, blockLabels),
            });
        }

        addCtaIssues(issues, section, block, blockLabels);
        addImageAltIssues(issues, section, block, blockLabels);
    });

    if (h1Count === 0) {
        issues.unshift({
            id: 'missing-h1',
            severity: 'error',
            title: 'Page has no H1',
            description:
                'Add one primary H1 heading, usually through the hero title or rich text content.',
        });
    } else if (h1Count > 1) {
        issues.unshift({
            id: 'multiple-h1',
            severity: 'warning',
            title: 'Page has more than one H1',
            description: `Found ${h1Count} H1 headings. Keep one primary H1 and change the rest to H2/H3.`,
        });
    }

    const errorCount = issues.filter(
        (issue) => issue.severity === 'error',
    ).length;
    const warningCount = issues.length - errorCount;

    return {
        issues,
        summary: {
            h1Count,
            activeBlockCount: blocks.length,
            issueCount: issues.length,
            errorCount,
            warningCount,
        },
    };
}
