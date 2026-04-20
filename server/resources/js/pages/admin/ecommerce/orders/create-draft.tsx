import { Head, useForm } from '@inertiajs/react';
import { Minus, Plus, Search, ShoppingCart, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as AdminOrderCreateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/AdminOrderCreateController';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Customer = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
};

type Variant = {
    id: number;
    sku: string;
    name: string;
    price: number;
    stock_quantity: number;
};

type LineItem = {
    variant_id: number;
    sku: string;
    name: string;
    price: number;
    quantity: number;
};

type Props = {
    customers: Customer[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Orders', href: '/admin/ecommerce/orders' },
    { title: 'Create Draft Order', href: '#' },
];

function fmt(cents: number): string {
    return (cents / 100).toLocaleString('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    });
}

export default function CreateDraftOrder({ customers }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        customer_id: number | null;
        notes: string;
        items: Array<{ variant_id: number; quantity: number }>;
    }>({
        customer_id: null,
        notes: '',
        items: [],
    });

    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const [variantSearch, setVariantSearch] = useState('');
    const [variantResults, setVariantResults] = useState<Variant[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const filteredCustomers = customers.filter((c) => {
        const q = customerSearch.toLowerCase();
        return (
            !q ||
            c.first_name.toLowerCase().includes(q) ||
            c.last_name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        );
    });

    const searchVariants = useCallback((q: string) => {
        if (!q) {
            setVariantResults([]);
            return;
        }
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            const url =
                AdminOrderCreateController.searchVariants.url() +
                '?q=' +
                encodeURIComponent(q);
            const res = await fetch(url, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });
            const json = (await res.json()) as Variant[];
            setVariantResults(json);
        }, 300);
    }, []);

    const addVariant = (v: Variant) => {
        setLineItems((prev) => {
            const existing = prev.find((i) => i.variant_id === v.id);
            if (existing) {
                return prev.map((i) =>
                    i.variant_id === v.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i,
                );
            }
            return [
                ...prev,
                {
                    variant_id: v.id,
                    sku: v.sku,
                    name: v.name,
                    price: v.price,
                    quantity: 1,
                },
            ];
        });
        setVariantSearch('');
        setVariantResults([]);
    };

    const updateQty = (variantId: number, qty: number) => {
        if (qty <= 0) {
            setLineItems((prev) =>
                prev.filter((i) => i.variant_id !== variantId),
            );
        } else {
            setLineItems((prev) =>
                prev.map((i) =>
                    i.variant_id === variantId ? { ...i, quantity: qty } : i,
                ),
            );
        }
    };

    const total = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setData(
            'items',
            lineItems.map((i) => ({
                variant_id: i.variant_id,
                quantity: i.quantity,
            })),
        );
        post(AdminOrderCreateController.store.url());
    };

    // Keep form data.items in sync with lineItems
    useEffect(() => {
        setData(
            'items',
            lineItems.map((i) => ({
                variant_id: i.variant_id,
                quantity: i.quantity,
            })),
        );
    }, [lineItems, setData]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Draft Order" />
            <Wrapper>
                <PageHeader
                    title="Create Draft Order"
                    description="Create an order on behalf of a customer. The order starts as a draft."
                />

                <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
                    {/* Left — customer + products */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Customer */}
                        <div className="rounded-xl border bg-card p-5">
                            <h2 className="mb-4 text-sm font-semibold">
                                Customer
                            </h2>

                            {selectedCustomer ? (
                                <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {selectedCustomer.first_name}{' '}
                                                {selectedCustomer.last_name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedCustomer.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            setData('customer_id', null);
                                        }}
                                    >
                                        Change
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by name or email..."
                                            className="pl-9"
                                            value={customerSearch}
                                            onChange={(e) =>
                                                setCustomerSearch(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    {errors.customer_id && (
                                        <p className="text-xs text-destructive">
                                            {errors.customer_id}
                                        </p>
                                    )}
                                    <div className="max-h-48 overflow-y-auto rounded-lg border">
                                        {filteredCustomers
                                            .slice(0, 20)
                                            .map((c) => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    className="w-full border-b px-4 py-2.5 text-left text-sm transition-colors last:border-0 hover:bg-accent"
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setData(
                                                            'customer_id',
                                                            c.id,
                                                        );
                                                        setCustomerSearch('');
                                                    }}
                                                >
                                                    <span className="font-medium">
                                                        {c.first_name}{' '}
                                                        {c.last_name}
                                                    </span>
                                                    <span className="ml-2 text-muted-foreground">
                                                        {c.email}
                                                    </span>
                                                </button>
                                            ))}
                                        {filteredCustomers.length === 0 && (
                                            <p className="px-4 py-3 text-sm text-muted-foreground">
                                                No customers found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Products */}
                        <div className="rounded-xl border bg-card p-5">
                            <h2 className="mb-4 text-sm font-semibold">
                                Products
                            </h2>

                            <div className="relative mb-4">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by product name or SKU..."
                                    className="pl-9"
                                    value={variantSearch}
                                    onChange={(e) => {
                                        setVariantSearch(e.target.value);
                                        searchVariants(e.target.value);
                                    }}
                                />
                                {variantResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-lg">
                                        {variantResults.map((v) => (
                                            <button
                                                key={v.id}
                                                type="button"
                                                className="flex w-full items-center justify-between border-b px-4 py-2.5 text-sm transition-colors last:border-0 hover:bg-accent"
                                                onClick={() => addVariant(v)}
                                            >
                                                <div>
                                                    <span className="font-medium">
                                                        {v.name}
                                                    </span>
                                                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                                                        {v.sku}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium">
                                                    {fmt(v.price)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {errors.items && (
                                <p className="mb-3 text-xs text-destructive">
                                    {errors.items}
                                </p>
                            )}

                            {lineItems.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
                                    <ShoppingCart className="mb-2 h-8 w-8 opacity-30" />
                                    <p className="text-sm">
                                        No items yet. Search for products above.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {lineItems.map((item) => (
                                        <div
                                            key={item.variant_id}
                                            className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {item.sku}
                                                </p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {fmt(item.price)}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.variant_id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.variant_id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <span className="w-20 text-right text-sm font-medium">
                                                {fmt(
                                                    item.price * item.quantity,
                                                )}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setLineItems((prev) =>
                                                        prev.filter(
                                                            (i) =>
                                                                i.variant_id !==
                                                                item.variant_id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="rounded-xl border bg-card p-5">
                            <Label className="mb-2 block text-sm font-semibold">
                                Internal Notes
                            </Label>
                            <Textarea
                                placeholder="Optional notes visible only to admins..."
                                rows={3}
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Right — summary */}
                    <div className="space-y-4">
                        <div className="sticky top-20 space-y-3 rounded-xl border bg-card p-5">
                            <h2 className="text-sm font-semibold">
                                Order Summary
                            </h2>
                            <Separator />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Items
                                </span>
                                <span>
                                    {lineItems.reduce(
                                        (s, i) => s + i.quantity,
                                        0,
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                                <span>Subtotal</span>
                                <span>{fmt(total)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Shipping and discounts can be added after the
                                order is confirmed.
                            </p>
                            <Separator />
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    processing ||
                                    !data.customer_id ||
                                    lineItems.length === 0
                                }
                            >
                                {processing
                                    ? 'Creating...'
                                    : 'Create Draft Order'}
                            </Button>
                            <p className="text-center text-xs text-muted-foreground">
                                Saves as draft — confirm later to submit.
                            </p>
                        </div>
                    </div>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
