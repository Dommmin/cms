import Link from 'next/link';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

export function ProseShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Prose Content"
                description="Rendered article content using globals.css .prose styles — same as rich text blocks and blog posts."
            />
            <article className="prose prose-lg max-w-[var(--container-content-width,48rem)]">
                <h2>Getting started with the design system</h2>
                <p>
                    This showcase documents the base components that power the
                    storefront. Every surface reads from CSS custom properties
                    so merchants can retheme without redeploying code.
                </p>
                <h3>Key principles</h3>
                <ul>
                    <li>Token-driven colors, typography, and spacing</li>
                    <li>Composition primitives for layout consistency</li>
                    <li>shadcn/ui primitives for interactive controls</li>
                </ul>
                <blockquote>
                    <p>
                        Good design systems make the right thing easy and the
                        wrong thing obvious.
                    </p>
                </blockquote>
                <p>
                    Read more in the{' '}
                    <Link href="/design-system-showcase">
                        design system documentation
                    </Link>
                    .
                </p>
            </article>
        </div>
    );
}
