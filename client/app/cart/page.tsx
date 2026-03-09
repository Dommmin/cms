"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { useTranslation } from "@/hooks/use-translation";
import { useLocalePath } from "@/hooks/use-locale";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveCartItem();
  const { t } = useTranslation();
  const lp = useLocalePath();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold">{t("cart.your_cart", "Your Cart")}</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="mb-4 text-3xl font-bold">{t("cart.your_cart", "Your Cart")}</h1>
        <p className="mb-8 text-muted-foreground">{t("cart.empty_desc", "Your cart is empty.")}</p>
        <Link
          href={lp("/products")}
          className="inline-flex items-center rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("cart.start_shopping", "Start Shopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">{t("cart.your_cart", "Your Cart")}</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-border rounded-xl border border-border">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.product?.thumbnail?.url ? (
                    <Image
                      src={item.product.thumbnail.url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="font-medium leading-tight">
                    {item.product?.name ?? "Product"}
                  </p>
                  {item.variant?.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {item.variant.sku}</p>
                  )}
                  <p className="text-sm font-semibold">{formatPrice(item.unit_price)}</p>

                  {/* Quantity stepper */}
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      onClick={() => updateItem({ id: item.id, quantity: item.quantity - 1 })}
                      disabled={item.quantity <= 1}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input hover:bg-accent disabled:opacity-40"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-input hover:bg-accent"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Line total */}
                <p className="shrink-0 font-medium">{formatPrice(item.subtotal)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("cart.order_summary", "Order Summary")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.subtotal", "Subtotal")}</span>
              <span>{formatPrice(cart?.subtotal ?? 0)}</span>
            </div>
            {(cart?.discount_amount ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>{t("cart.discount", "Discount")}</span>
                <span>-{formatPrice(cart!.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("cart.shipping", "Shipping")}</span>
              <span className="text-muted-foreground">{t("cart.calculated_at_checkout", "Calculated at checkout")}</span>
            </div>
          </div>
          <div className="my-4 border-t border-border pt-4">
            <div className="flex justify-between font-semibold">
              <span>{t("cart.total", "Total")}</span>
              <span>{formatPrice(cart?.total ?? 0)}</span>
            </div>
          </div>
          <Link
            href={lp("/checkout")}
            className="block w-full rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("cart.proceed", "Proceed to Checkout")}
          </Link>
          <Link
            href={lp("/products")}
            className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {t("cart.continue_shopping", "Continue Shopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
