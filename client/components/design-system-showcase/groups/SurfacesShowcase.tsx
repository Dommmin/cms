import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const surfaces = [
    {
        id: 'default',
        label: 'default',
        className: 'bg-card text-card-foreground border border-border',
    },
    {
        id: 'outlined',
        label: 'outlined',
        className: 'bg-background text-foreground border-2 border-border',
    },
    {
        id: 'elevated',
        label: 'elevated',
        className:
            'elevated-surface rounded-[var(--store-card-radius,var(--radius))]',
    },
    {
        id: 'muted',
        label: 'muted',
        className: 'bg-muted text-foreground border border-border',
    },
] as const;

export function SurfacesShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Surfaces"
                description="Card-like surfaces using design tokens and globals.css surface utilities."
            />
            <div className="grid gap-4 sm:grid-cols-2">
                {surfaces.map((surface) => (
                    <div key={surface.id} className="space-y-2">
                        <p className="text-muted-foreground font-mono text-xs uppercase">
                            {surface.label}
                        </p>
                        <div
                            className={[
                                'flex min-h-28 items-end rounded-lg p-4 text-sm font-medium',
                                surface.className,
                            ].join(' ')}
                        >
                            Surface · {surface.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
