import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as ShippingMethodController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ShippingMethodController';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import type { RestrictionItem } from '@/pages/admin/ecommerce/shipping-methods/edit.types';

interface SearchResult {
    id: number;
    name: string;
}

interface RestrictionSectionProps {
    shippingMethodId: number;
    type: 'product' | 'category';
    label: string;
    items: RestrictionItem[];
    onAdd: (item: RestrictionItem) => void;
    onRemove: (id: number) => void;
}

function RestrictionSection({
    shippingMethodId,
    type,
    label,
    items,
    onAdd,
    onRemove,
}: RestrictionSectionProps) {
    const __ = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const search = useCallback(
        (q: string) => {
            if (q.length < 1) {
                setResults([]);
                setOpen(false);
                return;
            }
            setLoading(true);
            fetch(
                ShippingMethodController.searchRestrictable.url({
                    query: { q, type },
                }),
                { headers: { 'X-Requested-With': 'XMLHttpRequest' } },
            )
                .then((r) => r.json())
                .then((data: SearchResult[]) => {
                    setResults(
                        data.filter((d) => !items.find((i) => i.id === d.id)),
                    );
                    setOpen(true);
                })
                .finally(() => setLoading(false));
        },
        [type, items],
    );

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => search(query), 250);
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, search]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAdd = (item: SearchResult) => {
        fetch(
            ShippingMethodController.addRestriction.url({
                shippingMethod: shippingMethodId,
            }),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((c) => c.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] ?? '',
                    ),
                },
                body: JSON.stringify({ type, id: item.id }),
            },
        ).then((r) => {
            if (r.ok) {
                onAdd({ id: item.id, name: item.name });
                setQuery('');
                setResults([]);
                setOpen(false);
            }
        });
    };

    const handleRemove = (id: number) => {
        fetch(
            ShippingMethodController.removeRestriction.url({
                shippingMethod: shippingMethodId,
            }),
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie
                            .split('; ')
                            .find((c) => c.startsWith('XSRF-TOKEN='))
                            ?.split('=')[1] ?? '',
                    ),
                },
                body: JSON.stringify({ type, id }),
            },
        ).then((r) => {
            if (r.ok) {
                onRemove(id);
            }
        });
    };

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium">{label}</h3>

            {items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <Badge
                            key={item.id}
                            variant="secondary"
                            className="gap-1 pr-1"
                        >
                            {item.name}
                            <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                className="ml-1 rounded-full hover:bg-muted"
                                aria-label={`Remove ${item.name}`}
                            >
                                <XIcon className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {__('misc.no_restrictions', 'No restrictions set')}
                </p>
            )}

            <div ref={wrapperRef} className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`${__('action.search', 'Search')} ${label.toLowerCase()}...`}
                            className="pl-8"
                        />
                    </div>
                </div>

                {open && results.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                        {results.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                                onClick={() => handleAdd(r)}
                            >
                                <PlusIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                {r.name}
                            </button>
                        ))}
                    </div>
                )}

                {open &&
                    !loading &&
                    results.length === 0 &&
                    query.length >= 1 && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
                            {__('misc.no_results', 'No results found')}
                        </div>
                    )}
            </div>
        </div>
    );
}

interface ShippingRestrictionsProps {
    shippingMethodId: number;
    initialProducts: RestrictionItem[];
    initialCategories: RestrictionItem[];
}

export default function ShippingRestrictions({
    shippingMethodId,
    initialProducts,
    initialCategories,
}: ShippingRestrictionsProps) {
    const __ = useTranslation();
    const [products, setProducts] =
        useState<RestrictionItem[]>(initialProducts);
    const [categories, setCategories] =
        useState<RestrictionItem[]>(initialCategories);

    return (
        <div className="space-y-4 rounded-xl border bg-card p-6">
            <div>
                <h2 className="font-semibold">
                    {__('misc.restrictions', 'Ograniczenia')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {__(
                        'misc.restrictions_help',
                        'This shipping method will not be available when the cart contains the listed products or products from the listed categories.',
                    )}
                </p>
            </div>

            <RestrictionSection
                shippingMethodId={shippingMethodId}
                type="product"
                label={__('label.products', 'Products')}
                items={products}
                onAdd={(item) => setProducts((prev) => [...prev, item])}
                onRemove={(id) =>
                    setProducts((prev) => prev.filter((p) => p.id !== id))
                }
            />

            <div className="border-t pt-4">
                <RestrictionSection
                    shippingMethodId={shippingMethodId}
                    type="category"
                    label={__('label.categories', 'Categories')}
                    items={categories}
                    onAdd={(item) => setCategories((prev) => [...prev, item])}
                    onRemove={(id) =>
                        setCategories((prev) => prev.filter((c) => c.id !== id))
                    }
                />
            </div>
        </div>
    );
}
