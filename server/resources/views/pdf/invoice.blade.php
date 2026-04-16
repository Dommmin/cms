<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faktura {{ $order->invoice_number ?? $order->reference_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company h1 { font-size: 24px; font-weight: bold; }
        .company p { color: #666; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 20px; text-transform: uppercase; color: #555; }
        .invoice-info p { color: #666; margin-top: 4px; }
        .invoice-number { font-size: 16px; font-weight: bold; color: #333 !important; }
        .addresses { display: flex; gap: 40px; margin-bottom: 30px; }
        .address-block { flex: 1; }
        .address-block h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
        .address-block p { line-height: 1.6; }
        .vat-id { font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f5f5f5; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .totals { margin-left: auto; width: 300px; }
        .totals table { margin-bottom: 0; }
        .totals td { padding: 6px 12px; border-bottom: none; }
        .totals .total-row td { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #e8f5e9; color: #388e3c; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company">
            <h1>{{ config('app.name') }}</h1>
            <p>Faktura VAT</p>
        </div>
        <div class="invoice-info">
            <h2>Faktura VAT</h2>
            @if($order->invoice_number)
            <p class="invoice-number">{{ $order->invoice_number }}</p>
            @endif
            <p><strong>Nr zamówienia:</strong> {{ $order->reference_number }}</p>
            <p><strong>Data wystawienia:</strong> {{ ($order->invoice_issued_at ?? $order->created_at)?->format('d/m/Y') }}</p>
            <p><strong>Status:</strong> <span class="badge">{{ \App\Enums\OrderStatusEnum::from((string) $order->status)->getLabel() }}</span></p>
        </div>
    </div>

    <div class="addresses">
        @if($order->buyer_company_name || $order->buyer_vat_id)
        <div class="address-block">
            <h3>Nabywca (B2B)</h3>
            @if($order->buyer_company_name)
            <p><strong>{{ $order->buyer_company_name }}</strong></p>
            @endif
            @if($order->buyer_vat_id)
            <p class="vat-id">NIP: {{ $order->buyer_vat_id }}</p>
            @endif
        </div>
        @endif

        @if($order->billingAddress)
        <div class="address-block">
            <h3>Adres rozliczeniowy</h3>
            <p>{{ $order->billingAddress->first_name }} {{ $order->billingAddress->last_name }}</p>
            <p>{{ $order->billingAddress->street }}</p>
            @if($order->billingAddress->street2)
            <p>{{ $order->billingAddress->street2 }}</p>
            @endif
            <p>{{ $order->billingAddress->postal_code }} {{ $order->billingAddress->city }}</p>
            <p>{{ $order->billingAddress->country_code }}</p>
        </div>
        @endif

        @if($order->shippingAddress)
        <div class="address-block">
            <h3>Adres dostawy</h3>
            <p>{{ $order->shippingAddress->first_name }} {{ $order->shippingAddress->last_name }}</p>
            <p>{{ $order->shippingAddress->street }}</p>
            @if($order->shippingAddress->street2)
            <p>{{ $order->shippingAddress->street2 }}</p>
            @endif
            <p>{{ $order->shippingAddress->postal_code }} {{ $order->shippingAddress->city }}</p>
            <p>{{ $order->shippingAddress->country_code }}</p>
        </div>
        @endif

        @if(!$order->buyer_company_name && $order->customer)
        <div class="address-block">
            <h3>Klient</h3>
            <p>{{ $order->customer->first_name }} {{ $order->customer->last_name }}</p>
            <p>{{ $order->customer->email }}</p>
            @if($order->customer->phone)
            <p>{{ $order->customer->phone }}</p>
            @endif
        </div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Produkt</th>
                <th>SKU</th>
                <th class="text-right">Cena jedn.</th>
                <th class="text-right">Ilość</th>
                <th class="text-right">Wartość</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product_name }}</td>
                <td>{{ $item->variant_sku }}</td>
                <td class="text-right">{{ number_format($item->unit_price / 100, 2) }} {{ $order->currency_code }}</td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->subtotal / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Suma netto</td>
                <td class="text-right">{{ number_format($order->subtotal / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @if($order->discount_amount > 0)
            <tr>
                <td>Rabat</td>
                <td class="text-right">-{{ number_format($order->discount_amount / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @endif
            <tr>
                <td>Dostawa</td>
                <td class="text-right">{{ number_format($order->shipping_cost / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @if($order->tax_amount > 0)
            <tr>
                <td>VAT</td>
                <td class="text-right">{{ number_format($order->tax_amount / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>Do zapłaty</td>
                <td class="text-right">{{ number_format($order->total / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Dokument wygenerowany automatycznie. Nie wymaga podpisu.</p>
    </div>
</body>
</html>
