import { router, useForm } from '@inertiajs/react';
import { Package, Plus, Truck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { store as shipmentsStore } from '@/routes/admin/ecommerce/orders/shipments';
import type { OrderItem, OrderView, Shipment } from './show.types';

type ShipmentItemInput = {
    order_item_id: number;
    quantity: number;
    enabled: boolean;
};

function ShipmentCard({
    shipment,
    fmtDate,
    order,
}: {
    shipment: Shipment;
    fmtDate: (d: string) => string;
    order: OrderView;
}) {
    const __ = useTranslation();

    return (
        <div className="rounded-lg border border-border p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                        {shipment.carrier ?? __('misc.shipment', 'Shipment')} #
                        {shipment.id}
                    </span>
                </div>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 capitalize">
                    {shipment.status}
                </span>
            </div>

            {(shipment.tracking_number || shipment.tracking_url) && (
                <div className="mt-2 text-xs text-muted-foreground">
                    {shipment.tracking_number && (
                        <span className="font-mono">
                            {shipment.tracking_number}
                        </span>
                    )}
                    {shipment.tracking_url && (
                        <a
                            href={shipment.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-primary hover:underline"
                        >
                            {__('action.track', 'Track')}
                        </a>
                    )}
                </div>
            )}

            {shipment.created_at && (
                <p className="mt-1 text-xs text-muted-foreground">
                    {fmtDate(shipment.created_at)}
                </p>
            )}

            {shipment.items && shipment.items.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-border pt-3">
                    {shipment.items.map((si) => {
                        const orderItem = (order.items ?? []).find(
                            (i) => i.id === si.order_item_id,
                        );
                        const name =
                            orderItem?.variant?.product?.name ??
                            orderItem?.product_name ??
                            `Item #${si.order_item_id}`;
                        return (
                            <li
                                key={si.id}
                                className="flex justify-between text-xs"
                            >
                                <span className="text-muted-foreground">
                                    {name}
                                </span>
                                <span className="font-medium">
                                    ×{si.quantity}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export function ShipmentSection({ order }: { order: OrderView }) {
    const __ = useTranslation();
    const [showForm, setShowForm] = useState(false);

    const unshippedItems: OrderItem[] = (order.items ?? []).filter(
        (i) => (i.shipped_quantity ?? 0) < i.quantity,
    );

    const initialItemInputs: ShipmentItemInput[] = unshippedItems.map((i) => ({
        order_item_id: i.id,
        quantity: i.quantity - (i.shipped_quantity ?? 0),
        enabled: true,
    }));

    const { data, setData, processing, errors, reset } = useForm<{
        carrier: string;
        tracking_number: string;
        tracking_url: string;
        items: ShipmentItemInput[];
    }>({
        carrier: '',
        tracking_number: '',
        tracking_url: '',
        items: initialItemInputs,
    });

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    function submitShipment(e: React.FormEvent) {
        e.preventDefault();

        const enabledItems = data.items
            .filter((i) => i.enabled && i.quantity > 0)
            .map(({ order_item_id, quantity }) => ({
                order_item_id,
                quantity,
            }));

        if (enabledItems.length === 0) {
            return;
        }

        router.post(
            shipmentsStore.url(order.id),
            {
                carrier: data.carrier,
                tracking_number: data.tracking_number,
                tracking_url: data.tracking_url,
                items: enabledItems,
            },
            {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                },
            },
        );
    }

    function updateItem(
        index: number,
        key: keyof ShipmentItemInput,
        value: boolean | number,
    ) {
        const updated = [...data.items];
        updated[index] = { ...updated[index], [key]: value };
        setData('items', updated);
    }

    const shipments = order.shipments ?? [];

    return (
        <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <h2 className="font-semibold">
                    {__('misc.fulfillment', 'Fulfillment')} ({shipments.length})
                </h2>
                {unshippedItems.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowForm((v) => !v)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        {__('action.create_shipment', 'Create Shipment')}
                    </button>
                )}
            </div>

            <div className="space-y-3 p-4">
                {shipments.length === 0 && !showForm && (
                    <div className="flex flex-col items-center gap-2 py-6 text-sm text-muted-foreground">
                        <Package className="h-8 w-8 opacity-40" />
                        <p>{__('misc.no_shipments', 'No shipments yet')}</p>
                    </div>
                )}

                {shipments.map((s) => (
                    <ShipmentCard
                        key={s.id}
                        shipment={s}
                        fmtDate={fmtDate}
                        order={order}
                    />
                ))}

                {/* Create shipment form */}
                {showForm && (
                    <form
                        onSubmit={submitShipment}
                        className="mt-2 space-y-4 rounded-lg border border-dashed border-border p-4"
                    >
                        <p className="text-sm font-semibold">
                            {__('misc.new_shipment', 'New Shipment')}
                        </p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium">
                                    {__('label.carrier', 'Carrier')}
                                </label>
                                <input
                                    type="text"
                                    value={data.carrier}
                                    onChange={(e) =>
                                        setData('carrier', e.target.value)
                                    }
                                    placeholder="DHL, InPost..."
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium">
                                    {__(
                                        'label.tracking_number',
                                        'Tracking No.',
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={data.tracking_number}
                                    onChange={(e) =>
                                        setData(
                                            'tracking_number',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium">
                                {__(
                                    'label.tracking_url_optional',
                                    'Tracking URL (optional)',
                                )}
                            </label>
                            <input
                                type="url"
                                value={data.tracking_url}
                                onChange={(e) =>
                                    setData('tracking_url', e.target.value)
                                }
                                placeholder="https://..."
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                            />
                            {errors.tracking_url && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.tracking_url}
                                </p>
                            )}
                        </div>

                        {/* Items picker */}
                        <div>
                            <p className="mb-2 text-xs font-medium">
                                {__('misc.items_to_ship', 'Items to ship')}
                            </p>
                            {errors.items && (
                                <p className="mb-2 text-xs text-destructive">
                                    {errors.items}
                                </p>
                            )}
                            <div className="space-y-2">
                                {data.items.map((input, idx) => {
                                    const orderItem = unshippedItems[idx];
                                    if (!orderItem) return null;
                                    const name =
                                        orderItem.variant?.product?.name ??
                                        orderItem.product_name ??
                                        `Item #${orderItem.id}`;
                                    const maxQty =
                                        orderItem.quantity -
                                        (orderItem.shipped_quantity ?? 0);

                                    return (
                                        <div
                                            key={orderItem.id}
                                            className="flex items-center gap-3 rounded-lg border border-border p-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={input.enabled}
                                                onChange={(e) =>
                                                    updateItem(
                                                        idx,
                                                        'enabled',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="h-4 w-4 shrink-0 rounded border-input"
                                            />
                                            <span className="flex-1 text-xs">
                                                {name}
                                                {orderItem.sku && (
                                                    <span className="ml-1 text-muted-foreground">
                                                        ({orderItem.sku})
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                max {maxQty}
                                            </span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={maxQty}
                                                value={input.quantity}
                                                disabled={!input.enabled}
                                                onChange={(e) =>
                                                    updateItem(
                                                        idx,
                                                        'quantity',
                                                        Math.min(
                                                            maxQty,
                                                            Math.max(
                                                                1,
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                ) || 1,
                                                            ),
                                                        ),
                                                    )
                                                }
                                                className="w-16 rounded-lg border border-input bg-background px-2 py-1 text-center text-xs focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-40"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-accent"
                            >
                                {__('action.cancel', 'Cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    data.items.every((i) => !i.enabled)
                                }
                                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                            >
                                {processing
                                    ? __('misc.saving', 'Saving...')
                                    : __(
                                          'action.create_shipment',
                                          'Create Shipment',
                                      )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
