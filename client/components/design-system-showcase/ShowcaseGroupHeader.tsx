import type { ShowcaseGroupHeaderProps } from './ShowcaseGroupHeader.types';

export function ShowcaseGroupHeader({
    title,
    description,
}: ShowcaseGroupHeaderProps) {
    return (
        <header className="mb-[var(--block-gap,2rem)] max-w-[var(--container-content-width,48rem)] space-y-2">
            <p className="text-primary text-xs font-semibold tracking-[0.12em] uppercase">
                Design system
            </p>
            <h2
                className="text-[length:var(--h2-size,2rem)] leading-tight font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
            >
                {title}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
                {description}
            </p>
        </header>
    );
}
