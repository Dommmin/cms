import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const gaps = [
    { id: 'xs', className: 'gap-2' },
    { id: 'sm', className: 'gap-3' },
    { id: 'md', className: 'gap-4' },
    { id: 'lg', className: 'gap-6' },
    { id: 'xl', className: 'gap-8' },
] as const;

export function StackLayoutsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Stack Layouts"
                description="Vertical stacks with consistent gap spacing — the most common composition pattern for forms and content blocks."
            />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {gaps.map((gap) => (
                    <div key={gap.id} className="space-y-2">
                        <p className="text-muted-foreground font-mono text-xs uppercase">
                            gap {gap.id}
                        </p>
                        <div
                            className={['flex flex-col', gap.className].join(
                                ' ',
                            )}
                        >
                            {['A', 'B', 'C'].map((item) => (
                                <div
                                    key={item}
                                    className="bg-card border-border flex h-10 items-center justify-center rounded-md border text-sm font-semibold"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
