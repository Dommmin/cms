import { Grid } from '@/components/composition/Grid';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

function GridCell({ label }: { label: string }) {
    return (
        <div className="bg-card border-border flex min-h-16 items-center justify-center rounded-md border text-sm font-semibold">
            {label}
        </div>
    );
}

export function GridLayoutsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Grid Layouts"
                description="Responsive column grids from the composition Grid primitive with token-driven gap."
            />
            <div className="space-y-10">
                <div className="space-y-3">
                    <p className="text-muted-foreground font-mono text-xs uppercase">
                        2 columns
                    </p>
                    <Grid cols={2}>
                        <GridCell label="1" />
                        <GridCell label="2" />
                    </Grid>
                </div>
                <div className="space-y-3">
                    <p className="text-muted-foreground font-mono text-xs uppercase">
                        3 columns
                    </p>
                    <Grid cols={3}>
                        <GridCell label="1" />
                        <GridCell label="2" />
                        <GridCell label="3" />
                    </Grid>
                </div>
                <div className="space-y-3">
                    <p className="text-muted-foreground font-mono text-xs uppercase">
                        4 columns
                    </p>
                    <Grid cols={4}>
                        <GridCell label="1" />
                        <GridCell label="2" />
                        <GridCell label="3" />
                        <GridCell label="4" />
                    </Grid>
                </div>
                <div className="space-y-3">
                    <p className="text-muted-foreground font-mono text-xs uppercase">
                        responsive (1 → 2 → 4)
                    </p>
                    <p className="text-muted-foreground text-sm">
                        Resize the viewport to see columns collapse: mobile 1
                        col, tablet 2 cols, desktop 4 cols.
                    </p>
                    <Grid cols={4}>
                        <GridCell label="A" />
                        <GridCell label="B" />
                        <GridCell label="C" />
                        <GridCell label="D" />
                    </Grid>
                </div>
            </div>
        </div>
    );
}
