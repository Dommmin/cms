import { Badge } from '@/components/ui/badge';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const variants = [
    { id: 'default', variant: 'default' as const, label: 'default' },
    { id: 'secondary', variant: 'secondary' as const, label: 'secondary' },
    {
        id: 'destructive',
        variant: 'destructive' as const,
        label: 'destructive',
    },
    { id: 'outline', variant: 'outline' as const, label: 'outline' },
];

export function BadgesShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Badges"
                description="Badge primitive variants for status labels, tags, and inline metadata."
            />
            <div className="flex flex-wrap gap-3">
                {variants.map((item) => (
                    <Badge key={item.id} variant={item.variant}>
                        {item.label}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
