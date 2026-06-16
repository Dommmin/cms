import { cn } from '@/lib/utils';

import { Container } from './Container';
import type { SectionProps } from './Section.types';

const variantClasses: Record<NonNullable<SectionProps['variant']>, string> = {
    light: 'bg-background text-foreground',
    dark: 'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
    muted: 'bg-muted text-foreground',
    brand: 'bg-primary text-primary-foreground',
};

const paddingClasses: Record<NonNullable<SectionProps['padding']>, string> = {
    none: 'py-0',
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-[var(--section-padding-y,5rem)]',
    xl: 'py-28',
};

export function Section({
    children,
    className,
    variant = 'light',
    padding = 'lg',
    id,
}: SectionProps) {
    return (
        <section
            id={id}
            className={cn(
                variantClasses[variant],
                paddingClasses[padding],
                className,
            )}
        >
            <Container>{children}</Container>
        </section>
    );
}
