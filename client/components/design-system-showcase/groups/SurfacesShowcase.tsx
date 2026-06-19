import { Surface } from '@/components/composition';
import type { SurfaceVariant } from '@/components/composition/styles';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const surfaces: { id: SurfaceVariant; label: string }[] = [
    { id: 'default', label: 'default' },
    { id: 'outlined', label: 'outlined' },
    { id: 'elevated', label: 'elevated' },
    { id: 'muted', label: 'muted' },
];

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
                        <Surface
                            variant={surface.id}
                            className="flex min-h-28 items-end p-4 text-sm font-medium"
                        >
                            Surface · {surface.label}
                        </Surface>
                    </div>
                ))}
            </div>
        </div>
    );
}
