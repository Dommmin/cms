<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PaymentProviderEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @property int $shipping_method_id
 * @property string $payment_provider
 * @property array<string, mixed> $billing_address
 * @property array<string, mixed> $shipping_address
 * @property string|null $pickup_point_id
 * @property string|null $notes
 */
class StoreCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string|Rule>>
     */
    public function rules(): array
    {
        return [
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
            'payment_provider' => ['required', 'string', Rule::enum(PaymentProviderEnum::class)],
            'pickup_point_id' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'billing_address' => ['required', 'array'],
            'billing_address.first_name' => ['required', 'string', 'max:255'],
            'billing_address.last_name' => ['required', 'string', 'max:255'],
            'billing_address.company_name' => ['nullable', 'string', 'max:255'],
            'billing_address.street' => ['required', 'string', 'max:255'],
            'billing_address.street2' => ['nullable', 'string', 'max:255'],
            'billing_address.city' => ['required', 'string', 'max:255'],
            'billing_address.postal_code' => ['required', 'string', 'max:20'],
            'billing_address.country_code' => ['nullable', 'string', 'size:2'],
            'billing_address.phone' => ['required', 'string', 'max:30'],

            'shipping_address' => ['required', 'array'],
            'shipping_address.first_name' => ['required', 'string', 'max:255'],
            'shipping_address.last_name' => ['required', 'string', 'max:255'],
            'shipping_address.company_name' => ['nullable', 'string', 'max:255'],
            'shipping_address.street' => ['required', 'string', 'max:255'],
            'shipping_address.street2' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:255'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country_code' => ['nullable', 'string', 'size:2'],
            'shipping_address.phone' => ['required', 'string', 'max:30'],
        ];
    }
}
