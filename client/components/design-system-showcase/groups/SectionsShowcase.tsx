import { sectionVariantClasses } from '@/components/composition/styles';
import { cn } from '@/lib/utils';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const variants = [
    {
        id: 'default',
        label: 'default',
        className: 'bg-background text-foreground',
    },
    { id: 'light', label: 'light', className: sectionVariantClasses.light },
    { id: 'dark', label: 'dark', className: sectionVariantClasses.dark },
    { id: 'muted', label: 'muted', className: sectionVariantClasses.muted },
    {
        id: 'accent',
        label: 'accent',
        className: 'bg-accent text-accent-foreground',
    },
] as const;

export function SectionsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Sections"
                description="Section background variants from composition/styles — used by the page builder section renderer."
            />
            <div className="grid gap-4 sm:grid-cols-2">
                {variants.map((variant) => (
                    <div key={variant.id} className="space-y-2">
                        <p className="text-muted-foreground font-mono text-xs uppercase">
                            {variant.label}
                        </p>
                        <div
                            className={cn(
                                'flex min-h-28 items-end rounded-lg border p-4 text-sm font-medium',
                                variant.className,
                            )}
                        >
                            Section · {variant.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
