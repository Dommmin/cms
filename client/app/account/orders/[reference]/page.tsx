"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Package, Truck } from "lucide-react";

import { useOrder, useCancelOrder } from "@/hooks/use-orders";
import { api } from "@/lib/axios";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

const RETURN_TYPES = [
  { value: "return", label: "Return" },
  { value: "exchange", label: "Exchange" },
  { value: "complaint", label: "Complaint" },
];

function StatusTimeline({ status, history }: { status: OrderStatus; history?: Array<{ status: string; note: string | null; created_at: string }> }) {
  const isCancelled = status === "cancelled" || status === "refunded";
  const currentIndex = STATUS_STEPS.indexOf(status);

  if (isCancelled) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 font-semibold">Order Status</h3>
        <div className="flex items-center gap-2 text-sm text-red-600">
          <Circle className="h-4 w-4 fill-red-100" />
          <span className="capitalize font-medium">{status}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Order Progress</h3>
      <ol className="relative flex items-start justify-between">
        {STATUS_STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const historyEntry = history?.find((h) => h.status === step);

          return (
            <li key={step} className="flex flex-1 flex-col items-center gap-1 relative">
              {/* connector line */}
              {i < STATUS_STEPS.length - 1 && (
                <span
                  className={`absolute left-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${
                    isDone ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
              <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background">
                {isDone || isCurrent ? (
                  <CheckCircle2
                    className={`h-6 w-6 ${isDone ? "text-primary" : "text-primary/60"}`}
                  />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/40" />
                )}
              </span>
              <span
                className={`text-center text-xs capitalize ${
                  isCurrent ? "font-semibold text-foreground" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                {step}
              </span>
              {historyEntry && (
                <span className="text-center text-xs text-muted-foreground/70">
                  {new Date(historyEntry.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function OrderDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const { data: order, isLoading } = useOrder(reference);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnType, setReturnType] = useState("return");
  const [returnReason, setReturnReason] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  function toggleItem(itemId: number) {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  }

  async function handleReturnSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    setIsSubmittingReturn(true);
    try {
      await api.post(`/orders/${reference}/return`, {
        type: returnType,
        reason: returnReason,
        items: selectedItems.map((id) => ({ order_item_id: id, quantity: 1 })),
      });
      setReturnSuccess(true);
      setShowReturnForm(false);
    } catch {
      // error handled silently
    } finally {
      setIsSubmittingReturn(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Order not found.{" "}
        <Link href="/account/orders" className="underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.reference_number}</h1>
          <p className="text-sm text-muted-foreground">
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span
          className={`self-start rounded-full px-3 py-1 text-sm font-medium capitalize ${
            STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {order.status_label ?? order.status}
        </span>
      </div>

      {/* Return success */}
      {returnSuccess && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Your return request has been submitted. We&apos;ll get back to you within 1-2 business days.
        </div>
      )}

      {/* Status timeline */}
      <StatusTimeline status={order.status} history={order.status_history} />

      {/* Shipment tracking */}
      {order.shipment && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Truck className="h-4 w-4 text-muted-foreground" />
            Shipment
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {order.shipment.carrier && (
              <>
                <dt className="text-muted-foreground">Carrier</dt>
                <dd className="font-medium">{order.shipment.carrier}</dd>
              </>
            )}
            {order.shipment.tracking_number && (
              <>
                <dt className="text-muted-foreground">Tracking</dt>
                <dd className="font-medium font-mono">{order.shipment.tracking_number}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Status</dt>
            <dd className="capitalize font-medium">{order.shipment.status}</dd>
          </dl>
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-semibold">Items</h2>
        </div>
        <ul className="divide-y divide-border">
          {order.items?.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.product_name}</p>
                  {item.variant_sku && (
                    <p className="text-xs text-muted-foreground">SKU: {item.variant_sku}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-medium">{formatPrice(item.subtotal)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-border px-4 py-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.shipping_cost > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_cost)}</span>
            </div>
          )}
          {order.tax_amount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
          )}
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-1 border-t border-border">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Addresses */}
      {(order.shipping_address || order.billing_address) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {order.shipping_address && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-semibold text-sm">Shipping Address</h3>
              <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                {order.shipping_address.address_line_1}<br />
                {order.shipping_address.address_line_2 && <>{order.shipping_address.address_line_2}<br /></>}
                {order.shipping_address.city}, {order.shipping_address.postal_code}<br />
                {order.shipping_address.country_code}
              </address>
            </div>
          )}
          {order.billing_address && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 font-semibold text-sm">Billing Address</h3>
              <address className="not-italic text-sm text-muted-foreground leading-relaxed">
                {order.billing_address.first_name} {order.billing_address.last_name}<br />
                {order.billing_address.address_line_1}<br />
                {order.billing_address.address_line_2 && <>{order.billing_address.address_line_2}<br /></>}
                {order.billing_address.city}, {order.billing_address.postal_code}<br />
                {order.billing_address.country_code}
              </address>
            </div>
          )}
        </div>
      )}

      {/* Payment */}
      {order.payment && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-2 font-semibold text-sm">Payment</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">Method</dt>
            <dd className="capitalize">{order.payment.method}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="capitalize">{order.payment.status}</dd>
          </dl>
        </div>
      )}

      {/* Actions */}
      {["pending", "processing"].includes(order.status) && (
        <div>
          <button
            onClick={() => cancelOrder(reference)}
            disabled={isCancelling}
            className="rounded-xl border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {isCancelling ? "Cancelling…" : "Cancel Order"}
          </button>
        </div>
      )}

      {["delivered", "shipped"].includes(order.status) && !returnSuccess && (
        <div>
          <button
            onClick={() => setShowReturnForm(!showReturnForm)}
            className="rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            {showReturnForm ? "Hide Return Form" : "Request Return / Complaint"}
          </button>
        </div>
      )}

      {/* Return form */}
      {showReturnForm && (
        <form
          onSubmit={handleReturnSubmit}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h3 className="mb-4 font-semibold">Return / Complaint Request</h3>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Request Type</label>
            <div className="flex gap-3">
              {RETURN_TYPES.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={returnType === value}
                    onChange={() => setReturnType(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Select Items</label>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                  {item.product_name}
                  {item.variant_sku ? ` (${item.variant_sku})` : ""}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="reason" className="mb-1 block text-sm font-medium">
              Reason
            </label>
            <textarea
              id="reason"
              required
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={3}
              placeholder="Please describe the reason for your return/complaint…"
              className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingReturn || selectedItems.length === 0}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {isSubmittingReturn ? "Submitting…" : "Submit Request"}
          </button>
        </form>
      )}
    </div>
  );
}
