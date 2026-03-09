import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Package } from "lucide-react";

function SuccessContent({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const ref = searchParams.ref ?? null;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
      <h1 className="mb-2 text-3xl font-bold">Zamówienie złożone!</h1>
      {ref && (
        <p className="mb-1 text-lg font-medium text-primary">#{ref}</p>
      )}
      <p className="mb-8 text-muted-foreground">
        Dziękujemy za zamówienie. Wysłaliśmy potwierdzenie na Twój adres
        e-mail. Zapłacisz przy odbiorze.
      </p>

      <div className="mb-8 rounded-xl border border-border p-5 text-left text-sm">
        <h2 className="mb-3 font-semibold">Co dalej?</h2>
        <ol className="space-y-2 text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            Otrzymasz e-mail z potwierdzeniem zamówienia.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              2
            </span>
            Poinformujemy Cię, gdy zamówienie zostanie wysłane.
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              3
            </span>
            Zapłać gotówką kurierowi lub w sklepie przy odbiorze.
          </li>
        </ol>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/account/orders"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Package className="h-4 w-4" />
          Moje zamówienia
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-accent"
        >
          <ShoppingBag className="h-4 w-4" />
          Kontynuuj zakupy
        </Link>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <Suspense>
      <SuccessContent searchParams={params} />
    </Suspense>
  );
}
