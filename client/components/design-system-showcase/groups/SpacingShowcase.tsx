import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const scale = [
    { id: 'xs', width: '0.5rem' },
    { id: 'sm', width: '0.75rem' },
    { id: 'md', width: '1rem' },
    { id: 'lg', width: '1.5rem' },
    { id: 'xl', width: '2rem' },
    { id: '2xl', width: '3rem' },
    { id: '3xl', width: '4rem' },
] as const;

export function SpacingShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Spacing"
                description="Visual spacing scale used for gaps, padding, and layout rhythm."
            />
            <div className="space-y-4">
                {scale.map((step) => (
                    <div key={step.id} className="flex items-center gap-4">
                        <span className="text-muted-foreground w-10 font-mono text-xs uppercase">
                            {step.id}
                        </span>
                        <div
                            className="bg-primary h-4 rounded-sm"
                            style={{ width: step.width }}
                            aria-hidden="true"
                        />
                        <span className="text-muted-foreground font-mono text-xs">
                            {step.width}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
