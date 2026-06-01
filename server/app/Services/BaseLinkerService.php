<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PaymentProviderEnum;
use App\Enums\PaymentStatusEnum;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * BaseLinker Integration Service
 */
final readonly class BaseLinkerService
{
    private const string API_URL = 'https://api.baselinker.com/connector.php';

    public function __construct(
        private string $apiToken = '',
    ) {}

    public function isConfigured(): bool
    {
        return $this->apiToken !== '';
    }

    /**
     * Send order to BaseLinker and return the created order ID.
     */
    public function addOrder(Order $order): ?int
    {
        if (! $this->isConfigured()) {
            return null;
        }

        $order->loadMissing(['items.variant.product', 'billingAddress', 'shippingAddress', 'customer']);

        $billing = $order->billingAddress;
        $shipping = $order->shippingAddress;

        $parameters = [
            'order_status_id' => null, // default
            'custom_source_id' => config('app.name'),
            'date_add' => $order->created_at->timestamp,
            'currency' => $order->currency_code,
            'payment_method' => $order->payment ? $order->payment->provider->value : 'unknown',
            'payment_method_cod' => $order->payment && $order->payment->provider === PaymentProviderEnum::CASH_ON_DELIVERY ? 1 : 0,
            'paid' => $order->payment && $order->payment->status === PaymentStatusEnum::COMPLETED ? 1 : 0,
            'user_comments' => $order->notes ?? '',
            'admin_comments' => '',
            'email' => $order->customer ? $order->customer->email : ($order->guest_email ?? ''),
            'phone' => $shipping->phone !== '' ? $shipping->phone : $billing->phone,
            'delivery_method' => $order->shipment ? $order->shipment->carrier : 'unknown',
            'delivery_price' => round($order->shipping_cost / 100, 2),
            'delivery_fullname' => mb_trim($shipping->first_name.' '.$shipping->last_name),
            'delivery_company' => $shipping->company_name ?? '',
            'delivery_address' => mb_trim($shipping->street.' '.($shipping->street2 ?? '')),
            'delivery_city' => $shipping->city,
            'delivery_postcode' => $shipping->postal_code,
            'delivery_country_code' => $shipping->country_code,
            'delivery_point_id' => $order->shipment ? ($order->shipment->pickup_point_id ?? '') : '',
            'invoice_fullname' => mb_trim($billing->first_name.' '.$billing->last_name),
            'invoice_company' => $order->buyer_company_name ?? $billing->company_name ?? '',
            'invoice_nip' => $order->buyer_vat_id ?? '',
            'invoice_address' => mb_trim($billing->street.' '.($billing->street2 ?? '')),
            'invoice_city' => $billing->city,
            'invoice_postcode' => $billing->postal_code,
            'invoice_country_code' => $billing->country_code,
            'products' => $this->mapProducts($order),
        ];

        try {
            $response = Http::asForm()
                ->timeout(10)
                ->post(self::API_URL, [
                    'token' => $this->apiToken,
                    'method' => 'addOrder',
                    'parameters' => json_encode($parameters, JSON_THROW_ON_ERROR),
                ]);

            $data = $response->json();

            if ($response->successful() && isset($data['status']) && $data['status'] === 'SUCCESS') {
                return (int) $data['order_id'];
            }

            Log::error('BaseLinker: Failed to add order', [
                'order_id' => $order->id,
                'response' => $data,
            ]);
        } catch (Throwable $throwable) {
            Log::error('BaseLinker: Exception adding order', [
                'order_id' => $order->id,
                'message' => $throwable->getMessage(),
            ]);
        }

        return null;
    }

    private function mapProducts(Order $order): array
    {
        $products = [];
        foreach ($order->items as $item) {
            /** @var OrderItem $item */
            $products[] = [
                'storage' => 'db',
                'storage_id' => 0,
                'product_id' => $item->variant_id ? 'v_'.$item->variant_id : 'p_'.$item->product_id,
                'variant_id' => $item->variant_id ?? 0,
                'name' => $item->product_name,
                'sku' => $item->sku,
                'ean' => $item->variant ? ($item->variant->ean ?? '') : '',
                'price_brutto' => round($item->unit_price / 100, 2),
                'tax_rate' => $item->variant ? ($item->variant->effectiveTaxRate()->rate ?? 23) : 23,
                'quantity' => $item->quantity,
                'weight' => $item->variant ? ($item->variant->weight ?? 0.0) : 0.0,
            ];
        }

        return $products;
    }
}
