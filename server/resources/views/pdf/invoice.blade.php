<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $order->reference_number }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 14px; color: #333; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company h1 { font-size: 24px; font-weight: bold; }
        .company p { color: #666; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 20px; text-transform: uppercase; color: #555; }
        .invoice-info p { color: #666; }
        .addresses { display: flex; gap: 40px; margin-bottom: 30px; }
        .address-block { flex: 1; }
        .address-block h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
        .address-block p { line-height: 1.6; }
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
            <p>Invoice</p>
        </div>
        <div class="invoice-info">
            <h2>Invoice</h2>
            <p><strong>Reference:</strong> {{ $order->reference_number }}</p>
            <p><strong>Date:</strong> {{ $order->created_at?->format('d/m/Y') }}</p>
            <p><strong>Status:</strong> <span class="badge">{{ \App\Enums\OrderStatusEnum::from((string) $order->status)->getLabel() }}</span></p>
        </div>
    </div>

    <div class="addresses">
        @if($order->billingAddress)
        <div class="address-block">
            <h3>Billing Address</h3>
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
            <h3>Shipping Address</h3>
            <p>{{ $order->shippingAddress->first_name }} {{ $order->shippingAddress->last_name }}</p>
            <p>{{ $order->shippingAddress->street }}</p>
            @if($order->shippingAddress->street2)
            <p>{{ $order->shippingAddress->street2 }}</p>
            @endif
            <p>{{ $order->shippingAddress->postal_code }} {{ $order->shippingAddress->city }}</p>
            <p>{{ $order->shippingAddress->country_code }}</p>
        </div>
        @endif

        @if($order->customer)
        <div class="address-block">
            <h3>Customer</h3>
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
                <th>Product</th>
                <th>SKU</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Subtotal</th>
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
                <td>Subtotal</td>
                <td class="text-right">{{ number_format($order->subtotal / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @if($order->discount_amount > 0)
            <tr>
                <td>Discount</td>
                <td class="text-right">-{{ number_format($order->discount_amount / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @endif
            <tr>
                <td>Shipping</td>
                <td class="text-right">{{ number_format($order->shipping_cost / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @if($order->tax_amount > 0)
            <tr>
                <td>Tax</td>
                <td class="text-right">{{ number_format($order->tax_amount / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>Total</td>
                <td class="text-right">{{ number_format($order->total / 100, 2) }} {{ $order->currency_code }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Thank you for your business. This is a computer-generated document, no signature required.</p>
    </div>
</body>
</html>
