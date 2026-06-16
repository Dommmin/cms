import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
    Container,
    CTASection,
    EmptyState,
    Grid,
    PageHeader,
    Section,
} from '@/components/composition';

describe('composition primitives', () => {
    it('renders Container with theme width tokens', () => {
        const html = renderToStaticMarkup(
            <Container narrow className="py-8">
                <p>content</p>
            </Container>,
        );

        expect(html).toContain('max-width:var(--container-narrow-width');
        expect(html).toContain('content');
    });

    it('renders Section with variant and padding classes from shared styles', () => {
        const html = renderToStaticMarkup(
            <Section variant="brand" padding="lg">
                <p>section</p>
            </Section>,
        );

        expect(html).toContain('bg-[var(--primary)]');
        expect(html).toContain('py-[var(--section-padding-y');
        expect(html).toContain('section');
    });

    it('renders Grid with column and gap tokens', () => {
        const html = renderToStaticMarkup(
            <Grid cols={3}>
                <div>one</div>
                <div>two</div>
                <div>three</div>
            </Grid>,
        );

        expect(html).toContain('md:grid-cols-3');
        expect(html).toContain('gap-[var(--block-gap');
    });

    it('renders PageHeader with heading tokens', () => {
        const html = renderToStaticMarkup(
            <PageHeader
                eyebrow="Blog"
                title="Latest posts"
                description="Updates from the team"
                align="center"
            />,
        );

        expect(html).toContain('Latest posts');
        expect(html).toContain('text-[length:var(--h1-size');
        expect(html).toContain('text-center');
    });

    it('renders EmptyState with card tokens', () => {
        const html = renderToStaticMarkup(
            <EmptyState title="No results" description="Try another filter." />,
        );

        expect(html).toContain('No results');
        expect(html).toContain('rounded-[var(--store-card-radius');
    });

    it('renders CTASection gradient style with button tokens', () => {
        const html = renderToStaticMarkup(
            <CTASection
                title="Start today"
                description="Join thousands of merchants."
                primaryLabel="Get started"
                primaryHref="/signup"
                style="gradient"
                align="center"
            />,
        );

        expect(html).toContain('Start today');
        expect(html).toContain('bg-gradient-to-r from-[var(--primary)]');
        expect(html).toContain('href="/signup"');
        expect(html).toContain('var(--btn-radius');
    });
});
