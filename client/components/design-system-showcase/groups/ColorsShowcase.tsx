import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

export const COLOR_TOKENS = [
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'border',
    'input',
    'ring',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
    'accent-vivid',
    'accent-vivid-foreground',
    'store-accent-mint',
    'store-accent-amber',
    'store-accent-rose',
] as const;

export function ColorsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Colors"
                description="Semantic color tokens from globals.css — swap the active theme to verify contrast."
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {COLOR_TOKENS.map((token) => (
                    <div key={token} className="space-y-2 text-center">
                        <div
                            className="border-border mx-auto h-14 w-14 rounded-lg border shadow-sm"
                            style={{ background: `var(--${token})` }}
                            aria-hidden="true"
                        />
                        <p className="text-muted-foreground font-mono text-xs">
                            {token}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
