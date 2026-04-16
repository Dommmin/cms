<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatusEnum;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\ProductVariant;
use Carbon\Carbon;
use DOMDocument;
use DOMElement;

class AnalyticsReportService
{
    /**
     * Conversion funnel report.
     * Stages: customers registered → added to cart → completed checkout → delivered
     *
     * @param  array{start: Carbon, end: Carbon}  $period
     * @return array<string, mixed>
     */
    public function conversionFunnel(array $period): array
    {
        $start = $period['start'];
        $end = $period['end'];

        $registered = Customer::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $addedToCart = Cart::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $startedCheckout = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $completedPurchase = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', [
                OrderStatusEnum::PROCESSING->value,
                OrderStatusEnum::SHIPPED->value,
                OrderStatusEnum::DELIVERED->value,
            ])
            ->count();

        return [
            'stages' => [
                ['name' => 'Registered Customers', 'count' => $registered, 'rate' => 100.0],
                ['name' => 'Added to Cart', 'count' => $addedToCart, 'rate' => $registered > 0 ? round($addedToCart / $registered * 100, 1) : 0],
                ['name' => 'Started Checkout', 'count' => $startedCheckout, 'rate' => $registered > 0 ? round($startedCheckout / $registered * 100, 1) : 0],
                ['name' => 'Completed Purchase', 'count' => $completedPurchase, 'rate' => $registered > 0 ? round($completedPurchase / $registered * 100, 1) : 0],
            ],
            'cart_to_checkout_rate' => $addedToCart > 0 ? round($startedCheckout / $addedToCart * 100, 1) : 0,
            'checkout_to_purchase_rate' => $startedCheckout > 0 ? round($completedPurchase / $startedCheckout * 100, 1) : 0,
            'overall_conversion_rate' => $registered > 0 ? round($completedPurchase / $registered * 100, 1) : 0,
        ];
    }

    /**
     * New vs returning customers report.
     *
     * @param  array{start: Carbon, end: Carbon}  $period
     * @return array<string, mixed>
     */
    public function customerReport(array $period): array
    {
        $start = $period['start'];
        $end = $period['end'];

        $newCustomers = Customer::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $customersWithOrders = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $returningCustomers = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereNotNull('customer_id')
            ->whereIn('customer_id', function ($sub) use ($start): void {
                $sub->select('customer_id')
                    ->from('orders')
                    ->where('created_at', '<', $start)
                    ->whereNotNull('customer_id');
            })
            ->distinct('customer_id')
            ->count('customer_id');

        $newBuyers = max(0, $customersWithOrders - $returningCustomers);

        $completedStatuses = [
            OrderStatusEnum::PROCESSING->value,
            OrderStatusEnum::SHIPPED->value,
            OrderStatusEnum::DELIVERED->value,
        ];

        $avgLtv = Customer::query()
            ->whereHas('orders', fn ($q) => $q->whereIn('status', $completedStatuses))
            ->withSum(['orders as total_spent' => fn ($q) => $q->whereIn('status', $completedStatuses)], 'total')
            ->get()
            ->avg('total_spent');

        $byDay = Customer::query()
            ->whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->mapWithKeys(fn ($item): array => [$item->date => (int) $item->count]);

        $chart = [];
        $current = $start->copy()->startOfDay();

        while ($current->lte($end)) {
            $chart[$current->toDateString()] = $byDay->get($current->toDateString(), 0);
            $current->addDay();
        }

        return [
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'new_buyers' => $newBuyers,
            'customers_with_orders' => $customersWithOrders,
            'avg_lifetime_value' => (int) round($avgLtv ?? 0),
            'chart' => $chart,
        ];
    }

    /**
     * Inventory / stock levels report.
     *
     * @return array<string, mixed>
     */
    public function inventoryReport(): array
    {
        $variants = ProductVariant::query()
            ->with(['product:id,name,slug'])
            ->select([
                'id', 'product_id', 'sku', 'name', 'stock_quantity', 'stock_threshold',
                'price', 'is_active',
            ])
            ->orderBy('stock_quantity')
            ->get();

        $outOfStock = $variants->where('stock_quantity', 0)->count();
        $lowStock = $variants->filter(fn ($v): bool => $v->stock_quantity > 0 && $v->stock_quantity <= $v->stock_threshold)->count();
        $inStock = $variants->where('stock_quantity', '>', 0)->count();

        $totalStockValue = $variants->sum(fn ($v): int|float => $v->stock_quantity * $v->price);

        $topByValue = $variants
            ->sortByDesc(fn ($v): int|float => $v->stock_quantity * $v->price)
            ->take(20)
            ->values()
            ->map(fn ($v): array => [
                'id' => $v->id,
                'sku' => $v->sku,
                'name' => $v->product?->getTranslation('name', 'en', false).($v->name ? ' — '.$v->name : ''),
                'stock_quantity' => $v->stock_quantity,
                'stock_threshold' => $v->stock_threshold,
                'price' => $v->price,
                'stock_value' => $v->stock_quantity * $v->price,
                'status' => match (true) {
                    $v->stock_quantity === 0 => 'out_of_stock',
                    $v->stock_quantity <= $v->stock_threshold => 'low_stock',
                    default => 'in_stock',
                },
            ]);

        $outOfStockItems = $variants
            ->where('stock_quantity', 0)
            ->take(50)
            ->values()
            ->map(fn ($v): array => [
                'id' => $v->id,
                'sku' => $v->sku,
                'name' => $v->product?->getTranslation('name', 'en', false).($v->name ? ' — '.$v->name : ''),
                'stock_quantity' => $v->stock_quantity,
                'stock_threshold' => $v->stock_threshold,
                'price' => $v->price,
                'status' => 'out_of_stock',
            ]);

        return [
            'summary' => [
                'total_variants' => $variants->count(),
                'out_of_stock' => $outOfStock,
                'low_stock' => $lowStock,
                'in_stock' => $inStock,
                'total_stock_value' => (int) $totalStockValue,
            ],
            'top_by_value' => $topByValue,
            'out_of_stock_items' => $outOfStockItems,
        ];
    }

    /**
     * VAT report — tax collected by period.
     *
     * @param  array{start: Carbon, end: Carbon}  $period
     * @return array<string, mixed>
     */
    public function vatReport(array $period): array
    {
        $start = $period['start'];
        $end = $period['end'];

        $completedStatuses = [
            OrderStatusEnum::PROCESSING->value,
            OrderStatusEnum::SHIPPED->value,
            OrderStatusEnum::DELIVERED->value,
        ];

        $totals = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', $completedStatuses)
            ->selectRaw('
                COUNT(*) as orders_count,
                SUM(subtotal) as net_total,
                SUM(tax_amount) as vat_total,
                SUM(total) as gross_total
            ')
            ->first();

        $byMonth = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', $completedStatuses)
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(tax_amount) as vat, SUM(subtotal) as net, SUM(total) as gross, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row): array => [
                'month' => $row->month,
                'vat' => (int) $row->vat,
                'net' => (int) $row->net,
                'gross' => (int) $row->gross,
                'count' => (int) $row->count,
            ]);

        return [
            'orders_count' => (int) ($totals->orders_count ?? 0),
            'net_total' => (int) ($totals->net_total ?? 0),
            'vat_total' => (int) ($totals->vat_total ?? 0),
            'gross_total' => (int) ($totals->gross_total ?? 0),
            'effective_vat_rate' => ($totals->net_total ?? 0) > 0
                ? round($totals->vat_total / $totals->net_total * 100, 2)
                : 0,
            'by_month' => $byMonth,
        ];
    }

    /**
     * Generate JPK_V7M XML for a single month.
     *
     * @param  Carbon  $month  First day of the month to report
     */
    public function generateJpkV7Xml(Carbon $month): string
    {
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        $completedStatuses = [
            OrderStatusEnum::PROCESSING->value,
            OrderStatusEnum::SHIPPED->value,
            OrderStatusEnum::DELIVERED->value,
        ];

        $orders = Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->whereIn('status', $completedStatuses)
            ->with(['customer', 'billingAddress', 'items'])
            ->get();

        $doc = new DOMDocument('1.0', 'UTF-8');
        $doc->formatOutput = true;

        $root = $doc->createElementNS(
            'http://jpk.mf.gov.pl/wzor/2022/02/17/02171/',
            'JPK'
        );
        $root->setAttributeNS(
            'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation',
            'http://jpk.mf.gov.pl/wzor/2022/02/17/02171/ http://jpk.mf.gov.pl/wzor/2022/02/17/02171/JPK_VAT_7M_v1-0E.xsd'
        );
        $doc->appendChild($root);

        // Naglowek
        $naglowek = $doc->createElement('Naglowek');
        $this->addEl($doc, $naglowek, 'KodFormularza', 'JPK_V7M');
        $this->addEl($doc, $naglowek, 'WariantFormularza', '1');
        $this->addEl($doc, $naglowek, 'CelZlozenia', '0'); // 0 = złożenie, 1 = korekta
        $this->addEl($doc, $naglowek, 'DataWytworzeniaJPK', now()->toIso8601String());
        $this->addEl($doc, $naglowek, 'DataOd', $start->toDateString());
        $this->addEl($doc, $naglowek, 'DataDo', $end->toDateString());
        $root->appendChild($naglowek);

        // Podmiot1
        $podmiot = $doc->createElement('Podmiot1');
        $osoba = $doc->createElement('OsobaFizyczna');
        $this->addEl($doc, $osoba, 'NIP', config('settings.nip', '0000000000'));
        $this->addEl($doc, $osoba, 'PelnaNazwa', config('app.name', 'Firma'));
        $podmiot->appendChild($osoba);
        $root->appendChild($podmiot);

        // Ewidencja — SprzedazWiersz per order
        $ewidencja = $doc->createElement('Ewidencja');
        $lp = 1;

        foreach ($orders as $order) {
            $wiersz = $doc->createElement('SprzedazWiersz');
            $this->addEl($doc, $wiersz, 'LpSprzedazy', (string) $lp++);

            // Kontrahent
            if ($order->buyer_vat_id) {
                $this->addEl($doc, $wiersz, 'NrKontrahenta', $order->buyer_vat_id);
                $this->addEl($doc, $wiersz, 'NazwaKontrahenta', $order->buyer_company_name ?? '');
            } elseif ($order->customer) {
                $this->addEl($doc, $wiersz, 'NrKontrahenta', 'BRAK');
                $this->addEl($doc, $wiersz, 'NazwaKontrahenta', $order->customer->first_name.' '.$order->customer->last_name);
            } elseif ($order->billingAddress) {
                $this->addEl($doc, $wiersz, 'NrKontrahenta', 'BRAK');
                $this->addEl($doc, $wiersz, 'NazwaKontrahenta', $order->billingAddress->first_name.' '.$order->billingAddress->last_name);
            }

            $this->addEl($doc, $wiersz, 'DowodSprzedazy', $order->invoice_number ?? $order->reference_number);
            $this->addEl($doc, $wiersz, 'DataSprzedazy', $order->created_at->toDateString());
            $this->addEl($doc, $wiersz, 'DataWystawienia', ($order->invoice_issued_at ?? $order->created_at)->toDateString());

            // VAT fields — simplified: treat all tax as 23% (K_19/K_20)
            $netCents = $order->subtotal - $order->discount_amount;
            $netPln = number_format($netCents / 100, 2, '.', '');
            $vatPln = number_format($order->tax_amount / 100, 2, '.', '');

            $this->addEl($doc, $wiersz, 'K_19', $netPln);  // netto 23%
            $this->addEl($doc, $wiersz, 'K_20', $vatPln);  // VAT 23%

            $ewidencja->appendChild($wiersz);
        }

        // SprzedazCtrl
        $sprzCtrl = $doc->createElement('SprzedazCtrl');
        $this->addEl($doc, $sprzCtrl, 'LiczbaWierszy', (string) $orders->count());
        $grossSum = number_format($orders->sum('total') / 100, 2, '.', '');
        $this->addEl($doc, $sprzCtrl, 'PodatekNalezny', $grossSum);
        $ewidencja->appendChild($sprzCtrl);

        $root->appendChild($ewidencja);

        return (string) $doc->saveXML();
    }

    private function addEl(DOMDocument $doc, DOMElement $parent, string $tag, string $value): void
    {
        $el = $doc->createElement($tag, htmlspecialchars($value));
        $parent->appendChild($el);
    }
}
