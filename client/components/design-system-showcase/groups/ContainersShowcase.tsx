import { Container } from '@/components/composition/Container';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const variants = [
    { id: 'default', label: 'default', props: {} },
    { id: 'narrow', label: 'narrow', props: { narrow: true } },
    { id: 'wide', label: 'wide', props: { wide: true } },
    { id: 'full', label: 'full', props: { fullWidth: true } },
] as const;

export function ContainersShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Containers"
                description="Layout shells from the composition Container primitive — default, narrow, wide, and full width."
            />
            <div className="space-y-6">
                {variants.map((variant) => (
                    <div key={variant.id} className="space-y-2">
                        <p className="text-muted-foreground font-mono text-xs uppercase">
                            {variant.label}
                        </p>
                        <Container
                            {...variant.props}
                            className="border-border bg-muted rounded-lg border border-dashed py-4"
                        >
                            <p className="text-center text-sm font-medium">
                                Container · {variant.label}
                            </p>
                        </Container>
                    </div>
                ))}
            </div>
        </div>
    );
}
