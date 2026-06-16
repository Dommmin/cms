import { Button } from '@/components/ui/button';

import { ShowcaseGroupHeader } from '../ShowcaseGroupHeader';

const variants = [
    { id: 'primary', label: 'primary', variant: 'default' as const },
    { id: 'secondary', label: 'secondary', variant: 'secondary' as const },
    { id: 'outline', label: 'outline', variant: 'outline' as const },
    { id: 'ghost', label: 'ghost', variant: 'ghost' as const },
    {
        id: 'destructive',
        label: 'destructive',
        variant: 'destructive' as const,
    },
];

const sizes = [
    { id: 'sm', size: 'sm' as const },
    { id: 'md', size: 'default' as const },
    { id: 'lg', size: 'lg' as const },
];

export function ButtonsShowcase() {
    return (
        <div>
            <ShowcaseGroupHeader
                title="Buttons"
                description="shadcn Button primitive — all variants and sizes used across the storefront."
            />
            <div className="space-y-10">
                <div className="space-y-4">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Variants
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {variants.map((item) => (
                            <Button
                                key={item.id}
                                type="button"
                                variant={item.variant}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Sizes
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        {sizes.map((item) => (
                            <Button
                                key={item.id}
                                type="button"
                                size={item.size}
                            >
                                {item.id}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                        Variant × size matrix
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[32rem] text-left text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-muted-foreground py-2 pr-4 font-medium">
                                        Variant
                                    </th>
                                    {sizes.map((size) => (
                                        <th
                                            key={size.id}
                                            className="text-muted-foreground py-2 pr-4 font-medium"
                                        >
                                            {size.id}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {variants.map((variant) => (
                                    <tr
                                        key={variant.id}
                                        className="border-b last:border-b-0"
                                    >
                                        <td className="text-muted-foreground py-3 pr-4 font-mono text-xs uppercase">
                                            {variant.label}
                                        </td>
                                        {sizes.map((size) => (
                                            <td
                                                key={size.id}
                                                className="py-3 pr-4"
                                            >
                                                <Button
                                                    type="button"
                                                    variant={variant.variant}
                                                    size={size.size}
                                                >
                                                    Action
                                                </Button>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
