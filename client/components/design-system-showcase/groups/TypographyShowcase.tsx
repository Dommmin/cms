import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const typeSamples = [
    {
        label: 'H1',
        tag: 'h1',
        text: 'Heading level one',
        className:
            'text-[length:var(--h1-size,2.5rem)] font-bold leading-tight',
    },
    {
        label: 'H2',
        tag: 'h2',
        text: 'Heading level two',
        className: 'text-[length:var(--h2-size,2rem)] font-bold leading-tight',
    },
    {
        label: 'H3',
        tag: 'h3',
        text: 'Heading level three',
        className: 'text-[length:var(--h3-size,1.5rem)] font-semibold',
    },
    {
        label: 'H4',
        tag: 'h4',
        text: 'Heading level four',
        className: 'text-[length:var(--h4-size,1.25rem)] font-semibold',
    },
    {
        label: 'H5',
        tag: 'h5',
        text: 'Heading level five',
        className: 'text-lg font-semibold',
    },
    {
        label: 'H6',
        tag: 'h6',
        text: 'Heading level six',
        className: 'text-base font-semibold',
    },
] as const;

export function TypographyShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Typography"
                description="Heading scale, body copy, and inline text styles driven by theme typography tokens."
            />
            <div className="space-y-8">
                {typeSamples.map((sample) => {
                    const Tag = sample.tag;
                    return (
                        <div
                            key={sample.label}
                            className="space-y-2 border-b pb-6 last:border-b-0"
                        >
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {sample.label}
                            </p>
                            <Tag
                                className={sample.className}
                                style={{ fontFamily: 'var(--font-heading)' }}
                            >
                                {sample.text}
                            </Tag>
                        </div>
                    );
                })}
                <div className="space-y-2 border-b pb-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Paragraph
                    </p>
                    <p className="text-base leading-relaxed">
                        Body text uses <strong>var(--font-body)</strong> at{' '}
                        <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
                            --text-base-size
                        </code>
                        . Merchants can swap heading and body families without
                        touching markup.
                    </p>
                </div>
                <div className="space-y-2 border-b pb-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Lead paragraph
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Lead copy introduces a section with slightly larger,
                        softer body text for hierarchy.
                    </p>
                </div>
                <div className="space-y-2 border-b pb-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Small text
                    </p>
                    <p className="text-sm">
                        Small supporting copy for captions and metadata.
                    </p>
                </div>
                <div className="space-y-2 border-b pb-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Muted text
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Helper labels and secondary information use muted
                        foreground.
                    </p>
                </div>
                <div className="space-y-2 border-b pb-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Link
                    </p>
                    <a
                        href="#typography"
                        className="text-primary font-medium underline underline-offset-4"
                    >
                        Inline text link
                    </a>
                </div>
                <div className="space-y-2 border-b pb-6">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        List
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                        <li>First list item</li>
                        <li>Second list item</li>
                        <li>Third list item</li>
                    </ul>
                </div>
                <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Quote
                    </p>
                    <blockquote className="border-primary text-muted-foreground border-l-4 pl-4 italic">
                        Design tokens keep typography consistent across every
                        storefront surface.
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
