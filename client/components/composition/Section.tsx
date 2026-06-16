import { cn } from '@/lib/utils';

import { Container } from './Container';
import type { SectionProps } from './Section.types';
import { sectionPaddingClasses, sectionVariantClasses } from './styles';

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
                sectionVariantClasses[variant],
                sectionPaddingClasses[padding],
                className,
            )}
        >
            <Container>{children}</Container>
        </section>
    );
}
