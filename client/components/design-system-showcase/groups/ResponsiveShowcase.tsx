import { Grid } from '@/components/composition/Grid';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const breakpoints = [
    {
        id: 'mobile',
        label: 'mobile',
        description: 'Single column — default below md breakpoint.',
        cols: 1 as const,
        cells: ['Full width'],
    },
    {
        id: 'tablet',
        label: 'tablet',
        description: 'Two columns from md breakpoint.',
        cols: 2 as const,
        cells: ['Col A', 'Col B'],
    },
    {
        id: 'desktop',
        label: 'desktop',
        description: 'Three columns from lg breakpoint (Grid cols=3).',
        cols: 3 as const,
        cells: ['Col A', 'Col B', 'Col C'],
    },
];

export function ResponsiveShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Responsive Examples"
                description="Common layout patterns at mobile, tablet, and desktop breakpoints."
            />
            <div className="space-y-10">
                {breakpoints.map((bp) => (
                    <div key={bp.id} className="space-y-3">
                        <div>
                            <p className="text-muted-foreground font-mono text-xs uppercase">
                                {bp.label}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {bp.description}
                            </p>
                        </div>
                        {bp.cols === 1 ? (
                            <div className="bg-card border-border rounded-md border p-4 text-center text-sm font-medium">
                                {bp.cells[0]}
                            </div>
                        ) : (
                            <Grid cols={bp.cols}>
                                {bp.cells.map((cell) => (
                                    <div
                                        key={cell}
                                        className="bg-card border-border flex min-h-16 items-center justify-center rounded-md border text-sm font-medium"
                                    >
                                        {cell}
                                    </div>
                                ))}
                            </Grid>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
