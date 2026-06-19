import { Stack } from '@/components/composition';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const gaps = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export function StackLayoutsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Stack Layouts"
                description="Vertical stacks with consistent gap spacing — the most common composition pattern for forms and content blocks."
            />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {gaps.map((gap) => (
                    <div key={gap} className="space-y-2">
                        <p className="text-muted-foreground font-mono text-xs uppercase">
                            gap {gap}
                        </p>
                        <Stack gap={gap}>
                            {['A', 'B', 'C'].map((item) => (
                                <div
                                    key={item}
                                    className="bg-card border-border flex h-10 items-center justify-center rounded-md border text-sm font-semibold"
                                >
                                    {item}
                                </div>
                            ))}
                        </Stack>
                    </div>
                ))}
            </div>
        </div>
    );
}
